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

        // Get all students ordered by ID (created sequentially in UserSeeder)
        $students = User::where('role', 'student')->orderBy('id')->get();
        $studentChunks = $students->chunk(36);

        foreach ($classroomData as $index => $data) {
            $teacher = User::where('email', $data['wali'])->firstOrFail();

            $classroom = Classroom::create([
                'name'          => $data['name'],
                'level'         => $data['level'],
                'major'         => $data['major'],
                'academic_year' => '2024/2025',
                'teacher_id'    => $teacher->id,
            ]);

            if (isset($studentChunks[$index])) {
                foreach ($studentChunks[$index] as $student) {
                    $classroom->students()->attach($student->id, ['is_active' => true]);
                }
            }
        }

        $this->command->info('Classrooms seeded: 10 classrooms, 360 students assigned');
    }
}
