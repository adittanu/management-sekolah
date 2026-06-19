<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        // Kirim semua user per role agar frontend bisa random cycling tiap klik
        $demoAccounts = [
            // Batasi 20 siswa agar payload tidak berat (ada 360+ siswa)
            'student' => User::where('role', 'student')
                ->inRandomOrder()
                ->select('name', 'email', 'role')
                ->limit(20)
                ->get(),
            // Guru biasanya sedikit, ambil semua
            'teacher' => User::where('role', 'teacher')
                ->select('name', 'email', 'role')
                ->get(),
            // Admin ambil semua
            'admin' => User::where('role', 'admin')
                ->select('name', 'email', 'role')
                ->get(),
            // Orangtua ambil semua
            'parent' => User::where('role', 'parent')
                ->select('name', 'email', 'role')
                ->get(),
        ];

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'demoAccounts' => $demoAccounts,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
