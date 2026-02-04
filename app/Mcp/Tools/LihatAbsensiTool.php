<?php

namespace App\Mcp\Tools;

use App\Models\Attendance;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
#[IsIdempotent]
class LihatAbsensiTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Melihat data absensi siswa untuk jadwal dan tanggal tertentu. Menampilkan statistik kehadiran. Memerlukan email_guru.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'email_guru' => ['required', 'email', 'exists:users,email'],
            'jadwal_id' => ['required', 'integer', 'exists:schedules,id'],
            'tanggal' => ['required', 'date'],
        ], [
            'email_guru.exists' => 'Guru dengan email tersebut tidak ditemukan.',
            'jadwal_id.exists' => 'Jadwal tidak ditemukan.',
        ]);

        // Get teacher by email
        $teacher = \App\Models\User::where('email', $validated['email_guru'])->first();

        // Verify teacher owns this schedule
        $schedule = Schedule::where('id', $validated['jadwal_id'])
            ->where('teacher_id', $teacher->id)
            ->with(['subject', 'classroom'])
            ->first();

        if (! $schedule) {
            return Response::error('Anda tidak memiliki akses ke jadwal ini.');
        }

        $date = Carbon::parse($validated['tanggal'])->format('Y-m-d');

        $attendances = Attendance::where('schedule_id', $validated['jadwal_id'])
            ->where('date', $date)
            ->with('student')
            ->get();

        if ($attendances->isEmpty()) {
            return Response::text('Belum ada data absensi untuk jadwal ini.');
        }

        // Calculate statistics
        $stats = [
            'hadir' => $attendances->where('status', 'hadir')->count(),
            'sakit' => $attendances->where('status', 'sakit')->count(),
            'izin' => $attendances->where('status', 'izin')->count(),
            'alpha' => $attendances->where('status', 'alpha')->count(),
        ];

        $total = $attendances->count();

        $output = sprintf(
            "📊 Absensi: %s - %s\n📅 Tanggal: %s\n\n",
            $schedule->subject->name,
            $schedule->classroom->name,
            $date
        );

        $output .= "📈 Statistik:\n";
        $output .= sprintf("   ✅ Hadir: %d\n", $stats['hadir']);
        $output .= sprintf("   🤒 Sakit: %d\n", $stats['sakit']);
        $output .= sprintf("   📝 Izin: %d\n", $stats['izin']);
        $output .= sprintf("   ❌ Alpha: %d\n", $stats['alpha']);
        $output .= sprintf("   📊 Total: %d\n\n", $total);

        $output .= "📋 Detail Absensi:\n";

        foreach ($attendances as $attendance) {
            $statusIcon = match ($attendance->status) {
                'hadir' => '✅',
                'sakit' => '🤒',
                'izin' => '📝',
                'alpha' => '❌',
            };

            $output .= sprintf(
                "   %s %s (%s) - %s\n",
                $statusIcon,
                $attendance->student->name ?? 'Unknown',
                $attendance->student->nis ?? '-',
                ucfirst($attendance->status)
            );
        }

        return Response::text($output);
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
                ->description('Email guru')
                ->required(),
            'jadwal_id' => $schema->integer()
                ->description('ID jadwal mengajar')
                ->required(),
            'tanggal' => $schema->string()
                ->description('Tanggal absensi (YYYY-MM-DD)')
                ->required(),
        ];
    }
}
