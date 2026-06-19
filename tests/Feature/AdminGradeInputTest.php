<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminGradeInputTest extends TestCase
{
    use RefreshDatabase;

    private function createTestData(): array
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK01', 'category' => 'Core']);
        $subject->teachers()->attach($teacher->id);

        $classroom = Classroom::create([
            'name' => 'X-A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026',
        ]);
        $classroom->students()->attach($student->id);

        return compact('admin', 'teacher', 'student', 'subject', 'classroom');
    }

    public function test_admin_can_access_grade_input_page(): void
    {
        $data = $this->createTestData();

        $response = $this->actingAs($data['admin'])->get(route('admin.rapor.input'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Rapor/Index'));
    }

    public function test_admin_can_access_raport_page(): void
    {
        $data = $this->createTestData();

        $response = $this->actingAs($data['admin'])->get(route('admin.rapor.view'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Rapor/Raport'));
    }

    public function test_admin_can_store_grades_without_teacher_id(): void
    {
        $data = $this->createTestData();

        $response = $this->actingAs($data['admin'])->post(route('admin.rapor.store'), [
            'classroom_id' => $data['classroom']->id,
            'subject_id' => $data['subject']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'daily',
            'grades' => [
                [
                    'student_id' => $data['student']->id,
                    'score' => 85,
                    'description' => 'Baik',
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('grades', [
            'student_id' => $data['student']->id,
            'subject_id' => $data['subject']->id,
            'classroom_id' => $data['classroom']->id,
            'score' => 85,
            'teacher_id' => $data['teacher']->id,
            'period' => 'daily',
        ]);
    }

    public function test_admin_can_store_grades_with_teacher_id(): void
    {
        $data = $this->createTestData();

        $response = $this->actingAs($data['admin'])->post(route('admin.rapor.store'), [
            'classroom_id' => $data['classroom']->id,
            'subject_id' => $data['subject']->id,
            'teacher_id' => $data['teacher']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'daily',
            'grades' => [
                [
                    'student_id' => $data['student']->id,
                    'score' => 90,
                    'description' => 'Sangat Baik',
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('grades', [
            'student_id' => $data['student']->id,
            'subject_id' => $data['subject']->id,
            'classroom_id' => $data['classroom']->id,
            'score' => 90,
            'teacher_id' => $data['teacher']->id,
            'period' => 'daily',
        ]);
    }

    public function test_empty_grades_are_skipped(): void
    {
        $data = $this->createTestData();

        $response = $this->actingAs($data['admin'])->post(route('admin.rapor.store'), [
            'classroom_id' => $data['classroom']->id,
            'subject_id' => $data['subject']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'daily',
            'grades' => [
                [
                    'student_id' => $data['student']->id,
                    'score' => null,
                    'description' => '',
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('grades', 0);
    }

    public function test_admin_can_update_existing_grades(): void
    {
        $data = $this->createTestData();

        Grade::create([
            'student_id' => $data['student']->id,
            'subject_id' => $data['subject']->id,
            'classroom_id' => $data['classroom']->id,
            'teacher_id' => $data['teacher']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'daily',
            'score' => 70,
            'description' => 'Cukup',
        ]);

        $response = $this->actingAs($data['admin'])->post(route('admin.rapor.store'), [
            'classroom_id' => $data['classroom']->id,
            'subject_id' => $data['subject']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'daily',
            'grades' => [
                [
                    'student_id' => $data['student']->id,
                    'score' => 95,
                    'description' => 'Sangat Baik',
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('grades', [
            'student_id' => $data['student']->id,
            'score' => 95,
            'description' => 'Sangat Baik',
            'period' => 'daily',
        ]);
        $this->assertDatabaseCount('grades', 1);
    }

    public function test_validation_requires_classroom_and_subject(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.rapor.store'), [
            'classroom_id' => null,
            'subject_id' => null,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'daily',
            'grades' => [],
        ]);

        $response->assertSessionHasErrors(['classroom_id', 'subject_id']);
    }

    public function test_unauthenticated_user_cannot_access_grade_input(): void
    {
        $response = $this->get(route('admin.rapor.input'));

        $response->assertRedirect('/login');
    }

    public function test_student_cannot_access_grade_input(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->get(route('admin.rapor.input'));

        $response->assertStatus(403);
    }

    public function test_admin_can_filter_grades_by_period(): void
    {
        $data = $this->createTestData();

        // Create mid grade
        Grade::create([
            'student_id' => $data['student']->id,
            'subject_id' => $data['subject']->id,
            'classroom_id' => $data['classroom']->id,
            'teacher_id' => $data['teacher']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'mid',
            'score' => 75,
            'description' => 'Cukup',
        ]);

        // Create final grade
        Grade::create([
            'student_id' => $data['student']->id,
            'subject_id' => $data['subject']->id,
            'classroom_id' => $data['classroom']->id,
            'teacher_id' => $data['teacher']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'final',
            'score' => 90,
            'description' => 'Baik',
        ]);

        // Access with mid period
        $response = $this->actingAs($data['admin'])->get(route('admin.rapor.input', [
            'classroom_id' => $data['classroom']->id,
            'subject_id' => $data['subject']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'mid',
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Rapor/Index')
            ->where('grades.'.$data['student']->id.'.score', '75.00')
            ->where('filters.period', 'mid')
        );

        // Access with final period
        $response2 = $this->actingAs($data['admin'])->get(route('admin.rapor.input', [
            'classroom_id' => $data['classroom']->id,
            'subject_id' => $data['subject']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'period' => 'final',
        ]));

        $response2->assertStatus(200);
        $response2->assertInertia(fn ($page) => $page
            ->component('Admin/Rapor/Index')
            ->where('grades.'.$data['student']->id.'.score', '90.00')
            ->where('filters.period', 'final')
        );
    }

    public function test_admin_can_store_raport_data_with_only_global_place_and_date(): void
    {
        $data = $this->createTestData();

        $response = $this->actingAs($data['admin'])->post(route('admin.rapor.store-raport-data'), [
            'classroom_id' => $data['classroom']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'report_type' => 'final',
            'raport_entries' => [],
            'raport_place' => 'Bandung',
            'raport_date' => '2026-06-18',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertDatabaseHas('raport_data', [
            'student_id' => $data['student']->id,
            'classroom_id' => $data['classroom']->id,
            'academic_year' => '2025/2026',
            'semester' => 1,
            'report_type' => 'final',
            'raport_place' => 'Bandung',
        ]);
    }

    public function test_raport_pdf_view_displays_correct_fase_labels(): void
    {
        $data = $this->createTestData();

        // Test with mid (UTS) report type
        $viewMid = $this->view('raport-pdf', [
            'student' => $data['student'],
            'classroom' => $data['classroom'],
            'subjects' => [],
            'average' => 0,
            'academicYear' => '2025/2026',
            'semester' => 1,
            'attendance' => ['hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpha' => 0, 'total' => 0],
            'schoolName' => 'Test School',
            'reportType' => 'mid',
        ]);
        $viewMid->assertSee('Ujian Tengah Semester');
        $viewMid->assertDontSee('Ujian Akhir Semester');

        // Test with final (UAS) report type
        $viewFinal = $this->view('raport-pdf', [
            'student' => $data['student'],
            'classroom' => $data['classroom'],
            'subjects' => [],
            'average' => 0,
            'academicYear' => '2025/2026',
            'semester' => 1,
            'attendance' => ['hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpha' => 0, 'total' => 0],
            'schoolName' => 'Test School',
            'reportType' => 'final',
        ]);
        $viewFinal->assertSee('Ujian Akhir Semester');
        $viewFinal->assertDontSee('Ujian Tengah Semester');
    }

    public function test_admin_can_export_raport_pdf(): void
    {
        $data = $this->createTestData();

        $response = $this->actingAs($data['admin'])->get(route('admin.rapor.export-pdf', [
            'classroom_id' => $data['classroom']->id,
            'student_id' => $data['student']->id,
            'semester' => 1,
            'academic_year' => '2025/2026',
            'report_type' => 'mid',
        ]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}
