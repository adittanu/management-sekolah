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
            ['name' => 'Matematika Wajib',        'code' => 'MTK-W', 'category' => 'Wajib',     'teacher_email' => 'budi.santoso@sekolah.id'],
            ['name' => 'Bahasa Indonesia',         'code' => 'BIND',  'category' => 'Wajib',     'teacher_email' => 'siti.aminah@sekolah.id'],
            ['name' => 'Bahasa Inggris',           'code' => 'BING',  'category' => 'Wajib',     'teacher_email' => 'bambang.susilo@sekolah.id'],
            ['name' => 'Fisika',                   'code' => 'FIS',   'category' => 'Peminatan', 'teacher_email' => 'ratna.dewi@sekolah.id'],
            ['name' => 'Kimia',                    'code' => 'KIM',   'category' => 'Peminatan', 'teacher_email' => 'ahmad.fauzi@sekolah.id'],
            ['name' => 'Biologi',                  'code' => 'BIO',   'category' => 'Peminatan', 'teacher_email' => 'dewi.lestari@sekolah.id'],
            ['name' => 'Sejarah Indonesia',        'code' => 'SEJI',  'category' => 'Wajib',     'teacher_email' => 'wahyu.santoso@sekolah.id'],
            ['name' => 'Pendidikan Pancasila',     'code' => 'PPKN',  'category' => 'Wajib',     'teacher_email' => 'rina.susanti@sekolah.id'],
            ['name' => 'Pendidikan Agama',         'code' => 'PAI',   'category' => 'Wajib',     'teacher_email' => 'agus.setiawan@sekolah.id'],
            ['name' => 'Penjas',                   'code' => 'PJOK',  'category' => 'Wajib',     'teacher_email' => 'yanti.kurniawati@sekolah.id'],
            ['name' => 'Seni Budaya',              'code' => 'SBUD',  'category' => 'Wajib',     'teacher_email' => 'hendra.kusuma@sekolah.id'],
            ['name' => 'Matematika Peminatan',     'code' => 'MTK-P', 'category' => 'Peminatan', 'teacher_email' => 'lina.marlina@sekolah.id'],
            ['name' => 'Ekonomi',                  'code' => 'EKO',   'category' => 'Peminatan', 'teacher_email' => 'muhamad.akbar@sekolah.id'],
            ['name' => 'Sosiologi',                'code' => 'SOS',   'category' => 'Peminatan', 'teacher_email' => 'nita.sari@sekolah.id'],
            ['name' => 'Geografi',                 'code' => 'GEO',   'category' => 'Peminatan', 'teacher_email' => 'odi.supriadi@sekolah.id'],
        ];

        foreach ($subjects as $data) {
            $teacher = User::where('email', $data['teacher_email'])->firstOrFail();
            $subject = Subject::create([
                'name'     => $data['name'],
                'code'     => $data['code'],
                'category' => $data['category'],
            ]);
            $subject->teachers()->attach($teacher->id);
        }

        $this->command->info('Subjects seeded: 15 subjects with teacher mappings');
    }
}
