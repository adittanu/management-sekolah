<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreLibraryBookmarkRequest extends FormRequest
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
            'page_number' => 'required|integer|min:1',
            'note' => 'nullable|string|max:2000',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'page_number.required' => 'Nomor halaman wajib diisi.',
            'page_number.integer' => 'Nomor halaman harus berupa angka.',
            'page_number.min' => 'Nomor halaman minimal 1.',
            'note.max' => 'Catatan maksimal 2000 karakter.',
        ];
    }
}
