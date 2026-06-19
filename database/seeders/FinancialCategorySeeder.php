<?php

namespace Database\Seeders;

use App\Models\FinancialCategory;
use Illuminate\Database\Seeder;

class FinancialCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'SPP Bulanan', 'type' => 'income', 'description' => 'Iuran SPP per bulan', 'default_amount' => 150000],
            ['name' => 'Uang Gedung', 'type' => 'income', 'description' => 'Pembayaran uang gedung sekolah', 'default_amount' => 5000000],
            ['name' => 'Seragam', 'type' => 'income', 'description' => 'Pembelian seragam sekolah', 'default_amount' => 350000],
            ['name' => 'Uang Buku', 'type' => 'income', 'description' => 'Pembelian buku pelajaran', 'default_amount' => 500000],
            ['name' => 'Uang Praktikum', 'type' => 'income', 'description' => 'Biaya praktikum', 'default_amount' => 200000],
            ['name' => 'Uang Kegiatan', 'type' => 'income', 'description' => 'Biaya kegiatan sekolah', 'default_amount' => 100000],
            ['name' => 'Biaya Operasional', 'type' => 'expense', 'description' => 'Biaya operasional sekolah', 'default_amount' => null],
            ['name' => 'Gaji Guru', 'type' => 'expense', 'description' => 'Pembayaran gaji guru', 'default_amount' => null],
        ];

        foreach ($categories as $category) {
            FinancialCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
