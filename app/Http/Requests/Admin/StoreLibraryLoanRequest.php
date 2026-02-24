<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreLibraryLoanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'library_book_id' => 'required|exists:library_books,id',
            'user_id' => 'required|exists:users,id',
            'duration_days' => 'required|integer|min:1|max:30',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'library_book_id.required' => 'Buku wajib dipilih.',
            'user_id.required' => 'Peminjam wajib dipilih.',
            'duration_days.required' => 'Durasi pinjam wajib diisi.',
        ];
    }
}
