<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBillingRequest;
use App\Http\Requests\Admin\StoreFinancialCategoryRequest;
use App\Http\Requests\Admin\StorePaymentRequest;
use App\Models\Billing;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinancialController extends Controller
{
    /**
     * Display the main finance management page.
     */
    public function index(Request $request): Response
    {
        $students = User::where('role', 'student')
            ->with(['billings.category', 'billings.transactions', 'classrooms'])
            ->get();

        $classrooms = \App\Models\Classroom::orderBy('name')->get();

        $categories = FinancialCategory::where('is_active', true)->get();

        $recentTransactions = FinancialTransaction::with(['billing.student', 'billing.category', 'recorder'])
            ->latest()
            ->limit(20)
            ->get();

        // Stats
        $totalIncome = FinancialTransaction::sum('amount');
        $totalBillings = Billing::where('status', 'unpaid')->orWhere('status', 'partial')->sum(DB::raw('amount - discount - total_paid'));
        $paidBillings = Billing::where('status', 'paid')->count();
        $unpaidBillings = Billing::where('status', 'unpaid')->orWhere('status', 'partial')->count();

        return Inertia::render('Admin/Keuangan/Index', [
            'students' => $students,
            'classrooms' => $classrooms,
            'categories' => $categories,
            'recentTransactions' => $recentTransactions,
            'stats' => [
                'total_income' => $totalIncome,
                'total_arrears' => $totalBillings,
                'paid_count' => $paidBillings,
                'unpaid_count' => $unpaidBillings,
            ],
        ]);
    }

    // ========== Financial Categories CRUD ==========

    /**
     * Store a new financial category.
     */
    public function storeCategory(StoreFinancialCategoryRequest $request): RedirectResponse
    {
        FinancialCategory::create($request->validated());

        return redirect()->back()->with('success', 'Kategori berhasil dibuat.');
    }

    /**
     * Update an existing financial category.
     */
    public function updateCategory(StoreFinancialCategoryRequest $request, FinancialCategory $category): RedirectResponse
    {
        $category->update($request->validated());

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Delete a financial category.
     */
    public function destroyCategory(FinancialCategory $category): RedirectResponse
    {
        if ($category->billings()->exists()) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena masih digunakan oleh tagihan.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }

    // ========== Billings CRUD ==========

    /**
     * Store a new billing.
     */
    public function storeBilling(StoreBillingRequest $request): RedirectResponse
    {
        // Determine targeted students
        $studentIds = [];
        $targetType = $request->target_type;

        if ($targetType === 'single') {
            $studentIds = [$request->student_id];
        } elseif ($targetType === 'multiple') {
            $studentIds = $request->student_ids;
        } elseif ($targetType === 'classroom') {
            $studentIds = DB::table('classroom_user')
                ->where('classroom_id', $request->classroom_id)
                ->where('is_active', true)
                ->pluck('user_id')
                ->toArray();
        } elseif ($targetType === 'all') {
            $studentIds = User::where('role', 'student')->pluck('id')->toArray();
        }

        if (empty($studentIds)) {
            return redirect()->back()->with('error', 'Tidak ada siswa yang dipilih atau ditemukan untuk target penerima.');
        }

        // Determine billing dates
        $billingsData = [];
        $billingType = $request->billing_type;

        if ($billingType === 'one_time') {
            $billingsData[] = [
                'due_date' => $request->due_date,
                'desc_suffix' => '',
            ];
        } elseif ($billingType === 'monthly') {
            $startYear = (int) $request->monthly_start_year;
            $startMonth = (int) $request->monthly_start_month;
            $endYear = (int) $request->monthly_end_year;
            $endMonth = (int) $request->monthly_end_month;
            $dueDay = (int) $request->monthly_due_day;

            $idMonths = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
            ];

            $currentYear = $startYear;
            $currentMonth = $startMonth;

            // Generate monthly dates
            while ($currentYear < $endYear || ($currentYear === $endYear && $currentMonth <= $endMonth)) {
                $monthName = $idMonths[$currentMonth];
                $dueDate = \Carbon\Carbon::create($currentYear, $currentMonth, 1)->endOfMonth();
                if ($dueDay < $dueDate->day) {
                    $dueDate->day($dueDay);
                }

                $billingsData[] = [
                    'due_date' => $dueDate->toDateString(),
                    'desc_suffix' => " - $monthName $currentYear",
                ];

                $currentMonth++;
                if ($currentMonth > 12) {
                    $currentMonth = 1;
                    $currentYear++;
                }
            }
        }

        // Create the billings inside a database transaction
        DB::transaction(function () use ($studentIds, $billingsData, $request) {
            foreach ($studentIds as $studentId) {
                foreach ($billingsData as $data) {
                    Billing::create([
                        'student_id' => $studentId,
                        'financial_category_id' => $request->financial_category_id,
                        'description' => $request->description.$data['desc_suffix'],
                        'amount' => $request->amount,
                        'discount' => $request->discount ?? 0,
                        'due_date' => $data['due_date'],
                        'status' => 'unpaid',
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Tagihan berhasil dibuat.');
    }

    /**
     * Update an existing billing.
     */
    public function updateBilling(StoreBillingRequest $request, Billing $billing): RedirectResponse
    {
        $billing->update([
            'student_id' => $request->student_id,
            'financial_category_id' => $request->financial_category_id,
            'description' => $request->description,
            'amount' => $request->amount,
            'discount' => $request->discount ?? 0,
            'due_date' => $request->due_date,
        ]);

        return redirect()->back()->with('success', 'Tagihan berhasil diperbarui.');
    }

    /**
     * Delete a billing.
     */
    public function destroyBilling(Billing $billing): RedirectResponse
    {
        if ($billing->transactions()->exists()) {
            return redirect()->back()->with('error', 'Tagihan tidak dapat dihapus karena sudah memiliki pembayaran.');
        }

        $billing->delete();

        return redirect()->back()->with('success', 'Tagihan berhasil dihapus.');
    }

    // ========== Payments ==========

    /**
     * Store a new payment transaction.
     */
    public function storePayment(StorePaymentRequest $request): RedirectResponse
    {
        $billing = Billing::findOrFail($request->billing_id);
        $remaining = $billing->amount - $billing->discount - $billing->total_paid;

        if ($request->amount > $remaining) {
            return redirect()->back()->with('error', 'Jumlah pembayaran melebihi sisa tagihan.');
        }

        DB::transaction(function () use ($request, $billing) {
            FinancialTransaction::create([
                'billing_id' => $request->billing_id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'reference_number' => $request->reference_number,
                'notes' => $request->notes,
                'recorded_by' => Auth::id(),
            ]);

            $newTotalPaid = $billing->total_paid + $request->amount;
            $netAmount = $billing->amount - $billing->discount;

            $status = 'partial';
            if ($newTotalPaid >= $netAmount) {
                $status = 'paid';
            }

            $billing->update([
                'total_paid' => $newTotalPaid,
                'status' => $status,
            ]);
        });

        return redirect()->back()->with('success', 'Pembayaran berhasil dicatat.');
    }

    /**
     * Get billings for a specific student.
     */
    public function getStudentBillings(User $student): \Illuminate\Http\JsonResponse
    {
        $billings = Billing::where('student_id', $student->id)
            ->with('category')
            ->orderBy('due_date', 'desc')
            ->get();

        return response()->json([
            'data' => $billings,
        ]);
    }

    /**
     * Get transactions for a specific billing.
     */
    public function getBillingTransactions(Billing $billing): \Illuminate\Http\JsonResponse
    {
        $transactions = FinancialTransaction::where('billing_id', $billing->id)
            ->with('recorder')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $transactions,
        ]);
    }
}
