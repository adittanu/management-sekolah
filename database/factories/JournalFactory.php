<?php

namespace Database\Factories;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class JournalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'schedule_id' => Schedule::factory(),
            'teacher_id' => User::factory()->state(['role' => 'teacher']),
            'date' => now()->subDays(rand(1, 30))->toDateString(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'proof_file' => null,
            'leave_letter_file' => null,
        ];
    }
}
