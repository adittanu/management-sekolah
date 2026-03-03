<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClassroomFactory extends Factory
{
    public function definition(): array
    {
        $levels = ['10', '11', '12'];
        $majors = ['IPA', 'IPS', 'Bahasa', 'Teknik'];
        $level = $this->faker->randomElement($levels);

        return [
            'name' => $level . $this->faker->randomElement(['A', 'B', 'C']),
            'level' => $level,
            'major' => $this->faker->randomElement($majors),
            'academic_year' => '2025/2026',
            'teacher_id' => null,
        ];
    }
}
