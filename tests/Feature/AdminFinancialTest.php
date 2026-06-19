<?php

namespace Tests\Feature;

use App\Models\Billing;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFinancialTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private FinancialCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->category = FinancialCategory::create([
            'name' => 'SPP Bulanan',
            'type' => 'income',
            'description' => 'Iuran SPP per bulan',
            'default_amount' => 150000,
        ]);
    }

    public function test_admin_can_access_finance_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.keuangan'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Keuangan/Index'));
    }

    public function test_student_cannot_access_finance_page(): void
    {
        $response = $this->actingAs($this->student)->get(route('admin.keuangan'));

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_finance_page(): void
    {
        $response = $this->get(route('admin.keuangan'));

        $response->assertRedirect('/login');
    }

    // ========== Category Tests ==========

    public function test_admin_can_create_financial_category(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.kategori.store'), [
            'name' => 'Uang Gedung',
            'type' => 'income',
            'description' => 'Pembayaran uang gedung',
            'default_amount' => 5000000,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('financial_categories', [
            'name' => 'Uang Gedung',
            'type' => 'income',
        ]);
    }

    public function test_admin_can_update_financial_category(): void
    {
        $response = $this->actingAs($this->admin)->patch(route('admin.keuangan.kategori.update', $this->category), [
            'name' => 'SPP Bulanan 2026',
            'type' => 'income',
            'description' => 'Iuran SPP bulanan tahun 2026',
            'default_amount' => 200000,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('financial_categories', [
            'id' => $this->category->id,
            'name' => 'SPP Bulanan 2026',
        ]);
    }

    public function test_admin_can_delete_financial_category(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('admin.keuangan.kategori.destroy', $this->category));

        $response->assertRedirect();
        $this->assertDatabaseMissing('financial_categories', ['id' => $this->category->id]);
    }

    public function test_category_with_billings_cannot_be_deleted(): void
    {
        Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.keuangan.kategori.destroy', $this->category));

        $response->assertRedirect();
        $this->assertDatabaseHas('financial_categories', ['id' => $this->category->id]);
    }

    public function test_category_validation_requires_name(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.kategori.store'), [
            'name' => '',
            'type' => 'income',
        ]);

        $response->assertInvalid(['name']);
    }

    public function test_category_validation_requires_valid_type(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.kategori.store'), [
            'name' => 'Test Kategori',
            'type' => 'invalid',
        ]);

        $response->assertInvalid(['type']);
    }

    // ========== Billing Tests ==========

    public function test_admin_can_create_billing(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.tagihan.store'), [
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari 2026',
            'amount' => 150000,
            'discount' => 0,
            'due_date' => '2026-01-31',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari 2026',
            'amount' => 150000,
            'status' => 'unpaid',
        ]);
    }

    public function test_admin_can_update_billing(): void
    {
        $billing = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->admin)->patch(route('admin.keuangan.tagihan.update', $billing), [
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari 2026 (Updated)',
            'amount' => 200000,
            'due_date' => '2026-02-28',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'id' => $billing->id,
            'description' => 'SPP Januari 2026 (Updated)',
            'amount' => 200000,
        ]);
    }

    public function test_admin_can_delete_billing_without_payments(): void
    {
        $billing = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.keuangan.tagihan.destroy', $billing));

        $response->assertRedirect();
        $this->assertDatabaseMissing('billings', ['id' => $billing->id]);
    }

    public function test_billing_with_payments_cannot_be_deleted(): void
    {
        $billing = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        FinancialTransaction::create([
            'billing_id' => $billing->id,
            'amount' => 100000,
            'payment_method' => 'cash',
            'recorded_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.keuangan.tagihan.destroy', $billing));

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', ['id' => $billing->id]);
    }

    // ========== Payment Tests ==========

    public function test_admin_can_store_full_payment(): void
    {
        $billing = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.pembayaran.store'), [
            'billing_id' => $billing->id,
            'amount' => 150000,
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'id' => $billing->id,
            'total_paid' => 150000,
            'status' => 'paid',
        ]);
    }

    public function test_admin_can_store_partial_payment(): void
    {
        $billing = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.pembayaran.store'), [
            'billing_id' => $billing->id,
            'amount' => 100000,
            'payment_method' => 'transfer',
            'reference_number' => 'TRF-001',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'id' => $billing->id,
            'total_paid' => 100000,
            'status' => 'partial',
        ]);
    }

    public function test_payment_exceeding_remaining_amount_is_rejected(): void
    {
        $billing = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.pembayaran.store'), [
            'billing_id' => $billing->id,
            'amount' => 200000,
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'id' => $billing->id,
            'total_paid' => 0,
            'status' => 'unpaid',
        ]);
    }

    public function test_payment_validation_requires_billing_id(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.pembayaran.store'), [
            'billing_id' => '',
            'amount' => 100000,
            'payment_method' => 'cash',
        ]);

        $response->assertInvalid(['billing_id']);
    }

    public function test_payment_validation_requires_valid_payment_method(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.pembayaran.store'), [
            'billing_id' => 999,
            'amount' => 100000,
            'payment_method' => 'invalid',
        ]);

        $response->assertInvalid(['payment_method']);
    }

    public function test_payment_with_discount_calculation(): void
    {
        $billing = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Januari',
            'amount' => 150000,
            'discount' => 50000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        // Net = 150000 - 50000 = 100000
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.pembayaran.store'), [
            'billing_id' => $billing->id,
            'amount' => 100000,
            'payment_method' => 'cash',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'id' => $billing->id,
            'total_paid' => 100000,
            'status' => 'paid',
        ]);
    }

    public function test_unauthenticated_user_cannot_store_category(): void
    {
        $response = $this->postJson(route('admin.keuangan.kategori.store'), [
            'name' => 'Test',
            'type' => 'income',
        ]);

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_store_billing(): void
    {
        $response = $this->postJson(route('admin.keuangan.tagihan.store'), [
            'student_id' => 1,
            'financial_category_id' => 1,
            'description' => 'Test',
            'amount' => 100000,
            'due_date' => '2026-01-31',
        ]);

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_store_payment(): void
    {
        $response = $this->postJson(route('admin.keuangan.pembayaran.store'), [
            'billing_id' => 1,
            'amount' => 100000,
            'payment_method' => 'cash',
        ]);

        $response->assertStatus(401);
    }

    public function test_admin_can_create_billing_for_multiple_students(): void
    {
        $student2 = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.tagihan.store'), [
            'target_type' => 'multiple',
            'student_ids' => [$this->student->id, $student2->id],
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Iuran Masal',
            'amount' => 150000,
            'discount' => 0,
            'billing_type' => 'one_time',
            'due_date' => '2026-01-31',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'student_id' => $this->student->id,
            'description' => 'SPP Iuran Masal',
        ]);
        $this->assertDatabaseHas('billings', [
            'student_id' => $student2->id,
            'description' => 'SPP Iuran Masal',
        ]);
    }

    public function test_admin_can_create_billing_for_classroom(): void
    {
        $classroom = \App\Models\Classroom::create([
            'name' => '10A',
            'level' => '10',
            'major' => 'Science',
            'academic_year' => '2025/2026',
        ]);

        $classroom->students()->attach($this->student->id, ['is_active' => true]);

        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.tagihan.store'), [
            'target_type' => 'classroom',
            'classroom_id' => $classroom->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Kelas 10A',
            'amount' => 150000,
            'discount' => 0,
            'billing_type' => 'one_time',
            'due_date' => '2026-01-31',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('billings', [
            'student_id' => $this->student->id,
            'description' => 'SPP Kelas 10A',
        ]);
    }

    public function test_admin_can_create_monthly_recurring_billings(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.keuangan.tagihan.store'), [
            'target_type' => 'single',
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'Uang Komite Bulanan',
            'amount' => 100000,
            'discount' => 0,
            'billing_type' => 'monthly',
            'monthly_start_month' => 7,
            'monthly_start_year' => 2026,
            'monthly_end_month' => 9,
            'monthly_end_year' => 2026,
            'monthly_due_day' => 10,
        ]);

        $response->assertRedirect();

        // 3 months: July, August, September
        $this->assertDatabaseHas('billings', [
            'student_id' => $this->student->id,
            'description' => 'Uang Komite Bulanan - Juli 2026',
            'due_date' => '2026-07-10 00:00:00',
        ]);
        $this->assertDatabaseHas('billings', [
            'student_id' => $this->student->id,
            'description' => 'Uang Komite Bulanan - Agustus 2026',
            'due_date' => '2026-08-10 00:00:00',
        ]);
        $this->assertDatabaseHas('billings', [
            'student_id' => $this->student->id,
            'description' => 'Uang Komite Bulanan - September 2026',
            'due_date' => '2026-09-10 00:00:00',
        ]);
    }

    public function test_parent_can_view_child_financial_portal(): void
    {
        $parent = User::factory()->create(['role' => 'parent']);
        $parent->children()->attach($this->student->id);

        Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Uji Coba',
            'amount' => 150000,
            'due_date' => '2026-01-31',
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($parent)->get(route('orangtua.keuangan'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Orangtua/Keuangan/Index'));
    }
}
