<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeSlotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $timeSlots = TimeSlot::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('slot_number', 'like', "%{$search}%");
            })
            ->orderBy('slot_number')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/TimeSlot/Index', [
            'timeSlots' => $timeSlots,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'slot_number' => 'required|integer|min:1|unique:time_slots,slot_number',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'boolean',
        ]);

        TimeSlot::create($validated);

        return redirect()->back()->with('success', 'Jam pelajaran berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TimeSlot $timeSlot)
    {
        $validated = $request->validate([
            'slot_number' => 'required|integer|min:1|unique:time_slots,slot_number,' . $timeSlot->id,
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'boolean',
        ]);

        $timeSlot->update($validated);

        return redirect()->back()->with('success', 'Jam pelajaran berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeSlot $timeSlot)
    {
        $timeSlot->delete();

        return redirect()->back()->with('success', 'Jam pelajaran berhasil dihapus.');
    }
}
