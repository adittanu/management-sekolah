<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminRoomTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->admin->forceFill(['role' => 'admin'])->save();
    }

    public function test_admin_can_view_rooms_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.ruangan.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Ruangan/Index'));
    }

    public function test_admin_can_store_room(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.ruangan.store'), [
            'name' => 'Ruang Kelas 1',
            'code' => 'R101',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'building' => 'Gedung A',
            'floor' => '1',
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('rooms', ['code' => 'R101', 'name' => 'Ruang Kelas 1']);
    }

    public function test_admin_can_update_room(): void
    {
        $room = Room::factory()->create(['code' => 'OLD']);

        $response = $this->actingAs($this->admin)->put(route('admin.ruangan.update', $room->id), [
            'name' => 'Updated Name',
            'code' => 'NEW',
            'type' => 'Laboratorium',
            'capacity' => 40,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('rooms', ['id' => $room->id, 'name' => 'Updated Name', 'code' => 'NEW']);
    }

    public function test_admin_can_delete_room(): void
    {
        $room = Room::factory()->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.ruangan.destroy', $room->id));

        $response->assertStatus(303);
        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.ruangan.store'), []);

        $response->assertSessionHasErrors(['name', 'code', 'type', 'capacity']);
    }

    public function test_store_validates_unique_code(): void
    {
        Room::factory()->create(['code' => 'DUP']);

        $response = $this->actingAs($this->admin)->post(route('admin.ruangan.store'), [
            'name' => 'Duplicate',
            'code' => 'DUP',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
        ]);

        $response->assertSessionHasErrors(['code']);
    }

    public function test_search_filters_rooms(): void
    {
        Room::factory()->create(['name' => 'Lab Fisika']);
        Room::factory()->create(['name' => 'Ruang Guru']);

        $response = $this->actingAs($this->admin)->get(route('admin.ruangan.index', ['search' => 'Fisika']));

        $response->assertStatus(200);
    }
}
