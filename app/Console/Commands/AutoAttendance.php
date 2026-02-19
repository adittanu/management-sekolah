<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Journal;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoAttendance extends Command
{
    protected $signature = 'app:auto-attendance {--dry-run : Tampilkan jadwal yang akan diproses tanpa menyimpan}';

    protected $description = 'Otomatis isi absensi hadir siswa & tandai guru tidak mengabsen untuk jadwal yang sudah lewat tanpa absensi';

    public function handle(): void
    {
        $now = Carbon::now();
        $todayDate = $now->format('Y-m-d');

        $dayMap = [
            'Monday'    => 'Senin',
            'Tuesday'   => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday'  => 'Kamis',
            'Friday'    => 'Jumat',
            'Saturday'  => 'Sabtu',
            'Sunday'    => 'Minggu',
        ];

        $currentDay = $dayMap[$now->format('l')] ?? null;

        if (! $currentDay) {
            $this->info('Hari tidak dikenali, skip.');
            return;
        }

        // Get all schedules for today where end_time has passed
        $schedules = Schedule::with(['classroom.activeStudents'])
            ->where('day', $currentDay)
            ->whereTime('end_time', '<', $now->format('H:i:s'))
            ->get();

        if ($schedules->isEmpty()) {
            $this->info("Tidak ada jadwal yang sudah selesai hari ini ({$currentDay}).");
            return;
        }

        $processed = 0;

        foreach ($schedules as $schedule) {
            // Skip if attendance already exists for this schedule today
            $hasAttendance = Attendance::where('schedule_id', $schedule->id)
                ->where('date', $todayDate)
                ->exists();

            if ($hasAttendance) {
                $this->line("  [skip] Jadwal #{$schedule->id} sudah memiliki absensi.");
                continue;
            }

            // Skip if no classroom or no students
            if (! $schedule->classroom || $schedule->classroom->activeStudents->isEmpty()) {
                $this->warn("  [skip] Jadwal #{$schedule->id} tidak memiliki siswa aktif.");
                continue;
            }

            if ($this->option('dry-run')) {
                $this->info("  [dry-run] Akan diproses: Jadwal #{$schedule->id} - Kelas {$schedule->classroom->name} ({$schedule->classroom->activeStudents->count()} siswa)");
                continue;
            }

            DB::transaction(function () use ($schedule, $todayDate) {
                // 1. Isi absensi semua siswa aktif dengan status 'hadir'
                foreach ($schedule->classroom->activeStudents as $student) {
                    Attendance::updateOrCreate(
                        [
                            'schedule_id' => $schedule->id,
                            'student_id'  => $student->id,
                            'date'        => $todayDate,
                        ],
                        ['status' => 'hadir']
                    );
                }

                // 2. Tandai guru tidak mengabsen
                if ($schedule->teacher_id) {
                    Attendance::updateOrCreate(
                        [
                            'schedule_id' => $schedule->id,
                            'student_id'  => $schedule->teacher_id,
                            'date'        => $todayDate,
                        ],
                        ['status' => 'tidak_mengabsen']
                    );
                }

                // 3. Buat jurnal otomatis
                Journal::updateOrCreate(
                    [
                        'schedule_id' => $schedule->id,
                        'date'        => $todayDate,
                    ],
                    [
                        'teacher_id'  => $schedule->teacher_id,
                        'title'       => '[Auto] Tidak Ada Absensi',
                        'description' => 'Absensi diisi otomatis oleh sistem karena guru tidak melakukan presensi setelah jam pelajaran berakhir.',
                        'proof_file'  => null,
                    ]
                );
            });

            $count = $schedule->classroom->activeStudents->count();
            $this->info("  [ok] Jadwal #{$schedule->id} ({$schedule->classroom->name}): {$count} siswa → hadir, guru → tidak_mengabsen");
            $processed++;
        }

        $this->info("Selesai. Total {$processed} jadwal diproses.");
    }
}
