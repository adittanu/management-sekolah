<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // Count statistics
        $totalStudents = User::where('role', 'student')->count();
        $totalTeachers = User::where('role', 'teacher')->count();
        $totalClasses = Classroom::count();
        $totalSubjects = Subject::count();

        // Today's attendance stats
        $todayAttendance = Attendance::whereDate('date', $today)->get();
        $presentToday = $todayAttendance->where('status', 'hadir')->count();
        $sickToday = $todayAttendance->where('status', 'sakit')->count();
        $permitToday = $todayAttendance->where('status', 'izin')->count();
        $absentToday = $todayAttendance->where('status', 'alpha')->count();

        // Stats for cards (matching mockStats structure)
        $stats = [
            [
                'title' => 'Total Siswa',
                'value' => number_format($totalStudents),
                'icon' => 'Users',
                'bg' => 'bg-blue-50',
                'color' => 'text-blue-600',
            ],
            [
                'title' => 'Total Guru',
                'value' => number_format($totalTeachers),
                'icon' => 'GraduationCap',
                'bg' => 'bg-green-50',
                'color' => 'text-green-600',
            ],
            [
                'title' => 'Jumlah Kelas',
                'value' => number_format($totalClasses),
                'icon' => 'School',
                'bg' => 'bg-purple-50',
                'color' => 'text-purple-600',
            ],
            [
                'title' => 'Mata Pelajaran',
                'value' => number_format($totalSubjects),
                'icon' => 'BookOpen',
                'bg' => 'bg-orange-50',
                'color' => 'text-orange-600',
            ],
        ];

        // Attendance data for chart (last 7 days)
        $attendanceData = [];
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayAttendance = Attendance::whereDate('date', $date)->get();
            $present = $dayAttendance->where('status', 'hadir')->count();
            $absent = $dayAttendance->whereIn('status', ['sakit', 'izin', 'alpha'])->count();
            
            $attendanceData[] = [
                'day' => $dayNames[$date->dayOfWeek],
                'present' => $present,
                'absent' => $absent,
            ];
        }

        // Recent activities (mock for now, can be replaced with actual activity log)
        $reports = [
            [
                'id' => 1,
                'user' => 'Sistem',
                'action' => 'Backup database berhasil dilakukan',
                'time' => '2 menit lalu',
                'avatar' => null,
            ],
            [
                'id' => 2,
                'user' => 'Admin',
                'action' => 'Menambahkan 5 siswa baru',
                'time' => '1 jam lalu',
                'avatar' => null,
            ],
            [
                'id' => 3,
                'user' => 'Sistem',
                'action' => 'Sinkronisasi data selesai',
                'time' => '3 jam lalu',
                'avatar' => null,
            ],
        ];

        return Inertia::render('Admin/Dashboard', [
            'totalStudents' => $totalStudents,
            'totalTeachers' => $totalTeachers,
            'totalClasses' => $totalClasses,
            'totalSubjects' => $totalSubjects,
            'attendanceData' => $attendanceData,
            'reports' => $reports,
            'todayStats' => [
                'present' => $presentToday,
                'sick' => $sickToday,
                'permit' => $permitToday,
                'absent' => $absentToday,
            ],
        ]);
    }
}
