<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teacherId = Auth::id();

        $schedules = Schedule::query()
            ->with(['subject', 'classroom', 'teacher'])
            ->where('teacher_id', $teacherId)
            ->latest()
            ->get();

        $subjects = Subject::with('teachers')->get();
        $classrooms = Classroom::all();
        // Only return the current teacher
        $teachers = User::where('id', $teacherId)->get();

        return Inertia::render('Guru/Jadwal/Index', [
            'schedules' => $schedules,
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
            'role' => 'teacher'
        ]);
    }
}
