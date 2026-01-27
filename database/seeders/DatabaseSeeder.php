<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Clear existing data
        DB::statement('PRAGMA foreign_keys = OFF');
        Attendance::truncate();
        Schedule::truncate();
        DB::table('classroom_user')->truncate();
        Classroom::truncate();
        Subject::truncate();
        User::truncate();
        DB::statement('PRAGMA foreign_keys = ON');

        // ============================================
        // 1. USERS (Admin, Teachers, Students)
        // ============================================
        
        // Admin
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@sekolah.id',
            'role' => 'admin',
            'identity_number' => null,
            'gender' => 'L',
            'password' => bcrypt('password'),
        ]);

        // Teachers (10 guru)
        $teachers = [];
        $teacherData = [
            ['name' => 'Budi Santoso, S.Pd', 'email' => 'budi.santoso@sekolah.id', 'identity_number' => '198501012010011001', 'gender' => 'L'],
            ['name' => 'Siti Aminah, S.Pd', 'email' => 'siti.aminah@sekolah.id', 'identity_number' => '198602022011012002', 'gender' => 'P'],
            ['name' => 'Bambang Susilo, S.Pd', 'email' => 'bambang.susilo@sekolah.id', 'identity_number' => '198703032012013003', 'gender' => 'L'],
            ['name' => 'Ratna Dewi, S.Pd', 'email' => 'ratna.dewi@sekolah.id', 'identity_number' => '198804042013014004', 'gender' => 'P'],
            ['name' => 'Ahmad Fauzi, S.Pd', 'email' => 'ahmad.fauzi@sekolah.id', 'identity_number' => '198905052014015005', 'gender' => 'L'],
            ['name' => 'Dewi Lestari, S.Pd', 'email' => 'dewi.lestari@sekolah.id', 'identity_number' => '199006062015016006', 'gender' => 'P'],
            ['name' => 'Joko Widodo, S.Pd', 'email' => 'joko.widodo@sekolah.id', 'identity_number' => '199107072016017007', 'gender' => 'L'],
            ['name' => 'Rina Susanti, S.Pd', 'email' => 'rina.susanti@sekolah.id', 'identity_number' => '199208082017018008', 'gender' => 'P'],
            ['name' => 'Agus Setiawan, S.Pd', 'email' => 'agus.setiawan@sekolah.id', 'identity_number' => '199309092018019009', 'gender' => 'L'],
            ['name' => 'Yanti Kurniawati, S.Pd', 'email' => 'yanti.kurniawati@sekolah.id', 'identity_number' => '199410102019020010', 'gender' => 'P'],
        ];

        foreach ($teacherData as $data) {
            $teachers[] = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => 'teacher',
                'identity_number' => $data['identity_number'],
                'gender' => $data['gender'],
                'password' => bcrypt('password'),
            ]);
        }

        // Students (36 siswa untuk demo)
        $students = [];
        $studentNames = [
            ['name' => 'Ahmad Rizki', 'gender' => 'L'],
            ['name' => 'Budi Prasetyo', 'gender' => 'L'],
            ['name' => 'Citra Dewi', 'gender' => 'P'],
            ['name' => 'Dian Sastro', 'gender' => 'P'],
            ['name' => 'Eko Prasetyo', 'gender' => 'L'],
            ['name' => 'Fajar Nugraha', 'gender' => 'L'],
            ['name' => 'Gita Gutawa', 'gender' => 'P'],
            ['name' => 'Hendra Setiawan', 'gender' => 'L'],
            ['name' => 'Indah Permata', 'gender' => 'P'],
            ['name' => 'Joko Susilo', 'gender' => 'L'],
            ['name' => 'Kartika Putri', 'gender' => 'P'],
            ['name' => 'Lukman Hakim', 'gender' => 'L'],
            ['name' => 'Maya Sari', 'gender' => 'P'],
            ['name' => 'Nanda Pratama', 'gender' => 'L'],
            ['name' => 'Oktavia Sari', 'gender' => 'P'],
            ['name' => 'Putra Wijaya', 'gender' => 'L'],
            ['name' => 'Qori Amalia', 'gender' => 'P'],
            ['name' => 'Rudi Hartono', 'gender' => 'L'],
            ['name' => 'Sinta Dewi', 'gender' => 'P'],
            ['name' => 'Taufik Hidayat', 'gender' => 'L'],
            ['name' => 'Umi Kalsum', 'gender' => 'P'],
            ['name' => 'Vino Bastian', 'gender' => 'L'],
            ['name' => 'Wulan Sari', 'gender' => 'P'],
            ['name' => 'Xavier Pratama', 'gender' => 'L'],
            ['name' => 'Yuni Shara', 'gender' => 'P'],
            ['name' => 'Zainal Abidin', 'gender' => 'L'],
            ['name' => 'Anisa Rahma', 'gender' => 'P'],
            ['name' => 'Bayu Aji', 'gender' => 'L'],
            ['name' => 'Cantika Putri', 'gender' => 'P'],
            ['name' => 'Dimas Anggara', 'gender' => 'L'],
            ['name' => 'Elsa Maharani', 'gender' => 'P'],
            ['name' => 'Firman Syah', 'gender' => 'L'],
            ['name' => 'Gina Maharani', 'gender' => 'P'],
            ['name' => 'Hadi Wijaya', 'gender' => 'L'],
            ['name' => 'Intan Permata', 'gender' => 'P'],
            ['name' => 'Jihan Aulia', 'gender' => 'P'],
        ];

        $nisCounter = 20240001;
        foreach ($studentNames as $data) {
            $students[] = User::create([
                'name' => $data['name'],
                'email' => strtolower(str_replace(' ', '.', $data['name'])) . '@siswa.sekolah.id',
                'role' => 'student',
                'identity_number' => (string)$nisCounter++,
                'gender' => $data['gender'],
                'password' => bcrypt('password'),
            ]);
        }

        // ============================================
        // 2. SUBJECTS (Mata Pelajaran)
        // ============================================
        $subjects = [];
        $subjectData = [
            ['name' => 'Matematika Wajib', 'code' => 'MTK-W', 'category' => 'Wajib'],
            ['name' => 'Matematika Peminatan', 'code' => 'MTK-P', 'category' => 'Peminatan'],
            ['name' => 'Bahasa Indonesia', 'code' => 'BIND', 'category' => 'Wajib'],
            ['name' => 'Bahasa Inggris', 'code' => 'BING', 'category' => 'Wajib'],
            ['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Peminatan'],
            ['name' => 'Kimia', 'code' => 'KIM', 'category' => 'Peminatan'],
            ['name' => 'Biologi', 'code' => 'BIO', 'category' => 'Peminatan'],
            ['name' => 'Sejarah Indonesia', 'code' => 'SEJI', 'category' => 'Wajib'],
            ['name' => 'Pendidikan Pancasila', 'code' => 'PPKN', 'category' => 'Wajib'],
            ['name' => 'Pendidikan Agama', 'code' => 'PAI', 'category' => 'Wajib'],
            ['name' => 'Penjas', 'code' => 'PJOK', 'category' => 'Wajib'],
            ['name' => 'Seni Budaya', 'code' => 'SBUD', 'category' => 'Wajib'],
        ];

        foreach ($subjectData as $data) {
            $subjects[] = Subject::create($data);
        }

        // ============================================
        // 3. CLASSROOMS (Kelas/Rombel)
        // ============================================
        $classrooms = [];
        $classroomData = [
            // Kelas X
            ['name' => 'X IPA 1', 'level' => '10', 'major' => 'IPA', 'teacher_index' => 0],
            ['name' => 'X IPA 2', 'level' => '10', 'major' => 'IPA', 'teacher_index' => 1],
            ['name' => 'X IPS 1', 'level' => '10', 'major' => 'IPS', 'teacher_index' => 2],
            ['name' => 'X IPS 2', 'level' => '10', 'major' => 'IPS', 'teacher_index' => 3],
            // Kelas XI
            ['name' => 'XI IPA 1', 'level' => '11', 'major' => 'IPA', 'teacher_index' => 4],
            ['name' => 'XI IPA 2', 'level' => '11', 'major' => 'IPA', 'teacher_index' => 5],
            ['name' => 'XI IPS 1', 'level' => '11', 'major' => 'IPS', 'teacher_index' => 6],
            // Kelas XII
            ['name' => 'XII IPA 1', 'level' => '12', 'major' => 'IPA', 'teacher_index' => 7],
            ['name' => 'XII IPA 2', 'level' => '12', 'major' => 'IPA', 'teacher_index' => 8],
            ['name' => 'XII IPS 1', 'level' => '12', 'major' => 'IPS', 'teacher_index' => 9],
        ];

        foreach ($classroomData as $data) {
            $classrooms[] = Classroom::create([
                'name' => $data['name'],
                'level' => $data['level'],
                'major' => $data['major'],
                'academic_year' => '2024/2025',
                'teacher_id' => $teachers[$data['teacher_index']]->id,
            ]);
        }

        // Assign students to classrooms (distribute evenly)
        $studentsPerClass = array_chunk($students, 12); // ~12 siswa per kelas untuk 3 kelas pertama
        foreach ($classrooms as $index => $classroom) {
            if (isset($studentsPerClass[$index])) {
                foreach ($studentsPerClass[$index] as $student) {
                    $classroom->students()->attach($student->id, ['is_active' => true]);
                }
            }
        }

        // ============================================
        // 4. SCHEDULES (Jadwal)
        // ============================================
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $timeSlots = [
            ['start' => '07:00', 'end' => '07:45'],
            ['start' => '07:45', 'end' => '08:30'],
            ['start' => '08:30', 'end' => '09:15'],
            ['start' => '09:30', 'end' => '10:15'],
            ['start' => '10:15', 'end' => '11:00'],
            ['start' => '11:00', 'end' => '11:45'],
            ['start' => '12:30', 'end' => '13:15'],
            ['start' => '13:15', 'end' => '14:00'],
        ];
        $rooms = ['R.101', 'R.102', 'R.103', 'R.201', 'R.202', 'R.203', 'Lab Fisika', 'Lab Kimia', 'Lab Komputer'];

        // Create schedules for first 3 classrooms
        $schedules = [];
        for ($classIndex = 0; $classIndex < 3; $classIndex++) {
            $classroom = $classrooms[$classIndex];
            
            foreach ($days as $dayIndex => $day) {
                // 4 slots per day
                for ($slot = 0; $slot < 4; $slot++) {
                    $subjectIndex = ($dayIndex * 4 + $slot) % count($subjects);
                    $teacherIndex = $subjectIndex % count($teachers);
                    $roomIndex = ($classIndex + $slot) % count($rooms);
                    
                    $schedule = Schedule::create([
                        'subject_id' => $subjects[$subjectIndex]->id,
                        'classroom_id' => $classroom->id,
                        'teacher_id' => $teachers[$teacherIndex]->id,
                        'day' => $day,
                        'start_time' => $timeSlots[$slot]['start'],
                        'end_time' => $timeSlots[$slot]['end'],
                        'room' => $rooms[$roomIndex],
                    ]);
                    $schedules[] = $schedule;
                }
            }
        }

        // ============================================
        // 5. ATTENDANCES (Sample data for today)
        // ============================================
        $today = now()->format('Y-m-d');
        $statuses = ['hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'sakit', 'izin', 'alpha'];

        // Get schedules for today (based on day name)
        $todaySchedules = Schedule::where('day', now()->locale('id')->dayName)->get();
        
        // If no schedules for today, use Senin schedules
        if ($todaySchedules->isEmpty()) {
            $todaySchedules = Schedule::where('day', 'Senin')->take(5)->get();
        }

        foreach ($todaySchedules->take(5) as $schedule) {
            $classroomStudents = $schedule->classroom->students;
            
            foreach ($classroomStudents as $student) {
                Attendance::create([
                    'schedule_id' => $schedule->id,
                    'student_id' => $student->id,
                    'date' => $today,
                    'status' => $statuses[array_rand($statuses)],
                ]);
            }
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('- Users: ' . User::count() . ' (1 admin, ' . count($teachers) . ' teachers, ' . count($students) . ' students)');
        $this->command->info('- Subjects: ' . Subject::count());
        $this->command->info('- Classrooms: ' . Classroom::count());
        $this->command->info('- Schedules: ' . Schedule::count());
        $this->command->info('- Attendances: ' . Attendance::count());
    }
}
