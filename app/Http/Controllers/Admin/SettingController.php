<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index()
    {
        $school = School::first() ?? new School([
            'name' => 'Sekolah Kita Bisa Berkarya',
            'app_name' => 'Sekolah Kita',
            'address' => 'Jl. Bergerak Berkarya Berdampak No. 123',
            'phone' => '(021) 1234567',
            'email' => 'info@sekolah.sch.id',
            'website' => 'https://www.sekolahkita.sch.id',
            'npsn' => '',
            'accreditation' => '',
            'headmaster_name' => 'Dr. Budi Santoso, M.Pd',
            'headmaster_id' => '19800101 200501 1 001',
        ]);

        return Inertia::render('Admin/Setting/Index', [
            'school' => $school,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'app_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'npsn' => 'nullable|string|max:255',
            'accreditation' => 'nullable|string|max:255',
            'headmaster_name' => 'nullable|string|max:255',
            'headmaster_id' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048', // 2MB Max
        ]);

        $school = School::first();

        if (!$school) {
            $school = new School();
        }

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($school->logo) {
                Storage::disk('public')->delete($school->logo);
            }
            $path = $request->file('logo')->store('schools', 'public');
            $data['logo'] = $path;
        }

        $school->fill($data);
        $school->save();
        
        // Clear cache so frontend gets updated data immediately
        Cache::forget('school_settings');

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
