<?php

namespace App\Http\Controllers\Orangtua;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialController extends Controller
{
    /**
     * Display the parent's children billings and payment history.
     */
    public function index(Request $request): Response
    {
        $parent = $request->user();

        // Load children with their classrooms
        $parent->load('children.classrooms');

        $children = $parent->children;
        $childrenIds = $children->pluck('id');

        // Fetch all billings for all children
        $billings = Billing::whereIn('student_id', $childrenIds)
            ->with(['category', 'student', 'transactions.recorder'])
            ->orderBy('due_date', 'desc')
            ->get();

        // Calculate summary stats for the parent
        $totalArrears = 0;
        $totalPaid = 0;
        foreach ($billings as $billing) {
            $netAmount = (float) $billing->amount - (float) $billing->discount;
            $totalPaid += (float) $billing->total_paid;
            if ($billing->status !== 'paid') {
                $totalArrears += ($netAmount - (float) $billing->total_paid);
            }
        }

        return Inertia::render('Orangtua/Keuangan/Index', [
            'children' => $children->map(function ($child) {
                $activeClass = $child->classrooms->firstWhere('pivot.is_active', true);

                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'identity_number' => $child->identity_number,
                    'class' => $activeClass ? $activeClass->name : '-',
                ];
            }),
            'billings' => $billings,
            'summary' => [
                'total_arrears' => $totalArrears,
                'total_paid' => $totalPaid,
                'unpaid_count' => $billings->whereIn('status', ['unpaid', 'partial'])->count(),
            ],
        ]);
    }
}
