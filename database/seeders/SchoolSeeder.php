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
