<?php

namespace App\Services;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TimeSlot;
use Illuminate\Support\Collection;

/**
 * Automatic schedule generator using backtracking constraint-satisfaction algorithm.
 *
 * Generates conflict-free class schedules by considering:
 * - Teacher availability (no overlapping classes)
 * - Classroom/room availability (no double-booking)
 * - Teacher workload distribution across days
 * - Subject priority (core subjects prefer morning slots)
 */
class AutoScheduleGenerator
{
    /** @var array<string> */
    private array $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    /** @var array<int, int> Cached time-to-slot mapping */
    private array $timeSlotCache = [];

    /** @var array<string, int> Subject priority (higher = preferred earlier in day) */
    private array $subjectPriority = [
        'Matematika' => 10,
        'Bahasa Indonesia' => 9,
        'Bahasa Inggris' => 8,
        'IPA' => 7,
        'IPS' => 6,
        'Fisika' => 7,
        'Kimia' => 7,
        'Biologi' => 7,
    ];

    /** @var string|null User prompt for additional scheduling instructions */
    private ?string $prompt = null;

    /** @var int Backtracking iteration counter */
    private int $backtrackCount = 0;

    /** @var int Maximum backtracking iterations allowed per attempt */
    private int $maxBacktrackIterations = 1000;

    /** @var string Default room for the target classroom */
    private string $defaultClassroomRoom = 'R.101';

    /** @var bool Whether the classroom is a mobile/moving class */
    private bool $isMobile = false;

    /** @var array<string> List of all potential rooms */
    private array $allPotentialRooms = [];

    /** @var array<int> Excluded slot numbers (e.g. for breaks) */
    private array $excludedSlots = [];

    /** @var array<string, array<int>> Excluded slot numbers for specific days */
    private array $daySpecificExcludedSlots = [];

    /**
     * Set user prompt for additional scheduling instructions.
     */
    public function setPrompt(?string $prompt): void
    {
        $this->prompt = $prompt ? trim($prompt) : null;
    }

    /**
     * Generate a complete schedule for a classroom using backtracking.
     *
     * @param  array<int, array{subject_id: int, hours: int}>  $requirements  Subject requirements per week
     * @param  int  $maxTeacherHoursPerDay  Maximum teaching hours per teacher per day
     * @return array{schedule: array, conflicts: array<string>, stats: array, warnings: array<string>}
     */
    public function generate(
        int $classroomId,
        array $requirements,
        int $maxTeacherHoursPerDay = 6
    ): array {
        $classroom = Classroom::findOrFail($classroomId);
        $this->isMobile = (bool) ($classroom->is_mobile ?? false);
        $timeSlots = TimeSlot::where('is_active', true)->orderBy('slot_number')->get();

        if ($timeSlots->isEmpty()) {
            return [
                'schedule' => [],
                'conflicts' => ['Tidak ada slot waktu aktif. Silakan atur jam pelajaran terlebih dahulu.'],
                'stats' => [],
                'warnings' => [],
            ];
        }

        // --- Parse prompt overrides ---
        $this->daySpecificExcludedSlots = [];
        $this->excludedSlots = $this->getExcludedSlots($timeSlots);
        if ($this->prompt) {
            if (preg_match('/(?:maksimal|maks|max|maximum)\s+(\d+)\s+jam/i', $this->prompt, $matches)) {
                $maxTeacherHoursPerDay = (int) $matches[1];
            }
        }

        // --- Validate total hours vs total available slots ---
        $activeDays = $this->getActiveDays();
        $totalAvailableSlots = count($activeDays) * $timeSlots->count();
        $lessons = $this->expandRequirements($requirements);

        $totalNeeded = 0;
        foreach ($lessons as $lesson) {
            $totalNeeded += $lesson['duration'];
        }

        $warnings = [];
        if ($totalNeeded > $totalAvailableSlots) {
            $diff = $totalNeeded - $totalAvailableSlots;
            $warnings[] = "Total jam mata pelajaran ({$totalNeeded} JP) melebihi total slot tersedia ({$totalAvailableSlots} JP). Ada {$diff} slot yang tidak cukup. Kurangi jam beberapa mapel atau tambah hari/J pelajaran.";
        } elseif ($totalNeeded < $totalAvailableSlots) {
            $diff = $totalAvailableSlots - $totalNeeded;
            $warnings[] = "Total jam mata pelajaran ({$totalNeeded} JP) kurang dari total slot tersedia ({$totalAvailableSlots} JP). Ada {$diff} slot kosong.";
        }

        $subjectIds = array_column($requirements, 'subject_id');
        $relevantTeacherIds = \DB::table('subject_user')
            ->whereIn('subject_id', $subjectIds)
            ->pluck('user_id')
            ->unique()
            ->all();

        $existingClassroomTeacherIds = Schedule::where('classroom_id', $classroomId)
            ->pluck('teacher_id')
            ->unique()
            ->all();

        $allRelevantTeacherIds = array_unique(array_merge($relevantTeacherIds, $existingClassroomTeacherIds));

        $activeRooms = \App\Models\Room::where('is_active', true)->get();

        if ($activeRooms->isEmpty()) {
            $potentialRooms = ['R.101'];
            $promptOverrides = $this->getPromptRoomOverrides();
            foreach ($promptOverrides as $override) {
                $potentialRooms[] = $override['room'];
            }

            $labMap = [
                'fisika' => 'Lab Fisika',
                'kimia' => 'Lab Kimia',
                'biologi' => 'Lab Biologi',
                'komputer' => 'Lab Komputer',
                'olahraga' => 'Lapangan',
                'sbk' => 'Lab Seni',
                'prakarya' => 'Lab Prakarya',
            ];

            $subjects = Subject::whereIn('id', $subjectIds)->get();
            foreach ($subjects as $subject) {
                $lowerSubject = strtolower($subject->name);
                foreach ($labMap as $keyword => $lab) {
                    if (str_contains($lowerSubject, $keyword)) {
                        $potentialRooms[] = $lab;
                    }
                }
            }

            $existingClassroomRooms = Schedule::where('classroom_id', $classroomId)
                ->whereNotNull('room')
                ->where('room', '!=', '')
                ->pluck('room')
                ->unique()
                ->all();

            $this->allPotentialRooms = array_unique(array_merge($potentialRooms, $existingClassroomRooms));

            $classroomRoomsMap = [
                'X IPA 1' => 'R.101', 'X IPA 2' => 'R.102',
                'X IPS 1' => 'R.103', 'X IPS 2' => 'R.104',
                'XI IPA 1' => 'R.201', 'XI IPA 2' => 'R.202',
                'XI IPS 1' => 'R.203',
                'XII IPA 1' => 'R.301', 'XII IPA 2' => 'R.302',
                'XII IPS 1' => 'R.303',
            ];
            $this->defaultClassroomRoom = $classroomRoomsMap[$classroom->name] ?? 'R.101';
            $nonLabClassroomRooms = array_values(array_filter($existingClassroomRooms, function ($r) {
                return ! in_array($r, ['Lab Fisika', 'Lab Kimia', 'Lab Biologi', 'Lab Komputer', 'Lapangan', 'Lab Seni', 'Lab Prakarya']);
            }));
            if (! empty($nonLabClassroomRooms)) {
                $this->defaultClassroomRoom = $nonLabClassroomRooms[0];
            }
        } else {
            $potentialRooms = [];
            $allActiveRoomNames = $activeRooms->pluck('name')->all();

            $foundDefaultRoom = null;

            $classroomRoomsMap = [
                'X IPA 1' => 'R101', 'X IPA 2' => 'R102',
                'X IPS 1' => 'R103', 'X IPS 2' => 'R104',
                'XI IPA 1' => 'R201', 'XI IPA 2' => 'R202',
                'XI IPS 1' => 'R203',
                'XII IPA 1' => 'R301', 'XII IPA 2' => 'R302',
                'XII IPS 1' => 'R303',
            ];

            $targetCode = $classroomRoomsMap[$classroom->name] ?? null;
            if ($targetCode) {
                foreach ($activeRooms as $room) {
                    if (strcasecmp($room->code, $targetCode) === 0 || str_contains(str_replace('.', '', strtolower($room->code)), strtolower($targetCode))) {
                        $foundDefaultRoom = $room->name;
                        break;
                    }
                }
            }

            if (! $foundDefaultRoom) {
                foreach ($activeRooms as $room) {
                    if (str_contains(strtolower($room->name), strtolower($classroom->name))) {
                        $foundDefaultRoom = $room->name;
                        break;
                    }
                }
            }

            if (! $foundDefaultRoom) {
                $firstClassRoom = $activeRooms->firstWhere('type', 'Ruang Kelas');
                $foundDefaultRoom = $firstClassRoom ? $firstClassRoom->name : $activeRooms->first()->name;
            }

            $this->defaultClassroomRoom = $foundDefaultRoom;

            $promptOverrides = $this->getPromptRoomOverrides();
            foreach ($promptOverrides as $override) {
                foreach ($activeRooms as $room) {
                    if (str_contains(strtolower($room->name), strtolower($override['room'])) || str_contains(strtolower($room->code), strtolower($override['room']))) {
                        $potentialRooms[] = $room->name;
                    }
                }
            }

            $labKeywords = ['fisika', 'kimia', 'biologi', 'komputer', 'olahraga', 'seni', 'prakarya', 'bahasa'];
            $subjects = Subject::whereIn('id', $subjectIds)->get();
            foreach ($subjects as $subject) {
                $lowerSubject = strtolower($subject->name);
                foreach ($labKeywords as $keyword) {
                    if (str_contains($lowerSubject, $keyword)) {
                        foreach ($activeRooms as $room) {
                            $roomNameLower = strtolower($room->name);
                            $roomCodeLower = strtolower($room->code);
                            $roomTypeLower = strtolower($room->type);

                            if (str_contains($roomNameLower, $keyword) ||
                                str_contains($roomCodeLower, $keyword) ||
                                str_contains($roomTypeLower, $keyword)) {
                                $potentialRooms[] = $room->name;
                            }
                        }
                    }
                }
            }

            $existingClassroomRooms = Schedule::where('classroom_id', $classroomId)
                ->whereNotNull('room')
                ->where('room', '!=', '')
                ->pluck('room')
                ->unique()
                ->all();

            $this->allPotentialRooms = array_unique(array_merge(
                [$this->defaultClassroomRoom],
                $potentialRooms,
                $existingClassroomRooms,
                $allActiveRoomNames
            ));
        }

        $existingSchedules = Schedule::with(['teacher', 'classroom'])
            ->where('classroom_id', $classroomId)
            ->orWhereIn('teacher_id', $allRelevantTeacherIds)
            ->orWhereIn('room', $this->allPotentialRooms)
            ->get();

        // Build constraint maps
        $teacherWorkload = $this->buildTeacherWorkload($existingSchedules);
        $classroomOccupancy = $this->buildClassroomOccupancy($existingSchedules, $classroomId);
        $roomOccupancy = $this->buildRoomOccupancy($existingSchedules);

        // Run backtracking solver with multiple attempts
        $bestResult = $this->runBacktracking(
            $lessons,
            $timeSlots,
            $classroomId,
            $classroom,
            $existingSchedules,
            $teacherWorkload,
            $classroomOccupancy,
            $roomOccupancy,
            $maxTeacherHoursPerDay
        );

        $unfulfilled = $bestResult['unfulfilled'];
        if (! empty($unfulfilled)) {
            $names = array_unique(array_column($unfulfilled, 'name'));
            $warnings[] = 'Tidak bisa menjadwalkan: '.implode(', ', $names).' (guru atau slot tidak tersedia).';
        }

        $scheduledHours = 0;
        foreach ($bestResult['schedule'] as $entry) {
            $start = $this->timeToSlot($entry['start_time'], false);
            $end = $this->timeToSlot($entry['end_time'], true);
            $scheduledHours += max(1, $end - $start + 1);
        }

        $stats = [
            'total_lessons' => $totalNeeded,
            'scheduled' => $scheduledHours,
            'conflicts' => count($bestResult['conflicts']),
            'fill_rate' => $totalNeeded > 0
                ? round(($scheduledHours / $totalNeeded) * 100, 1)
                : 0,
        ];

        return [
            'schedule' => $this->mergeConsecutiveSlots($bestResult['schedule']),
            'conflicts' => $bestResult['conflicts'],
            'stats' => $stats,
            'warnings' => $warnings,
            'unfulfilled' => $unfulfilled,
        ];
    }

    /**
     * Merge consecutive slots of the same subject for the same teacher, room and day.
     */
    public function mergeConsecutiveSlots(array $scheduleData): array
    {
        if (empty($scheduleData)) {
            return [];
        }

        $dayWeights = array_flip($this->days);

        usort($scheduleData, function ($a, $b) use ($dayWeights) {
            if ($a['classroom_id'] != $b['classroom_id']) {
                return $a['classroom_id'] <=> $b['classroom_id'];
            }
            $dayA = $dayWeights[$a['day']] ?? 99;
            $dayB = $dayWeights[$b['day']] ?? 99;
            if ($dayA != $dayB) {
                return $dayA <=> $dayB;
            }

            return strcmp($a['start_time'], $b['start_time']);
        });

        $merged = [];
        foreach ($scheduleData as $entry) {
            if (empty($merged)) {
                $merged[] = $entry;

                continue;
            }

            $lastIndex = count($merged) - 1;
            $last = &$merged[$lastIndex];

            if ($last['classroom_id'] == $entry['classroom_id'] &&
                $last['day'] === $entry['day'] &&
                $last['subject_id'] == $entry['subject_id'] &&
                $last['teacher_id'] == $entry['teacher_id'] &&
                $last['room'] === $entry['room'] &&
                $last['end_time'] === $entry['start_time']) {

                $last['end_time'] = $entry['end_time'];
            } else {
                $merged[] = $entry;
            }
        }

        return $merged;
    }

    /**
     * Save generated schedule to database.
     *
     * @param  bool  $clearExisting  Whether to clear existing schedules for the classroom first
     * @return array{saved: int, errors: array}
     */
    public function saveSchedule(array $scheduleData, bool $clearExisting = false): array
    {
        $saved = 0;
        $errors = [];

        if ($clearExisting) {
            $classroomIds = array_unique(array_column($scheduleData, 'classroom_id'));
            foreach ($classroomIds as $classroomId) {
                Schedule::where('classroom_id', $classroomId)->delete();
            }
        }

        if (! $clearExisting && (! empty($this->excludedSlots) || ! empty($this->daySpecificExcludedSlots))) {
            $classroomIds = array_unique(array_column($scheduleData, 'classroom_id'));
            if (! empty($classroomIds)) {
                // 1. General excluded slots cleanup (applies to all days)
                if (! empty($this->excludedSlots)) {
                    $excludedTimeSlots = TimeSlot::where('is_active', true)
                        ->whereIn('slot_number', $this->excludedSlots)
                        ->get();

                    foreach ($classroomIds as $classroomId) {
                        foreach ($excludedTimeSlots as $slot) {
                            $slotStart = $this->normalizeTime((string) $slot->start_time);
                            $slotEnd = $this->normalizeTime((string) $slot->end_time);

                            Schedule::where('classroom_id', $classroomId)
                                ->get()
                                ->filter(function ($existing) use ($slotStart, $slotEnd) {
                                    $existingStart = $this->normalizeTime((string) $existing->start_time);
                                    $existingEnd = $this->normalizeTime((string) $existing->end_time);

                                    return $existingStart < $slotEnd && $slotStart < $existingEnd;
                                })
                                ->each(function ($existing) {
                                    $existing->delete();
                                });
                        }
                    }
                }

                // 2. Day-specific excluded slots cleanup
                foreach ($this->daySpecificExcludedSlots as $day => $sList) {
                    if (empty($sList)) {
                        continue;
                    }
                    $excludedTimeSlots = TimeSlot::where('is_active', true)
                        ->whereIn('slot_number', $sList)
                        ->get();

                    foreach ($classroomIds as $classroomId) {
                        foreach ($excludedTimeSlots as $slot) {
                            $slotStart = $this->normalizeTime((string) $slot->start_time);
                            $slotEnd = $this->normalizeTime((string) $slot->end_time);

                            Schedule::where('classroom_id', $classroomId)
                                ->where('day', $day)
                                ->get()
                                ->filter(function ($existing) use ($slotStart, $slotEnd) {
                                    $existingStart = $this->normalizeTime((string) $existing->start_time);
                                    $existingEnd = $this->normalizeTime((string) $existing->end_time);

                                    return $existingStart < $slotEnd && $slotStart < $existingEnd;
                                })
                                ->each(function ($existing) {
                                    $existing->delete();
                                });
                        }
                    }
                }
            }
        }

        foreach ($scheduleData as $entry) {
            try {
                $start = $this->normalizeTime($entry['start_time']);
                $end = $this->normalizeTime($entry['end_time']);

                // Check teacher conflict
                $existingForTeacher = Schedule::where('teacher_id', $entry['teacher_id'])
                    ->where('day', $entry['day'])
                    ->get();

                $teacherConflict = $existingForTeacher->contains(function ($existing) use ($start, $end) {
                    $existingStart = $this->normalizeTime((string) $existing->start_time);
                    $existingEnd = $this->normalizeTime((string) $existing->end_time);

                    return $existingStart < $end && $start < $existingEnd;
                });

                if ($teacherConflict) {
                    $errors[] = "{$entry['subject_name']} ({$entry['day']} {$start}): Guru sudah mengajar di kelas lain pada jam ini.";

                    continue;
                }

                Schedule::create([
                    'subject_id' => $entry['subject_id'],
                    'classroom_id' => $entry['classroom_id'],
                    'teacher_id' => $entry['teacher_id'],
                    'day' => $entry['day'],
                    'start_time' => $start,
                    'end_time' => $end,
                    'room' => $entry['room'] ?? '',
                ]);

                $saved++;
            } catch (\Exception $e) {
                $errors[] = "{$entry['subject_name']}: {$e->getMessage()}";
            }
        }

        return ['saved' => $saved, 'errors' => $errors];
    }

    // ---- Backtracking Solver ----

    /**
     * Run backtracking solver with multiple randomized attempts.
     *
     * @return array{schedule: array, conflicts: array, unfulfilled: array}
     */
    private function runBacktracking(
        array $lessons,
        Collection $timeSlots,
        int $classroomId,
        Classroom $classroom,
        Collection $existingSchedules,
        array $teacherWorkload,
        array $classroomOccupancy,
        array $roomOccupancy,
        int $maxTeacherHoursPerDay
    ): array {
        $bestSchedule = [];
        $bestConflicts = [];
        $bestUnfulfilled = $lessons;
        $bestCount = 0;

        /** @var array<int, array{subject_id: int, name: string, teachers: array<int, array{id: int, name: string}>}> Pre-loaded subject data */
        $subjectCache = $this->preloadSubjectData($lessons);

        // Convert existingSchedules to lightweight arrays for faster recursive operations
        $existingSchedulesArray = $existingSchedules->map(fn ($s) => [
            'teacher_id' => $s->teacher_id,
            'classroom_id' => $s->classroom_id,
            'day' => $s->day,
            'start_time' => (string) $s->start_time,
            'end_time' => (string) $s->end_time,
        ])->values()->all();

        // Pre-compute time slot arrays for faster lookups
        $timeSlotsArray = $timeSlots->values()->all();

        // Try multiple orderings: original + several random shuffles
        $totalAvailableSlots = count($this->getActiveDays()) * count($timeSlotsArray);
        $totalNeeded = 0;
        foreach ($lessons as $lesson) {
            $totalNeeded += $lesson['duration'];
        }
        $attempts = [shuffle($lessons) ? $lessons : $lessons];
        $maxAttempts = ($totalNeeded > $totalAvailableSlots) ? 1 : min(12, $totalNeeded + 1);
        for ($i = 1; $i < $maxAttempts; $i++) {
            $shuffled = $lessons;
            shuffle($shuffled);
            $attempts[] = $shuffled;
        }

        foreach ($attempts as $attemptIndex => $orderedLessons) {
            $this->backtrackCount = 0;
            $tw = $this->deepCopyWorkload($teacherWorkload);
            $co = $this->deepCopyOccupancy($classroomOccupancy);
            $ro = $roomOccupancy;
            $es = $existingSchedulesArray;

            $queue = $orderedLessons;
            $schedule = [];
            $conflicts = [];

            $result = $this->solveBacktrack(
                $queue,
                $schedule,
                $conflicts,
                $timeSlotsArray,
                $classroomId,
                $classroom,
                $es,
                $tw,
                $co,
                $ro,
                $maxTeacherHoursPerDay,
                0,
                $attemptIndex,
                $subjectCache
            );

            if (count($result['schedule']) > $bestCount) {
                $bestSchedule = $result['schedule'];
                $bestConflicts = $result['conflicts'];
                $bestUnfulfilled = $result['queue'];
                $bestCount = count($result['schedule']);
            }

            // Perfect solution found
            if (empty($result['queue'])) {
                break;
            }
        }

        return [
            'schedule' => $bestSchedule,
            'conflicts' => $bestConflicts,
            'unfulfilled' => $bestUnfulfilled,
        ];
    }

    /**
     * Pre-load all subject data with teachers to avoid DB queries during recursion.
     *
     * @param  array<int, array{subject_id: int, name: string}>  $lessons
     * @return array<int, array{id: int, name: string, teachers: array<int, array{id: int, name: string}>}>
     */
    private function preloadSubjectData(array $lessons): array
    {
        $subjectIds = array_unique(array_column($lessons, 'subject_id'));
        $subjects = Subject::with('teachers')->whereIn('id', $subjectIds)->get();

        $cache = [];
        foreach ($subjects as $subject) {
            $cache[$subject->id] = [
                'id' => $subject->id,
                'name' => $subject->name,
                'teachers' => $subject->teachers->map(fn ($t) => ['id' => $t->id, 'name' => $t->name])->all(),
            ];
        }

        return $cache;
    }

    /**
     * Recursive backtracking solver.
     *
     * @param  array  $queue  Remaining lessons to place
     * @param  array  $schedule  Already placed schedule entries
     * @param  array  $conflicts  Conflict messages
     * @param  array  $timeSlots  Pre-computed time slot arrays
     * @param  array  $existingSchedules  Pre-computed existing schedule arrays
     * @param  array<int, array{id: int, name: string, teachers: array<int, array{id: int, name: string}>>}  $subjectCache
     * @return array{schedule: array, conflicts: array, queue: array}
     */
    private function solveBacktrack(
        array $queue,
        array $schedule,
        array $conflicts,
        array $timeSlots,
        int $classroomId,
        Classroom $classroom,
        array $existingSchedules,
        array &$teacherWorkload,
        array &$classroomOccupancy,
        array &$roomOccupancy,
        int $maxTeacherHoursPerDay,
        int $depth,
        int $attemptIndex,
        array $subjectCache
    ): array {
        $this->backtrackCount++;
        if ($this->backtrackCount > $this->maxBacktrackIterations) {
            return [
                'schedule' => $schedule,
                'conflicts' => $conflicts,
                'queue' => $queue,
            ];
        }

        // Base case: all lessons placed
        if (empty($queue)) {
            return [
                'schedule' => $schedule,
                'conflicts' => $conflicts,
                'queue' => [],
            ];
        }

        // MRV heuristic: pick the lesson with the fewest valid placements (most constrained first)
        $bestLessonIndex = $this->pickMostConstrainedLesson(
            $queue,
            $timeSlots,
            $classroomOccupancy,
            $existingSchedules,
            $teacherWorkload,
            $maxTeacherHoursPerDay,
            $subjectCache
        );

        $lesson = $queue[$bestLessonIndex];

        // Find valid placement for this lesson
        $candidates = $this->findPlacementCandidates(
            $lesson,
            $timeSlots,
            $classroomId,
            $classroom,
            $existingSchedules,
            $teacherWorkload,
            $classroomOccupancy,
            $roomOccupancy,
            $maxTeacherHoursPerDay,
            $subjectCache
        );

        if (! empty($candidates)) {
            // Try each candidate, starting with the best scored one
            foreach ($candidates as $candidate) {
                // Place lesson
                $schedule[] = $candidate['scheduleEntry'];
                $teacherWorkload = $candidate['teacherWorkload'];
                $classroomOccupancy = $candidate['classroomOccupancy'];
                $roomOccupancy = $candidate['roomOccupancy'];
                $existingSchedules = $candidate['existingSchedules'];

                // Remove from queue
                $newQueue = $queue;
                unset($newQueue[$bestLessonIndex]);
                $newQueue = array_values($newQueue);

                // Recurse
                $result = $this->solveBacktrack(
                    $newQueue,
                    $schedule,
                    $conflicts,
                    $timeSlots,
                    $classroomId,
                    $classroom,
                    $existingSchedules,
                    $teacherWorkload,
                    $classroomOccupancy,
                    $roomOccupancy,
                    $maxTeacherHoursPerDay,
                    $depth + 1,
                    $attemptIndex,
                    $subjectCache
                );

                if (empty($result['queue'])) {
                    return $result;
                }

                // Undo placement (backtrack) if not fully solved
                array_pop($schedule);
                // Restore state from snapshot
                $teacherWorkload = $candidate['prevTeacherWorkload'];
                $classroomOccupancy = $candidate['prevClassroomOccupancy'];
                $roomOccupancy = $candidate['prevRoomOccupancy'];
                $existingSchedules = $candidate['prevExistingSchedules'];
            }
        }

        // Could not place this lesson at all — add conflict and continue without it
        $conflicts[] = "Tidak bisa menjadwalkan: {$lesson['name']} (semua slot dan guru sudah penuh)";

        return [
            'schedule' => $schedule,
            'conflicts' => $conflicts,
            'queue' => $queue,
        ];
    }

    /**
     * Pick the lesson with the fewest valid placements (MRV heuristic).
     *
     * @param  array  $timeSlots  Pre-computed time slot arrays
     * @param  array  $existingSchedules  Lightweight arrays (not Eloquent models)
     * @param  array<int, array{id: int, name: string, teachers: array<int, array{id: int, name: string}>>}  $subjectCache
     */
    private function pickMostConstrainedLesson(
        array $queue,
        array $timeSlots,
        array $classroomOccupancy,
        array $existingSchedules,
        array $teacherWorkload,
        int $maxTeacherHoursPerDay,
        array $subjectCache
    ): int {
        $minCandidates = PHP_INT_MAX;
        $bestIndex = 0;

        foreach ($queue as $index => $lesson) {
            $subjectData = $subjectCache[$lesson['subject_id']] ?? null;
            if (! $subjectData || empty($subjectData['teachers'])) {
                return $index; // Impossible to place — pick first to fail fast
            }

            $candidateCount = 0;
            $duration = $lesson['duration'] ?? 1;

            foreach ($subjectData['teachers'] as $teacher) {
                foreach ($this->days as $day) {
                    $dayWorkload = $teacherWorkload[$teacher['id']][$day] ?? 0;
                    if ($dayWorkload + $duration > $maxTeacherHoursPerDay) {
                        continue;
                    }
                    $available = $this->countAvailableBlocksForDay(
                        $day,
                        $duration,
                        $timeSlots,
                        $classroomOccupancy,
                        $existingSchedules,
                        $teacher['id']
                    );
                    $candidateCount += $available;
                    if ($candidateCount >= $minCandidates) {
                        break 2;
                    }
                }
            }

            if ($candidateCount < $minCandidates) {
                $minCandidates = $candidateCount;
                $bestIndex = $index;
            }

            if ($minCandidates === 0) {
                break;
            }
        }

        return $bestIndex;
    }

    /**
     * Count available block starting positions for a teacher on a given day (lightweight version for MRV).
     */
    private function countAvailableBlocksForDay(
        string $day,
        int $duration,
        array $timeSlots,
        array $classroomOccupancy,
        array $existingSchedules,
        int $teacherId
    ): int {
        $usedSlots = $classroomOccupancy[$day] ?? [];
        $count = 0;
        $numSlots = count($timeSlots);

        for ($idx = 0; $idx <= $numSlots - $duration; $idx++) {
            // Check if the block slots are contiguous
            $isValid = true;
            for ($j = 0; $j < $duration; $j++) {
                $slot = $timeSlots[$idx + $j];
                if ($j > 0 && $slot->slot_number !== $timeSlots[$idx + $j - 1]->slot_number + 1) {
                    $isValid = false;
                    break;
                }
                if (in_array($slot->slot_number, $usedSlots)) {
                    $isValid = false;
                    break;
                }
                if (in_array($slot->slot_number, $this->excludedSlots) ||
                    (isset($this->daySpecificExcludedSlots[$day]) && in_array($slot->slot_number, $this->daySpecificExcludedSlots[$day]))) {
                    $isValid = false;
                    break;
                }
            }
            if (! $isValid) {
                continue;
            }

            $blockStart = $this->normalizeTime((string) $timeSlots[$idx]->start_time);
            $blockEnd = $this->normalizeTime((string) $timeSlots[$idx + $duration - 1]->end_time);

            $teacherBusy = false;
            foreach ($existingSchedules as $s) {
                if ((int) $s['teacher_id'] !== $teacherId || $s['day'] !== $day) {
                    continue;
                }
                $sStart = $this->normalizeTime($s['start_time']);
                $sEnd = $this->normalizeTime($s['end_time']);
                if ($sStart < $blockEnd && $blockStart < $sEnd) {
                    $teacherBusy = true;
                    break;
                }
            }

            if (! $teacherBusy) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * Find all valid placement candidates for a lesson, sorted by quality score.
     */
    private function findPlacementCandidates(
        array $lesson,
        array $timeSlots,
        int $classroomId,
        Classroom $classroom,
        array $existingSchedules,
        array $teacherWorkload,
        array $classroomOccupancy,
        array $roomOccupancy,
        int $maxTeacherHoursPerDay,
        array $subjectCache
    ): array {
        $subjectData = $subjectCache[$lesson['subject_id']] ?? null;
        if (! $subjectData || empty($subjectData['teachers'])) {
            return [];
        }

        $duration = $lesson['duration'] ?? 1;
        $candidates = [];
        $dayOrder = $this->getDayOrder();
        $numSlots = count($timeSlots);

        foreach ($subjectData['teachers'] as $teacher) {
            foreach ($dayOrder as $day) {
                $currentDayWorkload = $teacherWorkload[$teacher['id']][$day] ?? 0;
                if ($currentDayWorkload + $duration > $maxTeacherHoursPerDay) {
                    continue;
                }

                // Find contiguous start indices
                for ($idx = 0; $idx <= $numSlots - $duration; $idx++) {
                    $usedSlots = $classroomOccupancy[$day] ?? [];

                    // Check classroom occupancy and contiguity
                    $isValid = true;
                    $blockSlots = [];
                    for ($j = 0; $j < $duration; $j++) {
                        $slot = $timeSlots[$idx + $j];
                        if ($j > 0 && $slot->slot_number !== $timeSlots[$idx + $j - 1]->slot_number + 1) {
                            $isValid = false;
                            break;
                        }
                        if (in_array($slot->slot_number, $usedSlots)) {
                            $isValid = false;
                            break;
                        }
                        if (in_array($slot->slot_number, $this->excludedSlots) ||
                            (isset($this->daySpecificExcludedSlots[$day]) && in_array($slot->slot_number, $this->daySpecificExcludedSlots[$day]))) {
                            $isValid = false;
                            break;
                        }
                        $blockSlots[] = $slot->slot_number;
                    }
                    if (! $isValid) {
                        continue;
                    }

                    $start_time = $this->normalizeTime((string) $timeSlots[$idx]->start_time);
                    $end_time = $this->normalizeTime((string) $timeSlots[$idx + $duration - 1]->end_time);

                    // Check teacher busy
                    $teacherBusy = false;
                    foreach ($existingSchedules as $s) {
                        if ((int) $s['teacher_id'] !== $teacher['id'] || $s['day'] !== $day) {
                            continue;
                        }
                        $sStart = $this->normalizeTime($s['start_time']);
                        $sEnd = $this->normalizeTime($s['end_time']);
                        if ($sStart < $end_time && $start_time < $sEnd) {
                            $teacherBusy = true;
                            break;
                        }
                    }

                    if ($teacherBusy) {
                        continue;
                    }

                    // Find and suggest room that is free for the entire block duration
                    $room = $this->suggestRoomForBlock($lesson['name'], $day, $blockSlots, $roomOccupancy);

                    $scheduleEntry = [
                        'subject_id' => $lesson['subject_id'],
                        'classroom_id' => $classroomId,
                        'teacher_id' => $teacher['id'],
                        'day' => $day,
                        'start_time' => $start_time,
                        'end_time' => $end_time,
                        'room' => $room,
                        'subject_name' => $lesson['name'],
                        'teacher_name' => $teacher['name'],
                        'classroom_name' => $classroom->name,
                    ];

                    // Score: strongly prefer earlier slots & spread across days
                    // Slot preference (weight up to ~100): earlier = much higher score
                    $startSlot = $timeSlots[$idx]->slot_number;
                    $slotScore = max(0, 100 - ($startSlot * 7));
                    // Day balance (weight up to ~50): prefer days with fewer lessons
                    $dayLessonCount = count(array_unique($classroomOccupancy[$day] ?? []));
                    $dayBalance = max(0, 50 - ($dayLessonCount * 10));
                    // Subject priority (weight up to 10)
                    $priority = $this->getSubjectPriority($lesson['name']);
                    // Teacher workload balance (weight up to 10)
                    $workloadBalance = $maxTeacherHoursPerDay - $currentDayWorkload;
                    $score = $slotScore + $dayBalance + $priority + $workloadBalance;

                    // AI Prompt custom preferences scoring:
                    // 1. Day preference
                    $prefDay = $this->getSubjectPreferredDay($lesson['name']);
                    if ($prefDay && $prefDay === $day) {
                        $score += 200; // Large bonus for preferred day
                    }
                    // 2. Time preference (either general pagi/siang, or specific time limit)
                    $timeLimit = $this->getSubjectTimeLimit($lesson['name']);
                    if ($timeLimit) {
                        [$sHour, $sMin] = explode(':', $start_time);
                        $startMinutes = (int) $sHour * 60 + (int) $sMin;

                        $isMet = false;
                        if ($timeLimit['operator'] === '>=') {
                            $isMet = ($startMinutes >= $timeLimit['time']);
                        } elseif ($timeLimit['operator'] === '<=') {
                            $isMet = ($startMinutes <= $timeLimit['time']);
                        }

                        if ($isMet) {
                            $score += 200; // Large bonus if specific hour condition is met
                        }
                    } else {
                        $prefTime = $this->getSubjectTimePreference($lesson['name']);
                        if ($prefTime === 'pagi' && $startSlot <= 3) {
                            $score += 150; // Bonus for morning preference
                        } elseif ($prefTime === 'siang' && $startSlot >= 4) {
                            $score += 150; // Bonus for afternoon preference
                        }
                    }

                    $candidates[] = [
                        'scheduleEntry' => $scheduleEntry,
                        'score' => $score,
                        'teacherId' => $teacher['id'],
                        'day' => $day,
                        'blockSlots' => $blockSlots,
                        'start_time' => $start_time,
                        'end_time' => $end_time,
                        'room' => $room,
                        'duration' => $duration,
                    ];
                }
            }
        }

        if (empty($candidates)) {
            return [];
        }

        // Sort by score descending (best first)
        usort($candidates, fn ($a, $b) => $b['score'] <=> $a['score']);

        // Prepare state snapshots for each candidate
        $result = [];
        foreach ($candidates as $candidate) {
            $prevTW = $this->deepCopyWorkload($teacherWorkload);
            $prevCO = $this->deepCopyOccupancy($classroomOccupancy);
            $prevRO = $roomOccupancy;
            $prevES = $existingSchedules;

            // Apply placement
            $teacherWorkload[$candidate['teacherId']][$candidate['day']] =
                ($teacherWorkload[$candidate['teacherId']][$candidate['day']] ?? 0) + $candidate['duration'];

            foreach ($candidate['blockSlots'] as $sNum) {
                $classroomOccupancy[$candidate['day']][] = $sNum;
                $roomOccupancy[$candidate['day']][$candidate['room']][] = $sNum;
            }

            $existingSchedules[] = [
                'teacher_id' => $candidate['teacherId'],
                'classroom_id' => $classroomId,
                'day' => $candidate['day'],
                'start_time' => $candidate['start_time'],
                'end_time' => $candidate['end_time'],
            ];

            $candidate['teacherWorkload'] = $teacherWorkload;
            $candidate['classroomOccupancy'] = $classroomOccupancy;
            $candidate['roomOccupancy'] = $roomOccupancy;
            $candidate['existingSchedules'] = $existingSchedules;
            $candidate['prevTeacherWorkload'] = $prevTW;
            $candidate['prevClassroomOccupancy'] = $prevCO;
            $candidate['prevRoomOccupancy'] = $prevRO;
            $candidate['prevExistingSchedules'] = $prevES;

            unset($candidate['score']);

            $result[] = $candidate;

            // Restore state after snapshot
            $teacherWorkload = $prevTW;
            $classroomOccupancy = $prevCO;
            $roomOccupancy = $prevRO;
            $existingSchedules = $prevES;
        }

        return $result;
    }

    /**
     * Suggest room that is free for the entire duration of the block.
     */
    private function suggestRoomForBlock(
        string $subjectName,
        string $day,
        array $blockSlots,
        array $roomOccupancy
    ): string {
        $lower = strtolower($subjectName);

        // 1. Check prompt overrides
        $promptOverrides = $this->getPromptRoomOverrides();
        foreach ($promptOverrides as $override) {
            if (str_contains($lower, $override['keyword'])) {
                foreach ($this->allPotentialRooms as $room) {
                    if (str_contains(strtolower($room), strtolower($override['room']))) {
                        if ($this->isRoomFreeForBlock($room, $day, $blockSlots, $roomOccupancy)) {
                            return $room;
                        }
                    }
                }
            }
        }

        // 2. Check lab map keywords/matching
        $labKeywords = ['fisika', 'kimia', 'biologi', 'komputer', 'olahraga', 'seni', 'prakarya', 'bahasa'];
        foreach ($labKeywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                foreach ($this->allPotentialRooms as $room) {
                    if (str_contains(strtolower($room), $keyword)) {
                        if ($this->isRoomFreeForBlock($room, $day, $blockSlots, $roomOccupancy)) {
                            return $room;
                        }
                    }
                }
            }
        }

        // 3. Fallback to default classroom room
        if (! $this->isMobile) {
            if ($this->isRoomFreeForBlock($this->defaultClassroomRoom, $day, $blockSlots, $roomOccupancy)) {
                return $this->defaultClassroomRoom;
            }
        }

        // 4. Find ANY free room from potential rooms list
        foreach ($this->allPotentialRooms as $room) {
            if ($this->isRoomFreeForBlock($room, $day, $blockSlots, $roomOccupancy)) {
                return $room;
            }
        }

        return $this->defaultClassroomRoom;
    }

    /**
     * Check if a room is free for a given set of slot numbers.
     */
    private function isRoomFreeForBlock(
        string $room,
        string $day,
        array $blockSlots,
        array $roomOccupancy
    ): bool {
        $occupiedSlots = $roomOccupancy[$day][$room] ?? [];
        foreach ($blockSlots as $slotNum) {
            if (in_array($slotNum, $occupiedSlots)) {
                return false;
            }
        }

        return true;
    }

    // ---- Constraint Map Builders ----

    private function buildTeacherWorkload(Collection $schedules): array
    {
        $workload = [];
        foreach ($schedules as $s) {
            $startSlot = $this->timeToSlot($s->start_time, false);
            $endSlot = $this->timeToSlot($s->end_time, true);
            $hours = max(1, $endSlot - $startSlot + 1);
            $workload[$s->teacher_id][$s->day] = ($workload[$s->teacher_id][$s->day] ?? 0) + $hours;
        }

        return $workload;
    }

    private function buildClassroomOccupancy(Collection $schedules, int $classroomId): array
    {
        $occupancy = [];
        foreach ($schedules as $s) {
            if ($s->classroom_id == $classroomId) {
                $startSlot = $this->timeToSlot($s->start_time, false);
                $endSlot = $this->timeToSlot($s->end_time, true);
                for ($i = $startSlot; $i <= $endSlot; $i++) {
                    $occupancy[$s->day][] = $i;
                }
            }
        }

        return $occupancy;
    }

    private function buildRoomOccupancy(Collection $schedules): array
    {
        $occupancy = [];
        foreach ($schedules as $s) {
            if (! empty($s->room)) {
                $startSlot = $this->timeToSlot($s->start_time, false);
                $endSlot = $this->timeToSlot($s->end_time, true);
                for ($i = $startSlot; $i <= $endSlot; $i++) {
                    $occupancy[$s->day][$s->room][] = $i;
                }
            }
        }

        return $occupancy;
    }

    // ---- Helpers ----

    /**
     * Get the preferred day ordering.
     */
    private function getDayOrder(): array
    {
        $dayOrder = $this->days;
        $preferredDays = $this->getPreferredDays();
        if (! empty($preferredDays)) {
            $preferred = array_intersect($this->days, $preferredDays);
            $others = array_diff($this->days, $preferredDays);
            $dayOrder = array_values(array_merge($preferred, $others));
        }

        return $dayOrder;
    }

    /**
     * Get active days (the days this school uses).
     */
    private function getActiveDays(): array
    {
        return $this->days;
    }

    /**
     * Normalize a time value to HH:MM format.
     */
    private function normalizeTime($time): string
    {
        if ($time instanceof \Carbon\CarbonInterface) {
            return $time->format('H:i');
        }
        if ($time instanceof \DateTimeInterface) {
            return $time->format('H:i');
        }
        $str = trim((string) $time);

        if (preg_match('/\d{4}-\d{2}-\d{2}\s+(\d{2}:\d{2})/', $str, $matches)) {
            return $matches[1];
        }

        if (preg_match('/^(\d{2}:\d{2})/', $str, $matches)) {
            return $matches[1];
        }

        return substr($str, 0, 5);
    }

    private function timeToSlot(string $time, bool $isEnd = false): int
    {
        $normalized = $this->normalizeTime($time);
        $cacheKey = $normalized.($isEnd ? '_end' : '_start');
        if (isset($this->timeSlotCache[$cacheKey])) {
            return $this->timeSlotCache[$cacheKey];
        }

        if ($isEnd) {
            $slot = TimeSlot::where('end_time', $normalized)
                ->where('is_active', true)
                ->first();
        } else {
            $slot = TimeSlot::where('start_time', $normalized)
                ->where('is_active', true)
                ->first();
        }

        if (! $slot) {
            if ($isEnd) {
                $slot = TimeSlot::where('start_time', $normalized)
                    ->where('is_active', true)
                    ->first();
                if ($slot) {
                    $this->timeSlotCache[$cacheKey] = max(1, $slot->slot_number - 1);

                    return $this->timeSlotCache[$cacheKey];
                }
            } else {
                $slot = TimeSlot::where('end_time', $normalized)
                    ->where('is_active', true)
                    ->first();
                if ($slot) {
                    $this->timeSlotCache[$cacheKey] = $slot->slot_number + 1;

                    return $this->timeSlotCache[$cacheKey];
                }
            }
        }

        $this->timeSlotCache[$cacheKey] = $slot ? $slot->slot_number : 1;

        return $this->timeSlotCache[$cacheKey];
    }

    /**
     * Expand requirements into lesson blocks.
     * Each requirement of N hours is split into blocks of maximum size 3.
     */
    private function expandRequirements(array $requirements): array
    {
        $subjectIds = array_column($requirements, 'subject_id');
        $subjects = Subject::whereIn('id', $subjectIds)->get()->keyBy('id');

        $lessons = [];
        foreach ($requirements as $req) {
            $subject = $subjects->get($req['subject_id']);
            $subjectName = $subject ? $subject->name : 'Unknown';
            $hours = max(1, (int) $req['hours']);

            $blocks = $this->splitHoursIntoBlocks($hours);
            foreach ($blocks as $duration) {
                $lessons[] = [
                    'subject_id' => $req['subject_id'],
                    'name' => $subjectName,
                    'duration' => $duration,
                ];
            }
        }

        return $lessons;
    }

    /**
     * Split weekly lesson hours into blocks of max 3 JP.
     */
    private function splitHoursIntoBlocks(int $hours): array
    {
        if ($hours <= 3) {
            return [$hours];
        }

        $blocks = [];
        while ($hours > 0) {
            if ($hours === 4) {
                $blocks[] = 2;
                $blocks[] = 2;
                $hours = 0;
            } elseif ($hours >= 3) {
                $blocks[] = 3;
                $hours -= 3;
            } else {
                $blocks[] = $hours;
                $hours = 0;
            }
        }

        return $blocks;
    }

    private function getSubjectPriority(string $subjectName): int
    {
        foreach ($this->subjectPriority as $key => $priority) {
            if (str_contains($subjectName, $key)) {
                return $priority;
            }
        }

        return 5;
    }

    private function isSubjectMentionedInPrompt(string $subjectName): bool
    {
        if (! $this->prompt) {
            return false;
        }

        return str_contains(mb_strtolower($this->prompt), mb_strtolower($subjectName));
    }

    private function getPreferredDays(): array
    {
        if (! $this->prompt) {
            return [];
        }

        $foundDays = [];
        foreach ($this->days as $day) {
            if (str_contains(mb_strtolower($this->prompt), mb_strtolower($day))) {
                $foundDays[] = $day;
            }
        }

        return $foundDays;
    }

    /**
     * Parse specific room overrides from prompt.
     */
    private function getPromptRoomOverrides(): array
    {
        $overrides = [];

        if (! $this->prompt) {
            return $overrides;
        }

        $labPatterns = [
            ['keywords' => ['fisika', 'lab fisika'], 'room' => 'Lab Fisika'],
            ['keywords' => ['kimia', 'lab kimia'], 'room' => 'Lab Kimia'],
            ['keywords' => ['biologi', 'lab biologi'], 'room' => 'Lab Biologi'],
            ['keywords' => ['komputer', 'lab komputer', 'informatika', 'pbw'], 'room' => 'Lab Komputer'],
            ['keywords' => ['olahraga', 'penjas'], 'room' => 'Lapangan'],
            ['keywords' => ['seni', 'sbk', 'prakarya'], 'room' => 'Lab Seni'],
        ];

        $lower = mb_strtolower($this->prompt);

        foreach ($labPatterns as $pattern) {
            foreach ($pattern['keywords'] as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $overrides[] = ['keyword' => $keyword, 'room' => $pattern['room']];

                    break;
                }
            }
        }

        return $overrides;
    }

    /**
     * Parse subject day preference from prompt.
     */
    private function getSubjectPreferredDay(string $subjectName): ?string
    {
        if (! $this->prompt) {
            return null;
        }
        $lowerPrompt = mb_strtolower($this->prompt);
        $lowerSubject = mb_strtolower($subjectName);

        if (str_contains($lowerPrompt, $lowerSubject)) {
            $clauses = preg_split('/(?<!\d)[.,;]|[.,;](?!\d)/', $lowerPrompt);
            foreach ($clauses as $clause) {
                if (str_contains($clause, $lowerSubject)) {
                    foreach ($this->days as $day) {
                        $lowerDay = mb_strtolower($day);
                        if (str_contains($clause, $lowerDay)) {
                            return $day;
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Parse subject time of day preference from prompt (pagi/siang).
     */
    private function getSubjectTimePreference(string $subjectName): ?string
    {
        if (! $this->prompt) {
            return null;
        }
        $lowerPrompt = mb_strtolower($this->prompt);
        $lowerSubject = mb_strtolower($subjectName);

        if (str_contains($lowerPrompt, $lowerSubject)) {
            $clauses = preg_split('/(?<!\d)[.,;]|[.,;](?!\d)/', $lowerPrompt);
            foreach ($clauses as $clause) {
                if (str_contains($clause, $lowerSubject)) {
                    if (str_contains($clause, 'pagi') || str_contains($clause, 'awal') || str_contains($clause, 'morning')) {
                        return 'pagi';
                    }
                    if (str_contains($clause, 'siang') || str_contains($clause, 'sore') || str_contains($clause, 'akhir') || str_contains($clause, 'afternoon')) {
                        return 'siang';
                    }
                }
            }
        }

        return null;
    }

    /**
     * Check if the subject has a custom hour constraint parsed from the prompt.
     * Returns an array with ['operator' => '>='|'<=', 'time' => minutes_from_midnight] or null.
     */
    private function getSubjectTimeLimit(string $subjectName): ?array
    {
        if (! $this->prompt) {
            return null;
        }
        $lowerPrompt = mb_strtolower($this->prompt);
        $lowerSubject = mb_strtolower($subjectName);

        if (str_contains($lowerPrompt, $lowerSubject)) {
            $clauses = preg_split('/(?<!\d)[.,;]|[.,;](?!\d)/', $lowerPrompt);
            foreach ($clauses as $clause) {
                if (str_contains($clause, $lowerSubject)) {
                    // Match either "jam 12" (no minutes) or "12:00"/"12.00"
                    if (preg_match('/(?:jam|pukul)\s*(\d{1,2})(?:[.:](\d{2}))?|(\d{1,2})[.:](\d{2})/i', $clause, $timeMatches)) {
                        if (! empty($timeMatches[1])) {
                            $hour = (int) $timeMatches[1];
                            $min = isset($timeMatches[2]) && $timeMatches[2] !== '' ? (int) $timeMatches[2] : 0;
                        } else {
                            $hour = (int) $timeMatches[3];
                            $min = (int) $timeMatches[4];
                        }
                        $limitMinutes = $hour * 60 + $min;

                        $operator = null;
                        if (str_contains($clause, 'atas') || str_contains($clause, 'setelah') || str_contains($clause, 'mulai') || str_contains($clause, 'selepas') || str_contains($clause, 'lewat')) {
                            $operator = '>=';
                        } elseif (str_contains($clause, 'bawah') || str_contains($clause, 'sebelum') || str_contains($clause, 'maks') || str_contains($clause, 'kurang')) {
                            $operator = '<=';
                        }

                        if ($operator) {
                            return [
                                'operator' => $operator,
                                'time' => $limitMinutes,
                            ];
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Parse excluded slot numbers (either slot numbers or time ranges) from prompt.
     */
    private function getExcludedSlots(Collection $timeSlots): array
    {
        $this->daySpecificExcludedSlots = [];

        if (! $this->prompt) {
            return [];
        }
        $lowerPrompt = mb_strtolower($this->prompt);
        // Normalize common typos, abbreviations and variations of 'sampai'
        $lowerPrompt = preg_replace('/(?<!\w)(samapai|sampa|sapmai|sampay|s\.d\.|s\.d|s\/d|sd)(?!\w)/i', 'sampai', $lowerPrompt);
        $excluded = [];
        $breakPattern = 'istirahat|istiraht|istirhat|istirat|kosong|break|free|empty|upacara|acara|rapat|libur';

        // Split into clauses, preserving times
        $splitRegex = '/(?<!\d)[.,;]|[.,;](?!\d)|\bdan\b|\band\b/';
        $clauses = preg_split($splitRegex, $lowerPrompt);

        $breakKeywords = ['istirahat', 'istiraht', 'istirhat', 'istirat', 'kosong', 'break', 'free', 'empty', 'upacara', 'acara', 'rapat', 'libur'];
        $allSubjectNames = Subject::pluck('name')->map(fn ($n) => mb_strtolower($n))->all();
        $lastClauseWasBreak = false;
        $lastClauseDay = null;

        foreach ($clauses as $clause) {
            $clause = trim($clause);
            if ($clause === '') {
                continue;
            }

            $hasBreakKeyword = false;
            foreach ($breakKeywords as $kw) {
                if (str_contains($clause, $kw)) {
                    $hasBreakKeyword = true;
                    break;
                }
            }

            $mentionsSubject = false;
            foreach ($allSubjectNames as $subName) {
                if (str_contains($clause, $subName)) {
                    $mentionsSubject = true;
                    break;
                }
            }

            // Check if day is mentioned in this clause
            $targetDay = null;
            foreach ($this->days as $day) {
                if (str_contains($clause, mb_strtolower($day))) {
                    $targetDay = $day;
                    break;
                }
            }

            if ($hasBreakKeyword) {
                $lastClauseWasBreak = true;
                $lastClauseDay = $targetDay; // Reset/set to targetDay (could be null!)
            } elseif ($mentionsSubject) {
                $lastClauseWasBreak = false;
                $lastClauseDay = null;
            }

            $isBreak = $hasBreakKeyword || ($lastClauseWasBreak && ! $mentionsSubject);
            $dayToUse = $targetDay ?: ($lastClauseWasBreak ? $lastClauseDay : null);

            // Fallback: if the prompt is ONLY the time range itself, treat it as a break
            if (! $isBreak && preg_match('/^[^\w]*(?:jam|pukul)?\s*\d{1,2}(?:[.:]\d{2})?\s*(?:sampai|sd|s\/d|s\.d\.|-|hingga|to)\s*(?:jam|pukul)?\s*\d{1,2}(?:[.:]\d{2})?[^\w]*$/i', $clause)) {
                $isBreak = true;
            }

            if ($isBreak) {
                $clauseSlots = [];

                // Check for special keyword exclusions
                if (str_contains($clause, 'upacara') || (str_contains($clause, 'pagi') && (str_contains($clause, 'kosong') || str_contains($clause, 'acara') || str_contains($clause, 'istirahat')))) {
                    $clauseSlots[] = 1;
                }

                // Check for time range first (with lookbehind to avoid matching slot numbers as hours)
                $timeRegex = '/(?:jam|pukul)?\s*(?<!slot\s|slot\ske-|slot\ske|ke-|slot)(\d{1,2})(?:[.:](\d{2}))?\s*(?:sampai|sd|s\/d|s\.d\.|-|hingga|to)\s*(?:jam|pukul)?\s*(\d{1,2})(?:[.:](\d{2}))?/i';
                if (preg_match_all($timeRegex, $clause, $timeMatches, PREG_SET_ORDER)) {
                    foreach ($timeMatches as $match) {
                        $startHour = (int) $match[1];
                        $startMin = isset($match[2]) && $match[2] !== '' ? (int) $match[2] : 0;
                        $endHour = (int) $match[3];
                        $endMin = isset($match[4]) && $match[4] !== '' ? (int) $match[4] : 0;

                        $bStart = $startHour * 60 + $startMin;
                        $bEnd = $endHour * 60 + $endMin;

                        foreach ($timeSlots as $slot) {
                            $slotStartStr = $this->normalizeTime((string) $slot->start_time);
                            $slotEndStr = $this->normalizeTime((string) $slot->end_time);

                            [$sHour, $sMin] = explode(':', $slotStartStr);
                            [$eHour, $eMin] = explode(':', $slotEndStr);

                            $sStart = (int) $sHour * 60 + (int) $sMin;
                            $sEnd = (int) $eHour * 60 + (int) $eMin;

                            if ($sStart < $bEnd && $bStart < $sEnd) {
                                $clauseSlots[] = $slot->slot_number;
                            }
                        }
                    }
                } else {
                    // Check for single "until" time e.g. "sampai jam 7.45" (must have jam/pukul prefix OR have minutes)
                    $untilRegex = '/(?:sampai|sd|s\/d|s\.d\.|-|hingga|to|sebelum|kurang\s*dari|maksimal|maks|max)\s*(?:(?:jam|pukul)\s*(\d{1,2})(?:[.:](\d{2}))?|(\d{1,2})[.:](\d{2}))/i';
                    if (preg_match($untilRegex, $clause, $untilMatch)) {
                        if (! empty($untilMatch[1])) {
                            $endHour = (int) $untilMatch[1];
                            $endMin = isset($untilMatch[2]) && $untilMatch[2] !== '' ? (int) $untilMatch[2] : 0;
                        } else {
                            $endHour = (int) $untilMatch[3];
                            $endMin = (int) $untilMatch[4];
                        }

                        $bStart = 0;
                        $bEnd = $endHour * 60 + $endMin;

                        foreach ($timeSlots as $slot) {
                            $slotStartStr = $this->normalizeTime((string) $slot->start_time);
                            $slotEndStr = $this->normalizeTime((string) $slot->end_time);

                            [$sHour, $sMin] = explode(':', $slotStartStr);
                            [$eHour, $eMin] = explode(':', $slotEndStr);

                            $sStart = (int) $sHour * 60 + (int) $sMin;
                            $sEnd = (int) $eHour * 60 + (int) $eMin;

                            if ($sStart < $bEnd && $bStart < $sEnd) {
                                $clauseSlots[] = $slot->slot_number;
                            }
                        }
                    } else {
                        // Parse slot ranges e.g. "slot 1 sampai 2" or "1 sampai 2"
                        $rangeRegex = '/(?:slot|jam(?:\s*ke)?|ke-)?\s*(\d+)\s*(?:sampai|sd|s\/d|s\.d\.|-|hingga|to)\s*(\d+)/i';
                        if (preg_match_all($rangeRegex, $clause, $rangeMatches, PREG_SET_ORDER)) {
                            foreach ($rangeMatches as $match) {
                                $start = (int) $match[1];
                                $end = (int) $match[2];
                                if ($start <= 12 && $end <= 12 && $start <= $end) {
                                    for ($s = $start; $s <= $end; $s++) {
                                        $clauseSlots[] = $s;
                                    }
                                }
                            }
                        } else {
                            // Parse individual slot numbers (with negative lookahead to avoid matching time periods)
                            if (preg_match_all('/(?:slot|jam(?:\s*ke)?|ke-)\s*(\d+)(?![\.:]\d)/i', $clause, $matches)) {
                                foreach ($matches[1] as $num) {
                                    $clauseSlots[] = (int) $num;
                                }
                            }
                            // Fallback for standalone numbers or "istirahat 5" (with negative lookahead)
                            elseif (preg_match_all('/(?:'.$breakPattern.')\D*(\d+)(?![\.:]\d)/i', $clause, $matches)) {
                                foreach ($matches[1] as $num) {
                                    $clauseSlots[] = (int) $num;
                                }
                            }
                        }
                    }
                }

                // Distribute slots to either general or day-specific arrays
                if (! empty($clauseSlots)) {
                    if ($dayToUse) {
                        if (! isset($this->daySpecificExcludedSlots[$dayToUse])) {
                            $this->daySpecificExcludedSlots[$dayToUse] = [];
                        }
                        $this->daySpecificExcludedSlots[$dayToUse] = array_merge($this->daySpecificExcludedSlots[$dayToUse], $clauseSlots);
                    } else {
                        $excluded = array_merge($excluded, $clauseSlots);
                    }
                }
            }
        }

        // De-duplicate
        $excluded = array_unique($excluded);
        foreach ($this->daySpecificExcludedSlots as $day => $sList) {
            $this->daySpecificExcludedSlots[$day] = array_unique($sList);
        }

        return $excluded;
    }

    private function deepCopyWorkload(array $workload): array
    {
        $copy = [];
        foreach ($workload as $teacherId => $days) {
            $copy[$teacherId] = $days;
        }

        return $copy;
    }

    private function deepCopyOccupancy(array $occupancy): array
    {
        $copy = [];
        foreach ($occupancy as $day => $slots) {
            $copy[$day] = $slots;
        }

        return $copy;
    }
}
