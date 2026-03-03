<?php

namespace App\Http\Controllers\Orangtua;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $parent = $request->user();
        $parent->load('children');
        $children = $parent->children;
        $childrenIds = $children->pluck('id')->toArray();

        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);
        $studentId = $request->query('student_id');

        // Validation to ensure parent can only view their own children
        if ($studentId && ! in_array($studentId, $childrenIds)) {
            abort(403, 'Unauthorized access to student data.');
        }

        $query = Attendance::with(['student:id,name', 'schedule.subject'])
            ->whereIn('student_id', $studentId ? [$studentId] : $childrenIds)
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

        $attendances = $query->orderBy('date', 'desc')->get();

        // Group by status for summary
        $summary = [
            'hadir' => $attendances->where('status', 'hadir')->count(),
            'sakit' => $attendances->where('status', 'sakit')->count(),
            'izin' => $attendances->where('status', 'izin')->count(),
            'alpha' => $attendances->where('status', 'alpha')->count(),
        ];

        return Inertia::render('Orangtua/Kehadiran/Index', [
            'children' => $children->map->only(['id', 'name']),
            'attendances' => $attendances,
            'summary' => $summary,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'student_id' => $studentId,
            ],
        ]);
    }
}
