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
            ['name' => 'Budi Santoso, S.Pd',    'email' => 'budi.santoso@sekolah.id',    'identity_number' => '198501012010011001', 'gender' => 'L'],
            ['name' => 'Siti Aminah, S.Pd',      'email' => 'siti.aminah@sekolah.id',      'identity_number' => '198602022011012002', 'gender' => 'P'],
            ['name' => 'Bambang Susilo, S.Pd',   'email' => 'bambang.susilo@sekolah.id',   'identity_number' => '198703032012013003', 'gender' => 'L'],
            ['name' => 'Ratna Dewi, S.Pd',       'email' => 'ratna.dewi@sekolah.id',       'identity_number' => '198804042013014004', 'gender' => 'P'],
            ['name' => 'Ahmad Fauzi, S.Pd',      'email' => 'ahmad.fauzi@sekolah.id',      'identity_number' => '198905052014015005', 'gender' => 'L'],
            ['name' => 'Dewi Lestari, S.Pd',     'email' => 'dewi.lestari@sekolah.id',     'identity_number' => '199006062015016006', 'gender' => 'P'],
            ['name' => 'Wahyu Santoso, S.Pd',    'email' => 'wahyu.santoso@sekolah.id',    'identity_number' => '199107072016017007', 'gender' => 'L'],
            ['name' => 'Rina Susanti, S.Pd',     'email' => 'rina.susanti@sekolah.id',     'identity_number' => '199208082017018008', 'gender' => 'P'],
            ['name' => 'Agus Setiawan, S.Pd',    'email' => 'agus.setiawan@sekolah.id',    'identity_number' => '199309092018019009', 'gender' => 'L'],
            ['name' => 'Yanti Kurniawati, S.Pd', 'email' => 'yanti.kurniawati@sekolah.id', 'identity_number' => '199410102019020010', 'gender' => 'P'],
            ['name' => 'Hendra Kusuma, S.Pd',    'email' => 'hendra.kusuma@sekolah.id',    'identity_number' => '199511112020021011', 'gender' => 'L'],
            ['name' => 'Lina Marlina, S.Pd',     'email' => 'lina.marlina@sekolah.id',     'identity_number' => '199612122021022012', 'gender' => 'P'],
            ['name' => 'Muhamad Akbar, S.Pd',    'email' => 'muhamad.akbar@sekolah.id',    'identity_number' => '199713132022023013', 'gender' => 'L'],
            ['name' => 'Nita Sari, S.Pd',        'email' => 'nita.sari@sekolah.id',        'identity_number' => '199814142023024014', 'gender' => 'P'],
            ['name' => 'Odi Supriadi, S.Pd',     'email' => 'odi.supriadi@sekolah.id',     'identity_number' => '199915152024025015', 'gender' => 'L'],
        ];

        foreach ($teacherData as $data) {
            User::create(array_merge($data, [
                'role'     => 'teacher',
                'password' => bcrypt('password'),
            ]));
        }

        // ── Students: 20 first names × 18 last names = 360 ──────
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
                User::create([
                    'name'            => $first . ' ' . $last,
                    'email'           => strtolower($first . '.' . $last) . '@siswa.sekolah.id',
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
