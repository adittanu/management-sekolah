<?php

namespace App\Mcp\Tools;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[IsIdempotent]
class ProsesAbsensiTextTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Mengolah text absensi natural language menjadi data terstruktur dan langsung mencatat absensi. Format: email_guru, tanggal (YYYY-MM-DD), dan text absensi dengan daftar nama siswa per status.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'email_guru' => ['required', 'email', 'exists:users,email'],
            'text_absensi' => ['required', 'string'],
            'tanggal' => ['required', 'date', 'before_or_equal:today'],
            'kelas' => ['nullable', 'string'],
        ], [
            'email_guru.exists' => 'Guru dengan email tersebut tidak ditemukan.',
            'tanggal.before_or_equal' => 'Tanggal tidak boleh di masa depan.',
        ]);

        $teacher = User::where('email', $validated['email_guru'])->first();
        $text = $validated['text_absensi'];
        $date = $validated['tanggal'];
        $kelas = $validated['kelas'] ?? null;

        // Parse text absensi
        $parsed = $this->parseAbsensiText($text);

        if (empty($parsed['hadir']) && empty($parsed['sakit']) && empty($parsed['izin']) && empty($parsed['alpha'])) {
            return Response::error('Tidak dapat menemukan data absensi dari text. Pastikan format mencantumkan daftar nama dengan status Hadir/Sakit/Izin/Alpha.');
        }

        // Cari jadwal untuk kelas ini
        $schedule = $this->findSchedule($teacher->id, $kelas, $parsed['kelas_dari_text'] ?? null, $date);

        if (! $schedule) {
            return Response::error(
                'Tidak menemukan jadwal mengajar untuk kelas ini. '.
                'Pastikan kelas tercantum dalam text (contoh: "Kelas 7A") atau parameter kelas diisi.'
            );
        }

        // Proses absensi
        $results = $this->processAbsensi($schedule, $parsed, $date);

        // Build response
        $output = $this->buildResponse($schedule, $parsed, $results, $date);

        return Response::text($output);
    }

    /**
     * Parse text absensi jadi array terstruktur
     */
    private function parseAbsensiText(string $text): array
    {
        $result = [
            'hadir' => [],
            'sakit' => [],
            'izin' => [],
            'alpha' => [],
            'kelas_dari_text' => null,
            'catatan' => null,
        ];

        // Extract kelas (7A, 8B, XI-AFM2, dll)
        if (preg_match('/kelas[:\s]+([A-Z0-9\-]+)/i', $text, $matches)) {
            $result['kelas_dari_text'] = $matches[1];
        }

        // Extract catatan
        if (preg_match('/catatan:\s*(.+?)(?:\n|$)/i', $text, $matches)) {
            $result['catatan'] = trim($matches[1]);
        }

        // Parse tiap section
        $lines = explode("\n", $text);
        $currentStatus = null;

        foreach ($lines as $line) {
            $line = trim($line);

            // Detect status
            if (preg_match('/^(Hadir|Sakit|Izin|Alpha):\s*(.*)/i', $line, $matches)) {
                $currentStatus = strtolower($matches[1]);
                $names = $matches[2];

                if ($names && $names !== '-') {
                    $result[$currentStatus] = array_merge(
                        $result[$currentStatus],
                        $this->extractNames($names)
                    );
                }
            } elseif ($currentStatus && $line && ! str_starts_with(strtolower($line), 'catatan:')) {
                // Continuation of previous status
                $result[$currentStatus] = array_merge(
                    $result[$currentStatus],
                    $this->extractNames($line)
                );
            }
        }

        return $result;
    }

    /**
     * Extract names from comma-separated string
     */
    private function extractNames(string $names): array
    {
        $names = str_replace(['-', '–', '—'], '', $names);
        $names = preg_replace('/\s+/', ' ', $names);

        return array_filter(array_map('trim', explode(',', $names)));
    }

    /**
     * Find schedule for teacher and class
     */
    private function findSchedule(int $teacherId, ?string $kelasParam, ?string $kelasDariText, string $date): ?Schedule
    {
        $kelas = $kelasParam ?: $kelasDariText;

        if (! $kelas) {
            return null;
        }

        // Normalize kelas name
        $kelas = strtoupper(trim($kelas));

        return Schedule::query()
            ->where('teacher_id', $teacherId)
            ->whereHas('classroom', function ($query) use ($kelas) {
                $query->where('name', 'LIKE', "%{$kelas}%");
            })
            ->with(['classroom', 'subject'])
            ->first();
    }

    /**
     * Process absensi dan return hasil
     */
    private function processAbsensi(Schedule $schedule, array $parsed, string $date): array
    {
        $results = [
            'success' => [],
            'failed' => [],
            'not_found' => [],
        ];

        // Get all students in this classroom via pivot table
        $students = User::query()
            ->where('role', 'student')
            ->whereHas('classrooms', function ($query) use ($schedule) {
                $query->where('classrooms.id', $schedule->classroom_id);
            })
            ->get()
            ->keyBy(fn ($s) => strtolower($s->name));

        DB::transaction(function () use ($schedule, $parsed, $date, $students, &$results) {
            foreach (['hadir', 'sakit', 'izin', 'alpha'] as $status) {
                foreach ($parsed[$status] as $name) {
                    // Try exact match first
                    $student = $students->get(strtolower($name));

                    // If not found, try partial match (since DB names have "XI-AFM2" suffix)
                    if (! $student) {
                        $searchName = strtolower($name);
                        foreach ($students as $key => $s) {
                            if (str_contains($key, $searchName) || str_contains($searchName, explode(' ', $key)[0])) {
                                $student = $s;
                                break;
                            }
                        }
                    }

                    if (! $student) {
                        $results['not_found'][] = ['name' => $name, 'status' => $status];

                        continue;
                    }

                    try {
                        \App\Models\Attendance::updateOrCreate(
                            [
                                'schedule_id' => $schedule->id,
                                'student_id' => $student->id,
                                'date' => $date,
                            ],
                            ['status' => $status]
                        );
                        $results['success'][] = ['name' => $name, 'status' => $status];
                    } catch (\Exception $e) {
                        $results['failed'][] = ['name' => $name, 'status' => $status, 'error' => $e->getMessage()];
                    }
                }
            }
        });

        return $results;
    }

    /**
     * Build response text
     */
    private function buildResponse(Schedule $schedule, array $parsed, array $results, string $date): string
    {
        $totalSuccess = count($results['success']);
        $totalNotFound = count($results['not_found']);
        $totalFailed = count($results['failed']);

        $output = "📊 Hasil Absensi\n";
        $output .= "═══════════════════\n";
        $output .= "📚 {$schedule->subject->name}\n";
        $output .= "🏫 {$schedule->classroom->name}\n";
        $output .= "📅 {$date}\n\n";

        // Ringkasan per status
        $output .= "📋 Ringkasan:\n";
        foreach (['hadir', 'sakit', 'izin', 'alpha'] as $status) {
            $count = count($parsed[$status]);
            if ($count > 0) {
                $icon = match ($status) {
                    'hadir' => '✅',
                    'sakit' => '🤒',
                    'izin' => '📝',
                    'alpha' => '❌',
                };
                $output .= "   {$icon} ".ucfirst($status).": {$count} siswa\n";
            }
        }

        $output .= "\n✅ Berhasil: {$totalSuccess}\n";

        if ($totalNotFound > 0) {
            $output .= "\n⚠️ Siswa tidak ditemukan:\n";
            foreach ($results['not_found'] as $item) {
                $output .= "   • {$item['name']}\n";
            }
        }

        if ($totalFailed > 0) {
            $output .= "\n❌ Gagal:\n";
            foreach ($results['failed'] as $item) {
                $output .= "   • {$item['name']}: {$item['error']}\n";
            }
        }

        if ($parsed['catatan']) {
            $output .= "\n📝 Catatan: {$parsed['catatan']}\n";
        }

        return $output;
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\Contracts\JsonSchema\JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'email_guru' => $schema->string()
                ->description('Email guru yang mengisi absensi')
                ->required(),
            'text_absensi' => $schema->string()
                ->description('Text absensi natural language. Contoh: "Hadir: Ahmad, Budi, Lina\nSakit: Siti\nIzin: Rina\nCatatan: Kelas berjalan kondusif"')
                ->required(),
            'tanggal' => $schema->string()
                ->description('Tanggal absensi (YYYY-MM-DD). Default: hari ini')
                ->required(),
            'kelas' => $schema->string()
                ->description('Kelas (opsional, jika tidak tercantum dalam text. Contoh: 7A, 8B)'),
        ];
    }
}
