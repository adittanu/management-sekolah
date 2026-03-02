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
