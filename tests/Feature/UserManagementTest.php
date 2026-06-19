<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_teacher_with_teacher_code(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.user.store'), [
            'name' => 'Guru Matematika',
            'email' => 'guru.mtk@sekolah.id',
            'password' => 'password123',
            'role' => 'teacher',
            'identity_number' => '199001012020011002',
            'teacher_code' => 'MTK-01',
            'gender' => 'L',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'email' => 'guru.mtk@sekolah.id',
            'role' => 'teacher',
            'teacher_code' => 'MTK-01',
        ]);
    }

    public function test_admin_cannot_create_teacher_with_duplicate_teacher_code(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // First teacher
        User::factory()->create([
            'role' => 'teacher',
            'teacher_code' => 'MTK-01',
        ]);

        // Attempting to create second teacher with same code
        $response = $this->actingAs($admin)->post(route('admin.user.store'), [
            'name' => 'Guru Matematika 2',
            'email' => 'guru.mtk2@sekolah.id',
            'password' => 'password123',
            'role' => 'teacher',
            'identity_number' => '199001012020011003',
            'teacher_code' => 'MTK-01',
            'gender' => 'P',
        ]);

        $response->assertSessionHasErrors(['teacher_code']);
    }

    public function test_admin_can_update_teacher_code(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create([
            'role' => 'teacher',
            'teacher_code' => 'MTK-01',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.user.update', $teacher->id), [
            'name' => $teacher->name,
            'email' => $teacher->email,
            'role' => 'teacher',
            'identity_number' => $teacher->identity_number,
            'teacher_code' => 'MTK-02',
            'gender' => 'L',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $teacher->id,
            'teacher_code' => 'MTK-02',
        ]);
    }

    public function test_admin_can_update_teacher_keeping_same_teacher_code(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create([
            'role' => 'teacher',
            'teacher_code' => 'MTK-01',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.user.update', $teacher->id), [
            'name' => 'Updated Teacher Name',
            'email' => $teacher->email,
            'role' => 'teacher',
            'identity_number' => $teacher->identity_number,
            'teacher_code' => 'MTK-01',
            'gender' => 'L',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $teacher->id,
            'name' => 'Updated Teacher Name',
            'teacher_code' => 'MTK-01',
        ]);
    }

    public function test_admin_cannot_update_teacher_with_duplicate_teacher_code(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $teacher1 = User::factory()->create([
            'role' => 'teacher',
            'teacher_code' => 'MTK-01',
        ]);

        $teacher2 = User::factory()->create([
            'role' => 'teacher',
            'teacher_code' => 'MTK-02',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.user.update', $teacher2->id), [
            'name' => $teacher2->name,
            'email' => $teacher2->email,
            'role' => 'teacher',
            'identity_number' => $teacher2->identity_number,
            'teacher_code' => 'MTK-01', // Clashing with teacher1
            'gender' => 'P',
        ]);

        $response->assertSessionHasErrors(['teacher_code']);
    }
}
