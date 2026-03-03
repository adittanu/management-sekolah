<?php

namespace Database\Factories;

use App\Models\LibraryBook;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LibraryComment>
 */
class LibraryCommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'library_book_id' => LibraryBook::factory(),
            'user_id' => User::factory(),
            'current_page' => fake()->numberBetween(1, 120),
            'comment' => fake()->sentence(),
        ];
    }
}
