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
