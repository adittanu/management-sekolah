<?php

namespace Database\Factories;

use App\Models\LibraryBook;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LibraryBookmark>
 */
class LibraryBookmarkFactory extends Factory
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
            'page_number' => fake()->numberBetween(1, 120),
            'note' => fake()->optional()->sentence(),
        ];
    }
}
