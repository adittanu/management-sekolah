<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $schedules = Schedule::query()
            ->with(['subject', 'classroom', 'teacher'])
            ->when(request('search'), function ($query, $search) {
                $query->whereHas('subject', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('classroom', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $subjects = Subject::all();
        $classrooms = Classroom::all();
        $teachers = User::where('role', 'teacher')->get();

        return Inertia::render('Admin/Jadwal/Index', [
            'schedules' => $schedules,
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'teacher_id' => 'required|exists:users,id',
            'day' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
        ]);

        $this->checkConflict(
            $validated['teacher_id'],
            $validated['classroom_id'],
            $validated['day'],
            $validated['start_time'],
            $validated['end_time']
        );

        Schedule::create($validated);

        return redirect()->back()->with('success', 'Schedule created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'teacher_id' => 'required|exists:users,id',
            'day' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
        ]);

        $this->checkConflict(
            $validated['teacher_id'],
            $validated['classroom_id'],
            $validated['day'],
            $validated['start_time'],
            $validated['end_time'],
            $schedule->id
        );

        $schedule->update($validated);

        return redirect()->back()->with('success', 'Schedule updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->back()->with('success', 'Schedule deleted successfully.');
    }

    /**
     * Check for scheduling conflicts.
     */
    protected function checkConflict($teacherId, $classroomId, $day, $start, $end, $ignoreId = null)
    {
        // Check Teacher Availability
        $teacherConflict = Schedule::where('teacher_id', $teacherId)
            ->where('day', $day)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_time', [$start, $end])
                    ->orWhereBetween('end_time', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_time', '<=', $start)
                            ->where('end_time', '>=', $end);
                    });
            })
            ->when($ignoreId, function ($query) use ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            })
            ->exists();

        if ($teacherConflict) {
            throw ValidationException::withMessages([
                'teacher_id' => 'Teacher is already teaching another class at this time.',
            ]);
        }

        // Check Classroom Availability
        $classroomConflict = Schedule::where('classroom_id', $classroomId)
            ->where('day', $day)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_time', [$start, $end])
                    ->orWhereBetween('end_time', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_time', '<=', $start)
                            ->where('end_time', '>=', $end);
                    });
            })
            ->when($ignoreId, function ($query) use ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            })
            ->exists();

        if ($classroomConflict) {
            throw ValidationException::withMessages([
                'classroom_id' => 'Classroom is already occupied at this time.',
            ]);
        }
    }
}
