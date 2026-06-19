<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when(request('role'), function ($query, $role) {
                $query->where('role', $role);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Get students for parent-linking dropdown
        $students = User::where('role', 'student')->select('id', 'name', 'identity_number')->orderBy('name')->get();

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            'students' => $students,
            'filters' => [
                'search' => request('search'),
                'role' => request('role'),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,teacher,student',
            'identity_number' => 'nullable|string|unique:users',
            'teacher_code' => 'nullable|string|unique:users,teacher_code',
            'gender' => 'nullable|in:L,P',
            'avatar' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = new User;
        $user->fill($validated);
        $user->role = $validated['role']; // Explicitly set role since it's guarded
        $user->save();

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:admin,teacher,student,parent',
            'identity_number' => ['nullable', 'string', Rule::unique('users')->ignore($user->id)],
            'teacher_code' => ['nullable', 'string', Rule::unique('users', 'teacher_code')->ignore($user->id)],
            'gender' => 'nullable|in:L,P',
            'avatar' => 'nullable|string',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->fill($validated);
        $user->role = $validated['role']; // Explicitly set role since it's guarded
        $user->save();

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Get children linked to a parent user.
     */
    public function getChildren(User $user)
    {
        if ($user->role !== 'parent') {
            return response()->json(['error' => 'User is not a parent'], 422);
        }

        $children = $user->children()->select('users.id', 'users.name', 'users.identity_number')->get();

        return response()->json($children);
    }

    /**
     * Link children to a parent user.
     */
    public function linkChildren(Request $request, User $user)
    {
        if ($user->role !== 'parent') {
            return redirect()->back()->with('error', 'User is not a parent.');
        }

        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        // Sync children (replaces all existing links)
        $user->children()->sync($validated['student_ids']);

        return redirect()->back()->with('success', 'Data anak berhasil diperbarui.');
    }
}
