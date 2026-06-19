<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms.
     */
    public function index()
    {
        $rooms = Room::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('building', 'like', "%{$search}%");
            })
            ->when(request('type'), function ($query, $type) {
                $query->where('type', $type);
            })
            ->when(request('is_active') !== null, function ($query) {
                $query->where('is_active', request('is_active') === '1');
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $roomTypes = Room::distinct()->pluck('type')->filter()->values();

        return Inertia::render('Admin/Ruangan/Index', [
            'rooms' => $rooms,
            'roomTypes' => $roomTypes,
        ]);
    }

    /**
     * Store a newly created room.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rooms',
            'type' => 'required|string|max:100',
            'capacity' => 'required|integer|min:0',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        Room::create($validated);

        return redirect()->back()->with('success', 'Ruangan berhasil ditambahkan.');
    }

    /**
     * Update the specified room.
     */
    public function update(Request $request, Room $ruangan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rooms,code,'.$ruangan->id,
            'type' => 'required|string|max:100',
            'capacity' => 'required|integer|min:0',
            'building' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        $ruangan->update($validated);

        return redirect()->back()->with('success', 'Ruangan berhasil diupdate.');
    }

    /**
     * Remove the specified room.
     */
    public function destroy(Room $ruangan)
    {
        try {
            if (request()->has('force') && request('force') === 'true') {
                \App\Models\Schedule::where('room', $ruangan->name)->update(['room' => '']);
                $ruangan->delete();

                return back(303)->with('success', 'Ruangan dan data terkait berhasil dihapus.');
            }

            $ruangan->delete();

            return back(303)->with('success', 'Ruangan berhasil dihapus.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                $relatedSchedules = \App\Models\Schedule::with(['classroom', 'teacher'])
                    ->where('room', $ruangan->name)
                    ->get()
                    ->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'classroom' => $schedule->classroom ? $schedule->classroom->name : 'Kelas tidak ditemukan',
                            'teacher' => $schedule->teacher ? $schedule->teacher->name : 'Guru tidak ditemukan',
                            'day' => $schedule->day,
                            'time' => $schedule->start_time.' - '.$schedule->end_time,
                        ];
                    });

                return back(303)->with([
                    'error' => 'Ruangan tidak dapat dihapus karena masih digunakan di jadwal.',
                    'conflict_data' => $relatedSchedules->toArray(),
                ]);
            }

            return back(303)->withErrors(['error' => 'Terjadi kesalahan saat menghapus data.']);
        }
    }
}
