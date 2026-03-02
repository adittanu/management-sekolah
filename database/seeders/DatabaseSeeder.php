<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use \Illuminate\Database\Console\Seeds\WithoutModelEvents;

    public function run(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
        }

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

        if ($driver === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON');
        }

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
