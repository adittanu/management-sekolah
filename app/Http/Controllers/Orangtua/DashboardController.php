<?php

namespace App\Http\Controllers\Orangtua;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $parent = $request->user();

        // Eager load children with their current class
        $parent->load('children.classrooms');

        $children = $parent->children;
        $childrenIds = $children->pluck('id');

        $today = Carbon::today();

        // Get today's attendance for all children
        $todayAttendance = Attendance::whereIn('student_id', $childrenIds)
            ->whereDate('date', $today)
            ->get();

        // Map attendance to children
        $childrenData = $children->map(function ($child) use ($todayAttendance) {
            $attendance = $todayAttendance->firstWhere('student_id', $child->id);
            $activeClass = $child->classrooms->firstWhere('pivot.is_active', true);

            return [
                'id' => $child->id,
                'name' => $child->name,
                'identity_number' => $child->identity_number,
                'class' => $activeClass ? $activeClass->name : '-',
                'attendance_today' => $attendance ? $attendance->status : 'Belum Ada Data',
                'avatar' => $child->avatar,
            ];
        });

        // Stats
        $stats = [
            'total_children' => $children->count(),
            'present_today' => $todayAttendance->where('status', 'hadir')->count(),
            'absent_today' => $todayAttendance->whereIn('status', ['sakit', 'izin', 'alpha'])->count(),
        ];

        // Latest Announcements
        $announcements = Announcement::where('is_active', true)
            ->where('published_at', '<=', now())
            ->orderBy('published_at', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Orangtua/Dashboard', [
            'children' => $childrenData,
            'stats' => $stats,
            'announcements' => $announcements,
        ]);
    }
}
