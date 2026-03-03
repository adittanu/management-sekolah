<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ImportUserController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Redirect logged-in users to their dashboard based on role
    if (Auth::check()) {
        $user = Auth::user();

        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('guru.dashboard'),
            'student' => redirect()->route('siswa.dashboard'),
            'parent' => redirect()->route('orangtua.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }

    $demoAccounts = [
        'student' => \App\Models\User::where('role', 'student')
            ->inRandomOrder()
            ->select('name', 'email', 'role')
            ->limit(20)
            ->get(),
        'teacher' => \App\Models\User::where('role', 'teacher')
            ->select('name', 'email', 'role')
            ->get(),
        'admin' => \App\Models\User::where('role', 'admin')
            ->select('name', 'email', 'role')
            ->get(),
        'parent' => \App\Models\User::where('role', 'parent')
            ->select('name', 'email', 'role')
            ->get(),
    ];

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'demoAccounts' => $demoAccounts,
    ]);
});

Route::get('/dashboard', function () {
    $user = Auth::user();

    return match ($user->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'teacher' => redirect()->route('guru.dashboard'),
        'student' => redirect()->route('siswa.dashboard'),
        'parent' => redirect()->route('orangtua.dashboard'),
        default => Inertia::render('Dashboard'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::prefix('admin')
    ->middleware(['auth', RoleMiddleware::class.':admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        Route::post('user/import/preview', [ImportUserController::class, 'preview'])->name('user.import.preview');
        Route::post('user/import', [ImportUserController::class, 'import'])->name('user.import');
        Route::resource('user', UserController::class);
        Route::get('user/{user}/children', [UserController::class, 'getChildren'])->name('user.children');
        Route::post('user/{user}/children', [UserController::class, 'linkChildren'])->name('user.children.link');

        Route::resource('kelas', App\Http\Controllers\Admin\ClassroomController::class)
            ->parameters(['kelas' => 'classroom']);

        Route::post('kelas/{classroom}/students', [App\Http\Controllers\Admin\ClassroomController::class, 'addStudent'])->name('kelas.students.store');
        Route::delete('kelas/{classroom}/students/{student}', [App\Http\Controllers\Admin\ClassroomController::class, 'removeStudent'])->name('kelas.students.destroy');

        Route::resource('jadwal', App\Http\Controllers\Admin\ScheduleController::class)
            ->parameters(['jadwal' => 'schedule']);

        Route::resource('mapel', App\Http\Controllers\Admin\SubjectController::class)->except(['create', 'show', 'edit']);

        Route::resource('pengumuman', App\Http\Controllers\Admin\AnnouncementController::class)->except(['create', 'show', 'edit']);

        Route::resource('time-slot', App\Http\Controllers\Admin\TimeSlotController::class)->except(['create', 'show', 'edit']);

        Route::get('/laporan', function () {
            return Inertia::render('Admin/Laporan/Index');
        })->name('laporan');

        Route::get('/setting', [App\Http\Controllers\Admin\SettingController::class, 'index'])->name('setting');
        Route::post('/setting', [App\Http\Controllers\Admin\SettingController::class, 'update'])->name('setting.update');

        Route::get('/lisensi', function () {
            return Inertia::render('Admin/Lisensi/Index');
        })->name('lisensi');

        Route::get('/daring', function () {
            return Inertia::render('Admin/Daring/Index');
        })->name('daring');

        Route::get('/keuangan', function () {
            return Inertia::render('Admin/Keuangan/Index');
        })->name('keuangan');

        Route::resource('absensi', App\Http\Controllers\Admin\AttendanceController::class);

        Route::get('/perpustakaan', [App\Http\Controllers\Admin\LibraryController::class, 'index'])->name('perpustakaan');
        Route::post('/perpustakaan/books', [App\Http\Controllers\Admin\LibraryController::class, 'storeBook'])->name('perpustakaan.books.store');
        Route::patch('/perpustakaan/books/{book}', [App\Http\Controllers\Admin\LibraryController::class, 'updateBook'])->name('perpustakaan.books.update');
        Route::delete('/perpustakaan/books/{book}', [App\Http\Controllers\Admin\LibraryController::class, 'destroyBook'])->name('perpustakaan.books.destroy');
        Route::post('/perpustakaan/loans', [App\Http\Controllers\Admin\LibraryController::class, 'storeLoan'])->name('perpustakaan.loans.store');
        Route::post('/perpustakaan/books/{book}/reader/sync', [App\Http\Controllers\Admin\LibraryController::class, 'syncReader'])->name('perpustakaan.reader.sync');
        Route::get('/perpustakaan/books/{book}/reader/presence', [App\Http\Controllers\Admin\LibraryController::class, 'presence'])->name('perpustakaan.reader.presence');
        Route::get('/perpustakaan/books/{book}/reader/bookmarks', [App\Http\Controllers\Admin\LibraryController::class, 'bookmarks'])->name('perpustakaan.reader.bookmarks');
        Route::post('/perpustakaan/books/{book}/reader/bookmarks', [App\Http\Controllers\Admin\LibraryController::class, 'storeBookmark'])->name('perpustakaan.reader.bookmarks.store');
        Route::delete('/perpustakaan/books/{book}/reader/bookmarks/{bookmark}', [App\Http\Controllers\Admin\LibraryController::class, 'destroyBookmark'])->name('perpustakaan.reader.bookmarks.destroy');
        Route::get('/perpustakaan/books/{book}/reader/comments', [App\Http\Controllers\Admin\LibraryController::class, 'comments'])->name('perpustakaan.reader.comments');
        Route::post('/perpustakaan/books/{book}/reader/comments', [App\Http\Controllers\Admin\LibraryController::class, 'storeComment'])->name('perpustakaan.reader.comments.store');
        Route::get('/perpustakaan/books/{book}/file', [App\Http\Controllers\Admin\LibraryController::class, 'file'])->name('perpustakaan.reader.file');
        Route::post('/perpustakaan/loans/{loan}/return', [App\Http\Controllers\Admin\LibraryController::class, 'returnLoan'])->name('perpustakaan.loans.return');

        Route::get('/ppdb', function () {
            return Inertia::render('Admin/PPDB/Index');
        })->name('ppdb');

        Route::get('/lms', function () {
            return Inertia::render('Admin/LMS/Index');
        })->name('lms');

        Route::get('/chat', function () {
            return Inertia::render('Admin/Chat/Index');
        })->name('chat');

        Route::get('/office-frame', function () {
            return Inertia::render('Admin/SSO/Office');
        })->name('office-frame');

        Route::get('/sarpras', function () {
            return Inertia::render('Admin/Sarpras/Index');
        })->name('sarpras');

        Route::get('/ekskul', function () {
            return Inertia::render('Admin/Ekskul/Index');
        })->name('ekskul');

        Route::get('/pkl', function () {
            return Inertia::render('Admin/PKL/Index');
        })->name('pkl');
    });

// Student (Murid) Routes
Route::prefix('siswa')
    ->middleware(['auth', RoleMiddleware::class.':student'])
    ->name('siswa.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard', ['role' => 'student']);
        })->name('dashboard');

        Route::get('/perpustakaan', [App\Http\Controllers\Admin\LibraryController::class, 'index'])->name('perpustakaan');
        Route::post('/perpustakaan/loans', [App\Http\Controllers\Admin\LibraryController::class, 'storeLoan'])->name('perpustakaan.loans.store');
        Route::post('/perpustakaan/books/{book}/reader/sync', [App\Http\Controllers\Admin\LibraryController::class, 'syncReader'])->name('perpustakaan.reader.sync');
        Route::get('/perpustakaan/books/{book}/reader/presence', [App\Http\Controllers\Admin\LibraryController::class, 'presence'])->name('perpustakaan.reader.presence');
        Route::get('/perpustakaan/books/{book}/reader/bookmarks', [App\Http\Controllers\Admin\LibraryController::class, 'bookmarks'])->name('perpustakaan.reader.bookmarks');
        Route::post('/perpustakaan/books/{book}/reader/bookmarks', [App\Http\Controllers\Admin\LibraryController::class, 'storeBookmark'])->name('perpustakaan.reader.bookmarks.store');
        Route::delete('/perpustakaan/books/{book}/reader/bookmarks/{bookmark}', [App\Http\Controllers\Admin\LibraryController::class, 'destroyBookmark'])->name('perpustakaan.reader.bookmarks.destroy');
        Route::get('/perpustakaan/books/{book}/reader/comments', [App\Http\Controllers\Admin\LibraryController::class, 'comments'])->name('perpustakaan.reader.comments');
        Route::post('/perpustakaan/books/{book}/reader/comments', [App\Http\Controllers\Admin\LibraryController::class, 'storeComment'])->name('perpustakaan.reader.comments.store');
        Route::get('/perpustakaan/books/{book}/file', [App\Http\Controllers\Admin\LibraryController::class, 'file'])->name('perpustakaan.reader.file');
        Route::post('/perpustakaan/loans/{loan}/return', [App\Http\Controllers\Admin\LibraryController::class, 'returnLoan'])->name('perpustakaan.loans.return');
    });

// Parent (Orangtua) Routes
Route::prefix('orangtua')
    ->middleware(['auth', RoleMiddleware::class.':parent'])
    ->name('orangtua.')
    ->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Orangtua\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/pengumuman', [App\Http\Controllers\Orangtua\AnnouncementController::class, 'index'])->name('pengumuman');
        Route::get('/kehadiran', [App\Http\Controllers\Orangtua\AttendanceController::class, 'index'])->name('kehadiran');
        Route::get('/perpustakaan', [App\Http\Controllers\Orangtua\LibraryController::class, 'index'])->name('perpustakaan');
    });

// Teacher (Guru) Routes
Route::prefix('guru')
    ->middleware(['auth', RoleMiddleware::class.':teacher'])
    ->name('guru.')
    ->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Guru\DashboardController::class, 'index'])->name('dashboard');

        // Placeholder Routes
        Route::get('/jadwal', [App\Http\Controllers\Guru\ScheduleController::class, 'index'])->name('jadwal');

        Route::get('/absensi', [App\Http\Controllers\Teacher\AttendanceController::class, 'index'])->name('absensi');
        Route::post('/absensi', [App\Http\Controllers\Teacher\AttendanceController::class, 'store'])->name('absensi.store');

        Route::get('/profile', [App\Http\Controllers\Guru\ProfileController::class, 'index'])->name('profile');

        Route::get('/perpustakaan', [App\Http\Controllers\Admin\LibraryController::class, 'index'])->name('perpustakaan');
        Route::post('/perpustakaan/loans', [App\Http\Controllers\Admin\LibraryController::class, 'storeLoan'])->name('perpustakaan.loans.store');
        Route::post('/perpustakaan/books/{book}/reader/sync', [App\Http\Controllers\Admin\LibraryController::class, 'syncReader'])->name('perpustakaan.reader.sync');
        Route::get('/perpustakaan/books/{book}/reader/presence', [App\Http\Controllers\Admin\LibraryController::class, 'presence'])->name('perpustakaan.reader.presence');
        Route::get('/perpustakaan/books/{book}/reader/bookmarks', [App\Http\Controllers\Admin\LibraryController::class, 'bookmarks'])->name('perpustakaan.reader.bookmarks');
        Route::post('/perpustakaan/books/{book}/reader/bookmarks', [App\Http\Controllers\Admin\LibraryController::class, 'storeBookmark'])->name('perpustakaan.reader.bookmarks.store');
        Route::delete('/perpustakaan/books/{book}/reader/bookmarks/{bookmark}', [App\Http\Controllers\Admin\LibraryController::class, 'destroyBookmark'])->name('perpustakaan.reader.bookmarks.destroy');
        Route::get('/perpustakaan/books/{book}/reader/comments', [App\Http\Controllers\Admin\LibraryController::class, 'comments'])->name('perpustakaan.reader.comments');
        Route::post('/perpustakaan/books/{book}/reader/comments', [App\Http\Controllers\Admin\LibraryController::class, 'storeComment'])->name('perpustakaan.reader.comments.store');
        Route::get('/perpustakaan/books/{book}/file', [App\Http\Controllers\Admin\LibraryController::class, 'file'])->name('perpustakaan.reader.file');
        Route::post('/perpustakaan/loans/{loan}/return', [App\Http\Controllers\Admin\LibraryController::class, 'returnLoan'])->name('perpustakaan.loans.return');
    });

// QR Login Route
Route::post('/auth/qr-login', App\Http\Controllers\Auth\QrLoginController::class)->name('auth.qr-login');

// Bypass Login Route (For External Integration)
Route::get('/login-bypass', function (\Illuminate\Http\Request $request) {
    $email = $request->query('email');
    if (! $email) {
        return redirect()->route('login');
    }

    $user = \App\Models\User::where('email', $email)->first();
    if ($user) {
        Auth::login($user);

        // Redirect based on role
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('guru.dashboard'),
            'student' => redirect()->route('siswa.dashboard'),
            'parent' => redirect()->route('orangtua.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }

    return redirect()->route('login')->withErrors(['email' => 'User not found for bypass login']);
});

require __DIR__.'/auth.php';
