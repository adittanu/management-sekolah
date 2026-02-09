<?php

namespace App\Mcp\Tools;

use App\Models\Schedule;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class LihatJadwalTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Melihat jadwal mengajar guru. Filter berdasarkan hari atau tampilkan semua jadwal. Memerlukan email_guru.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'email_guru' => ['required', 'email', 'exists:users,email'],
            'hari' => ['nullable', 'string', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
        ], [
            'email_guru.exists' => 'Guru dengan email tersebut tidak ditemukan.',
        ]);

        // Get teacher by email
        $teacher = \App\Models\User::where('email', $validated['email_guru'])->first();

        $hari = $validated['hari'] ?? null;

        $query = Schedule::query()
            ->with(['subject', 'classroom'])
            ->where('teacher_id', $teacher->id);

        // Filter by day if provided
        if ($hari) {
            $query->where('day', $hari);
        }

        $schedules = $query->orderBy('start_time')->get();

        if ($schedules->isEmpty()) {
            return Response::text('Anda belum memiliki jadwal mengajar.');
        }

        $output = "Jadwal Mengajar:\n\n";

        foreach ($schedules as $schedule) {
            $output .= sprintf(
                "📚 %s\n   📍 %s (%s)\n   🕐 %s - %s\n   🏫 %s\n\n",
                $schedule->subject->name,
                $schedule->day,
                $schedule->room ?? '-',
                $schedule->start_time,
                $schedule->end_time,
                $schedule->classroom->name
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
            'hari' => $schema->string()
                ->description('Filter berdasarkan hari (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu)')
                ->enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']),
        ];
    }
}
