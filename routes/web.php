<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes (Dev Mode - No Auth for easier preview if needed, or we can use auth)
// For now let's just expose them
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    Route::get('/user', function () {
        return Inertia::render('Admin/User/Index');
    })->name('admin.user');

    Route::get('/kelas', function () {
        return Inertia::render('Admin/Kelas/Index');
    })->name('admin.kelas');

    Route::get('/kelas/{id}', function ($id) {
        return Inertia::render('Admin/Kelas/Show', ['id' => $id]);
    })->name('admin.kelas.show');

    Route::get('/jadwal', function () {
        return Inertia::render('Admin/Jadwal/Index');
    })->name('admin.jadwal');

    Route::get('/mapel', function () {
        return Inertia::render('Admin/Mapel/Index');
    })->name('admin.mapel');

    Route::get('/laporan', function () {
        return Inertia::render('Admin/Laporan/Index');
    })->name('admin.laporan');

    Route::get('/setting', function () {
        return Inertia::render('Admin/Setting/Index');
    })->name('admin.setting');

    Route::get('/licensi', function () {
        return Inertia::render('Admin/Licensi/Index');
    })->name('admin.licensi');

    Route::get('/daring', function () {
        return Inertia::render('Admin/Daring/Index');
    })->name('admin.daring');

    Route::get('/keuangan', function () {
        return Inertia::render('Admin/Keuangan/Index');
    })->name('admin.keuangan');

    Route::get('/absensi', function () {
        return Inertia::render('Admin/Absensi/Index');
    })->name('admin.absensi');
});

require __DIR__ . '/auth.php';
