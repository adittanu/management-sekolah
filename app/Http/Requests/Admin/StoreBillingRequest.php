<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBillingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'target_type' => $this->target_type ?? 'single',
            'billing_type' => $this->billing_type ?? 'one_time',
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'target_type' => 'required|in:single,multiple,classroom,all',
            'student_id' => 'required_if:target_type,single|nullable|exists:users,id',
            'student_ids' => 'required_if:target_type,multiple|nullable|array',
            'student_ids.*' => 'exists:users,id',
            'classroom_id' => 'required_if:target_type,classroom|nullable|exists:classrooms,id',
            'billing_type' => 'required|in:one_time,monthly',
            'financial_category_id' => 'required|exists:financial_categories,id',
            'description' => 'required|string|max:500',
            'amount' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'due_date' => 'required_if:billing_type,one_time|nullable|date',
            'monthly_start_month' => 'required_if:billing_type,monthly|nullable|integer|min:1|max:12',
            'monthly_start_year' => 'required_if:billing_type,monthly|nullable|integer|min:2020|max:2100',
            'monthly_end_month' => 'required_if:billing_type,monthly|nullable|integer|min:1|max:12',
            'monthly_end_year' => 'required_if:billing_type,monthly|nullable|integer|min:2020|max:2100',
            'monthly_due_day' => 'required_if:billing_type,monthly|nullable|integer|min:1|max:31',
        ];
    }

    public function messages(): array
    {
        return [
            'target_type.required' => 'Target penerima wajib dipilih.',
            'target_type.in' => 'Target penerima tidak valid.',
            'student_id.required_if' => 'Siswa wajib dipilih.',
            'student_id.exists' => 'Siswa tidak ditemukan.',
            'student_ids.required_if' => 'Daftar siswa wajib dipilih.',
            'student_ids.array' => 'Daftar siswa harus berupa array.',
            'classroom_id.required_if' => 'Kelas wajib dipilih.',
            'classroom_id.exists' => 'Kelas tidak ditemukan.',
            'billing_type.required' => 'Tipe tagihan wajib ditentukan.',
            'billing_type.in' => 'Tipe tagihan tidak valid.',
            'financial_category_id.required' => 'Kategori keuangan wajib dipilih.',
            'financial_category_id.exists' => 'Kategori keuangan tidak ditemukan.',
            'description.required' => 'Deskripsi wajib diisi.',
            'amount.required' => 'Nominal tagihan wajib diisi.',
            'amount.numeric' => 'Nominal tagihan harus berupa angka.',
            'amount.min' => 'Nominal tagihan tidak boleh kurang dari 0.',
            'due_date.required_if' => 'Tanggal jatuh tempo wajib diisi.',
            'due_date.date' => 'Format tanggal jatuh tempo tidak valid.',
            'monthly_start_month.required_if' => 'Bulan mulai wajib diisi.',
            'monthly_start_year.required_if' => 'Tahun mulai wajib diisi.',
            'monthly_end_month.required_if' => 'Bulan selesai wajib diisi.',
            'monthly_end_year.required_if' => 'Tahun selesai wajib diisi.',
            'monthly_due_day.required_if' => 'Hari jatuh tempo bulanan wajib diisi.',
        ];
    }
}
