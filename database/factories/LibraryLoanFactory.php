<?php

namespace Database\Factories;

use App\Models\LibraryBook;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LibraryLoan>
 */
class LibraryLoanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $loanedAt = now();

        return [
            'library_book_id' => LibraryBook::factory(),
            'user_id' => User::factory(),
            'loaned_by' => User::factory(),
            'loaned_at' => $loanedAt,
            'due_at' => $loanedAt->copy()->addDays(7),
            'returned_at' => null,
            'status' => 'active',
        ];
    }
}
