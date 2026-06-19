<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Room;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminScheduleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_view_schedules_dashboard_with_active_rooms(): void
    {
        // Create active and inactive rooms
        $activeRoom1 = Room::create([
            'name' => 'Ruang 101',
            'code' => 'R101',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_active' => true,
        ]);

        $activeRoom2 = Room::create([
            'name' => 'Lab Fisika',
            'code' => 'LAB-FIS',
            'type' => 'Laboratorium',
            'capacity' => 30,
            'is_active' => true,
        ]);

        $inactiveRoom = Room::create([
            'name' => 'Gudang Lama',
            'code' => 'GDG',
            'type' => 'Gudang',
            'capacity' => 10,
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.jadwal.index'));

        $response->assertStatus(200);
        $response->assertInertia(function ($page) use ($activeRoom1, $activeRoom2, $inactiveRoom) {
            $page->component('Admin/Jadwal/Index');

            // Check that active rooms are passed in props
            $page->has('rooms');
            $rooms = $page->toArray()['props']['rooms'];

            $roomNames = collect($rooms)->pluck('name');
            $this->assertTrue($roomNames->contains($activeRoom1->name));
            $this->assertTrue($roomNames->contains($activeRoom2->name));
            $this->assertFalse($roomNames->contains($inactiveRoom->name));
        });
    }

    public function test_cannot_create_schedule_with_conflicting_room(): void
    {
        $subject = Subject::create(['name' => 'Math', 'code' => 'MAT101', 'category' => 'Core']);
        $classroom1 = Classroom::create(['name' => '10A', 'level' => '10', 'major' => 'Science', 'academic_year' => '2025/2026']);
        $classroom2 = Classroom::create(['name' => '10B', 'level' => '10', 'major' => 'Social', 'academic_year' => '2025/2026']);
        $teacher1 = User::factory()->create(['role' => 'teacher']);
        $teacher2 = User::factory()->create(['role' => 'teacher']);

        $roomName = 'Lab Komputer';

        // Create initial schedule using the room
        \App\Models\Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom1->id,
            'teacher_id' => $teacher1->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
            'room' => $roomName,
        ]);

        // Attempt to create another schedule with the same room at the same time
        $response = $this->actingAs($this->admin)->post(route('admin.jadwal.store'), [
            'subject_id' => $subject->id,
            'classroom_id' => $classroom2->id,
            'teacher_id' => $teacher2->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
            'room' => $roomName,
        ]);

        $response->assertSessionHasErrors(['room']);
    }

    public function test_cannot_update_schedule_to_conflicting_room(): void
    {
        $subject = Subject::create(['name' => 'Math', 'code' => 'MAT101', 'category' => 'Core']);
        $classroom1 = Classroom::create(['name' => '10A', 'level' => '10', 'major' => 'Science', 'academic_year' => '2025/2026']);
        $classroom2 = Classroom::create(['name' => '10B', 'level' => '10', 'major' => 'Social', 'academic_year' => '2025/2026']);
        $teacher1 = User::factory()->create(['role' => 'teacher']);
        $teacher2 = User::factory()->create(['role' => 'teacher']);

        $roomName = 'Lab Komputer';

        // Schedule using the room
        \App\Models\Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom1->id,
            'teacher_id' => $teacher1->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
            'room' => $roomName,
        ]);

        // Second schedule in a different room
        $schedule2 = \App\Models\Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom2->id,
            'teacher_id' => $teacher2->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
            'room' => 'Ruang 102',
        ]);

        // Attempt to update second schedule to the conflicting room
        $response = $this->actingAs($this->admin)->put(route('admin.jadwal.update', $schedule2->id), [
            'subject_id' => $subject->id,
            'classroom_id' => $classroom2->id,
            'teacher_id' => $teacher2->id,
            'day' => 'Senin',
            'start_time' => '08:00',
            'end_time' => '09:00',
            'room' => $roomName, // Conflict!
        ]);

        $response->assertSessionHasErrors(['room']);
    }

    public function test_auto_generate_saves_is_mobile_to_classroom(): void
    {
        $subject = Subject::create(['name' => 'Math', 'code' => 'MAT101', 'category' => 'Core']);
        $classroom = Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026',
            'is_mobile' => false,
        ]);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $subject->teachers()->attach($teacher);

        // Make a couple of time slots active
        \App\Models\TimeSlot::create(['slot_number' => 1, 'start_time' => '07:00', 'end_time' => '07:45', 'is_active' => true]);

        $response = $this->actingAs($this->admin)->post(route('admin.jadwal.auto-generate'), [
            'classroom_id' => $classroom->id,
            'requirements' => [
                ['subject_id' => $subject->id, 'hours' => 1],
            ],
            'is_mobile' => true, // setting it to true
        ]);

        $response->assertRedirect();

        // Assert it was updated in the classroom database row
        $this->assertTrue($classroom->refresh()->is_mobile);
    }

    public function test_admin_can_export_schedules_excel(): void
    {
        $this->withoutExceptionHandling();
        $classroom = Classroom::create(['name' => '10A', 'level' => '10', 'major' => 'Science', 'academic_year' => '2025/2026']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MAT101', 'category' => 'Core']);
        $teacher = User::factory()->create(['role' => 'teacher', 'teacher_code' => 'TCH-01']);

        \App\Models\TimeSlot::create(['slot_number' => 1, 'start_time' => '07:15', 'end_time' => '07:55', 'is_active' => true]);

        \App\Models\Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom->id,
            'teacher_id' => $teacher->id,
            'day' => 'Senin',
            'start_time' => '07:15',
            'end_time' => '07:55',
            'room' => 'R101',
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.jadwal.export'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_admin_can_import_schedules_excel(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher', 'teacher_code' => 'TCH-01']);

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setCellValue('D14', '10-TM-1');
        $sheet->setCellValue('D15', 'Mata Pelajaran');
        $sheet->setCellValue('E15', 'Ko Gu');
        $sheet->setCellValue('F15', 'Ruang');

        $sheet->setCellValue('A16', 'Senin');
        $sheet->setCellValue('B16', '');
        $sheet->setCellValue('C16', '06.30 - 07.15');

        $sheet->setCellValue('A17', '');
        $sheet->setCellValue('B17', '1');
        $sheet->setCellValue('C17', '07.20 - 08.00');
        $sheet->setCellValue('D17', 'Matematika');
        $sheet->setCellValue('E17', 'TCH-01');
        $sheet->setCellValue('F17', 'Lab RPL');

        $tempFile = tempnam(sys_get_temp_dir(), 'sched');
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($tempFile);

        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $tempFile,
            'jadwal.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->actingAs($this->admin)->post(route('admin.jadwal.import'), [
            'file' => $uploadedFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('time_slots', [
            'slot_number' => 1,
            'start_time' => '07:20',
            'end_time' => '08:00',
        ]);

        $this->assertDatabaseHas('schedules', [
            'day' => 'Senin',
            'start_time' => '07:20',
            'end_time' => '08:00',
            'room' => 'Lab RPL',
        ]);

        @unlink($tempFile);
    }
}
