<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $teacherId = Auth::id();
        $today = Carbon::now()->locale('id')->dayName;
        
        // Count total students (role = 'student')
        $studentCount = User::where('role', 'student')->count();

        // Fetch schedules for today
        $schedules = Schedule::with(['subject', 'classroom'])
            ->where('teacher_id', $teacherId)
            ->where('day', $today)
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                // Determine status based on time
                $now = Carbon::now();
                $start = Carbon::parse($schedule->start_time);
                $end = Carbon::parse($schedule->end_time);
                
                $status = 'Akan Datang';
                if ($now->between($start, $end)) {
                    $status = 'Sedang Berlangsung';
                } elseif ($now->gt($end)) {
                    $status = 'Selesai';
                }

                return [
                    'class' => $schedule->classroom->name,
                    'subject' => $schedule->subject->name,
                    'time' => Carbon::parse($schedule->start_time)->format('H:i') . ' - ' . Carbon::parse($schedule->end_time)->format('H:i'),
                    'room' => $schedule->room ?? 'R-201', // Default or actual room if added to schema
                    'count' => $schedule->classroom->students()->count() . ' Siswa',
                    'status' => $status,
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'role' => 'teacher',
            'schedules' => $schedules,
            'userName' => Auth::user()->name,
            'classCount' => $schedules->count(),
            'totalStudents' => $studentCount,
        ]);
    }
}
