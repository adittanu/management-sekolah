<?php

namespace App\Mcp\Tools;

use App\Models\Attendance;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[IsIdempotent]
class AbsenSiswaTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Mencatat absensi siswa (hadir, sakit, izin, alpha). Guru hanya bisa absen untuk jadwal mengajar sendiri. Memerlukan email_guru.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'email_guru' => ['required', 'email', 'exists:users,email'],
            'jadwal_id' => ['required', 'integer', 'exists:schedules,id'],
            'siswa_id' => ['required', 'integer', 'exists:users,id'],
            'tanggal' => ['required', 'date', 'before_or_equal:today'],
            'status' => ['required', 'string', 'in:hadir,sakit,izin,alpha'],
        ], [
            'email_guru.exists' => 'Guru dengan email tersebut tidak ditemukan.',
            'jadwal_id.exists' => 'Jadwal tidak ditemukan.',
            'siswa_id.exists' => 'Siswa tidak ditemukan.',
            'tanggal.before_or_equal' => 'Tanggal tidak boleh di masa depan.',
            'status.in' => 'Status harus salah satu dari: hadir, sakit, izin, alpha.',
        ]);

        // Get teacher by email
        $teacher = \App\Models\User::where('email', $validated['email_guru'])->first();

        // Verify teacher owns this schedule
        $schedule = Schedule::where('id', $validated['jadwal_id'])
            ->where('teacher_id', $teacher->id)
            ->first();

        if (! $schedule) {
            return Response::error('Guru tidak memiliki akses ke jadwal ini.');
        }

        $date = Carbon::parse($validated['tanggal'])->format('Y-m-d');

        try {
            DB::transaction(function () use ($validated, $date) {
                Attendance::updateOrCreate(
                    [
                        'schedule_id' => $validated['jadwal_id'],
                        'student_id' => $validated['siswa_id'],
                        'date' => $date,
                    ],
                    [
                        'status' => $validated['status'],
                    ]
                );
            });

            $statusText = match ($validated['status']) {
                'hadir' => 'Hadir',
                'sakit' => 'Sakit',
                'izin' => 'Izin',
                'alpha' => 'Alpha',
            };

            return Response::text("✅ Absensi berhasil dicatat. Status: {$statusText}");
        } catch (\Exception $e) {
            return Response::error('Gagal mencatat absensi: '.$e->getMessage());
        }
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
                ->description('Email guru yang melakukan absensi')
                ->required(),
            'jadwal_id' => $schema->integer()
                ->description('ID jadwal mengajar')
                ->required(),
            'siswa_id' => $schema->integer()
                ->description('ID siswa yang diabsen')
                ->required(),
            'tanggal' => $schema->string()
                ->description('Tanggal absensi (YYYY-MM-DD)')
                ->required(),
            'status' => $schema->string()
                ->description('Status absensi: hadir, sakit, izin, alpha')
                ->enum(['hadir', 'sakit', 'izin', 'alpha'])
                ->required(),
        ];
    }
}
