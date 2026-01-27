<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $today = Carbon::now()->locale('id')->isoFormat('dddd');
        $mapDay = [
            'Senin' => 'Senin',
            'Selasa' => 'Selasa',
            'Rabu' => 'Rabu',
            'Kamis' => 'Kamis',
            'Jumat' => 'Jumat',
            'Sabtu' => 'Sabtu',
            'Minggu' => 'Minggu',
        ];
        
        $currentDay = $mapDay[$today] ?? 'Senin';

        $attendances = Attendance::query()
            ->with(['schedule.subject', 'schedule.classroom', 'student'])
            ->when(request('date'), function ($query, $date) {
                $query->where('date', $date);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Calculate stats for today
        $todayDate = Carbon::now()->format('Y-m-d');
        $todaysAttendance = Attendance::whereDate('date', $todayDate)->get();
        
        $stats = [
            'present' => $todaysAttendance->where('status', 'hadir')->count(),
            'sick' => $todaysAttendance->where('status', 'sakit')->count(),
            'permit' => $todaysAttendance->where('status', 'izin')->count(),
            'alpha' => $todaysAttendance->where('status', 'alpha')->count(),
            'late' => 0, // Not implemented yet
            'teachersPresent' => 0, // Placeholder
            'totalTeachers' => 0 // Placeholder
        ];

        $schedules = Schedule::with(['subject', 'classroom', 'classroom.students', 'teacher'])
            ->when(request('day'), function ($query, $day) {
                $query->where('day', $day);
            }, function ($query) use ($currentDay) {
                // Default to current day if no filter
                 $query->where('day', $currentDay);
            })
            ->get();

        return Inertia::render('Admin/Absensi/Index', [
            'attendances' => $attendances,
            'schedules' => $schedules,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'date' => 'required|date|before_or_equal:today',
            'students' => 'required|array',
            'students.*.student_id' => 'required|exists:users,id',
            'students.*.status' => 'required|in:hadir,sakit,izin,alpha',
        ]);

        foreach ($validated['students'] as $studentData) {
            Attendance::updateOrCreate(
                [
                    'schedule_id' => $validated['schedule_id'],
                    'student_id' => $studentData['student_id'],
                    'date' => Carbon::parse($validated['date'])->format('Y-m-d'),
                ],
                [
                    'status' => $studentData['status'],
                ]
            );
        }

        return redirect()->back()->with('success', 'Attendance recorded successfully.');
    }
}
