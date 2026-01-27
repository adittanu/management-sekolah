<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_admin_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'role' => 'admin',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'login' => 'admin@test.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_student_can_login_with_nis(): void
    {
        $user = User::factory()->create([
            'role' => 'student',
            'identity_number' => '123456', // NIS
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'login' => '123456',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_teacher_can_login_with_nip(): void
    {
        $user = User::factory()->create([
            'role' => 'teacher',
            'identity_number' => '19850101', // NIP
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'login' => '19850101',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_qr_login_with_valid_token(): void
    {
        $user = User::factory()->create([
            'role' => 'student',
            'identity_number' => 'TOKEN123',
        ]);

        $response = $this->postJson(route('auth.qr-login'), [
            'token' => 'TOKEN123',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Login successful!']);
        
        $this->assertAuthenticatedAs($user);
    }

    public function test_qr_login_fails_with_invalid_token(): void
    {
        $response = $this->postJson(route('auth.qr-login'), [
            'token' => 'INVALID_TOKEN',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid QR Code.']);
        
        $this->assertGuest();
    }
}
