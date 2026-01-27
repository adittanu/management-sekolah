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
                    if (isset($levelMap[$level])) {
                        $query->where('level', $levelMap[$level]);
                    }
                }
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $teachers = User::where('role', 'teacher')->get();

        return Inertia::render('Admin/Kelas/Index', [
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
            'name' => 'required|string|max:255',
            'level' => 'required|in:10,11,12',
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
        $classroom->load(['teacher', 'students']);
        
        return Inertia::render('Admin/Kelas/Show', [
            'classroom' => $classroom,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|in:10,11,12',
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

        return redirect()->back()->with('success', 'Classroom deleted successfully.');
    }
}
