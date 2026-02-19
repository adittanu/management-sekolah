<?php

namespace App\Http\Requests\Integration;

use Illuminate\Foundation\Http\FormRequest;

class ResolveExternalIdentityRequest extends FormRequest
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
            'provider' => ['required', 'string', 'max:50'],
            'external_user_id' => ['required', 'string', 'max:255'],
            'external_username' => ['nullable', 'string', 'max:255'],
            'room_id' => ['nullable', 'string', 'max:255'],
            'auto_link' => ['nullable', 'boolean'],
        ];
    }
}
