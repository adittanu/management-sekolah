<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AdminSchoolModuleTest extends TestCase
{
    use RefreshDatabase;

    // AC 1: Data Integrity
    public function test_cannot_delete_subject_with_existing_schedule()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MAT101', 'category' => 'Core']);
        $classroom = Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026'
        ]);
        $teacher = User::factory()->create(['role' => 'teacher']);

        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);
        $subject->delete();
    }

    public function test_student_appears_in_pivot_when_enrolled()
    {
        $classroom = Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026'
        ]);
        $student = User::factory()->create(['role' => 'student']);

        $classroom->students()->attach($student->id);

        $this->assertDatabaseHas('classroom_user', [
            'classroom_id' => $classroom->id,
            'user_id' => $student->id,
            'is_active' => 1,
        ]);
    }

    // AC 2: Strict Conflict
    public function test_schedule_conflict_classroom()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MAT101', 'category' => 'Core']);
        $classroom = Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026'
        ]);
        $teacher1 = User::factory()->create(['role' => 'teacher']);
        $teacher2 = User::factory()->create(['role' => 'teacher']);

        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher1->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.jadwal.store'), [
            'subject_id' => $subject->id,
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher2->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        $response->assertSessionHasErrors(['classroom_id']);
    }

    public function test_schedule_conflict_teacher()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MAT101', 'category' => 'Core']);
        $classroom1 = Classroom::create(['name' => '10A', 'level' => '10', 'major' => 'Science', 'academic_year' => '2025/2026']);
        $classroom2 = Classroom::create(['name' => '10B', 'level' => '10', 'major' => 'Social', 'academic_year' => '2025/2026']);
        $teacher = User::factory()->create(['role' => 'teacher']);

        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom1->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.jadwal.store'), [
            'subject_id' => $subject->id,
            'classroom_id' => $classroom2->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        $response->assertSessionHasErrors(['teacher_id']);
    }

    // AC 3: Authorization
    public function test_student_cannot_access_admin_routes()
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_routes()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
    }
}
