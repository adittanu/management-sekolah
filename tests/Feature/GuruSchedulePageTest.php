<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuruSchedulePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guru_schedule_page_includes_active_time_slots_for_multi_slot_rendering(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $subject = Subject::create(['name' => 'Kimia', 'code' => 'KIM101', 'category' => 'Core']);
        $classroom = Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026',
        ]);

        TimeSlot::create([
            'slot_number' => 1,
            'start_time' => '07:00',
            'end_time' => '07:45',
            'is_active' => true,
        ]);
        TimeSlot::create([
            'slot_number' => 2,
            'start_time' => '07:45',
            'end_time' => '08:30',
            'is_active' => true,
        ]);
        TimeSlot::create([
            'slot_number' => 3,
            'start_time' => '08:30',
            'end_time' => '09:15',
            'is_active' => false,
        ]);

        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '08:30',
            'room' => 'Lab 1',
        ]);

        $response = $this->actingAs($teacher)->get(route('guru.jadwal'));

        $response->assertStatus(200);

        /** @var array{component: string, props: array{timeSlots: array<int, array{slot_number: int, start_time: string, end_time: string, is_active: bool}>}} $page */
        $page = $response->viewData('page');

        $this->assertSame('Guru/Jadwal/Index', $page['component']);
        $this->assertArrayHasKey('timeSlots', $page['props']);
        $this->assertCount(2, $page['props']['timeSlots']);
        $this->assertSame(1, $page['props']['timeSlots'][0]['slot_number']);
        $this->assertSame('07:00', $page['props']['timeSlots'][0]['start_time']);
        $this->assertSame('08:30', $page['props']['timeSlots'][1]['end_time']);
    }
}
