<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    private array $timeSlots = [
        ['start' => '07:00', 'end' => '07:45'],
        ['start' => '07:45', 'end' => '08:30'],
        ['start' => '08:30', 'end' => '09:15'],
        ['start' => '09:30', 'end' => '10:15'],
        ['start' => '10:15', 'end' => '11:00'],
        ['start' => '11:00', 'end' => '11:45'],
        ['start' => '12:30', 'end' => '13:15'],
        ['start' => '13:15', 'end' => '14:00'],
    ];

    private array $scheduleIPA = [
        'Senin'  => ['MTK-W', 'BIND',  'FIS',   'KIM',   'BING',  'BIO',  'PAI',  'PJOK'],
        'Selasa' => ['MTK-P', 'BIND',  'KIM',   'FIS',   'BING',  'SEJI', 'PPKN', 'SBUD'],
        'Rabu'   => ['MTK-W', 'BING',  'FIS',   'BIO',   'BIND',  'KIM',  'PAI',  'MTK-P'],
        'Kamis'  => ['BIO',   'BIND',  'MTK-W', 'BING',  'FIS',   'SEJI', 'PJOK', 'SBUD'],
        'Jumat'  => ['MTK-P', 'BIO',   'KIM',   'BIND',  'MTK-W', 'BING', 'PPKN', 'PAI'],
    ];

    private array $scheduleIPS = [
        'Senin'  => ['MTK-W', 'BIND',  'EKO',   'SOS',   'BING',  'GEO',  'PAI',  'PJOK'],
        'Selasa' => ['EKO',   'BIND',  'SOS',   'MTK-W', 'BING',  'SEJI', 'PPKN', 'SBUD'],
        'Rabu'   => ['MTK-W', 'BING',  'GEO',   'EKO',   'BIND',  'SOS',  'PAI',  'SEJI'],
        'Kamis'  => ['GEO',   'BIND',  'MTK-W', 'BING',  'EKO',   'SEJI', 'PJOK', 'SBUD'],
        'Jumat'  => ['SOS',   'GEO',   'EKO',   'BIND',  'MTK-W', 'BING', 'PPKN', 'PAI'],
    ];

    private array $classroomRooms = [
        'X IPA 1'   => 'R.101', 'X IPA 2'   => 'R.102',
        'X IPS 1'   => 'R.103', 'X IPS 2'   => 'R.104',
        'XI IPA 1'  => 'R.201', 'XI IPA 2'  => 'R.202',
        'XI IPS 1'  => 'R.203',
        'XII IPA 1' => 'R.301', 'XII IPA 2' => 'R.302',
        'XII IPS 1' => 'R.303',
    ];

    private array $labRooms = [
        'FIS' => 'Lab Fisika',
        'KIM' => 'Lab Kimia',
        'BIO' => 'Lab Biologi',
    ];

    public function run(): void
    {
        $subjects   = Subject::all()->keyBy('code');
        $classrooms = Classroom::all();

        foreach ($classrooms as $classroom) {
            $template    = $classroom->major === 'IPA' ? $this->scheduleIPA : $this->scheduleIPS;
            $defaultRoom = $this->classroomRooms[$classroom->name] ?? 'R.101';

            foreach (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as $day) {
                foreach ($template[$day] as $slotIndex => $code) {
                    $subject = $subjects[$code] ?? null;
                    if (! $subject) {
                        continue;
                    }

                    // Use teachers() relationship (not users())
                    $teacher = $subject->teachers()->first();
                    if (! $teacher) {
                        continue;
                    }

                    Schedule::create([
                        'subject_id'   => $subject->id,
                        'classroom_id' => $classroom->id,
                        'teacher_id'   => $teacher->id,
                        'day'          => $day,
                        'start_time'   => $this->timeSlots[$slotIndex]['start'],
                        'end_time'     => $this->timeSlots[$slotIndex]['end'],
                        'room'         => $this->labRooms[$code] ?? $defaultRoom,
                    ]);
                }
            }
        }

        $this->command->info('Schedules seeded: ' . Schedule::count() . ' records');
    }
}
