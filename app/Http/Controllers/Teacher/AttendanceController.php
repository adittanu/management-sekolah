<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teacherId = Auth::id();
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
        $todayDate = Carbon::now()->format('Y-m-d');

        // Get schedules for current teacher only
        $schedules = Schedule::with(['subject', 'classroom', 'classroom.students', 'teacher'])
            ->where('teacher_id', $teacherId)
            ->when(request('day'), function ($query, $day) {
                $query->where('day', $day);
            }, function ($query) use ($currentDay) {
                // Default to current day if no filter
                 $query->where('day', $currentDay);
            })
            ->get();

        // Calculate 'has_attendance' for each schedule
        $schedules->each(function ($schedule) use ($todayDate) {
            $schedule->has_attendance = Attendance::where('schedule_id', $schedule->id)
                ->where('date', $todayDate)
                ->exists();
        });

        // 1. Get IDs of students in active schedules
        $studentIds = collect();
        foreach ($schedules as $schedule) {
            if ($schedule->classroom && $schedule->classroom->students) {
                $studentIds = $studentIds->merge($schedule->classroom->students->pluck('id'));
            }
        }
        $totalStudents = $studentIds->unique()->count();

        // 2. Get Today's Attendance for these schedules
        $scheduleIds = $schedules->pluck('id');
        $todaysAttendance = Attendance::whereDate('date', $todayDate)
            ->whereIn('schedule_id', $scheduleIds)
            ->get();
        
        $teacherAttendance = $todaysAttendance->where('student_id', $teacherId);
        $studentAttendance = $todaysAttendance->where('student_id', '!=', $teacherId);

        // Stats Calculation
        $stats = [
            'present' => $studentAttendance->where('status', 'hadir')->count(),
            'sick' => $studentAttendance->where('status', 'sakit')->count(),
            'permit' => $studentAttendance->where('status', 'izin')->count(),
            'alpha' => $studentAttendance->where('status', 'alpha')->count(),
            'late' => 0, 
            'teachersPresent' => $teacherAttendance->where('status', 'hadir')->count(),
            'totalTeachers' => 1, // Only current teacher
            'totalStudents' => $totalStudents > 0 ? $totalStudents : 0 
        ];

        $history = Journal::query()
            ->where('teacher_id', $teacherId)
            ->with(['schedule.subject', 'schedule.classroom', 'teacher'])
            ->when(request('date'), function ($query, $date) {
                $query->where('date', $date);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Calculate stats for each history item
        $history->getCollection()->transform(function ($journal) use ($teacherId) {
            $attendances = Attendance::where('schedule_id', $journal->schedule_id)
                ->where('date', $journal->date)
                ->with('student')
                ->get();
            
            $journal->stats = [
                'hadir' => $attendances->where('student_id', '!=', $teacherId)->where('status', 'hadir')->count(),
                'sakit' => $attendances->where('student_id', '!=', $teacherId)->where('status', 'sakit')->count(),
                'izin' => $attendances->where('student_id', '!=', $teacherId)->where('status', 'izin')->count(),
                'alpha' => $attendances->where('student_id', '!=', $teacherId)->where('status', 'alpha')->count(),
                'total' => $attendances->where('student_id', '!=', $teacherId)->count(),
            ];

            // Attach detailed attendance records for the modal
            $journal->attendance_details = $attendances
                ->where('student_id', '!=', $teacherId)
                ->map(function($att) {
                return [
                    'id' => $att->student_id,
                    'name' => $att->student->name ?? 'Unknown',
                    'nis' => $att->student->nis ?? '-',
                    'avatar_url' => $att->student->avatar_url, 
                    'status' => $att->status,
                ];
            })->values();
            
            // Determine teacher status from attendance records
            $teacherAttRecord = $attendances->firstWhere('student_id', $teacherId);
            $journal->teacher_status = $teacherAttRecord ? $teacherAttRecord->status : 'hadir';

            return $journal;
        });

        // Reuse Admin View but ensure it adapts to role
        return Inertia::render('Teacher/Absensi/Index', [
            'history' => $history,
            'schedules' => $schedules,
            'stats' => $stats,
            'role' => 'teacher' // Explicitly pass role if needed by View
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $teacherId = Auth::id();
        
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'date' => 'required|date|before_or_equal:today',
            'students' => 'required|array',
            'students.*.student_id' => 'required|exists:users,id',
            'students.*.status' => 'required|in:hadir,sakit,izin,alpha',
            // Teacher Attendance & Journal Inputs
            'teacher_status' => 'required|in:hadir,sakit,izin,alpha',
            'journal_topic' => 'nullable|string|max:255',
            'journal_content' => 'nullable|string',
            'proof_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);
        
        // Verify schedule belongs to teacher
        $schedule = Schedule::where('id', $validated['schedule_id'])
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        DB::transaction(function () use ($validated, $request, $schedule, $teacherId) {
            $date = Carbon::parse($validated['date'])->format('Y-m-d');
            
            // 1. Save Student Attendance
            foreach ($validated['students'] as $studentData) {
                Attendance::updateOrCreate(
                    [
                        'schedule_id' => $validated['schedule_id'],
                        'student_id' => $studentData['student_id'],
                        'date' => $date,
                    ],
                    [
                        'status' => $studentData['status'],
                    ]
                );
            }

            // 2. Save Teacher Attendance
            Attendance::updateOrCreate(
                [
                    'schedule_id' => $validated['schedule_id'],
                    'student_id' => $teacherId,
                    'date' => $date,
                ],
                [
                    'status' => $validated['teacher_status'],
                ]
            );

            // 3. Save Journal
            $proofPath = null;
            if ($request->hasFile('proof_file')) {
                $proofPath = $request->file('proof_file')->store('journals', 'public');
            }

            // Get existing journal to preserve proof_file if not uploading new one
            $existingJournal = Journal::where('schedule_id', $validated['schedule_id'])
                ->where('date', $date)
                ->first();

            if ($existingJournal && !$proofPath) {
                $proofPath = $existingJournal->proof_file;
            }

            Journal::updateOrCreate(
                [
                    'schedule_id' => $validated['schedule_id'],
                    'date' => $date,
                ],
                [
                    'title' => $validated['journal_topic'] ?? '-',
                    'description' => $validated['journal_content'] ?? '-',
                    'proof_file' => $proofPath,
                    'teacher_id' => $teacherId,
                ]
            );
        });

        return redirect()->back()->with('success', 'Data presensi dan jurnal berhasil disimpan.');
    }
}
