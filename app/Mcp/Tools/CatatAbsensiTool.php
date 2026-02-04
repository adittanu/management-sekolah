<?php

namespace App\Mcp\Tools;

use App\Models\Attendance;
use App\Models\Journal;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[IsIdempotent]
class CatatAbsensiTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Mencatat absensi siswa dengan format fleksibel. Bisa menerima daftar siswa yang hadir, tidak hadir, sakit, izin, atau alpha. Jika status tidak disebutkan, default adalah hadir untuk yang disebutkan.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'email_guru' => ['required', 'email', 'exists:users,email'],
            'kelas' => ['required', 'string'],
            'tanggal' => ['required', 'date', 'before_or_equal:today'],
            'siswa_hadir' => ['nullable', 'string'],
            'siswa_sakit' => ['nullable', 'string'],
            'siswa_izin' => ['nullable', 'string'],
            'siswa_alpha' => ['nullable', 'string'],
            'siswa_tidak_masuk' => ['nullable', 'string'],
            'catatan' => ['nullable', 'string'],
        ], [
            'email_guru.exists' => 'Guru dengan email tersebut tidak ditemukan.',
            'tanggal.before_or_equal' => 'Tanggal tidak boleh di masa depan.',
        ]);

        $teacher = User::where('email', $validated['email_guru'])->first();
        $date = $validated['tanggal'];
        $kelas = $validated['kelas'];

        // Cari jadwal
        $schedule = $this->findSchedule($teacher->id, $kelas, $date);

        if (! $schedule) {
            return Response::error(
                "Tidak menemukan jadwal mengajar untuk kelas {$kelas} pada tanggal {$date}."
            );
        }

        // Get semua siswa di kelas
        $students = $this->getStudentsInClass($schedule->classroom_id);

        if ($students->isEmpty()) {
            return Response::error("Tidak ada siswa di kelas {$kelas}.");
        }

        // Parse daftar siswa per status
        $absensi = $this->parseAbsensi($validated, $students);

        // Proses absensi
        $results = $this->processAbsensi($schedule, $absensi, $date, $teacher, $validated['catatan'] ?? null);

        // Build response
        $output = $this->buildResponse($schedule, $results, $date, $validated['catatan'] ?? null);

        return Response::text($output);
    }

    /**
     * Find schedule for teacher, class, and date
     */
    private function findSchedule(int $teacherId, string $kelas, string $date): ?Schedule
    {
        $dayName = Carbon::parse($date)->locale('id')->isoFormat('dddd');

        return Schedule::query()
            ->where('teacher_id', $teacherId)
            ->where('day', $dayName)
            ->whereHas('classroom', function ($query) use ($kelas) {
                $query->where('name', 'LIKE', "%{$kelas}%");
            })
            ->with(['classroom', 'subject'])
            ->first();
    }

    /**
     * Get students in classroom
     */
    private function getStudentsInClass(int $classroomId)
    {
        return User::query()
            ->where('role', 'student')
            ->whereHas('classrooms', function ($query) use ($classroomId) {
                $query->where('classrooms.id', $classroomId);
            })
            ->get()
            ->keyBy(fn ($s) => strtolower($s->name));
    }

    /**
     * Parse absensi dari input
     */
    private function parseAbsensi(array $validated, $students): array
    {
        $result = [
            'hadir' => [],
            'sakit' => [],
            'izin' => [],
            'alpha' => [],
            'tidak_diketahui' => [],
        ];

        // Parse siswa yang jelas statusnya
        if (! empty($validated['siswa_hadir'])) {
            $result['hadir'] = $this->matchStudents($validated['siswa_hadir'], $students);
        }

        if (! empty($validated['siswa_sakit'])) {
            $result['sakit'] = $this->matchStudents($validated['siswa_sakit'], $students);
        }

        if (! empty($validated['siswa_izin'])) {
            $result['izin'] = $this->matchStudents($validated['siswa_izin'], $students);
        }

        if (! empty($validated['siswa_alpha'])) {
            $result['alpha'] = $this->matchStudents($validated['siswa_alpha'], $students);
        }

        // Parse siswa yang "tidak masuk" - tanyakan ke user atau default ke alpha
        if (! empty($validated['siswa_tidak_masuk'])) {
            $result['tidak_diketahui'] = $this->matchStudents($validated['siswa_tidak_masuk'], $students);
        }

        return $result;
    }

    /**
     * Match student names from input to database
     */
    private function matchStudents(string $input, $students): array
    {
        $names = array_filter(array_map('trim', explode(',', $input)));
        $matched = [];

        foreach ($names as $name) {
            $searchName = strtolower($name);
            $found = null;

            // Exact match
            if ($students->has($searchName)) {
                $found = $students->get($searchName);
            } else {
                // Partial match
                foreach ($students as $key => $student) {
                    if (str_contains($key, $searchName)) {
                        $found = $student;
                        break;
                    }
                }
            }

            if ($found) {
                $matched[] = [
                    'input_name' => $name,
                    'student' => $found,
                ];
            } else {
                $matched[] = [
                    'input_name' => $name,
                    'student' => null,
                ];
            }
        }

        return $matched;
    }

    /**
     * Process absensi ke database
     */
    private function processAbsensi(Schedule $schedule, array $absensi, string $date, User $teacher, ?string $catatan): array
    {
        $results = [
            'hadir' => ['success' => [], 'not_found' => []],
            'sakit' => ['success' => [], 'not_found' => []],
            'izin' => ['success' => [], 'not_found' => []],
            'alpha' => ['success' => [], 'not_found' => []],
            'tidak_diketahui' => [],
        ];

        // Collect all mentioned student IDs
        $mentionedStudentIds = [];
        foreach (['hadir', 'sakit', 'izin', 'alpha'] as $status) {
            foreach ($absensi[$status] as $item) {
                if ($item['student']) {
                    $mentionedStudentIds[] = $item['student']->id;
                }
            }
        }

        DB::transaction(function () use ($schedule, $absensi, $date, $teacher, $catatan, &$results, $mentionedStudentIds) {
            // 1. Set all unmentioned students to 'hadir' (default)
            $allStudents = $this->getStudentsInClass($schedule->classroom_id);
            foreach ($allStudents as $student) {
                if (!in_array($student->id, $mentionedStudentIds)) {
                    Attendance::updateOrCreate(
                        [
                            'schedule_id' => $schedule->id,
                            'student_id' => $student->id,
                            'date' => $date,
                        ],
                        ['status' => 'hadir']
                    );
                }
            }

            // 2. Process mentioned students
            foreach (['hadir', 'sakit', 'izin', 'alpha'] as $status) {
                foreach ($absensi[$status] as $item) {
                    if ($item['student']) {
                        Attendance::updateOrCreate(
                            [
                                'schedule_id' => $schedule->id,
                                'student_id' => $item['student']->id,
                                'date' => $date,
                            ],
                            ['status' => $status]
                        );
                        $results[$status]['success'][] = $item['input_name'];
                    } else {
                        $results[$status]['not_found'][] = $item['input_name'];
                    }
                }
            }

            // 3. Save teacher attendance
            Attendance::updateOrCreate(
                [
                    'schedule_id' => $schedule->id,
                    'student_id' => $teacher->id,
                    'date' => $date,
                ],
                ['status' => 'hadir']
            );

            // 4. Create Journal for history
            Journal::updateOrCreate(
                [
                    'schedule_id' => $schedule->id,
                    'date' => $date,
                ],
                [
                    'title' => "Absensi {$schedule->subject->name} - {$schedule->classroom->name}",
                    'description' => $catatan ?? 'Absensi dicatat melalui AI Assistant',
                    'teacher_id' => $teacher->id,
                ]
            );

            // Siswa yang statusnya tidak diketahui
            foreach ($absensi['tidak_diketahui'] as $item) {
                $results['tidak_diketahui'][] = [
                    'name' => $item['input_name'],
                    'student' => $item['student']?->name,
                ];
            }
        });

        return $results;
    }

    /**
     * Build response text
     */
    private function buildResponse(Schedule $schedule, array $results, string $date, ?string $catatan): string
    {
        $output = "📊 Hasil Absensi\n";
        $output .= "═══════════════════\n";
        $output .= "📚 {$schedule->subject->name}\n";
        $output .= "🏫 {$schedule->classroom->name}\n";
        $output .= "📅 {$date}\n\n";

        // Ringkasan
        $output .= "📋 Ringkasan:\n";
        $totalHadir = count($results['hadir']['success']);
        $totalSakit = count($results['sakit']['success']);
        $totalIzin = count($results['izin']['success']);
        $totalAlpha = count($results['alpha']['success']);

        if ($totalHadir > 0) {
            $output .= "   ✅ Hadir: {$totalHadir} siswa\n";
        }
        if ($totalSakit > 0) {
            $output .= "   🤒 Sakit: {$totalSakit} siswa\n";
        }
        if ($totalIzin > 0) {
            $output .= "   📝 Izin: {$totalIzin} siswa\n";
        }
        if ($totalAlpha > 0) {
            $output .= "   ❌ Alpha: {$totalAlpha} siswa\n";
        }

        // Siswa yang perlu klarifikasi
        if (! empty($results['tidak_diketahui'])) {
            $output .= "\n⚠️ Perlu Klarifikasi (tidak masuk, status belum jelas):\n";
            foreach ($results['tidak_diketahui'] as $item) {
                $foundName = $item['student'] ? "(✓ {$item['student']})" : '(✗ tidak ditemukan)';
                $output .= "   • {$item['name']} {$foundName}\n";
            }
            $output .= "\n💡 Silakan sebutkan statusnya: sakit, izin, atau alpha.\n";
        }

        // Yang tidak ditemukan
        $notFound = array_merge(
            $results['hadir']['not_found'],
            $results['sakit']['not_found'],
            $results['izin']['not_found'],
            $results['alpha']['not_found']
        );

        if (! empty($notFound)) {
            $output .= "\n❌ Siswa tidak ditemukan:\n";
            foreach (array_unique($notFound) as $name) {
                $output .= "   • {$name}\n";
            }
        }

        if ($catatan) {
            $output .= "\n📝 Catatan: {$catatan}\n";
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
            'kelas' => $schema->string()
                ->description('Nama kelas (contoh: XI-AFM2, X-RPL1)')
                ->required(),
            'tanggal' => $schema->string()
                ->description('Tanggal absensi (YYYY-MM-DD)')
                ->required(),
            'siswa_hadir' => $schema->string()
                ->description('Daftar nama siswa yang hadir, pisahkan dengan koma'),
            'siswa_sakit' => $schema->string()
                ->description('Daftar nama siswa yang sakit, pisahkan dengan koma'),
            'siswa_izin' => $schema->string()
                ->description('Daftar nama siswa yang izin, pisahkan dengan koma'),
            'siswa_alpha' => $schema->string()
                ->description('Daftar nama siswa yang alpha, pisahkan dengan koma'),
            'siswa_tidak_masuk' => $schema->string()
                ->description('Daftar nama siswa yang tidak masuk (status belum jelas), pisahkan dengan koma'),
            'catatan' => $schema->string()
                ->description('Catatan tambahan tentang kelas'),
        ];
    }
}
