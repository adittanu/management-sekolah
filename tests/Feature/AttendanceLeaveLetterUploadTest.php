<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttendanceLeaveLetterUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_store_student_leave_letter_file_in_attendance_submission(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $schedule = $this->createScheduleForTeacher($teacher);

        $response = $this->actingAs($admin)->post(route('admin.absensi.store'), [
            'schedule_id' => $schedule->id,
            'date' => now()->toDateString(),
            'teacher_status' => 'izin',
            'journal_topic' => 'Materi A',
            'journal_content' => 'Catatan A',
            'students' => [
                [
                    'student_id' => $student->id,
                    'status' => 'izin',
                    'leave_letter_file' => UploadedFile::fake()->create('surat-izin.pdf', 100, 'application/pdf'),
                ],
            ],
        ]);

        $response->assertRedirect();

        $attendance = Attendance::query()
            ->where('schedule_id', $schedule->id)
            ->where('student_id', $student->id)
            ->first();

        $this->assertNotNull($attendance);
        $this->assertNotNull($attendance->leave_letter_file);
        $this->assertTrue(Storage::disk('public')->exists($attendance->leave_letter_file));
    }

    public function test_teacher_can_store_student_leave_letter_file_in_attendance_submission(): void
    {
        Storage::fake('public');

        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $schedule = $this->createScheduleForTeacher($teacher);

        $response = $this->actingAs($teacher)->post(route('guru.absensi.store'), [
            'schedule_id' => $schedule->id,
            'date' => now()->toDateString(),
            'teacher_status' => 'sakit',
            'journal_topic' => 'Materi B',
            'journal_content' => 'Catatan B',
            'students' => [
                [
                    'student_id' => $student->id,
                    'status' => 'sakit',
                    'leave_letter_file' => UploadedFile::fake()->create('surat-sakit.pdf', 120, 'application/pdf'),
                ],
            ],
        ]);

        $response->assertRedirect();

        $attendance = Attendance::query()
            ->where('schedule_id', $schedule->id)
            ->where('student_id', $student->id)
            ->first();

        $this->assertNotNull($attendance);
        $this->assertNotNull($attendance->leave_letter_file);
        $this->assertTrue(Storage::disk('public')->exists($attendance->leave_letter_file));
    }

    private function createScheduleForTeacher(User $teacher): Schedule
    {
        $subject = Subject::create([
            'name' => 'Sejarah',
            'code' => 'SEJ101',
            'category' => 'Core',
        ]);

        $classroom = Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'IPS',
            'academic_year' => '2025/2026',
        ]);

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
