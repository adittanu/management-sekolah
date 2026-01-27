<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QrLoginController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        // Decrypt or find user by token (Assuming token is identity_number for simplicity in demo)
        // In production, this should be a secure, time-limited token linked to the user.
        // For this demo: Token = Identity Number
        
        $user = User::where('identity_number', $request->token)->first();

        if (! $user) {
            return response()->json([
                'message' => 'Invalid QR Code.',
            ], 401);
        }

        Auth::login($user);

        $request->session()->regenerate();

        // Redirect path based on role
        $redirectUrl = match ($user->role) {
            'admin' => route('admin.dashboard'),
            'teacher' => route('guru.dashboard'),
            'student' => route('siswa.dashboard'),
            default => route('dashboard'),
        };

        return response()->json([
            'redirect_url' => $redirectUrl,
            'message' => 'Login successful!',
        ]);
    }
}
