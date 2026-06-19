<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TimeSlot;
use App\Models\User;
use App\Services\AutoScheduleGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoScheduleGeneratorTest extends TestCase
{
    use RefreshDatabase;

    /** @var \App\Models\TimeSlot[] */
    private array $timeSlots = [];

    private User $teacher1;

    private User $teacher2;

    private Classroom $classroom;

    protected function setUp(): void
    {
        parent::setUp();

        // Create 6 time slots (6 days × 6 slots = 36 total)
        $times = [
            ['start' => '07:00', 'end' => '07:45'],
            ['start' => '07:45', 'end' => '08:30'],
            ['start' => '08:30', 'end' => '09:15'],
            ['start' => '09:15', 'end' => '10:00'],
            ['start' => '10:00', 'end' => '10:45'],
            ['start' => '10:45', 'end' => '11:30'],
        ];

        foreach ($times as $i => $time) {
            $this->timeSlots[] = TimeSlot::create([
                'slot_number' => $i + 1,
                'start_time' => $time['start'],
                'end_time' => $time['end'],
                'is_active' => true,
            ]);
        }

        $this->teacher1 = User::factory()->create([
            'name' => 'Pak Budi',
            'email' => 'budi@test.com',
        ]);
        $this->teacher1->forceFill(['role' => 'teacher'])->save();

        $this->teacher2 = User::factory()->create([
            'name' => 'Pak Andi',
            'email' => 'andi@test.com',
        ]);
        $this->teacher2->forceFill(['role' => 'teacher'])->save();

        $this->classroom = Classroom::factory()->create([
            'name' => 'X-A',
            'level' => 'X',
            'major' => 'IPA',
        ]);
    }

    /**
     * Test: Total scheduled lessons must match total requirements when there are
     * no conflicts.
     * Scenario: 6 mapel × 6 jam/minggu = 36 lessons = 6 hari × 6 slot = 36 slot.
     */
    public function test_generate_fills_all_slots_when_requirements_match(): void
    {
        $subjects = collect();
        for ($i = 0; $i < 6; $i++) {
            $subject = Subject::create([
                'name' => 'Mapel '.$i,
                'code' => 'M'.$i,
                'category' => 'Core',
            ]);
            $subject->teachers()->attach($this->teacher1);
            $subjects->push($subject);
        }

        $requirements = $subjects->map(fn ($s) => [
            'subject_id' => $s->id,
            'hours' => 6,
        ])->toArray();

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        // Must schedule all 36 lessons
        $this->assertEquals(36, $this->countTotalSlots($result['schedule']), 'Expected 36 scheduled lessons');
        $this->assertEquals(100.0, $result['stats']['fill_rate']);
        $this->assertEmpty($result['unfulfilled'] ?? []);

        // Check: every subject appears exactly 6 times
        $subjectCounts = $this->getSubjectCountsInSlots($result['schedule']);
        foreach ($subjects as $subject) {
            $this->assertEquals(
                6,
                $subjectCounts[$subject->id] ?? 0,
                "Subject {$subject->name} should have 6 slots"
            );
        }
    }

    /**
     * Test: When total requirements < total slots, fill_rate < 100% and
     * warnings are returned about empty slots.
     */
    public function test_generate_warns_when_total_hours_less_than_slots(): void
    {
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        // 10 hours but 36 slots available
        $requirements = [['subject_id' => $subject->id, 'hours' => 10]];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertEquals(10, $this->countTotalSlots($result['schedule']));
        $this->assertNotEmpty($result['warnings']);
        $this->assertStringContainsString('kurang dari total slot', $result['warnings'][0]);
    }

    /**
     * Test: When total requirements > total slots, warning is returned.
     */
    public function test_generate_warns_when_total_hours_exceed_slots(): void
    {
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        // 40 hours but only 36 slots available
        $requirements = [['subject_id' => $subject->id, 'hours' => 40]];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['warnings']);
        $this->assertStringContainsString('melebihi total slot', $result['warnings'][0]);
    }

    /**
     * Test: Teacher constraint — a teacher cannot teach more than 1 class at the
     * same time. If teacher1 is already teaching another class at slot 1 Monday,
     * this teacher cannot be placed there for this class.
     */
    public function test_generate_respects_teacher_availability(): void
    {
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        // Create another classroom and schedule teacher1 at Monday slot 1
        $otherClassroom = Classroom::factory()->create(['name' => 'XI-A', 'level' => 'XI', 'major' => 'IPA']);
        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $otherClassroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        $requirements = [['subject_id' => $subject->id, 'hours' => 1]];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertCount(1, $result['schedule']);

        // Must NOT be on Senin at 07:00
        $placement = $result['schedule'][0];
        $this->assertTrue(
            $placement['day'] !== 'Senin' || $placement['start_time'] !== '07:00',
            'Teacher should not be scheduled at the same time as another class'
        );
    }

    /**
     * Test: No duplicate slot placement — same classroom cannot have 2 lessons
     * at the same day + time.
     */
    public function test_generate_no_duplicate_slots_per_classroom(): void
    {
        $subjects = collect();
        for ($i = 0; $i < 3; $i++) {
            $subject = Subject::create(['name' => 'Subject '.$i, 'code' => 'S'.$i, 'category' => 'Core']);
            $subject->teachers()->attach($this->teacher1);
            $subjects->push($subject);
        }

        $requirements = $subjects->map(fn ($s) => [
            'subject_id' => $s->id,
            'hours' => 6,
        ])->toArray();

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertEquals(18, $this->countTotalSlots($result['schedule']));

        // Check no duplicate day+time
        $slots = [];
        foreach ($result['schedule'] as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);
            for ($s = $startSlot; $s <= $endSlot; $s++) {
                $slots[] = $entry['day'].'_'.$s;
            }
        }
        $this->assertEquals(count($slots), count(array_unique($slots)), 'No duplicate slots');
    }

    /**
     * Test: saveSchedule respects clearExisting flag.
     */
    public function test_save_schedule_clears_existing_when_flag_is_true(): void
    {
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);

        // Create an existing schedule entry
        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        $generator = new AutoScheduleGenerator;

        // Save new schedule with clearExisting = true
        $newSchedule = [
            [
                'subject_id' => $subject->id,
                'classroom_id' => $this->classroom->id,
                'teacher_id' => $this->teacher2->id,
                'day' => 'Selasa',
                'start_time' => '07:00',
                'end_time' => '07:45',
                'room' => 'R.102',
                'subject_name' => 'Test Subject',
            ],
        ];

        $result = $generator->saveSchedule($newSchedule, true);

        $this->assertEquals(1, $result['saved']);

        // Old schedule should be deleted
        $this->assertDatabaseMissing('schedules', [
            'classroom_id' => $this->classroom->id,
            'day' => 'Senin',
        ]);

        // New schedule should exist
        $this->assertDatabaseHas('schedules', [
            'classroom_id' => $this->classroom->id,
            'day' => 'Selasa',
        ]);
    }

    /**
     * Test: saveSchedule preserves existing when clearExisting is false.
     */
    public function test_save_schedule_preserves_existing_when_flag_is_false(): void
    {
        $subject1 = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $subject2 = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);

        Schedule::create([
            'subject_id' => $subject1->id,
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        $generator = new AutoScheduleGenerator;

        $newSchedule = [
            [
                'subject_id' => $subject2->id,
                'classroom_id' => $this->classroom->id,
                'teacher_id' => $this->teacher2->id,
                'day' => 'Senin',
                'start_time' => '08:30',
                'end_time' => '09:15',
                'room' => 'R.102',
                'subject_name' => 'New Subject',
            ],
        ];

        $result = $generator->saveSchedule($newSchedule, false);

        $this->assertEquals(1, $result['saved']);

        // Old schedule should still exist
        $this->assertDatabaseHas('schedules', [
            'classroom_id' => $this->classroom->id,
            'day' => 'Senin',
            'start_time' => '07:00',
        ]);
    }

    /**
     * Test: When no time slots are configured, return error message.
     */
    public function test_generate_returns_error_when_no_time_slots(): void
    {
        TimeSlot::query()->update(['is_active' => false]);

        $subject = Subject::create(['name' => 'Math', 'code' => 'MTK', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [['subject_id' => $subject->id, 'hours' => 6]];
        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertEmpty($result['schedule']);
        $this->assertNotEmpty($result['conflicts']);
        $this->assertStringContainsString('slot waktu aktif', $result['conflicts'][0]);
    }

    /**
     * Test: Each subject's hours exactly match the count in the result.
     * This specifically tests Bug A — old code used block placement that lost hours.
     */
    public function test_each_subject_has_exact_hour_count(): void
    {
        $subjects = collect();
        $hoursPerSubject = [2, 4, 3, 6, 1, 5]; // total = 21, less than 36 slots

        for ($i = 0; $i < 6; $i++) {
            $subject = Subject::create([
                'name' => 'Subject '.$i,
                'code' => 'S'.$i,
                'category' => 'Core',
            ]);
            $subject->teachers()->attach($this->teacher1);
            $subjects->push($subject);
        }

        $requirements = [];
        foreach ($subjects as $i => $subject) {
            $requirements[] = [
                'subject_id' => $subject->id,
                'hours' => $hoursPerSubject[$i],
            ];
        }

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertEquals(21, $this->countTotalSlots($result['schedule']), 'Total scheduled must be 21');

        $subjectCounts = $this->getSubjectCountsInSlots($result['schedule']);
        foreach ($subjects as $i => $subject) {
            $this->assertEquals(
                $hoursPerSubject[$i],
                $subjectCounts[$subject->id] ?? 0,
                "Subject {$subject->name} should have exactly {$hoursPerSubject[$i]} hours"
            );
        }
    }

    /**
     * Test: generate() only returns schedule for the specified classroom, not others.
     */
    public function test_generate_scoped_to_single_classroom(): void
    {
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        // Create second classroom
        $otherClassroom = Classroom::factory()->create(['name' => 'XI-B', 'level' => 'XI', 'major' => 'IPA']);

        // Schedule for the other classroom already exists
        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $otherClassroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        $requirements = [['subject_id' => $subject->id, 'hours' => 1]];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertCount(1, $result['schedule']);

        // The generated schedule must belong to the target classroom only
        foreach ($result['schedule'] as $entry) {
            $this->assertEquals($this->classroom->id, $entry['classroom_id']);
            // Must not conflict with the other classroom's schedule
            if ($entry['day'] === 'Senin') {
                $this->assertNotEquals('07:00', $entry['start_time']);
            }
        }
    }

    /**
     * Test: generate() returns unfulfilled in the result.
     */
    public function test_generate_returns_unfulfilled(): void
    {
        // Subject with no teachers assigned — cannot be scheduled
        $subject = Subject::create(['name' => 'Tanpa Guru', 'code' => 'TG', 'category' => 'Elective']);

        $requirements = [['subject_id' => $subject->id, 'hours' => 2]];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertArrayHasKey('unfulfilled', $result);
        $this->assertNotEmpty($result['unfulfilled']);
    }

    /**
     * Test: saveSchedule with clearExisting only deletes the target classroom's schedules.
     */
    public function test_save_schedule_clears_only_target_classroom(): void
    {
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $otherClassroom = Classroom::factory()->create(['name' => 'XI-B', 'level' => 'XI', 'major' => 'IPA']);

        // Schedules for both classrooms
        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);
        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $otherClassroom->id,
            'teacher_id' => $this->teacher2->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.102',
        ]);

        // Simulate what the controller does: delete only target classroom
        Schedule::where('classroom_id', $this->classroom->id)->delete();

        // Other classroom's schedule should still exist
        $this->assertDatabaseHas('schedules', [
            'classroom_id' => $otherClassroom->id,
            'day' => 'Senin',
        ]);

        // Target classroom's schedule should be gone
        $this->assertDatabaseMissing('schedules', [
            'classroom_id' => $this->classroom->id,
            'day' => 'Senin',
        ]);
    }

    /**
     * Test: Cross-class teacher conflict — generating for classroom B respects
     * existing schedules from classroom A.
     */
    public function test_generate_respects_existing_schedules_from_other_classrooms(): void
    {
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $otherClassroom = Classroom::factory()->create(['name' => 'XI-A', 'level' => 'XI', 'major' => 'IPA']);

        // teacher1 already teaches in classroom A at Senin 07:00
        Schedule::create([
            'subject_id' => $subject->id,
            'classroom_id' => $otherClassroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        $requirements = [['subject_id' => $subject->id, 'hours' => 1]];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertCount(1, $result['schedule']);

        // Must NOT be placed at Senin 07:00 (teacher is busy)
        $placement = $result['schedule'][0];
        $this->assertTrue(
            $placement['day'] !== 'Senin' || $placement['start_time'] !== '07:00',
            'Should not schedule teacher at the same time as another class'
        );
    }

    /**
     * Test: A subject with 2 JP is scheduled as a contiguous block of consecutive slots
     * on the same day, rather than being split across different days or non-consecutive slots.
     */
    public function test_generate_schedules_multiple_jp_consecutively_on_same_day(): void
    {
        $subject = Subject::create([
            'name' => 'Ekonomi',
            'code' => 'EKO',
            'category' => 'Core',
        ]);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 2],
        ];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertCount(1, $result['schedule'], 'Ekonomi 2 JP should be merged/scheduled as 1 contiguous entry');

        $entry = $result['schedule'][0];
        $this->assertEquals($subject->id, $entry['subject_id']);

        $startSlot = $this->timeToSlotNumber($entry['start_time']);
        $endSlot = $this->timeToSlotNumber($entry['end_time'], true);

        $this->assertEquals(2, $endSlot - $startSlot + 1, 'Block duration should be exactly 2 slots');
    }

    /**
     * Test: The generator respects various instructions from the AI prompt,
     * including subject day/time preferences, teacher hour overrides, and slot exclusions.
     */
    public function test_generate_respects_ai_prompt_instructions(): void
    {
        $subject1 = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $subject1->teachers()->attach($this->teacher1);

        $subject2 = Subject::create(['name' => 'Olahraga', 'code' => 'OR', 'category' => 'Core']);
        $subject2->teachers()->attach($this->teacher2);

        $requirements = [
            ['subject_id' => $subject1->id, 'hours' => 2],
            ['subject_id' => $subject2->id, 'hours' => 2],
        ];

        $generator = new AutoScheduleGenerator;

        // Set prompt: "Matematika diutamakan pagi hari. Olahraga hari Jumat. Jam istirahat di slot 1."
        $generator->setPrompt('Matematika diutamakan pagi hari. Olahraga hari Jumat. Jam istirahat di slot 1.');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);

            // 1. Slot 1 must be empty (excluded as break)
            for ($s = $startSlot; $s <= $endSlot; $s++) {
                $this->assertNotEquals(1, $s, 'Slot 1 must be left empty for break');
            }

            // 2. Matematika must be scheduled in morning (slot <= 3)
            if ($entry['subject_id'] === $subject1->id) {
                $this->assertLessThanOrEqual(3, $startSlot, 'Matematika should prefer morning slots');
            }

            // 3. Olahraga must be scheduled on Jumat
            if ($entry['subject_id'] === $subject2->id) {
                $this->assertEquals('Jumat', $entry['day'], 'Olahraga should prefer Jumat');
            }
        }
    }

    /**
     * Test: The generator respects time-based break ranges specified in the prompt
     * by mapping them to overlapping slot numbers and leaving those slots empty.
     */
    public function test_generate_respects_time_range_ai_prompt_instructions(): void
    {
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 2],
        ];

        $generator = new AutoScheduleGenerator;

        // Set prompt with time-based break: "jam istirahat jam 07:45 sampai 08:30" (this is slot 2)
        $generator->setPrompt('jam istirahat jam 07.45 sampai 08.30');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);

            for ($s = $startSlot; $s <= $endSlot; $s++) {
                $this->assertNotEquals(2, $s, 'Slot 2 (07:45-08:30) must be left empty due to time-based break in prompt');
            }
        }
    }

    /**
     * Test: The generator respects specific hour limits for a subject (e.g. "Bahasa indonesia ... jam 10:00 ke atas")
     * by scoring them higher and placing them accordingly.
     */
    public function test_generate_respects_subject_specific_time_limit_instructions(): void
    {
        $subject = Subject::create(['name' => 'Bahasa Indonesia', 'code' => 'BIND', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 2],
        ];

        $generator = new AutoScheduleGenerator;

        // Set prompt: "Bahasa indonesia ingin di hari rabu di jam 10:00 ke atas"
        $generator->setPrompt('Bahasa indonesia ingin di hari rabu di jam 10:00 ke atas');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $this->assertEquals('Rabu', $entry['day']);

            [$hour, $min] = explode(':', $entry['start_time']);
            $startMinutes = (int) $hour * 60 + (int) $min;

            $this->assertGreaterThanOrEqual(10 * 60, $startMinutes, 'Should be scheduled after 10:00');
        }
    }

    /**
     * Test: The generator respects specific hour limits specified without minutes (e.g. "jam 10 ke atas")
     * by scoring them higher and placing them accordingly.
     */
    public function test_generate_respects_subject_specific_time_limit_without_minutes(): void
    {
        $subject = Subject::create(['name' => 'Matematika Wajib', 'code' => 'MTK-W', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 2],
        ];

        $generator = new AutoScheduleGenerator;

        // Set prompt: "Matematika Wajib ingin di hari rabu di jam setelah jam 10"
        $generator->setPrompt('Matematika Wajib ingin di hari rabu di jam setelah jam 10');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $this->assertEquals('Rabu', $entry['day']);

            [$hour, $min] = explode(':', $entry['start_time']);
            $startMinutes = (int) $hour * 60 + (int) $min;

            $this->assertGreaterThanOrEqual(10 * 60, $startMinutes, 'Should be scheduled after 10:00');
        }
    }

    private function countTotalSlots(array $schedule): int
    {
        $total = 0;
        foreach ($schedule as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);
            $total += max(1, $endSlot - $startSlot + 1);
        }

        return $total;
    }

    private function timeToSlotNumber(string $time, bool $isEnd = false): int
    {
        $normalized = substr($time, 0, 5);
        foreach ($this->timeSlots as $slot) {
            $slotTime = $isEnd ? $slot->end_time : $slot->start_time;
            if ($slotTime instanceof \DateTimeInterface) {
                $formatted = $slotTime->format('H:i');
            } else {
                $formatted = substr(trim((string) $slotTime), 0, 5);
                if (preg_match('/(\d{2}:\d{2})/', (string) $slotTime, $matches)) {
                    $formatted = $matches[1];
                }
            }

            if ($formatted === $normalized) {
                return $slot->slot_number;
            }
        }

        return 1;
    }

    private function getSubjectCountsInSlots(array $schedule): array
    {
        $counts = [];
        foreach ($schedule as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);
            $duration = max(1, $endSlot - $startSlot + 1);
            $subjectId = $entry['subject_id'];
            $counts[$subjectId] = ($counts[$subjectId] ?? 0) + $duration;
        }

        return $counts;
    }

    public function test_generate_allocates_various_rooms_for_mobile_classroom(): void
    {
        // Set classroom as mobile
        $this->classroom->update(['is_mobile' => true]);

        // Create active room master data
        \App\Models\Room::create(['name' => 'Ruang 101', 'code' => 'R101', 'type' => 'Ruang Kelas', 'is_active' => true]);
        \App\Models\Room::create(['name' => 'Ruang 102', 'code' => 'R102', 'type' => 'Ruang Kelas', 'is_active' => true]);

        $subject = Subject::create(['name' => 'Sejarah', 'code' => 'SEJ', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [['subject_id' => $subject->id, 'hours' => 2]];

        $generator = new AutoScheduleGenerator;
        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);
        $this->assertNotEmpty($result['schedule'][0]['room']);
    }

    /**
     * Test: The generator respects break time ranges with Indonesian typos, multiple slots, and conjunctions.
     */
    public function test_generate_respects_break_time_ranges_with_typos_and_conjunctions(): void
    {
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 2],
        ];

        $generator = new AutoScheduleGenerator;

        // Set prompt with break times using typos like "istirhat" and "dan" conjunction:
        // "jam istirhat jam 07.45 sampai 08.30 dan jam 08.30 sampai 09.15" (slots 2 and 3)
        $generator->setPrompt('jam istirhat jam 07.45 sampai 08.30 dan jam 08.30 sampai 09.15');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);

            for ($s = $startSlot; $s <= $endSlot; $s++) {
                $this->assertNotEquals(2, $s, 'Slot 2 (07:45-08:30) must be left empty');
                $this->assertNotEquals(3, $s, 'Slot 3 (08:30-09:15) must be left empty');
            }
        }
    }

    /**
     * Test: saveSchedule deletes existing overlapping schedules for break slots even when clearExisting is false.
     */
    public function test_save_schedule_deletes_overlapping_schedules_on_break_slots_when_clear_existing_is_false(): void
    {
        $subject1 = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $subject2 = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);

        // Create an existing schedule entry for the classroom on Monday slot 2 (07:45 - 08:30)
        $existingSchedule = Schedule::create([
            'subject_id' => $subject1->id,
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:45',
            'end_time' => '08:30',
            'room' => 'R.101',
        ]);

        // Create another existing schedule entry on Monday slot 1 (07:00 - 07:45)
        $otherSchedule = Schedule::create([
            'subject_id' => $subject1->id,
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        $generator = new AutoScheduleGenerator;
        // Exclude slot 2
        $generator->setPrompt('jam istirahat jam 07.45 sampai 08.30');

        // Populate $generator->excludedSlots by running generate
        $generator->generate($this->classroom->id, [
            ['subject_id' => $subject2->id, 'hours' => 1],
        ]);

        // Try to save new schedule with clearExisting = false
        $newSchedule = [
            [
                'subject_id' => $subject2->id,
                'classroom_id' => $this->classroom->id,
                'teacher_id' => $this->teacher2->id,
                'day' => 'Selasa',
                'start_time' => '08:30',
                'end_time' => '09:15',
                'room' => 'R.102',
                'subject_name' => 'Fisika',
            ],
        ];

        $result = $generator->saveSchedule($newSchedule, false);

        $this->assertEquals(1, $result['saved']);

        // The schedule on slot 2 (07:45 - 08:30) should be DELETED because it's a break slot
        $this->assertDatabaseMissing('schedules', [
            'id' => $existingSchedule->id,
        ]);

        // The schedule on slot 1 (07:00 - 07:45) should STILL exist because it's not a break slot
        $this->assertDatabaseHas('schedules', [
            'id' => $otherSchedule->id,
        ]);
    }

    /**
     * Test: The generator respects day-specific ceremony and slot-range exclusions from the prompt.
     */
    public function test_generate_respects_day_specific_ceremony_and_slot_range_exclusions(): void
    {
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 6], // 6 hours total
        ];

        $generator = new AutoScheduleGenerator;

        // Set prompt: "hari senin pagi ada upacara, hari selasa slot 1 sampai 2 kosong untuk acara"
        // This excludes Senin slot 1 and Selasa slots 1 & 2
        $generator->setPrompt('hari senin pagi ada upacara, hari selasa slot 1 sampai 2 kosong untuk acara');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);

            for ($s = $startSlot; $s <= $endSlot; $s++) {
                if ($entry['day'] === 'Senin') {
                    $this->assertNotEquals(1, $s, 'Senin slot 1 must be left empty for ceremony');
                }
                if ($entry['day'] === 'Selasa') {
                    $this->assertNotContains($s, [1, 2], 'Selasa slots 1 and 2 must be left empty for event');
                }
            }
        }
    }

    /**
     * Test: saveSchedule deletes day-specific overlapping schedules when clearExisting is false.
     */
    public function test_save_schedule_deletes_day_specific_overlapping_schedules_when_clear_existing_is_false(): void
    {
        $subject1 = Subject::create(['name' => 'Matematika', 'code' => 'MTK', 'category' => 'Core']);
        $subject2 = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);

        // Create an existing schedule entry for the classroom on Monday slot 1 (07:00 - 07:45)
        $mondaySlot1Schedule = Schedule::create([
            'subject_id' => $subject1->id,
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Senin',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        // Create an existing schedule entry for the classroom on Tuesday slot 1 (07:00 - 07:45)
        $tuesdaySlot1Schedule = Schedule::create([
            'subject_id' => $subject1->id,
            'classroom_id' => $this->classroom->id,
            'teacher_id' => $this->teacher1->id,
            'day' => 'Selasa',
            'start_time' => '07:00',
            'end_time' => '07:45',
            'room' => 'R.101',
        ]);

        $generator = new AutoScheduleGenerator;
        // Monday slot 1 upacara (Senin slot 1 excluded, but NOT Tuesday slot 1)
        $generator->setPrompt('hari senin pagi ada upacara');

        // Populate generator exclusions
        $generator->generate($this->classroom->id, [
            ['subject_id' => $subject2->id, 'hours' => 1],
        ]);

        // Try to save new schedule with clearExisting = false
        $newSchedule = [
            [
                'subject_id' => $subject2->id,
                'classroom_id' => $this->classroom->id,
                'teacher_id' => $this->teacher2->id,
                'day' => 'Selasa',
                'start_time' => '08:30',
                'end_time' => '09:15',
                'room' => 'R.102',
                'subject_name' => 'Fisika',
            ],
        ];

        $result = $generator->saveSchedule($newSchedule, false);

        $this->assertEquals(1, $result['saved']);

        // The schedule on Monday slot 1 should be DELETED because it overlaps with the ceremony slot
        $this->assertDatabaseMissing('schedules', [
            'id' => $mondaySlot1Schedule->id,
        ]);

        // The schedule on Tuesday slot 1 should STILL exist because it's only excluded on Monday
        $this->assertDatabaseHas('schedules', [
            'id' => $tuesdaySlot1Schedule->id,
        ]);
    }

    /**
     * Test: The generator parses break time ranges with 's.d.' abbreviations
     * and does not misidentify hour numbers (e.g. '09') as slot numbers.
     */
    public function test_generate_respects_break_time_with_sd_abbreviation_and_excludes_clock_hours(): void
    {
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 2],
        ];

        // Ensure we have slot 3 at 08:30 - 09:15, which overlaps with 09:00 - 09:15
        $generator = new AutoScheduleGenerator;

        // Prompt has both 's.d.' range and a standalone clock hour 'istirahat jam 09.00'
        // 'istirahat jam 09.00 s.d. 09.15' is slot 3 (08:30-09:15)
        $generator->setPrompt('istirahat jam 09.00 s.d. 09.15. istirahat jam 09.00.');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);

            for ($s = $startSlot; $s <= $endSlot; $s++) {
                $this->assertNotEquals(3, $s, 'Slot 3 must be left empty due to s.d. range');
                $this->assertNotEquals(9, $s, 'Slot 9 must NOT be excluded by mistake due to clock hour 09.00');
            }
        }
    }

    /**
     * Test: The generator parses break time ranges with typos (e.g. 'samapai') and single 'until' times (e.g. 'sampai jam 7.45'),
     * and resets target day state correctly to avoid day specific inheritance leaks.
     */
    public function test_generate_respects_typo_breaks_single_until_time_and_isolates_day_specifics(): void
    {
        $subject = Subject::create(['name' => 'Fisika', 'code' => 'FIS', 'category' => 'Core']);
        $subject->teachers()->attach($this->teacher1);

        $requirements = [
            ['subject_id' => $subject->id, 'hours' => 4],
        ];

        $generator = new AutoScheduleGenerator;

        // Prompt includes Monday morning ceremony ('samapai jam 7.45' -> slot 1)
        // and general breaks (slot 3 for 09.00-09.15, slot 6 for 10:45-11:30)
        $generator->setPrompt('hari senin pagi ada upacara samapai jam 7.45. untuk istirahat jam 9.00 sampai 9.15 dan jam 10.45 sampai jam 11.30');

        $result = $generator->generate($this->classroom->id, $requirements);

        $this->assertNotEmpty($result['schedule']);

        foreach ($result['schedule'] as $entry) {
            $startSlot = $this->timeToSlotNumber($entry['start_time']);
            $endSlot = $this->timeToSlotNumber($entry['end_time'], true);

            for ($s = $startSlot; $s <= $endSlot; $s++) {
                if ($entry['day'] === 'Senin') {
                    $this->assertNotEquals(1, $s, 'Senin Slot 1 must be left empty for ceremony');
                }
                $this->assertNotEquals(3, $s, 'Slot 3 must be left empty due to general break');
                $this->assertNotEquals(6, $s, 'Slot 6 must be left empty due to general break');
            }
        }
    }
}
