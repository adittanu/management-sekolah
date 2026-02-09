<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
        $timeSlots = TimeSlot::where('is_active', true)->orderBy('slot_number')->get();
        // Only return the current teacher
        $teachers = User::where('id', $teacherId)->get();

        return Inertia::render('Guru/Jadwal/Index', [
            'schedules' => $schedules,
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
            'timeSlots' => $timeSlots,
            'role' => 'teacher',
        ]);
    }
}
