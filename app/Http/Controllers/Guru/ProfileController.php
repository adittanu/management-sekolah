<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Display the teacher's profile.
     */
    public function index()
    {
        // Get currently authenticated teacher
        $user = Auth::user();

        // In a real app, you might have a separate 'teachers' table linked to 'users'
        // For now, we'll assume the basic User model holds the personal data
        // or we can fetch additional details if there's a relationship.
        
        return Inertia::render('Guru/Profile/Index', [
            'user' => $user,
        ]);
    }
}
