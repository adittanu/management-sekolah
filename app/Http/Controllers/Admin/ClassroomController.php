<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $classrooms = Classroom::query()
            ->with('teacher')
            ->withCount('students')
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('major', 'like', "%{$search}%")
                    ->orWhereHas('teacher', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when(request('level'), function ($query, $level) {
                if ($level !== 'Semua') {
                    $levelMap = [
                        'Kelas X' => '10',
                        'Kelas XI' => '11',
                        'Kelas XII' => '12',
                    ];
                    
                    // Check if we have a mapped value
                    if (isset($levelMap[$level])) {
                        $query->where('level', $levelMap[$level]);
                    } else {
                        // If no mapping found, use the raw value (assuming it's a valid string now)
                        $query->where('level', $level);
                    }
                }
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $teachers = User::where('role', 'teacher')->get();
        $levels = Classroom::distinct()->pluck('level')->sort()->values();

        return Inertia::render('Admin/Kelas/Index', [
            'classrooms' => $classrooms,
            'teachers' => $teachers,
            'availableLevels' => $levels,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:20', // Changed validation to string
            'major' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        Classroom::create($validated);

        return redirect()->back()->with('success', 'Classroom created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Classroom $classroom)
    {
        $classroom->load([
            'teacher', 
            'students', 
            'schedules.subject', // Load subject relation for schedules
            'schedules.teacher'  // Load teacher relation for schedules
        ]);
        
        $teachers = User::where('role', 'teacher')->get();
        
        // Get students who are NOT already in this classroom
        // This is a simple implementation. For large datasets, use AJAX search.
        $existingStudentIds = $classroom->students->pluck('id')->toArray();
        $availableStudents = User::where('role', 'student')
            ->whereNotIn('id', $existingStudentIds)
            ->get();

        return Inertia::render('Admin/Kelas/Show', [
            'classroom' => $classroom,
            'teachers' => $teachers,
            'availableStudents' => $availableStudents,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:20',
            'major' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        $classroom->update($validated);

        return redirect()->back()->with('success', 'Classroom updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Classroom $classroom)
    {
        $classroom->delete();

        return redirect()->route('admin.kelas.index')->with('success', 'Classroom deleted successfully.');
    }

    /**
     * Add students to the classroom.
     */
    public function addStudent(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        // Attach students without detaching existing ones
        // Using syncWithoutDetaching to avoid duplicates if accidentally sent
        $classroom->students()->syncWithoutDetaching($validated['student_ids']);

        return redirect()->back()->with('success', count($validated['student_ids']) . ' students added successfully.');
    }

    /**
     * Remove student from the classroom.
     */
    public function removeStudent(Classroom $classroom, User $student)
    {
        $classroom->students()->detach($student->id);

        return redirect()->back()->with('success', 'Student removed from classroom successfully.');
    }
}
