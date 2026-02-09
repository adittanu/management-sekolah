<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

class TimeSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $timeSlots = [
            ['slot_number' => 1, 'start_time' => '07:00', 'end_time' => '07:45', 'is_active' => true],
            ['slot_number' => 2, 'start_time' => '07:45', 'end_time' => '08:30', 'is_active' => true],
            ['slot_number' => 3, 'start_time' => '08:30', 'end_time' => '09:15', 'is_active' => true],
            ['slot_number' => 4, 'start_time' => '09:15', 'end_time' => '10:00', 'is_active' => true],
            ['slot_number' => 5, 'start_time' => '10:00', 'end_time' => '10:45', 'is_active' => true],
            ['slot_number' => 6, 'start_time' => '10:45', 'end_time' => '11:30', 'is_active' => true],
            ['slot_number' => 7, 'start_time' => '11:30', 'end_time' => '12:15', 'is_active' => true],
            ['slot_number' => 8, 'start_time' => '12:15', 'end_time' => '13:00', 'is_active' => true],
            ['slot_number' => 9, 'start_time' => '13:00', 'end_time' => '13:45', 'is_active' => true],
            ['slot_number' => 10, 'start_time' => '13:45', 'end_time' => '14:30', 'is_active' => true],
            ['slot_number' => 11, 'start_time' => '14:30', 'end_time' => '15:15', 'is_active' => true],
            ['slot_number' => 12, 'start_time' => '15:15', 'end_time' => '16:00', 'is_active' => true],
            ['slot_number' => 13, 'start_time' => '16:00', 'end_time' => '16:45', 'is_active' => true],
            ['slot_number' => 14, 'start_time' => '16:45', 'end_time' => '17:30', 'is_active' => true],
            ['slot_number' => 15, 'start_time' => '17:30', 'end_time' => '18:15', 'is_active' => true],
        ];

        foreach ($timeSlots as $slot) {
            TimeSlot::create($slot);
        }
    }
}
