<?php

namespace App\Http\Controllers\Orangtua;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('postedBy:id,name,role')
            ->where('is_active', true)
            ->where('published_at', '<=', now())
            ->orderBy('published_at', 'desc')
            ->paginate(10);

        return Inertia::render('Orangtua/Pengumuman/Index', [
            'announcements' => $announcements,
        ]);
    }
}
