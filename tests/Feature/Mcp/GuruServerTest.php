<?php

namespace Tests\Feature\Mcp;

use App\Mcp\Servers\GuruServer;
use App\Mcp\Tools\AbsenSiswaTool;
use App\Mcp\Tools\LihatAbsensiTool;
use App\Mcp\Tools\LihatJadwalHariIniTool;
use App\Mcp\Tools\LihatJadwalTool;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuruServerTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;

    private User $student;

    private User $admin;

    private Schedule $schedule;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::create([
            'name' => 'Guru Test',
            'email' => 'guru@test.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
        ]);

        $this->student = User::create([
            'name' => 'Siswa Test',
            'email' => 'siswa@test.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'identity_number' => '12345',
        ]);

        $this->admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $subject = Subject::create([
            'name' => 'Matematika',
            'code' => 'MTK',
            'category' => 'Umum',
        ]);

        $classroom = Classroom::create([
            'name' => 'XII-A',
            'level' => '12',
            'major' => 'IPA',
            'academic_year' => '2025/2026',
        ]);

        $this->schedule = Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $classroom->id,
            'teacher_id' => $this->teacher->id,
            'day' => 'Senin',
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
        ]);
    }

    public function test_lihat_jadwal_tool_returns_schedules_for_teacher(): void
    {
        $response = GuruServer::actingAs($this->teacher)
            ->tool(LihatJadwalTool::class);

        $response->dump();

        $response->assertOk();
        $response->assertSee('Matematika');
        $response->assertSee('XII-A');
        $response->assertSee('Senin');
    }

    public function test_lihat_jadwal_tool_filters_by_day(): void
    {
        $response = GuruServer::actingAs($this->teacher)
            ->tool(LihatJadwalTool::class, ['hari' => 'Senin']);

        $response->assertOk();
        $response->assertSee('Matematika');
    }

    public function test_lihat_jadwal_tool_rejects_non_teacher(): void
    {
        $response = GuruServer::actingAs($this->admin)
            ->tool(LihatJadwalTool::class);

        $response->assertHasErrors();
        $response->assertSee('Tool ini hanya untuk guru');
    }

    public function test_lihat_jadwal_hari_ini_tool_returns_today_schedule(): void
    {
        $response = GuruServer::actingAs($this->teacher)
            ->tool(LihatJadwalHariIniTool::class);

        $response->assertOk();
    }

    public function test_absen_siswa_tool_creates_attendance(): void
    {
        $response = GuruServer::actingAs($this->teacher)
            ->tool(AbsenSiswaTool::class, [
                'jadwal_id' => $this->schedule->id,
                'siswa_id' => $this->student->id,
                'tanggal' => now()->format('Y-m-d'),
                'status' => 'hadir',
            ]);

        $response->assertOk();
        $response->assertSee('Absensi berhasil dicatat');

        $this->assertDatabaseHas('attendances', [
            'schedule_id' => $this->schedule->id,
            'student_id' => $this->student->id,
            'status' => 'hadir',
        ]);
    }

    public function test_absen_siswa_tool_rejects_other_teacher_schedule(): void
    {
        $otherTeacher = User::create([
            'name' => 'Guru Lain',
            'email' => 'guru.lain@test.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
        ]);

        $response = GuruServer::actingAs($otherTeacher)
            ->tool(AbsenSiswaTool::class, [
                'jadwal_id' => $this->schedule->id,
                'siswa_id' => $this->student->id,
                'tanggal' => now()->format('Y-m-d'),
                'status' => 'hadir',
            ]);

        $response->assertHasErrors();
        $response->assertSee('tidak memiliki akses');
    }

    public function test_lihat_absensi_tool_returns_attendance_data(): void
    {
        Attendance::create([
            'schedule_id' => $this->schedule->id,
            'student_id' => $this->student->id,
            'date' => now()->format('Y-m-d'),
            'status' => 'hadir',
        ]);

        $response = GuruServer::actingAs($this->teacher)
            ->tool(LihatAbsensiTool::class, [
                'jadwal_id' => $this->schedule->id,
                'tanggal' => now()->format('Y-m-d'),
            ]);

        $response->assertOk();
        $response->assertSee('Hadir: 1');
        $response->assertSee('Siswa Test');
    }
}
