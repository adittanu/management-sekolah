<?php

namespace App\Mcp\Tools;

use App\Models\Attendance;
use App\Models\Schedule;
use Carbon\Carbon;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class LihatJadwalHariIniTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Melihat jadwal mengajar untuk hari ini beserta status absensi. Memerlukan email_guru.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'email_guru' => ['required', 'email', 'exists:users,email'],
        ], [
            'email_guru.exists' => 'Guru dengan email tersebut tidak ditemukan.',
        ]);

        // Get teacher by email
        $teacher = \App\Models\User::where('email', $validated['email_guru'])->first();

        $today = Carbon::now()->locale('id')->isoFormat('dddd');
        $todayDate = Carbon::now()->format('Y-m-d');

        // Weekend check
        if (in_array($today, ['Minggu'])) {
            return Response::text('Hari ini adalah hari libur. Tidak ada jadwal mengajar.');
        }

        $schedules = Schedule::query()
            ->with(['subject', 'classroom'])
            ->where('teacher_id', $teacher->id)
            ->where('day', $today)
            ->orderBy('start_time')
            ->get();

        if ($schedules->isEmpty()) {
            return Response::text("Tidak ada jadwal mengajar untuk hari {$today}.");
        }

        $output = "Jadwal Hari Ini ({$today}):\n\n";

        foreach ($schedules as $schedule) {
            // Check if attendance already recorded
            $hasAttendance = Attendance::where('schedule_id', $schedule->id)
                ->where('date', $todayDate)
                ->exists();

            $statusIcon = $hasAttendance ? '✅' : '⏳';
            $statusText = $hasAttendance ? 'Sudah absen' : 'Belum absen';

            $output .= sprintf(
                "%s 📚 %s\n   📍 %s (%s)\n   🕐 %s - %s\n   🏫 %s\n   📋 Status: %s\n\n",
                $statusIcon,
                $schedule->subject->name,
                $schedule->day,
                $schedule->room ?? '-',
                $schedule->start_time,
                $schedule->end_time,
                $schedule->classroom->name,
                $statusText
            );
        }

        return Response::text($output);
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\Contracts\JsonSchema\JsonSchema>
     */
    public function schema($schema): array
    {
        return [
            'email_guru' => $schema->string()
                ->description('Email guru')
                ->required(),
        ];
    }
}
