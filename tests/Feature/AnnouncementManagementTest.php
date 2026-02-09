<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_announcements_crud(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $storeResponse = $this->actingAs($admin)->post(route('admin.pengumuman.store'), [
            'title' => 'Info Rapat Bulanan',
            'content' => 'Rapat bulanan akan dilaksanakan Jumat pukul 13.00 WIB.',
            'is_active' => true,
        ]);

        $storeResponse->assertRedirect();

        $announcement = Announcement::query()->first();

        $this->assertNotNull($announcement);
        $this->assertDatabaseHas('announcements', [
            'title' => 'Info Rapat Bulanan',
            'posted_by' => $admin->id,
            'is_active' => true,
        ]);

        $updateResponse = $this->actingAs($admin)->put(route('admin.pengumuman.update', $announcement), [
            'title' => 'Info Rapat Revisi',
            'content' => 'Rapat dipindahkan ke pukul 14.00 WIB.',
            'is_active' => false,
        ]);

        $updateResponse->assertRedirect();

        $this->assertDatabaseHas('announcements', [
            'id' => $announcement->id,
            'title' => 'Info Rapat Revisi',
            'is_active' => false,
        ]);

        $deleteResponse = $this->actingAs($admin)->delete(route('admin.pengumuman.destroy', $announcement));

        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('announcements', [
            'id' => $announcement->id,
        ]);
    }

    public function test_teacher_dashboard_displays_only_active_announcements(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);

        Announcement::query()->create([
            'title' => 'Pengumuman Aktif',
            'content' => 'Ini pengumuman aktif untuk guru.',
            'posted_by' => $admin->id,
            'is_active' => true,
            'published_at' => now(),
        ]);

        Announcement::query()->create([
            'title' => 'Pengumuman Nonaktif',
            'content' => 'Ini seharusnya tidak muncul.',
            'posted_by' => $admin->id,
            'is_active' => false,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($teacher)->get(route('guru.dashboard'));

        $response->assertOk();
        $response->assertSee('Pengumuman Aktif');
        $response->assertDontSee('Pengumuman Nonaktif');
    }
}
