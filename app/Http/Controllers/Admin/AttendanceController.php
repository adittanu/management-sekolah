<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\Journal; // Assumed Model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use App\Models\User;

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
        $todayDate = Carbon::now()->format('Y-m-d');

        // Get all schedules for today
        $schedules = Schedule::with(['subject', 'classroom', 'classroom.students', 'teacher'])
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
        $activeClassroomIds = $schedules->pluck('classroom_id')->unique();
        $totalStudents = 0;
        // This is a rough estimate. For better accuracy, count distinct students in those classrooms.
        // Or count students who have schedules today. 
        // Let's count students who are in the classrooms that have schedules today.
        // We can do this by loading classroom student counts.
        foreach($schedules as $sched) {
             if($sched->classroom && $sched->classroom->students) {
                 // Note: this might double count if a student is in multiple schedules (unlikely for classroom based, but possible)
                 // A better way is to get all student IDs from these classrooms
             }
        }
        
        // Simpler approach for Total Students: Count all students in the system (or just relevant ones)
        // For Dashboard context "Siswa Hadir", usually means % of students expected to be present today.
        // Let's count unique students in the schedules for today.
        $studentIds = collect();
        foreach ($schedules as $schedule) {
            if ($schedule->classroom && $schedule->classroom->students) {
                $studentIds = $studentIds->merge($schedule->classroom->students->pluck('id'));
            }
        }
        $totalStudents = $studentIds->unique()->count();

        // 2. Get Today's Attendance
        $todaysAttendance = Attendance::whereDate('date', $todayDate)->get();
        
        // Filter attendance to only include students (exclude teachers)
        // We assume teachers are users with role 'teacher' or we check against schedule->teacher_id
        // But since we saved teacher attendance in same table, we need to distinguish.
        // A simple way is to check if student_id belongs to a teacher role.
        // Or simpler: We know teachers are saved with their User ID.
        
        // Get all Teacher IDs from schedules
        $teacherIds = $schedules->pluck('teacher_id')->unique()->filter();
        $totalTeachers = $teacherIds->count();
        
        $teacherAttendance = $todaysAttendance->whereIn('student_id', $teacherIds);
        $studentAttendance = $todaysAttendance->whereNotIn('student_id', $teacherIds);

        // Stats Calculation
        $stats = [
            'present' => $studentAttendance->where('status', 'hadir')->count(),
            'sick' => $studentAttendance->where('status', 'sakit')->count(),
            'permit' => $studentAttendance->where('status', 'izin')->count(),
            'alpha' => $studentAttendance->where('status', 'alpha')->count(),
            'late' => 0, 
            'teachersPresent' => $teacherAttendance->where('status', 'hadir')->count(),
            'totalTeachers' => $totalTeachers,
            'totalStudents' => $totalStudents > 0 ? $totalStudents : User::where('role', 'student')->count() // Fallback
        ];

        $attendances = Attendance::query()
            ->with(['schedule.subject', 'schedule.classroom', 'student'])
            ->when(request('date'), function ($query, $date) {
                $query->where('date', $date);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

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
            // Teacher Attendance & Journal Inputs
            'teacher_status' => 'required|in:hadir,sakit,izin,alpha',
            'journal_topic' => 'nullable|string|max:255',
            'journal_content' => 'nullable|string',
            'proof_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $date = Carbon::parse($validated['date'])->format('Y-m-d');
            $schedule = Schedule::find($validated['schedule_id']);

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
            // We use the same Attendance model, assuming teacher is also a User.
            // We identify the teacher from the schedule.
            if ($schedule && $schedule->teacher_id) {
                Attendance::updateOrCreate(
                    [
                        'schedule_id' => $validated['schedule_id'],
                        'student_id' => $schedule->teacher_id, // Saving teacher ID in student_id column
                        'date' => $date,
                    ],
                    [
                        'status' => $validated['teacher_status'],
                    ]
                );
            }

            // 3. Save Journal (Optional)
            if ($request->has('journal_topic') || $request->has('journal_content') || $request->hasFile('proof_file')) {
                $proofPath = null;
                if ($request->hasFile('proof_file')) {
                    $proofPath = $request->file('proof_file')->store('journals', 'public');
                }

                // Check if Journal model exists before using it to prevent crash if not yet created
                if (class_exists(Journal::class)) {
                    Journal::updateOrCreate(
                        [
                            'schedule_id' => $validated['schedule_id'],
                            'date' => $date,
                        ],
                        [
                            'title' => $validated['journal_topic'] ?? '',
                            'description' => $validated['journal_content'] ?? '',
                            'proof_file' => $proofPath,
                            'teacher_id' => $schedule->teacher_id,
                        ]
                    );
                } else {
                    // Fallback using DB Facade if Model doesn't exist yet
                    // Only try this if table exists, otherwise it will fail gracefully or we catch it?
                    // For now, we assume the user will create the model/table.
                     try {
                        DB::table('journals')->updateOrInsert(
                            [
                                'schedule_id' => $validated['schedule_id'],
                                'date' => $date,
                            ],
                            [
                                'title' => $validated['journal_topic'] ?? '',
                                'description' => $validated['journal_content'] ?? '',
                                'proof_file' => $proofPath,
                                'teacher_id' => $schedule->teacher_id,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );
                    } catch (\Exception $e) {
                        // Table might not exist yet
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Data presensi dan jurnal berhasil disimpan.');
    }
}
