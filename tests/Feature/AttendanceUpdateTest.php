<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Journal;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_attendance_and_journal(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $schedule = $this->createScheduleWithStudent($teacher, $student);
        $date = now()->subDay()->toDateString();

        $journal = Journal::create([
            'schedule_id' => $schedule->id,
            'teacher_id' => $teacher->id,
            'date' => $date,
            'title' => 'Old Title',
            'description' => 'Old Desc',
        ]);

        Attendance::create([
            'schedule_id' => $schedule->id,
            'student_id' => $student->id,
            'date' => $date,
            'status' => 'hadir',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.absensi.update', $journal->id), [
            'teacher_status' => 'hadir',
            'journal_topic' => 'New Title',
            'journal_content' => 'New Desc',
            'students' => [
                ['student_id' => $student->id, 'status' => 'sakit'],
            ],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('journals', [
            'id' => $journal->id,
            'title' => 'New Title',
            'description' => 'New Desc',
        ]);

        $this->assertDatabaseHas('attendances', [
            'schedule_id' => $schedule->id,
            'student_id' => $student->id,
            'date' => $date,
            'status' => 'sakit',
        ]);
    }

    public function test_guest_cannot_update_attendance(): void
    {
        $journal = Journal::factory()->create();

        $response = $this->put(route('admin.absensi.update', $journal->id), []);

        $response->assertRedirect(route('login'));
    }

    private function createScheduleWithStudent(User $teacher, User $student): Schedule
    {
        $subject = Subject::create([
            'name' => 'Test Mapel',
            'code' => 'TM101',
            'category' => 'Core',
        ]);

        $classroom = Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'IPS',
            'academic_year' => '2025/2026',
        ]);

        $classroom->students()->attach($student->id);

        return Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '08:00',
        ]);
    }
}
