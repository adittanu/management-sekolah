<?php

namespace App\Http\Middleware;

use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\Cache;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'conflict_data' => fn () => $request->session()->get('conflict_data'),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'school_settings' => function () {
                return Cache::remember('school_settings', 60, function () {
                    return School::first() ?? [
                        'name' => 'Sekolah Kita Bisa Berkarya',
                        'app_name' => 'Sekolah Kita',
                        'logo' => null,
                    ];
                });
            },
        ];
    }
}
