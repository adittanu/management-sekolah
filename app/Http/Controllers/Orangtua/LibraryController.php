<?php

namespace App\Http\Controllers\Orangtua;

use App\Http\Controllers\Controller;
use App\Models\LibraryLoan;
use App\Models\LibraryReadingProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LibraryController extends Controller
{
    public function index(Request $request)
    {
        $parent = $request->user();
        $parent->load('children');
        $children = $parent->children;
        $childrenIds = $children->pluck('id')->toArray();

        $studentId = $request->query('student_id');
        $activeStudentId = $studentId && in_array($studentId, $childrenIds) ? $studentId : ($childrenIds[0] ?? null);

        if (! $activeStudentId) {
            return Inertia::render('Orangtua/Perpustakaan/Index', [
                'children' => [],
                'loans' => [],
                'reading_progress' => [],
            ]);
        }

        $loans = LibraryLoan::with('book')
            ->where('user_id', $activeStudentId)
            ->orderBy('loaned_at', 'desc')
            ->get();

        $readingProgress = LibraryReadingProgress::with('book')
            ->where('user_id', $activeStudentId)
            ->orderBy('last_seen_at', 'desc')
            ->get();

        return Inertia::render('Orangtua/Perpustakaan/Index', [
            'children' => $children->map->only(['id', 'name']),
            'active_student_id' => $activeStudentId,
            'loans' => $loans,
            'reading_progress' => $readingProgress,
        ]);
    }
}
