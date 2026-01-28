<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ImportUserController;

Route::get('/', function () {
    // Redirect logged-in users to their dashboard based on role
    if (Auth::check()) {
        $user = Auth::user();
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('guru.dashboard'),
            'student' => redirect()->route('siswa.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $user = Auth::user();
    return match ($user->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'teacher' => redirect()->route('guru.dashboard'),
        'student' => redirect()->route('siswa.dashboard'),
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
    ->middleware(['auth', RoleMiddleware::class . ':admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        Route::post('user/import/preview', [ImportUserController::class, 'preview'])->name('user.import.preview');
        Route::post('user/import', [ImportUserController::class, 'import'])->name('user.import');
        Route::resource('user', UserController::class);

        Route::resource('kelas', App\Http\Controllers\Admin\ClassroomController::class)
            ->parameters(['kelas' => 'classroom']);

        Route::post('kelas/{classroom}/students', [App\Http\Controllers\Admin\ClassroomController::class, 'addStudent'])->name('kelas.students.store');
        Route::delete('kelas/{classroom}/students/{student}', [App\Http\Controllers\Admin\ClassroomController::class, 'removeStudent'])->name('kelas.students.destroy');

        Route::resource('jadwal', App\Http\Controllers\Admin\ScheduleController::class)
            ->parameters(['jadwal' => 'schedule']);

        Route::resource('mapel', App\Http\Controllers\Admin\SubjectController::class)->except(['create', 'show', 'edit']);

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

        Route::get('/perpustakaan', function () {
            return Inertia::render('Admin/Perpustakaan/Index');
        })->name('perpustakaan');

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
    ->middleware(['auth', RoleMiddleware::class . ':student'])
    ->name('siswa.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard', ['role' => 'student']);
        })->name('dashboard');
    });

// Teacher (Guru) Routes
Route::prefix('guru')
    ->middleware(['auth', RoleMiddleware::class . ':teacher'])
    ->name('guru.')
    ->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Guru\DashboardController::class, 'index'])->name('dashboard');

        // Placeholder Routes
        Route::get('/jadwal', [App\Http\Controllers\Guru\ScheduleController::class, 'index'])->name('jadwal');
        
        Route::get('/absensi', [App\Http\Controllers\Teacher\AttendanceController::class, 'index'])->name('absensi');
        Route::post('/absensi', [App\Http\Controllers\Teacher\AttendanceController::class, 'store'])->name('absensi.store');

        Route::get('/profile', [App\Http\Controllers\Guru\ProfileController::class, 'index'])->name('profile');
    });

// QR Login Route
Route::post('/auth/qr-login', App\Http\Controllers\Auth\QrLoginController::class)->name('auth.qr-login');

// Bypass Login Route (For External Integration)
Route::get('/login-bypass', function (\Illuminate\Http\Request $request) {
    $email = $request->query('email');
    if (!$email) {
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
            default => redirect()->route('dashboard'),
        };
    }

    return redirect()->route('login')->withErrors(['email' => 'User not found for bypass login']);
});

require __DIR__ . '/auth.php';
