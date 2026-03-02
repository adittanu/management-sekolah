<?php

namespace Database\Seeders;

use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceJournalSeeder extends Seeder
{
    private array $dayMap = [
        'Monday'    => 'Senin',
        'Tuesday'   => 'Selasa',
        'Wednesday' => 'Rabu',
        'Thursday'  => 'Kamis',
        'Friday'    => 'Jumat',
    ];

    private array $statusPool;
    private array $troublePool;

    private array $journalTitles = [
        'MTK-W'  => ['Bilangan Real dan Operasinya', 'Pertidaksamaan Linear', 'Fungsi dan Grafik', 'Sistem Persamaan Linear', 'Matriks Dasar'],
        'MTK-P'  => ['Limit Fungsi', 'Turunan dan Aplikasinya', 'Integral Tak Tentu', 'Barisan dan Deret', 'Trigonometri Lanjut'],
        'BIND'   => ['Teks Laporan Hasil Observasi', 'Teks Eksposisi', 'Teks Anekdot', 'Teks Hikayat', 'Teks Negosiasi'],
        'BING'   => ['Simple Present Tense', 'Narrative Text', 'Report Text', 'Analytical Exposition', 'Discussion Text'],
        'FIS'    => ['Gerak Lurus Beraturan', 'Hukum Newton', 'Usaha dan Energi', 'Gelombang Bunyi', 'Listrik Statis'],
        'KIM'    => ['Struktur Atom', 'Ikatan Kimia', 'Larutan Elektrolit', 'Stoikiometri', 'Termokimia'],
        'BIO'    => ['Sel dan Organel', 'Jaringan Tumbuhan', 'Sistem Pencernaan', 'Ekosistem', 'Hereditas'],
        'SEJI'   => ['Masa Praaksara', 'Kerajaan Hindu-Buddha', 'Masa Kolonial', 'Pergerakan Nasional', 'Proklamasi Kemerdekaan'],
        'PPKN'   => ['Pancasila sebagai Dasar Negara', 'UUD 1945', 'Sistem Pemerintahan', 'HAM', 'Bela Negara'],
        'PAI'    => ['Iman kepada Allah', 'Akhlak Terpuji', 'Fiqih Ibadah', 'Sejarah Islam', 'Al-Quran Hadis'],
        'PJOK'   => ['Permainan Bola Besar', 'Atletik Dasar', 'Senam Lantai', 'Kebugaran Jasmani', 'Renang'],
        'SBUD'   => ['Seni Rupa Nusantara', 'Seni Musik Tradisional', 'Seni Tari', 'Apresiasi Seni', 'Kreasi Seni'],
        'EKO'    => ['Kebutuhan dan Kelangkaan', 'Sistem Ekonomi', 'Permintaan dan Penawaran', 'Pasar', 'Pendapatan Nasional'],
        'SOS'    => ['Sosialisasi', 'Kelompok Sosial', 'Konflik Sosial', 'Mobilitas Sosial', 'Lembaga Sosial'],
        'GEO'    => ['Peta dan Pemetaan', 'Litosfer', 'Atmosfer', 'Hidrosfer', 'Biosfer'],
    ];

    public function run(): void
    {
        // Weighted random: 85% hadir, 7% sakit, 5% izin, 3% alpha
        $this->statusPool = array_merge(
            array_fill(0, 85, 'hadir'),
            array_fill(0, 7,  'sakit'),
            array_fill(0, 5,  'izin'),
            array_fill(0, 3,  'alpha')
        );

        // "Trouble students" (first 4 per class) get elevated alpha
        $this->troublePool = array_merge(
            array_fill(0, 60, 'hadir'),
            array_fill(0, 10, 'sakit'),
            array_fill(0, 10, 'izin'),
            array_fill(0, 20, 'alpha')
        );

        $schoolDays = $this->getSchoolDays();
        $this->command->info('Seeding attendance & journals for ' . count($schoolDays) . ' school days...');

        // Load all schedules with relationships
        $schedules = Schedule::with(['classroom.students', 'subject'])->get();

        // Group schedules by day name
        $byDay = $schedules->groupBy('day');

        $now = now()->toDateTimeString();

        foreach ($schoolDays as $dateStr) {
            $englishDay = Carbon::parse($dateStr)->format('l');
            $dayName    = $this->dayMap[$englishDay] ?? null;
            if (! $dayName) {
                continue;
            }

            $daySchedules = $byDay[$dayName] ?? collect();

            $attendanceBatch = [];
            $journalBatch    = [];

            foreach ($daySchedules as $schedule) {
                if (! $schedule->classroom) {
                    continue;
                }

                $students      = $schedule->classroom->students;
                $troubleIds    = $students->take(4)->pluck('id')->toArray();
                $subjectCode   = $schedule->subject->code;

                // Attendance rows
                foreach ($students as $student) {
                    $pool   = in_array($student->id, $troubleIds) ? $this->troublePool : $this->statusPool;
                    $status = $pool[array_rand($pool)];

                    $attendanceBatch[] = [
                        'schedule_id' => $schedule->id,
                        'student_id'  => $student->id,
                        'date'        => $dateStr,
                        'status'      => $status,
                        'created_at'  => $now,
                        'updated_at'  => $now,
                    ];
                }

                // Journal (75% chance)
                if (rand(1, 100) <= 75) {
                    $titles     = $this->journalTitles[$subjectCode] ?? ['Pembelajaran'];
                    $titleIndex = abs(crc32($dateStr . $schedule->id)) % count($titles);

                    $journalBatch[] = [
                        'schedule_id' => $schedule->id,
                        'teacher_id'  => $schedule->teacher_id,
                        'date'        => $dateStr,
                        'title'       => 'Pertemuan — ' . $titles[$titleIndex],
                        'description' => 'Kegiatan pembelajaran berjalan dengan lancar. Siswa aktif berpartisipasi dalam diskusi dan tanya jawab.',
                        'proof_file'  => null,
                        'created_at'  => $now,
                        'updated_at'  => $now,
                    ];
                }
            }

            // Bulk insert in chunks
            foreach (array_chunk($attendanceBatch, 500) as $chunk) {
                DB::table('attendances')->insert($chunk);
            }
            foreach (array_chunk($journalBatch, 200) as $chunk) {
                DB::table('journals')->insert($chunk);
            }
        }

        $this->command->info('Attendance seeded: ' . DB::table('attendances')->count() . ' records');
        $this->command->info('Journals seeded: ' . DB::table('journals')->count() . ' records');
    }

    private function getSchoolDays(): array
    {
        $days = [];

        // February 2026 — all weekdays (20 school days)
        $feb    = Carbon::create(2026, 2, 1);
        $febEnd = Carbon::create(2026, 2, 28);
        while ($feb->lte($febEnd)) {
            if ($feb->isWeekday()) {
                $days[] = $feb->format('Y-m-d');
            }
            $feb->addDay();
        }

        // March 2026 — weekdays up to today (dynamic)
        $mar   = Carbon::create(2026, 3, 1);
        $today = now()->startOfDay();
        while ($mar->lte($today)) {
            if ($mar->isWeekday()) {
                $days[] = $mar->format('Y-m-d');
            }
            $mar->addDay();
        }

        return $days;
    }
}
