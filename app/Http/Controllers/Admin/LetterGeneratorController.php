<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Letter;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LetterGeneratorController extends Controller
{
    /**
     * Display a listing of letters.
     */
    public function index()
    {
        $letters = Letter::query()
            ->with('createdBy:id,name')
            ->when(request('search'), function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('letter_number', 'like', "%{$search}%");
            })
            ->when(request('category'), function ($query, $category) {
                $query->where('category', $category);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/GeneratorSurat/Index', [
            'letters' => $letters,
        ]);
    }

    /**
     * Show the form for creating a new letter.
     */
    public function create()
    {
        $school = School::first();

        return Inertia::render('Admin/GeneratorSurat/Create', [
            'school' => $school,
        ]);
    }

    /**
     * Store a newly created letter.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'letter_number' => 'nullable|string|max:255',
            'letter_date' => 'nullable|date',
            'category' => 'required|string|in:umum,undangan,pemberitahuan,edaran,keterangan,tugas',
        ]);

        Letter::create([
            ...$validated,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('admin.generator-surat.index')
            ->with('success', 'Surat berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified letter.
     */
    public function edit(Letter $letter)
    {
        $school = School::first();

        return Inertia::render('Admin/GeneratorSurat/Create', [
            'letter' => $letter->load('createdBy:id,name'),
            'school' => $school,
        ]);
    }

    /**
     * Update the specified letter.
     */
    public function update(Request $request, Letter $letter)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'letter_number' => 'nullable|string|max:255',
            'letter_date' => 'nullable|date',
            'category' => 'required|string|in:umum,undangan,pemberitahuan,edaran,keterangan,tugas',
        ]);

        $letter->update($validated);

        return redirect()->route('admin.generator-surat.index')
            ->with('success', 'Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified letter.
     */
    public function destroy(Letter $letter)
    {
        $letter->delete();

        return redirect()->back()->with('success', 'Surat berhasil dihapus.');
    }

    /**
     * Print a specific letter with school letterhead.
     */
    public function print(Letter $letter)
    {
        $letter->load('createdBy:id,name');
        $school = School::first();

        return Inertia::render('Admin/GeneratorSurat/Print', [
            'letter' => $letter,
            'school' => $school,
        ]);
    }
}
