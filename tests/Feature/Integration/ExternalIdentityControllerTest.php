<?php

namespace Tests\Feature\Integration;

use App\Models\ExternalIdentityMap;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExternalIdentityControllerTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'guru-mcp-token-2024';

    public function test_resolve_returns_existing_mapping(): void
    {
        $user = User::factory()->create([
            'name' => 'Admin Sekolah',
            'email' => 'admin@sekolah.test',
            'role' => 'admin',
        ]);

        ExternalIdentityMap::query()->create([
            'provider' => 'nextcloud',
            'external_user_id' => 'users/admin',
            'external_username' => 'admin',
            'room_id' => 'room-1',
            'user_id' => $user->id,
        ]);

        $response = $this->withToken(self::TOKEN)
            ->postJson('/integrations/external-identities/resolve', [
                'provider' => 'nextcloud',
                'external_user_id' => 'users/admin',
                'external_username' => 'admin',
                'room_id' => 'room-1',
            ]);

        $response->assertOk()
            ->assertJsonPath('resolved', true)
            ->assertJsonPath('source', 'existing_mapping')
            ->assertJsonPath('user.email', 'admin@sekolah.test');
    }

    public function test_resolve_auto_links_when_single_candidate_found(): void
    {
        $user = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@sekolah.test',
            'role' => 'admin',
        ]);

        $response = $this->withToken(self::TOKEN)
            ->postJson('/integrations/external-identities/resolve', [
                'provider' => 'nextcloud',
                'external_user_id' => 'users/admin',
                'external_username' => 'admin',
            ]);

        $response->assertOk()
            ->assertJsonPath('resolved', true)
            ->assertJsonPath('source', 'auto_link')
            ->assertJsonPath('user.id', $user->id);

        $this->assertDatabaseHas('external_identity_maps', [
            'provider' => 'nextcloud',
            'external_user_id' => 'users/admin',
            'user_id' => $user->id,
        ]);
    }

    public function test_resolve_returns_ambiguous_when_multiple_candidates_found(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin.one@sekolah.test',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Budi',
            'email' => 'admin@sekolah.test',
            'role' => 'teacher',
        ]);

        $response = $this->withToken(self::TOKEN)
            ->postJson('/integrations/external-identities/resolve', [
                'provider' => 'nextcloud',
                'external_user_id' => 'users/admin',
                'external_username' => 'admin',
            ]);

        $response->assertOk()
            ->assertJsonPath('resolved', false)
            ->assertJsonPath('source', 'ambiguous')
            ->assertJsonPath('candidate_count', 2)
            ->assertJsonPath('needs_manual_link', true);
    }

    public function test_link_creates_mapping_for_specific_user_email(): void
    {
        $user = User::factory()->create([
            'name' => 'Guru A',
            'email' => 'guru.a@sekolah.test',
            'role' => 'teacher',
        ]);

        $response = $this->withToken(self::TOKEN)
            ->postJson('/integrations/external-identities/link', [
                'provider' => 'nextcloud',
                'external_user_id' => 'users/guru.a',
                'external_username' => 'guru.a',
                'room_id' => 'room-7',
                'user_email' => 'guru.a@sekolah.test',
            ]);

        $response->assertOk()
            ->assertJsonPath('linked', true)
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('external_user_id', 'users/guru.a');

        $this->assertDatabaseHas('external_identity_maps', [
            'provider' => 'nextcloud',
            'external_user_id' => 'users/guru.a',
            'user_id' => $user->id,
            'room_id' => 'room-7',
        ]);
    }

    public function test_resolve_requires_valid_bearer_token(): void
    {
        $response = $this->postJson('/integrations/external-identities/resolve', [
            'provider' => 'nextcloud',
            'external_user_id' => 'users/admin',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'error' => 'Unauthorized. Invalid token.',
            ]);
    }
}
