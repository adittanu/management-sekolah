<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LibraryBook>
 */
class LibraryBookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'author' => fake()->name(),
            'category' => fake()->randomElement(['Teknologi', 'Pelajaran', 'Fiksi']),
            'description' => fake()->paragraph(),
            'total_pages' => fake()->numberBetween(20, 300),
            'pdf_path' => 'library-books/'.fake()->uuid().'.pdf',
            'uploaded_by' => User::factory(),
            'is_active' => true,
        ];
    }
}
