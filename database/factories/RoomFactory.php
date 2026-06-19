<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true).' Room',
            'code' => fake()->unique()->bothify('R-####'),
            'type' => fake()->randomElement(['Ruang Kelas', 'Laboratorium', 'Ruang Guru', 'Aula']),
            'capacity' => fake()->numberBetween(10, 50),
            'building' => fake()->randomElement(['Gedung A', 'Gedung B', 'Gedung C', null]),
            'floor' => fake()->randomElement(['1', '2', '3', null]),
            'is_active' => true,
            'notes' => null,
        ];
    }
}
