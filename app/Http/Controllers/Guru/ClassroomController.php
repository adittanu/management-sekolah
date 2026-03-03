<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    /**
     * Show the classroom where the teacher is the homeroom teacher (wali kelas).
     * Redirects directly to the detail page.
     */
    public function index()
    {
        $teacherId = Auth::id();

        // Find the classroom where this teacher is the wali kelas
        $classroom = Classroom::where('teacher_id', $teacherId)->first();

        if (!$classroom) {
            // If teacher is not assigned as wali kelas to any classroom
            return Inertia::render('Guru/Kelas/Show', [
                'classroom' => null,
                'isWaliKelas' => false,
            ]);
        }

        // Load classroom with relations
        $classroom->load([
            'teacher',
            'students',
            'schedules.subject',
            'schedules.teacher',
        ]);

        return Inertia::render('Guru/Kelas/Show', [
            'classroom' => $classroom,
            'isWaliKelas' => true,
        ]);
    }
}
