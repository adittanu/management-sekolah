<?php

namespace App\Http\Controllers\Orangtua;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications for the authenticated parent.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $notifications = $user->notifications()->paginate(15);

        return Inertia::render('Orangtua/Notifikasi/Index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(string $id): RedirectResponse
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return redirect()->back()->with('success', 'Notifikasi berhasil ditandai sebagai dibaca');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): RedirectResponse
    {
        Auth::user()->unreadNotifications->markAsRead();

        return redirect()->back()->with('success', 'Semua notifikasi berhasil ditandai sebagai dibaca');
    }

    /**
     * Manually trigger sending of notifications (for testing and convenience).
     */
    public function triggerRecap(): RedirectResponse
    {
        Artisan::call('app:send-notification-reminders');

        return redirect()->back()->with('success', 'Berhasil memproses pembaruan rekap dan tagihan');
    }
}
