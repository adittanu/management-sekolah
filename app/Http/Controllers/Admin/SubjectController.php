<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subjects = Subject::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $teachers = User::where('role', 'teacher')->get();

        return Inertia::render('Admin/Mapel/Index', [
            'subjects' => $subjects,
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
            'code' => 'required|string|max:20|unique:subjects',
            'category' => 'required|string|max:100',
        ]);

        Subject::create($validated);

        return redirect()->back()->with('success', 'Mata pelajaran berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $mapel)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:subjects,code,' . $mapel->id,
            'category' => 'required|string|max:100',
        ]);

        $mapel->update($validated);

        return redirect()->back()->with('success', 'Mata pelajaran berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $mapel)
    {
        try {
            if (request()->has('force') && request('force') == 'true') {
                // Hapus data terkait di Schedule
                \App\Models\Schedule::where('subject_id', $mapel->id)->delete();
                $mapel->delete();
                return back(303)->with('success', 'Mata pelajaran dan data terkait berhasil dihapus secara paksa.');
            }

            $mapel->delete();
            return back(303)->with('success', 'Mata pelajaran berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == "23000") {
                // Ambil data schedule yang menggunakan mapel ini untuk ditampilkan di modal konfirmasi
                $relatedSchedules = \App\Models\Schedule::with(['classroom', 'teacher'])
                    ->where('subject_id', $mapel->id)
                    ->get()
                    ->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'classroom' => $schedule->classroom ? $schedule->classroom->name : 'Kelas tidak ditemukan',
                            'teacher' => $schedule->teacher ? $schedule->teacher->name : 'Guru tidak ditemukan',
                            'day' => $schedule->day,
                            'time' => $schedule->start_time . ' - ' . $schedule->end_time,
                        ];
                    });

                return back(303)->with([
                    'error' => 'Mata pelajaran tidak dapat dihapus karena masih digunakan di jadwal atau data lain.',
                    'conflict_data' => $relatedSchedules->toArray()
                ]);
            }
            return back(303)->withErrors(['error' => 'Terjadi kesalahan saat menghapus data.']);
        }
    }
}
