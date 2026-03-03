<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLibraryBookRequest;
use App\Http\Requests\Admin\StoreLibraryLoanRequest;
use App\Http\Requests\Admin\UpdateLibraryBookRequest;
use App\Http\Requests\Admin\UpdateLibraryReadingProgressRequest;
use App\Models\LibraryBook;
use App\Models\LibraryLoan;
use App\Models\LibraryReadingProgress;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    public function index(): Response
    {
        $books = LibraryBook::query()
            ->latest()
            ->get(['id', 'title', 'author', 'category', 'description', 'total_pages', 'is_active', 'created_at']);

        $loans = LibraryLoan::query()
            ->with(['book:id,title,total_pages', 'user:id,name'])
            ->latest('loaned_at')
            ->limit(30)
            ->get();

        $borrowers = User::query()
            ->whereIn('role', ['admin', 'teacher', 'student'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        $myActiveLoans = LibraryLoan::query()
            ->with('book:id,title,total_pages')
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->where('due_at', '>=', now())
            ->latest('loaned_at')
            ->get();

        $readingProgress = LibraryReadingProgress::query()
            ->where('user_id', Auth::id())
            ->get(['library_book_id', 'current_page', 'last_seen_at'])
            ->keyBy('library_book_id');

        return Inertia::render('Admin/Perpustakaan/Index', [
            'role' => Auth::user()?->role,
            'books' => $books,
            'loans' => $loans,
            'borrowers' => $borrowers,
            'myActiveLoans' => $myActiveLoans,
            'readingProgress' => $readingProgress,
        ]);
    }

    public function storeBook(StoreLibraryBookRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $filePath = $request->file('pdf_file')->store('library-books', 'public');

        LibraryBook::query()->create([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'total_pages' => $validated['total_pages'],
            'pdf_path' => $filePath,
            'uploaded_by' => Auth::id(),
            'is_active' => $validated['is_active'],
        ]);

        return back()->with('success', 'Buku digital berhasil ditambahkan.');
    }

    public function updateBook(UpdateLibraryBookRequest $request, LibraryBook $book): RedirectResponse
    {
        $validated = $request->validated();

        $payload = [
            'title' => $validated['title'],
            'author' => $validated['author'],
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'total_pages' => $validated['total_pages'],
            'is_active' => $validated['is_active'],
        ];

        if ($request->hasFile('pdf_file')) {
            if (Storage::disk('public')->exists($book->pdf_path)) {
                Storage::disk('public')->delete($book->pdf_path);
            }

            $payload['pdf_path'] = $request->file('pdf_file')->store('library-books', 'public');
        }

        $book->update($payload);

        return back()->with('success', 'Buku digital berhasil diperbarui.');
    }

    public function destroyBook(LibraryBook $book): RedirectResponse
    {
        $hasActiveLoan = LibraryLoan::query()
            ->where('library_book_id', $book->id)
            ->where('status', 'active')
            ->exists();

        if ($hasActiveLoan) {
            return back()->with('error', 'Buku tidak bisa dihapus karena masih memiliki pinjaman aktif.');
        }

        if (Storage::disk('public')->exists($book->pdf_path)) {
            Storage::disk('public')->delete($book->pdf_path);
        }

        $book->delete();

        return back()->with('success', 'Buku berhasil dihapus.');
    }

    public function storeLoan(StoreLibraryLoanRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $existingActiveLoan = LibraryLoan::query()
            ->where('library_book_id', $validated['library_book_id'])
            ->where('user_id', $validated['user_id'])
            ->where('status', 'active')
            ->where('due_at', '>=', now())
            ->exists();

        if ($existingActiveLoan) {
            return back()->with('error', 'User ini masih memiliki pinjaman aktif untuk buku tersebut.');
        }

        $loanedAt = now();

        LibraryLoan::query()->create([
            'library_book_id' => $validated['library_book_id'],
            'user_id' => $validated['user_id'],
            'loaned_by' => Auth::id(),
            'loaned_at' => $loanedAt,
            'due_at' => $loanedAt->copy()->addDays($validated['duration_days']),
            'status' => 'active',
        ]);

        return back()->with('success', 'Pinjaman digital berhasil dibuat.');
    }

    public function syncReader(UpdateLibraryReadingProgressRequest $request, LibraryBook $book): JsonResponse
    {
        if (! $this->hasActiveLoan($book->id, Auth::id())) {
            abort(403, 'Tidak memiliki pinjaman aktif untuk buku ini.');
        }

        $validated = $request->validated();
        $now = Carbon::now();

        $progress = LibraryReadingProgress::query()->firstOrNew([
            'library_book_id' => $book->id,
            'user_id' => Auth::id(),
        ]);

        if ($progress->exists && $progress->page_updated_at !== null && $progress->page_updated_at->gt($now)) {
            return response()->json([
                'message' => 'Progress lebih baru sudah tersimpan.',
            ]);
        }

        $progress->fill([
            'current_page' => min((int) $validated['current_page'], $book->total_pages),
            'session_id' => $validated['session_id'],
            'last_event' => $validated['event'],
            'page_updated_at' => $now,
            'last_seen_at' => $now,
        ]);
        $progress->save();

        return response()->json([
            'message' => 'Progress baca tersimpan.',
            'current_page' => $progress->current_page,
        ]);
    }

    public function presence(LibraryBook $book): JsonResponse
    {
        $targetPage = max((int) request('page', 1), 1);
        $threshold = now()->subSeconds(45);

        $participants = LibraryReadingProgress::query()
            ->with('user:id,name')
            ->where('library_book_id', $book->id)
            ->where('current_page', $targetPage)
            ->where('last_seen_at', '>=', $threshold)
            ->get()
            ->map(function (LibraryReadingProgress $progress) {
                return [
                    'user_id' => $progress->user_id,
                    'name' => $progress->user?->name,
                    'current_page' => $progress->current_page,
                    'last_seen_at' => optional($progress->last_seen_at)->toIso8601String(),
                ];
            })
            ->values();

        return response()->json([
            'participants' => $participants,
            'count' => $participants->count(),
        ]);
    }

    public function file(LibraryBook $book)
    {
        if (! $this->hasActiveLoan($book->id, Auth::id())) {
            abort(403, 'Tidak memiliki pinjaman aktif untuk membaca file ini.');
        }

        if (! Storage::disk('public')->exists($book->pdf_path)) {
            abort(404, 'File PDF tidak ditemukan.');
        }

        return response()->file(storage_path('app/public/'.$book->pdf_path), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$book->title.'.pdf"',
        ]);
    }

    public function returnLoan(LibraryLoan $loan): RedirectResponse
    {
        $loan->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        return back()->with('success', 'Pinjaman ditandai sudah dikembalikan.');
    }

    private function hasActiveLoan(int $bookId, ?int $userId): bool
    {
        if ($userId === null) {
            return false;
        }

        return LibraryLoan::query()
            ->where('library_book_id', $bookId)
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->where('due_at', '>=', now())
            ->exists();
    }
}
