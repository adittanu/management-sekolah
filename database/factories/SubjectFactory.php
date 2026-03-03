<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SubjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'code' => strtoupper($this->faker->lexify('??###')),
            'category' => $this->faker->randomElement(['Core', 'Elective', 'Vocational']),
        ];
    }
}
