# Full Seeder Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the partial `DatabaseSeeder` with 9 modular seeder classes covering all tables with realistic demo data including February 2026 historical data and March 2026 up to today.

**Architecture:** Multiple Seeder classes orchestrated by `DatabaseSeeder`. Truncation uses `SET FOREIGN_KEY_CHECKS=0`. Bulk inserts via `DB::table()->insert()` for large tables (attendance, journals). Dynamic date range for attendance: Feb 2026 full + March 2026 up to `now()`.

**Tech Stack:** Laravel 12, PHP 8.4, MariaDB, Carbon

---

### Task 1: Update DatabaseSeeder (orchestration + truncation)

**Files:**
- Modify: `database/seeders/DatabaseSeeder.php`

**Step 1: Replace entire file**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use \Illuminate\Database\Console\Seeds\WithoutModelEvents;

    public function run(): void
    {
        // Truncate in FK-safe order
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('library_reading_progress')->truncate();
        DB::table('library_loans')->truncate();
        DB::table('library_books')->truncate();
        DB::table('announcements')->truncate();
        DB::table('journals')->truncate();
        DB::table('attendances')->truncate();
        DB::table('schedules')->truncate();
        DB::table('classroom_user')->truncate();
        DB::table('subject_user')->truncate();
        DB::table('classrooms')->truncate();
        DB::table('subjects')->truncate();
        DB::table('time_slots')->truncate();
        DB::table('users')->truncate();
        DB::table('schools')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->call([
            SchoolSeeder::class,
            UserSeeder::class,
            SubjectSeeder::class,
            ClassroomSeeder::class,
            TimeSlotSeeder::class,
            ScheduleSeeder::class,
            AttendanceJournalSeeder::class,
            AnnouncementSeeder::class,
            LibrarySeeder::class,
        ]);
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/DatabaseSeeder.php
git commit -m "refactor(seeder): orchestrate all seeders with FK-safe truncation"
```

---

### Task 2: SchoolSeeder

**Files:**
- Create: `database/seeders/SchoolSeeder.php`

**Step 1: Create file**

```php
<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        School::create([
            'name'            => 'SMAN 1 Nusantara',
            'app_name'        => 'Sekolah Kita',
            'address'         => 'Jl. Pendidikan No. 1, Kota Nusantara',
            'phone'           => '(021) 555-0101',
            'email'           => 'info@sman1nusantara.sch.id',
            'website'         => 'https://sman1nusantara.sch.id',
            'npsn'            => '20101234',
            'accreditation'   => 'A',
            'headmaster_name' => 'Dr. H. Supriyadi, M.Pd',
            'headmaster_id'   => '196501011990011001',
            'logo'            => null,
        ]);
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/SchoolSeeder.php
git commit -m "feat(seeder): add SchoolSeeder"
```

---

### Task 3: UserSeeder

**Files:**
- Create: `database/seeders/UserSeeder.php`

**Step 1: Create file**

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ────────────────────────────────────────────────
        User::create([
            'name'            => 'Administrator',
            'email'           => 'admin@sekolah.id',
            'role'            => 'admin',
            'identity_number' => null,
            'gender'          => 'L',
            'password'        => bcrypt('password'),
        ]);

        // ── Teachers ─────────────────────────────────────────────
        $teacherData = [
            ['name' => 'Budi Santoso, S.Pd',      'email' => 'budi.santoso@sekolah.id',      'identity_number' => '198501012010011001', 'gender' => 'L'],
            ['name' => 'Siti Aminah, S.Pd',        'email' => 'siti.aminah@sekolah.id',        'identity_number' => '198602022011012002', 'gender' => 'P'],
            ['name' => 'Bambang Susilo, S.Pd',     'email' => 'bambang.susilo@sekolah.id',     'identity_number' => '198703032012013003', 'gender' => 'L'],
            ['name' => 'Ratna Dewi, S.Pd',         'email' => 'ratna.dewi@sekolah.id',         'identity_number' => '198804042013014004', 'gender' => 'P'],
            ['name' => 'Ahmad Fauzi, S.Pd',        'email' => 'ahmad.fauzi@sekolah.id',        'identity_number' => '198905052014015005', 'gender' => 'L'],
            ['name' => 'Dewi Lestari, S.Pd',       'email' => 'dewi.lestari@sekolah.id',       'identity_number' => '199006062015016006', 'gender' => 'P'],
            ['name' => 'Wahyu Santoso, S.Pd',      'email' => 'wahyu.santoso@sekolah.id',      'identity_number' => '199107072016017007', 'gender' => 'L'],
            ['name' => 'Rina Susanti, S.Pd',       'email' => 'rina.susanti@sekolah.id',       'identity_number' => '199208082017018008', 'gender' => 'P'],
            ['name' => 'Agus Setiawan, S.Pd',      'email' => 'agus.setiawan@sekolah.id',      'identity_number' => '199309092018019009', 'gender' => 'L'],
            ['name' => 'Yanti Kurniawati, S.Pd',   'email' => 'yanti.kurniawati@sekolah.id',   'identity_number' => '199410102019020010', 'gender' => 'P'],
            ['name' => 'Hendra Kusuma, S.Pd',      'email' => 'hendra.kusuma@sekolah.id',      'identity_number' => '199511112020021011', 'gender' => 'L'],
            ['name' => 'Lina Marlina, S.Pd',       'email' => 'lina.marlina@sekolah.id',       'identity_number' => '199612122021022012', 'gender' => 'P'],
            ['name' => 'Muhamad Akbar, S.Pd',      'email' => 'muhamad.akbar@sekolah.id',      'identity_number' => '199713132022023013', 'gender' => 'L'],
            ['name' => 'Nita Sari, S.Pd',          'email' => 'nita.sari@sekolah.id',          'identity_number' => '199814142023024014', 'gender' => 'P'],
            ['name' => 'Odi Supriadi, S.Pd',       'email' => 'odi.supriadi@sekolah.id',       'identity_number' => '199915152024025015', 'gender' => 'L'],
        ];

        foreach ($teacherData as $data) {
            User::create(array_merge($data, ['role' => 'teacher', 'password' => bcrypt('password')]));
        }

        // ── Students ─────────────────────────────────────────────
        $firstNames = [
            'Ahmad','Budi','Citra','Dian','Eko',
            'Fajar','Gita','Hendra','Indah','Jihan',
            'Kartika','Lukman','Maya','Nanda','Okta',
            'Putra','Qori','Rudi','Sinta','Taufik',
        ];
        $lastNames = [
            'Pratama','Setiawan','Dewi','Putra','Santoso',
            'Rahmat','Sari','Wijaya','Kurniawan','Hidayat',
            'Lestari','Nugroho','Permata','Susanto','Maharani',
            'Fauzi','Abidin','Handoko',
        ];
        $genderMap = [
            'Ahmad'=>'L','Budi'=>'L','Citra'=>'P','Dian'=>'P','Eko'=>'L',
            'Fajar'=>'L','Gita'=>'P','Hendra'=>'L','Indah'=>'P','Jihan'=>'P',
            'Kartika'=>'P','Lukman'=>'L','Maya'=>'P','Nanda'=>'L','Okta'=>'P',
            'Putra'=>'L','Qori'=>'P','Rudi'=>'L','Sinta'=>'P','Taufik'=>'L',
        ];

        $nis = 20240001;
        foreach ($firstNames as $first) {
            foreach ($lastNames as $last) {
                $fullName = $first . ' ' . $last;
                $email    = strtolower($first . '.' . $last) . '@siswa.sekolah.id';
                User::create([
                    'name'            => $fullName,
                    'email'           => $email,
                    'role'            => 'student',
                    'identity_number' => (string) $nis++,
                    'gender'          => $genderMap[$first],
                    'password'        => bcrypt('password'),
                ]);
            }
        }

        $this->command->info('Users seeded: 1 admin, 15 teachers, 360 students');
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/UserSeeder.php
git commit -m "feat(seeder): add UserSeeder (1 admin, 15 teachers, 360 students)"
```

---

### Task 4: SubjectSeeder

**Files:**
- Create: `database/seeders/SubjectSeeder.php`

**Step 1: Create file**

```php
<?php

namespace Database\Seeders;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Matematika Wajib',     'code' => 'MTK-W', 'category' => 'Wajib',     'teacher_email' => 'budi.santoso@sekolah.id'],
            ['name' => 'Bahasa Indonesia',      'code' => 'BIND',  'category' => 'Wajib',     'teacher_email' => 'siti.aminah@sekolah.id'],
            ['name' => 'Bahasa Inggris',        'code' => 'BING',  'category' => 'Wajib',     'teacher_email' => 'bambang.susilo@sekolah.id'],
            ['name' => 'Fisika',                'code' => 'FIS',   'category' => 'Peminatan', 'teacher_email' => 'ratna.dewi@sekolah.id'],
            ['name' => 'Kimia',                 'code' => 'KIM',   'category' => 'Peminatan', 'teacher_email' => 'ahmad.fauzi@sekolah.id'],
            ['name' => 'Biologi',               'code' => 'BIO',   'category' => 'Peminatan', 'teacher_email' => 'dewi.lestari@sekolah.id'],
            ['name' => 'Sejarah Indonesia',     'code' => 'SEJI',  'category' => 'Wajib',     'teacher_email' => 'wahyu.santoso@sekolah.id'],
            ['name' => 'Pendidikan Pancasila',  'code' => 'PPKN',  'category' => 'Wajib',     'teacher_email' => 'rina.susanti@sekolah.id'],
            ['name' => 'Pendidikan Agama',      'code' => 'PAI',   'category' => 'Wajib',     'teacher_email' => 'agus.setiawan@sekolah.id'],
            ['name' => 'Penjas',                'code' => 'PJOK',  'category' => 'Wajib',     'teacher_email' => 'yanti.kurniawati@sekolah.id'],
            ['name' => 'Seni Budaya',           'code' => 'SBUD',  'category' => 'Wajib',     'teacher_email' => 'hendra.kusuma@sekolah.id'],
            ['name' => 'Matematika Peminatan',  'code' => 'MTK-P', 'category' => 'Peminatan', 'teacher_email' => 'lina.marlina@sekolah.id'],
            ['name' => 'Ekonomi',               'code' => 'EKO',   'category' => 'Peminatan', 'teacher_email' => 'muhamad.akbar@sekolah.id'],
            ['name' => 'Sosiologi',             'code' => 'SOS',   'category' => 'Peminatan', 'teacher_email' => 'nita.sari@sekolah.id'],
            ['name' => 'Geografi',              'code' => 'GEO',   'category' => 'Peminatan', 'teacher_email' => 'odi.supriadi@sekolah.id'],
        ];

        foreach ($subjects as $data) {
            $teacher = User::where('email', $data['teacher_email'])->first();
            $subject = Subject::create([
                'name'     => $data['name'],
                'code'     => $data['code'],
                'category' => $data['category'],
            ]);
            // Map teacher to subject
            $subject->users()->attach($teacher->id);
        }

        $this->command->info('Subjects seeded: 15 subjects with teacher mappings');
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/SubjectSeeder.php
git commit -m "feat(seeder): add SubjectSeeder (15 subjects + subject_user)"
```

---

### Task 5: ClassroomSeeder

**Files:**
- Create: `database/seeders/ClassroomSeeder.php`

**Step 1: Create file**

```php
<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassroomSeeder extends Seeder
{
    public function run(): void
    {
        $classroomData = [
            ['name' => 'X IPA 1',   'level' => '10', 'major' => 'IPA', 'wali' => 'budi.santoso@sekolah.id'],
            ['name' => 'X IPA 2',   'level' => '10', 'major' => 'IPA', 'wali' => 'siti.aminah@sekolah.id'],
            ['name' => 'X IPS 1',   'level' => '10', 'major' => 'IPS', 'wali' => 'muhamad.akbar@sekolah.id'],
            ['name' => 'X IPS 2',   'level' => '10', 'major' => 'IPS', 'wali' => 'nita.sari@sekolah.id'],
            ['name' => 'XI IPA 1',  'level' => '11', 'major' => 'IPA', 'wali' => 'ratna.dewi@sekolah.id'],
            ['name' => 'XI IPA 2',  'level' => '11', 'major' => 'IPA', 'wali' => 'ahmad.fauzi@sekolah.id'],
            ['name' => 'XI IPS 1',  'level' => '11', 'major' => 'IPS', 'wali' => 'odi.supriadi@sekolah.id'],
            ['name' => 'XII IPA 1', 'level' => '12', 'major' => 'IPA', 'wali' => 'dewi.lestari@sekolah.id'],
            ['name' => 'XII IPA 2', 'level' => '12', 'major' => 'IPA', 'wali' => 'wahyu.santoso@sekolah.id'],
            ['name' => 'XII IPS 1', 'level' => '12', 'major' => 'IPS', 'wali' => 'lina.marlina@sekolah.id'],
        ];

        // Get all students ordered by ID (they were created in order)
        $students = User::where('role', 'student')->orderBy('id')->get();
        $studentChunks = $students->chunk(36); // 36 per class

        foreach ($classroomData as $index => $data) {
            $teacher = User::where('email', $data['wali'])->first();

            $classroom = Classroom::create([
                'name'          => $data['name'],
                'level'         => $data['level'],
                'major'         => $data['major'],
                'academic_year' => '2024/2025',
                'teacher_id'    => $teacher->id,
            ]);

            // Attach 36 students to this classroom
            if (isset($studentChunks[$index])) {
                foreach ($studentChunks[$index] as $student) {
                    $classroom->students()->attach($student->id, ['is_active' => true]);
                }
            }
        }

        $this->command->info('Classrooms seeded: 10 classrooms, 360 students assigned');
    }
}
```

**Step 2: Verify `students()` relationship exists on Classroom model**

Check `app/Models/Classroom.php` — it should have:
```php
public function students(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'classroom_user')
                ->withPivot('is_active')
                ->withTimestamps();
}
```
If not, add it.

**Step 3: Commit**

```bash
git add database/seeders/ClassroomSeeder.php
git commit -m "feat(seeder): add ClassroomSeeder (10 classrooms, 360 students)"
```

---

### Task 6: ScheduleSeeder

**Files:**
- Create: `database/seeders/ScheduleSeeder.php`

**Step 1: Create file**

```php
<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    // 8 time slots per day (07:00–14:00, with breaks)
    private array $timeSlots = [
        ['start' => '07:00', 'end' => '07:45'],
        ['start' => '07:45', 'end' => '08:30'],
        ['start' => '08:30', 'end' => '09:15'],
        ['start' => '09:30', 'end' => '10:15'], // after istirahat
        ['start' => '10:15', 'end' => '11:00'],
        ['start' => '11:00', 'end' => '11:45'],
        ['start' => '12:30', 'end' => '13:15'], // after ishoma
        ['start' => '13:15', 'end' => '14:00'],
    ];

    // Subject codes per day per major (8 per day)
    private array $scheduleIPA = [
        'Senin'  => ['MTK-W', 'BIND',  'FIS',  'KIM',   'BING',  'BIO',  'PAI',  'PJOK'],
        'Selasa' => ['MTK-P', 'BIND',  'KIM',  'FIS',   'BING',  'SEJI', 'PPKN', 'SBUD'],
        'Rabu'   => ['MTK-W', 'BING',  'FIS',  'BIO',   'BIND',  'KIM',  'PAI',  'MTK-P'],
        'Kamis'  => ['BIO',   'BIND',  'MTK-W','BING',  'FIS',   'SEJI', 'PJOK', 'SBUD'],
        'Jumat'  => ['MTK-P', 'BIO',   'KIM',  'BIND',  'MTK-W', 'BING', 'PPKN', 'PAI'],
    ];

    private array $scheduleIPS = [
        'Senin'  => ['MTK-W', 'BIND',  'EKO',  'SOS',   'BING',  'GEO',  'PAI',  'PJOK'],
        'Selasa' => ['EKO',   'BIND',  'SOS',  'MTK-W', 'BING',  'SEJI', 'PPKN', 'SBUD'],
        'Rabu'   => ['MTK-W', 'BING',  'GEO',  'EKO',   'BIND',  'SOS',  'PAI',  'SEJI'],
        'Kamis'  => ['GEO',   'BIND',  'MTK-W','BING',  'EKO',   'SEJI', 'PJOK', 'SBUD'],
        'Jumat'  => ['SOS',   'GEO',   'EKO',  'BIND',  'MTK-W', 'BING', 'PPKN', 'PAI'],
    ];

    // Default room per classroom
    private array $classroomRooms = [
        'X IPA 1'   => 'R.101',
        'X IPA 2'   => 'R.102',
        'X IPS 1'   => 'R.103',
        'X IPS 2'   => 'R.104',
        'XI IPA 1'  => 'R.201',
        'XI IPA 2'  => 'R.202',
        'XI IPS 1'  => 'R.203',
        'XII IPA 1' => 'R.301',
        'XII IPA 2' => 'R.302',
        'XII IPS 1' => 'R.303',
    ];

    // Lab overrides for science subjects
    private array $labRooms = [
        'FIS' => 'Lab Fisika',
        'KIM' => 'Lab Kimia',
        'BIO' => 'Lab Biologi',
    ];

    public function run(): void
    {
        $subjects   = Subject::all()->keyBy('code');
        $classrooms = Classroom::all();
        $days       = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

        foreach ($classrooms as $classroom) {
            $template    = $classroom->major === 'IPA' ? $this->scheduleIPA : $this->scheduleIPS;
            $defaultRoom = $this->classroomRooms[$classroom->name] ?? 'R.101';

            foreach ($days as $day) {
                $subjectCodes = $template[$day];

                foreach ($subjectCodes as $slotIndex => $code) {
                    $subject = $subjects[$code] ?? null;
                    if (! $subject) {
                        continue;
                    }

                    // Get the teacher for this subject from subject_user
                    $teacher = $subject->users()->first();
                    if (! $teacher) {
                        continue;
                    }

                    $room = $this->labRooms[$code] ?? $defaultRoom;

                    Schedule::create([
                        'subject_id'   => $subject->id,
                        'classroom_id' => $classroom->id,
                        'teacher_id'   => $teacher->id,
                        'day'          => $day,
                        'start_time'   => $this->timeSlots[$slotIndex]['start'],
                        'end_time'     => $this->timeSlots[$slotIndex]['end'],
                        'room'         => $room,
                    ]);
                }
            }
        }

        $this->command->info('Schedules seeded: ' . Schedule::count() . ' records');
    }
}
```

**Step 2: Verify `users()` relationship exists on Subject model**

Check `app/Models/Subject.php` — it should have:
```php
public function users(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'subject_user')->withTimestamps();
}
```
If not, add it.

**Step 3: Commit**

```bash
git add database/seeders/ScheduleSeeder.php
git commit -m "feat(seeder): add ScheduleSeeder (400 schedules for all 10 classrooms)"
```

---

### Task 7: AttendanceJournalSeeder

**Files:**
- Create: `database/seeders/AttendanceJournalSeeder.php`

**Step 1: Create file**

```php
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

    // Weighted random: 85% hadir, 7% sakit, 5% izin, 3% alpha
    private array $statusPool = [
        ...array_fill(0, 85, 'hadir'),
        ...array_fill(0, 7,  'sakit'),
        ...array_fill(0, 5,  'izin'),
        ...array_fill(0, 3,  'alpha'),
    ];

    // "Trouble students" (by NIS index in their class, 0-based) get elevated alpha
    private array $troublePool = [
        ...array_fill(0, 60, 'hadir'),
        ...array_fill(0, 10, 'sakit'),
        ...array_fill(0, 10, 'izin'),
        ...array_fill(0, 20, 'alpha'),
    ];

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
                $students      = $schedule->classroom->students;
                $troubleIds    = $students->take(4)->pluck('id')->toArray(); // first 4 are "trouble"
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
                    $titles      = $this->journalTitles[$subjectCode] ?? ['Pembelajaran'];
                    $titleIndex  = (crc32($dateStr . $schedule->id)) % count($titles);

                    $journalBatch[] = [
                        'schedule_id' => $schedule->id,
                        'teacher_id'  => $schedule->teacher_id,
                        'date'        => $dateStr,
                        'title'       => 'Pertemuan — ' . $titles[abs($titleIndex)],
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
        $feb = Carbon::create(2026, 2, 1);
        $febEnd = Carbon::create(2026, 2, 28);
        while ($feb->lte($febEnd)) {
            if ($feb->isWeekday()) {
                $days[] = $feb->format('Y-m-d');
            }
            $feb->addDay();
        }

        // March 2026 — weekdays up to today (dynamic)
        $mar = Carbon::create(2026, 3, 1);
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
```

**Step 2: Commit**

```bash
git add database/seeders/AttendanceJournalSeeder.php
git commit -m "feat(seeder): add AttendanceJournalSeeder (Feb 2026 + March up to today)"
```

---

### Task 8: AnnouncementSeeder

**Files:**
- Create: `database/seeders/AnnouncementSeeder.php`

**Step 1: Create file**

```php
<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $announcements = [
            [
                'title'        => 'Jadwal Ujian Tengah Semester Genap 2024/2025',
                'content'      => 'Diberitahukan kepada seluruh siswa bahwa Ujian Tengah Semester (UTS) Genap Tahun Pelajaran 2024/2025 akan dilaksanakan pada tanggal 17–22 Maret 2026. Siswa diharapkan mempersiapkan diri dengan baik.',
                'is_active'    => true,
                'published_at' => '2026-02-10 08:00:00',
            ],
            [
                'title'        => 'Libur Hari Raya Nyepi',
                'content'      => 'Diberitahukan bahwa pada hari Senin, 20 Maret 2026, sekolah libur dalam rangka Hari Raya Nyepi Tahun Baru Saka 1948. Kegiatan belajar mengajar kembali normal pada hari Selasa, 21 Maret 2026.',
                'is_active'    => true,
                'published_at' => '2026-03-01 07:00:00',
            ],
            [
                'title'        => 'Rapat Orang Tua dan Wali Murid',
                'content'      => 'Mengundang seluruh orang tua/wali murid untuk hadir dalam Rapat Orang Tua yang akan dilaksanakan pada Sabtu, 15 Maret 2026 pukul 09.00 WIB di Aula Sekolah. Agenda: laporan perkembangan siswa dan persiapan ujian akhir semester.',
                'is_active'    => true,
                'published_at' => '2026-03-02 09:00:00',
            ],
            [
                'title'        => 'Lomba Karya Tulis Ilmiah Tingkat Provinsi',
                'content'      => 'Sekolah membuka pendaftaran untuk Lomba Karya Tulis Ilmiah (LKTI) tingkat provinsi. Siswa kelas XI dan XII yang berminat dapat mendaftarkan diri ke ruang BK paling lambat 10 Maret 2026.',
                'is_active'    => true,
                'published_at' => '2026-02-20 10:00:00',
            ],
            [
                'title'        => 'Pengumuman Pemenang Lomba Kebersihan Kelas',
                'content'      => 'Selamat kepada Kelas XI IPA 1 yang berhasil meraih Juara 1 Lomba Kebersihan dan Keindahan Kelas bulan Februari 2026. Juara 2: X IPS 2, Juara 3: XII IPA 2.',
                'is_active'    => true,
                'published_at' => '2026-02-28 13:00:00',
            ],
            [
                'title'        => '[DRAFT] Panduan Penerimaan Peserta Didik Baru 2026/2027',
                'content'      => 'Panduan PPDB Tahun Pelajaran 2026/2027 sedang dalam tahap finalisasi. Informasi lebih lanjut akan diumumkan segera.',
                'is_active'    => false,
                'published_at' => null,
            ],
        ];

        foreach ($announcements as $data) {
            Announcement::create(array_merge($data, ['posted_by' => $admin->id]));
        }

        $this->command->info('Announcements seeded: 6 records (5 active, 1 draft)');
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/AnnouncementSeeder.php
git commit -m "feat(seeder): add AnnouncementSeeder (6 pengumuman)"
```

---

### Task 9: LibrarySeeder

**Files:**
- Create: `database/seeders/LibrarySeeder.php`

**Step 1: Create file**

```php
<?php

namespace Database\Seeders;

use App\Models\LibraryBook;
use App\Models\LibraryLoan;
use App\Models\LibraryReadingProgress;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        $admin    = User::where('role', 'admin')->first();
        $students = User::where('role', 'student')->inRandomOrder()->take(60)->get();

        // ── Books ─────────────────────────────────────────────────
        $booksData = [
            ['title' => 'Matematika untuk SMA Kelas X',         'author' => 'Sukino',                'category' => 'Matematika',  'pages' => 280, 'slug' => 'matematika-sma-x'],
            ['title' => 'Matematika untuk SMA Kelas XI',        'author' => 'Sukino',                'category' => 'Matematika',  'pages' => 310, 'slug' => 'matematika-sma-xi'],
            ['title' => 'Matematika untuk SMA Kelas XII',       'author' => 'Marthen Kanginan',      'category' => 'Matematika',  'pages' => 295, 'slug' => 'matematika-sma-xii'],
            ['title' => 'Fisika Dasar Jilid 1',                 'author' => 'Halliday & Resnick',    'category' => 'Fisika',      'pages' => 480, 'slug' => 'fisika-dasar-1'],
            ['title' => 'Fisika untuk SMA Kelas XI',            'author' => 'Marthen Kanginan',      'category' => 'Fisika',      'pages' => 340, 'slug' => 'fisika-sma-xi'],
            ['title' => 'Kimia Organik',                        'author' => 'Fessenden & Fessenden', 'category' => 'Kimia',       'pages' => 520, 'slug' => 'kimia-organik'],
            ['title' => 'Kimia untuk SMA Kelas X',              'author' => 'Unggul Sudarmo',        'category' => 'Kimia',       'pages' => 260, 'slug' => 'kimia-sma-x'],
            ['title' => 'Biologi SMA Kelas X',                  'author' => 'D.A. Pratiwi',          'category' => 'Biologi',     'pages' => 290, 'slug' => 'biologi-sma-x'],
            ['title' => 'Biologi Sel dan Molekuler',            'author' => 'Gerald Karp',           'category' => 'Biologi',     'pages' => 450, 'slug' => 'biologi-sel'],
            ['title' => 'Bahasa Indonesia Ekspresi Diri',       'author' => 'Kemendikbud',           'category' => 'Bahasa',      'pages' => 220, 'slug' => 'bahasa-indonesia-x'],
            ['title' => 'English Grammar in Use',               'author' => 'Raymond Murphy',        'category' => 'Bahasa',      'pages' => 380, 'slug' => 'english-grammar'],
            ['title' => 'Sejarah Indonesia Kelas X',            'author' => 'Kemendikbud',           'category' => 'Sejarah',     'pages' => 200, 'slug' => 'sejarah-indonesia-x'],
            ['title' => 'Sejarah Peradaban Islam',              'author' => 'Samsul Munir Amin',     'category' => 'Sejarah',     'pages' => 360, 'slug' => 'sejarah-islam'],
            ['title' => 'Ekonomi SMA Kelas X',                  'author' => 'Alam S.',               'category' => 'Ekonomi',     'pages' => 240, 'slug' => 'ekonomi-sma-x'],
            ['title' => 'Pengantar Ilmu Ekonomi',               'author' => 'Sadono Sukirno',        'category' => 'Ekonomi',     'pages' => 420, 'slug' => 'pengantar-ekonomi'],
            ['title' => 'Sosiologi SMA Kelas XI',               'author' => 'Kun Maryati',           'category' => 'Sosiologi',   'pages' => 210, 'slug' => 'sosiologi-xi'],
            ['title' => 'Geografi SMA Kelas X',                 'author' => 'Wardiyatmoko',          'category' => 'Geografi',    'pages' => 250, 'slug' => 'geografi-x'],
            ['title' => 'Laskar Pelangi',                       'author' => 'Andrea Hirata',         'category' => 'Novel',       'pages' => 529, 'slug' => 'laskar-pelangi'],
            ['title' => 'Bumi Manusia',                         'author' => 'Pramoedya Ananta Toer', 'category' => 'Novel',       'pages' => 535, 'slug' => 'bumi-manusia'],
            ['title' => 'Perahu Kertas',                        'author' => 'Dee Lestari',           'category' => 'Novel',       'pages' => 444, 'slug' => 'perahu-kertas'],
            ['title' => 'Sang Pemimpi',                         'author' => 'Andrea Hirata',         'category' => 'Novel',       'pages' => 292, 'slug' => 'sang-pemimpi'],
            ['title' => 'Seni Budaya SMA Kelas X',              'author' => 'Kemendikbud',           'category' => 'Seni',        'pages' => 190, 'slug' => 'seni-budaya-x'],
            ['title' => 'Pendidikan Pancasila dan Kewarganegaraan', 'author' => 'Kemendikbud',       'category' => 'PKn',         'pages' => 180, 'slug' => 'ppkn-sma'],
            ['title' => 'Psikologi Pendidikan',                 'author' => 'Syah Muhibbin',         'category' => 'Umum',        'pages' => 310, 'slug' => 'psikologi-pendidikan'],
            ['title' => 'Kecerdasan Emosional',                 'author' => 'Daniel Goleman',        'category' => 'Umum',        'pages' => 358, 'slug' => 'kecerdasan-emosional'],
        ];

        $books = [];
        foreach ($booksData as $data) {
            $books[] = LibraryBook::create([
                'title'       => $data['title'],
                'author'      => $data['author'],
                'category'    => $data['category'],
                'description' => 'Buku referensi ' . $data['category'] . ' untuk mendukung kegiatan belajar mengajar.',
                'total_pages' => $data['pages'],
                'pdf_path'    => 'books/' . $data['slug'] . '.pdf',
                'uploaded_by' => $admin->id,
                'is_active'   => true,
            ]);
        }

        // ── Loans ─────────────────────────────────────────────────
        $loanedAt = Carbon::create(2026, 2, 3);
        $loansCreated = 0;

        foreach ($students->take(40) as $index => $student) {
            $book      = $books[$index % count($books)];
            $loanDate  = Carbon::create(2026, 2, 1)->addDays(rand(0, 42));
            $dueDate   = (clone $loanDate)->addDays(14);
            $isReturned = $index < 15; // first 15 are returned

            LibraryLoan::create([
                'library_book_id' => $book->id,
                'user_id'         => $student->id,
                'loaned_by'       => $admin->id,
                'loaned_at'       => $loanDate->toDateTimeString(),
                'due_at'          => $dueDate->toDateTimeString(),
                'returned_at'     => $isReturned ? $dueDate->subDays(rand(1, 7))->toDateTimeString() : null,
                'status'          => $isReturned ? 'returned' : 'active',
            ]);
            $loansCreated++;
        }

        // ── Reading Progress ──────────────────────────────────────
        foreach ($students->take(20) as $index => $student) {
            $book = $books[($index + 5) % count($books)];
            LibraryReadingProgress::create([
                'library_book_id' => $book->id,
                'user_id'         => $student->id,
                'current_page'    => rand(1, $book->total_pages),
                'last_event'      => 'page_turn',
                'page_updated_at' => now()->subDays(rand(1, 30))->toDateTimeString(),
                'last_seen_at'    => now()->subDays(rand(0, 7))->toDateTimeString(),
            ]);
        }

        $this->command->info('Library seeded: ' . count($books) . ' books, ' . $loansCreated . ' loans, 20 reading progress');
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/LibrarySeeder.php
git commit -m "feat(seeder): add LibrarySeeder (25 books, 40 loans, 20 progress)"
```

---

### Task 10: Final verification & push

**Step 1: Run full seeder in local tinker to verify (dry run)**

```bash
php artisan db:seed --class=DatabaseSeeder
```

Expected output:
```
INFO  Seeding database.
Users seeded: 1 admin, 15 teachers, 360 students
Subjects seeded: 15 subjects with teacher mappings
Classrooms seeded: 10 classrooms, 360 students assigned
Schedules seeded: 400 records
Seeding attendance & journals for 21 school days...
Attendance seeded: ~60480 records
Journals seeded: ~1260 records
Announcements seeded: 6 records (5 active, 1 draft)
Library seeded: 25 books, 40 loans, 20 reading progress
```

**Step 2: Verify record counts**

```bash
php artisan tinker --execute="
  echo 'Users: ' . App\Models\User::count() . PHP_EOL;
  echo 'Subjects: ' . App\Models\Subject::count() . PHP_EOL;
  echo 'Classrooms: ' . App\Models\Classroom::count() . PHP_EOL;
  echo 'Schedules: ' . App\Models\Schedule::count() . PHP_EOL;
  echo 'Attendances: ' . App\Models\Attendance::count() . PHP_EOL;
  echo 'Journals: ' . App\Models\Journal::count() . PHP_EOL;
"
```

**Step 3: Push**

```bash
git push origin master
```

---

## Notes

- `AttendanceJournalSeeder` uses `crc32($dateStr . $scheduleId)` for deterministic journal title selection (not `rand()`) to avoid duplicate random seeds producing the same data on re-runs.
- The `troublePool` marks the first 4 students per class as "frequent absentees" for realistic dashboard data.
- All bulk inserts use `DB::table()->insert()` with 500-row chunks to avoid memory issues.
- If `LibraryBook`, `LibraryLoan`, `LibraryReadingProgress` models don't exist yet, create them pointing to the correct table names.
