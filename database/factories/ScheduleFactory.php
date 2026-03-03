<?php

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    public function definition(): array
    {
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

        return [
            'subject_id' => Subject::factory(),
            'classroom_id' => Classroom::factory(),
            'teacher_id' => User::factory()->state(['role' => 'teacher']),
            'day' => $this->faker->randomElement($days),
            'start_time' => '07:00',
            'end_time' => '08:00',
            'room' => null,
        ];
    }
}
