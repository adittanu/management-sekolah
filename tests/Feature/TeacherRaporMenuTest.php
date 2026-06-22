<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherRaporMenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_who_is_not_homeroom_teacher_has_is_walikelas_false_in_inertia(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $response = $this->actingAs($teacher)->get('/guru/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->where('auth.user.is_walikelas', false);
        });
    }

    public function test_teacher_who_is_homeroom_teacher_has_is_walikelas_true_in_inertia(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $classroom = Classroom::create([
            'name' => 'X-A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026',
            'teacher_id' => $teacher->id,
        ]);

        $response = $this->actingAs($teacher)->get('/guru/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->where('auth.user.is_walikelas', true);
        });
    }
}
