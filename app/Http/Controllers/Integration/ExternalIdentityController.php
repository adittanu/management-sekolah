<?php

namespace App\Http\Controllers\Integration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Integration\LinkExternalIdentityRequest;
use App\Http\Requests\Integration\ResolveExternalIdentityRequest;
use App\Models\ExternalIdentityMap;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class ExternalIdentityController extends Controller
{
    public function resolve(ResolveExternalIdentityRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $provider = strtolower($validated['provider']);
        $externalUserId = $validated['external_user_id'];
        $externalUsername = $validated['external_username'] ?? null;
        $roomId = $validated['room_id'] ?? null;
        $autoLink = $validated['auto_link'] ?? true;

        $mapping = ExternalIdentityMap::query()
            ->with('user')
            ->where('provider', $provider)
            ->where('external_user_id', $externalUserId)
            ->first();

        if ($mapping) {
            $mapping->forceFill([
                'external_username' => $externalUsername ?? $mapping->external_username,
                'room_id' => $roomId ?? $mapping->room_id,
                'last_seen_at' => Carbon::now(),
            ])->save();

            return response()->json([
                'resolved' => true,
                'source' => 'existing_mapping',
                'provider' => $provider,
                'external_user_id' => $externalUserId,
                'user' => $this->userPayload($mapping->user),
            ]);
        }

        if (! $autoLink) {
            return response()->json([
                'resolved' => false,
                'source' => 'not_found',
                'provider' => $provider,
                'external_user_id' => $externalUserId,
                'needs_manual_link' => true,
                'message' => 'Identitas eksternal belum terhubung dengan user aplikasi.',
            ]);
        }

        $candidates = $this->findUserCandidates($externalUserId, $externalUsername);

        if ($candidates->count() === 1) {
            $user = $candidates->first();

            $newMapping = ExternalIdentityMap::query()->create([
                'provider' => $provider,
                'external_user_id' => $externalUserId,
                'external_username' => $externalUsername,
                'room_id' => $roomId,
                'user_id' => $user->id,
                'last_seen_at' => Carbon::now(),
            ]);

            return response()->json([
                'resolved' => true,
                'source' => 'auto_link',
                'provider' => $provider,
                'external_user_id' => $externalUserId,
                'mapping_id' => $newMapping->id,
                'user' => $this->userPayload($user),
            ]);
        }

        return response()->json([
            'resolved' => false,
            'source' => $candidates->isEmpty() ? 'not_found' : 'ambiguous',
            'provider' => $provider,
            'external_user_id' => $externalUserId,
            'needs_manual_link' => true,
            'candidate_count' => $candidates->count(),
            'candidate_users' => $candidates->map(fn (User $user) => $this->userPayload($user))->values(),
            'message' => $candidates->isEmpty()
                ? 'Tidak ditemukan user kandidat. Lakukan link manual.'
                : 'Ditemukan lebih dari satu user kandidat. Lakukan link manual.',
        ]);
    }

    public function link(LinkExternalIdentityRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $provider = strtolower($validated['provider']);
        $user = User::query()->where('email', $validated['user_email'])->firstOrFail();

        $mapping = ExternalIdentityMap::query()->updateOrCreate(
            [
                'provider' => $provider,
                'external_user_id' => $validated['external_user_id'],
            ],
            [
                'external_username' => $validated['external_username'] ?? null,
                'room_id' => $validated['room_id'] ?? null,
                'user_id' => $user->id,
                'last_seen_at' => Carbon::now(),
            ]
        );

        return response()->json([
            'linked' => true,
            'provider' => $provider,
            'external_user_id' => $mapping->external_user_id,
            'mapping_id' => $mapping->id,
            'user' => $this->userPayload($user),
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function findUserCandidates(string $externalUserId, ?string $externalUsername)
    {
        $handles = collect([
            $externalUsername,
            Str::contains($externalUserId, '/') ? Str::afterLast($externalUserId, '/') : $externalUserId,
        ])->filter(fn (?string $value) => filled($value))->map(fn (string $value) => strtolower(trim($value)))->unique();

        if ($handles->isEmpty()) {
            return collect();
        }

        return User::query()
            ->get()
            ->filter(function (User $user) use ($handles): bool {
                $name = strtolower($user->name);
                $email = strtolower($user->email);
                $emailLocalPart = strtolower(Str::before($user->email, '@'));

                return $handles->contains($name)
                    || $handles->contains($email)
                    || $handles->contains($emailLocalPart);
            })
            ->values();
    }

    /**
     * @return array{id:int,name:string,email:string,role:string}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }
}
