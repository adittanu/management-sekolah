<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportScheduleRequest;
use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\TimeSlot;
use App\Models\User;
use App\Services\AutoScheduleGenerator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $schedules = Schedule::query()
            ->with(['subject', 'classroom', 'teacher'])
            ->when(request('search'), function ($query, $search) {
                $query->whereHas('subject', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('classroom', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        $subjects = Subject::with('teachers')->get();
        $classrooms = Classroom::all();
        $teachers = User::where('role', 'teacher')->get();
        $timeSlots = TimeSlot::where('is_active', true)->orderBy('slot_number')->get();
        $rooms = \App\Models\Room::where('is_active', true)->orderBy('name')->get();

        $classroomIdsWithSchedule = Schedule::pluck('classroom_id')->unique()->values()->all();

        return Inertia::render('Admin/Jadwal/Index', [
            'schedules' => $schedules,
            'subjects' => $subjects,
            'classrooms' => $classrooms,
            'teachers' => $teachers,
            'timeSlots' => $timeSlots,
            'rooms' => $rooms,
            'autoResult' => session()->get('auto_generate_result'),
            'classroomIdsWithSchedule' => $classroomIdsWithSchedule,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'teacher_id' => 'required|exists:users,id',
            'day' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
        ]);

        $this->checkConflict(
            $validated['teacher_id'],
            $validated['classroom_id'],
            $validated['day'],
            $validated['start_time'],
            $validated['end_time'],
            $validated['room'] ?? null
        );

        Schedule::create($validated);

        return redirect()->back()->with('success', 'Schedule created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'teacher_id' => 'required|exists:users,id',
            'day' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
        ]);

        $this->checkConflict(
            $validated['teacher_id'],
            $validated['classroom_id'],
            $validated['day'],
            $validated['start_time'],
            $validated['end_time'],
            $validated['room'] ?? null,
            $schedule->id
        );

        $schedule->update($validated);

        return redirect()->back()->with('success', 'Schedule updated successfully.');
    }

    /**
     * Auto-generate schedules for a classroom using AI algorithm.
     */
    public function autoGenerate(Request $request)
    {
        $validated = $request->validate([
            'classroom_id' => 'required|integer|exists:classrooms,id',
            'requirements' => 'required|array|min:1',
            'requirements.*.subject_id' => 'required|exists:subjects,id',
            'requirements.*.hours' => 'required|integer|min:1|max:10',
            'clear_existing' => 'sometimes|boolean',
            'prompt' => 'nullable|string|max:1000',
            'is_mobile' => 'sometimes|boolean',
        ]);

        $classroomId = (int) $validated['classroom_id'];
        $clearExisting = $validated['clear_existing'] ?? false;

        $classroom = Classroom::findOrFail($classroomId);
        if ($request->has('is_mobile')) {
            $classroom->update(['is_mobile' => (bool) $request->input('is_mobile')]);
        }

        $generator = new AutoScheduleGenerator;
        $generator->setPrompt($validated['prompt'] ?? null);

        if ($clearExisting) {
            Schedule::where('classroom_id', $classroomId)->delete();
        }

        $result = $generator->generate(
            $classroomId,
            $validated['requirements']
        );

        $totalLessons = $result['stats']['total_lessons'] ?? 0;
        $totalScheduled = $result['stats']['scheduled'] ?? 0;

        $allConflicts = $result['conflicts'] ?? [];
        $allWarnings = $result['warnings'] ?? [];
        $allSaved = 0;
        $allErrors = [];

        if (! empty($result['schedule'])) {
            $saveResult = $generator->saveSchedule($result['schedule'], false);
            $allSaved = $saveResult['saved'];
            $allErrors = $saveResult['errors'];
        }

        $fillRate = $totalLessons > 0 ? round(($totalScheduled / $totalLessons) * 100, 1) : 0;

        $unfulfilled = $result['unfulfilled'] ?? [];
        $unfulfilledSubjectNames = array_unique(array_column($unfulfilled, 'name'));

        $classroomIdsWithSchedule = Schedule::pluck('classroom_id')->unique()->values()->all();
        $nextClassroom = Classroom::whereNotIn('id', $classroomIdsWithSchedule)->first();

        $flashData = [
            'auto_generate_stats' => [
                'total_lessons' => $totalLessons,
                'scheduled' => $totalScheduled,
                'conflicts' => count($allConflicts),
                'fill_rate' => $fillRate,
                'classroom_id' => $classroomId,
            ],
        ];

        if (! empty($allConflicts)) {
            $flashData['auto_generate_conflicts'] = $allConflicts;
        }
        if ($allSaved > 0) {
            $flashData['auto_generate_saved'] = $allSaved;
        }
        if (! empty($allErrors)) {
            $flashData['auto_generate_errors'] = $allErrors;
        }
        if (! empty($allWarnings)) {
            $flashData['auto_generate_warnings'] = $allWarnings;
        }
        if (! empty($unfulfilledSubjectNames)) {
            $flashData['auto_generate_unfulfilled'] = $unfulfilledSubjectNames;
        }
        if ($nextClassroom) {
            $flashData['auto_generate_next_classroom_id'] = $nextClassroom->id;
            $flashData['auto_generate_next_classroom_name'] = $nextClassroom->name;
        }

        session()->flash('auto_generate_result', $flashData);

        return redirect()->route('admin.jadwal.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->back()->with('success', 'Schedule deleted successfully.');
    }

    /**
     * Check for scheduling conflicts.
     */
    protected function checkConflict($teacherId, $classroomId, $day, $start, $end, $room = null, $ignoreId = null)
    {
        $teacherConflict = Schedule::where('teacher_id', $teacherId)
            ->where('day', $day)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_time', [$start, $end])
                    ->orWhereBetween('end_time', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_time', '<=', $start)
                            ->where('end_time', '>=', $end);
                    });
            })
            ->when($ignoreId, function ($query) use ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            })
            ->exists();

        if ($teacherConflict) {
            throw ValidationException::withMessages([
                'teacher_id' => 'Teacher is already teaching another class at this time.',
            ]);
        }

        $classroomConflict = Schedule::where('classroom_id', $classroomId)
            ->where('day', $day)
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_time', [$start, $end])
                    ->orWhereBetween('end_time', [$start, $end])
                    ->orWhere(function ($q) use ($start, $end) {
                        $q->where('start_time', '<=', $start)
                            ->where('end_time', '>=', $end);
                    });
            })
            ->when($ignoreId, function ($query) use ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            })
            ->exists();

        if ($classroomConflict) {
            throw ValidationException::withMessages([
                'classroom_id' => 'Classroom is already occupied at this time.',
            ]);
        }

        if (! empty($room)) {
            $roomConflict = Schedule::where('room', $room)
                ->where('day', $day)
                ->where(function ($query) use ($start, $end) {
                    $query->whereBetween('start_time', [$start, $end])
                        ->orWhereBetween('end_time', [$start, $end])
                        ->orWhere(function ($q) use ($start, $end) {
                            $q->where('start_time', '<=', $start)
                                ->where('end_time', '>=', $end);
                        });
                })
                ->when($ignoreId, function ($query) use ($ignoreId) {
                    $query->where('id', '!=', $ignoreId);
                })
                ->exists();

            if ($roomConflict) {
                throw ValidationException::withMessages([
                    'room' => 'Ruangan sudah digunakan oleh kelas lain pada jam tersebut.',
                ]);
            }
        }
    }

    /**
     * Export all classroom schedules to an Excel file matching the required template format.
     */
    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\RedirectResponse
    {
        $timeSlots = TimeSlot::where('is_active', true)->orderBy('slot_number')->get();
        $classrooms = Classroom::all();
        $schedules = Schedule::with(['subject', 'classroom', 'teacher'])->get();

        if ($classrooms->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada data kelas untuk diekspor.');
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Jadwal Pembelajaran');

        $titleStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
                'name' => 'Arial',
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
            ],
        ];

        $sheet->setCellValue('A1', 'PEMERINTAH DAERAH PROVINSI JAWA BARAT');
        $sheet->setCellValue('A2', 'DINAS PENDIDIKAN');
        $sheet->setCellValue('A3', 'KANTOR CABANG DINAS PENDIDIKAN WILAYAH VII');
        $sheet->setCellValue('A4', 'SEKOLAH MENENGAH KEJURUAN NEGERI 12 BANDUNG');
        $sheet->setCellValue('A5', 'Website: smkn12bdg.sch.id Email: info@smkn12bdg.sch.id');
        $sheet->setCellValue('A6', 'Jalan Pajajaran No. 92 Telepon/Fax. 022-6038055 Kel. Pamoyanan Kec. Cicendo Bandung 40173');

        $sheet->getStyle('A1:A6')->applyFromArray($titleStyle);
        $sheet->getStyle('A1')->getFont()->setSize(14)->setBold(true);
        $sheet->getStyle('A4')->getFont()->setSize(14)->setBold(true);

        $totalColsCount = 3 + ($classrooms->count() * 3);
        $lastColLetter = Coordinate::stringFromColumnIndex($totalColsCount);

        $sheet->getStyle("A7:{$lastColLetter}7")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THICK);

        $sheet->setCellValue('A9', 'JADWAL PEMBELAJARAN');
        $sheet->setCellValue('A10', 'TAHUN PELAJARAN '.(date('Y').'/'.(date('Y') + 1)));
        $sheet->getStyle('A9:A10')->getFont()->setBold(true)->setSize(12);

        $sheet->setCellValue('A13', 'HARI');
        $sheet->mergeCells('A13:A15');

        $sheet->setCellValue('B13', 'JP.KE');
        $sheet->mergeCells('B13:B15');

        $sheet->setCellValue('C13', 'WAKTU');
        $sheet->mergeCells('C13:C15');

        $sheet->setCellValue('D13', 'KELAS. RUANG DAN MATA PELAJARAN');
        $sheet->mergeCells("D13:{$lastColLetter}13");

        $colIdx = 4;
        foreach ($classrooms as $classroom) {
            $startLetter = Coordinate::stringFromColumnIndex($colIdx);
            $endLetter = Coordinate::stringFromColumnIndex($colIdx + 2);
            $sheet->setCellValue("{$startLetter}14", $classroom->name);
            $sheet->mergeCells("{$startLetter}14:{$endLetter}14");

            $sheet->setCellValue("{$startLetter}15", 'Mata Pelajaran');
            $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIdx + 1).'15', 'Ko Gu');
            $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIdx + 2).'15', 'Ruang');

            $colIdx += 3;
        }

        $headerRange = "A13:{$lastColLetter}15";
        $sheet->getStyle($headerRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle($headerRange)->getFont()->setBold(true);
        $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('E2EFDA');

        $currentRow = 16;
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        foreach ($days as $day) {
            $dayStartRow = $currentRow;

            if ($day === 'Senin') {
                $sheet->setCellValue("B{$currentRow}", '');
                $sheet->setCellValue("C{$currentRow}", '06.30 - 07.15');

                $startLetter = 'D';
                $sheet->setCellValue("{$startLetter}{$currentRow}", 'Upacara / Lapangan');
                $sheet->mergeCells("{$startLetter}{$currentRow}:{$lastColLetter}{$currentRow}");
                $sheet->getStyle("{$startLetter}{$currentRow}:{$lastColLetter}{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $currentRow++;
            } else {
                $sheet->setCellValue("B{$currentRow}", '');
                $sheet->setCellValue("C{$currentRow}", '06.30 - 07.15');
                $sheet->setCellValue("D{$currentRow}", 'Dhuha / Literasi');
                $sheet->mergeCells("D{$currentRow}:{$lastColLetter}{$currentRow}");
                $sheet->getStyle("D{$currentRow}:{$lastColLetter}{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $currentRow++;
            }

            for ($slotNum = 1; $slotNum <= 10; $slotNum++) {
                $ts = $timeSlots->where('slot_number', $slotNum)->first();
                $timeStr = '';
                if ($ts && $ts->start_time && $ts->end_time) {
                    $timeStr = $ts->start_time->format('H.i').' - '.$ts->end_time->format('H.i');
                } else {
                    $fallbacks = [
                        1 => '07.15 - 07.55',
                        2 => '07.55 - 08.35',
                        3 => '08.35 - 09.15',
                        4 => '09.30 - 10.10',
                        5 => '10.10 - 10.50',
                        6 => '10.50 - 11.30',
                        7 => '12.15 - 12.55',
                        8 => '12.55 - 13.35',
                        9 => '13.35 - 14.15',
                        10 => '14.15 - 14.55',
                    ];
                    $timeStr = $fallbacks[$slotNum] ?? '';
                }

                $sheet->setCellValue("B{$currentRow}", $slotNum);
                $sheet->setCellValue("C{$currentRow}", $timeStr);

                $cColIdx = 4;
                foreach ($classrooms as $classroom) {
                    $startLetter = Coordinate::stringFromColumnIndex($cColIdx);
                    $teacherLetter = Coordinate::stringFromColumnIndex($cColIdx + 1);
                    $roomLetter = Coordinate::stringFromColumnIndex($cColIdx + 2);

                    $schedule = $schedules->where('classroom_id', $classroom->id)
                        ->where('day', $day)
                        ->filter(function ($item) use ($ts, $slotNum) {
                            if ($ts && $ts->start_time) {
                                return Carbon::parse($item->start_time)->format('H:i') === $ts->start_time->format('H:i');
                            }
                            $starts = [
                                1 => '07:15', 2 => '07:55', 3 => '08:35',
                                4 => '09:30', 5 => '10:10', 6 => '10:50',
                                7 => '12:15', 8 => '12:55', 9 => '13:35', 10 => '14:15',
                            ];

                            return Carbon::parse($item->start_time)->format('H:i') === ($starts[$slotNum] ?? '');
                        })->first();

                    if ($schedule) {
                        $sheet->setCellValue("{$startLetter}{$currentRow}", $schedule->subject->name);
                        $sheet->setCellValue("{$teacherLetter}{$currentRow}", $schedule->teacher->teacher_code ?? '');
                        $sheet->setCellValue("{$roomLetter}{$currentRow}", $schedule->room ?? '');
                    }

                    $cColIdx += 3;
                }

                $currentRow++;

                if ($slotNum === 3) {
                    $sheet->setCellValue("B{$currentRow}", '');
                    $sheet->setCellValue("C{$currentRow}", '09.15 - 09.30');
                    $sheet->setCellValue("D{$currentRow}", 'Istirahat');
                    $sheet->mergeCells("D{$currentRow}:{$lastColLetter}{$currentRow}");
                    $sheet->getStyle("D{$currentRow}:{$lastColLetter}{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $currentRow++;
                }

                if ($slotNum === 6) {
                    $sheet->setCellValue("B{$currentRow}", '');
                    $sheet->setCellValue("C{$currentRow}", '11.30 - 12.15');
                    $sheet->setCellValue("D{$currentRow}", 'Istirahat');
                    $sheet->mergeCells("D{$currentRow}:{$lastColLetter}{$currentRow}");
                    $sheet->getStyle("D{$currentRow}:{$lastColLetter}{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $currentRow++;
                }
            }

            $dayEndRow = $currentRow - 1;

            $sheet->setCellValue("A{$dayStartRow}", $day);
            $sheet->mergeCells("A{$dayStartRow}:A{$dayEndRow}");

            $dayAlign = $sheet->getStyle("A{$dayStartRow}:A{$dayEndRow}")->getAlignment();
            $dayAlign->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $dayAlign->setTextRotation(90);
            $sheet->getStyle("A{$dayStartRow}:A{$dayEndRow}")->getFont()->setBold(true);
        }

        $styleArray = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'BFBFBF'],
                ],
            ],
            'font' => [
                'name' => 'Arial',
                'size' => 10,
            ],
        ];
        $sheet->getStyle("A13:{$lastColLetter}".($currentRow - 1))->applyFromArray($styleArray);

        for ($col = 1; $col <= $totalColsCount; $col++) {
            $colLetter = Coordinate::stringFromColumnIndex($col);
            if ($colLetter === 'A' || $colLetter === 'B') {
                $sheet->getColumnDimension($colLetter)->setWidth(8);
            } elseif ($colLetter === 'C') {
                $sheet->getColumnDimension($colLetter)->setWidth(15);
            } else {
                $sheet->getColumnDimension($colLetter)->setAutoSize(true);
            }
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'jadwal_pelajaran_'.date('Ymd_His').'.xlsx';

        return response()->stream(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Cache-Control' => 'max-age=0',
            ]
        );
    }

    /**
     * Download a pre-filled example Excel template for schedule import.
     */
    public function downloadTemplate(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $timeSlots = TimeSlot::where('is_active', true)->orderBy('slot_number')->get();
        $teachers = User::where('role', 'teacher')->whereNotNull('teacher_code')->orderBy('name')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Format Jadwal Import');

        $sheet->setCellValue('A1', 'PEMERINTAH DAERAH PROVINSI JAWA BARAT');
        $sheet->setCellValue('A2', 'DINAS PENDIDIKAN');
        $sheet->setCellValue('A3', 'KANTOR CABANG DINAS PENDIDIKAN WILAYAH VII');
        $sheet->setCellValue('A4', 'SEKOLAH MENENGAH KEJURUAN NEGERI 12 BANDUNG');
        $sheet->setCellValue('A5', 'Website: smkn12bdg.sch.id  Email: info@smkn12bdg.sch.id');
        $sheet->setCellValue('A6', 'Jalan Pajajaran No. 92 Telepon/Fax. 022-6038055 Kel. Pamoyanan Kec. Cicendo Bandung 40173');
        $sheet->getStyle('A1')->getFont()->setSize(13)->setBold(true);
        $sheet->getStyle('A4')->getFont()->setSize(13)->setBold(true);
        $sheet->getStyle('A7:L7')->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THICK);
        $sheet->setCellValue('A9', 'JADWAL PEMBELAJARAN');
        $sheet->setCellValue('A10', 'TAHUN PELAJARAN '.date('Y').'/'.(date('Y') + 1));
        $sheet->getStyle('A9:A10')->getFont()->setBold(true)->setSize(12);

        $sampleClasses = ['X-TM-1', 'X-TM-2', 'X-TM-3'];

        $sheet->setCellValue('A13', 'HARI');
        $sheet->mergeCells('A13:A15');
        $sheet->setCellValue('B13', 'JP.KE');
        $sheet->mergeCells('B13:B15');
        $sheet->setCellValue('C13', 'WAKTU');
        $sheet->mergeCells('C13:C15');
        $sheet->setCellValue('D13', 'KELAS. RUANG DAN MATA PELAJARAN');
        $sheet->mergeCells('D13:L13');

        $colIdx = 4;
        foreach ($sampleClasses as $className) {
            $startLetter = Coordinate::stringFromColumnIndex($colIdx);
            $endLetter = Coordinate::stringFromColumnIndex($colIdx + 2);
            $sheet->setCellValue("{$startLetter}14", $className);
            $sheet->mergeCells("{$startLetter}14:{$endLetter}14");
            $sheet->setCellValue("{$startLetter}15", 'Mata Pelajaran');
            $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIdx + 1).'15', 'Ko Gu');
            $sheet->setCellValue(Coordinate::stringFromColumnIndex($colIdx + 2).'15', 'Ruang');
            $colIdx += 3;
        }

        $headerStyle = [
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'font' => ['bold' => true, 'name' => 'Arial', 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'E2EFDA']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];
        $sheet->getStyle('A13:L15')->applyFromArray($headerStyle);

        $teacherCodes = $teachers->pluck('teacher_code')->values();
        $t1 = $teacherCodes->get(0, 'TCH-01');
        $t2 = $teacherCodes->get(1, 'TCH-02');
        $t3 = $teacherCodes->get(2, 'TCH-03');
        $t4 = $teacherCodes->get(3, 'TCH-04');
        $t5 = $teacherCodes->get(4, 'TCH-05');
        $t6 = $teacherCodes->get(5, 'TCH-06');

        $sampleSchedule = [
            'Senin' => [
                1 => [['Matematika', $t1, 'R.101'], ['Bahasa Inggris', $t2, 'R.102'], ['Fisika', $t3, 'Lab FIS']],
                2 => [['Matematika', $t1, 'R.101'], ['Bahasa Inggris', $t2, 'R.102'], ['Fisika', $t3, 'Lab FIS']],
                3 => [['Bahasa Indonesia', $t4, 'R.101'], ['Kimia', $t5, 'Lab KIM'], ['PJOK', $t6, 'Lap']],
                4 => [['Bahasa Indonesia', $t4, 'R.101'], ['Kimia', $t5, 'Lab KIM'], ['PJOK', $t6, 'Lap']],
                5 => [['PJOK', $t6, 'Lap'], ['Matematika', $t1, 'R.103'], ['Bahasa Indonesia', $t4, 'R.104']],
                6 => [['PJOK', $t6, 'Lap'], ['Matematika', $t1, 'R.103'], ['Bahasa Indonesia', $t4, 'R.104']],
            ],
            'Selasa' => [
                1 => [['Bahasa Inggris', $t2, 'R.101'], ['PJOK', $t6, 'Lap'], ['Matematika', $t1, 'R.103']],
                2 => [['Bahasa Inggris', $t2, 'R.101'], ['PJOK', $t6, 'Lap'], ['Matematika', $t1, 'R.103']],
                3 => [['Fisika', $t3, 'Lab FIS'], ['Bahasa Indonesia', $t4, 'R.104'], ['Kimia', $t5, 'Lab KIM']],
                4 => [['Fisika', $t3, 'Lab FIS'], ['Bahasa Indonesia', $t4, 'R.104'], ['Kimia', $t5, 'Lab KIM']],
                5 => [['Kimia', $t5, 'Lab KIM'], ['Fisika', $t3, 'Lab FIS'], ['Bahasa Inggris', $t2, 'R.102']],
                6 => [['Kimia', $t5, 'Lab KIM'], ['Fisika', $t3, 'Lab FIS'], ['Bahasa Inggris', $t2, 'R.102']],
            ],
        ];

        $currentRow = 16;
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

        foreach ($days as $day) {
            $dayStartRow = $currentRow;

            $preLabel = ($day === 'Senin') ? 'Upacara / Lapangan' : 'Dhuha / Literasi';
            $sheet->setCellValue("A{$currentRow}", $day);
            $sheet->setCellValue("B{$currentRow}", '');
            $sheet->setCellValue("C{$currentRow}", '06.30 - 07.15');
            $sheet->setCellValue("D{$currentRow}", $preLabel);
            $sheet->mergeCells("D{$currentRow}:L{$currentRow}");
            $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2CC');
            $sheet->getStyle("D{$currentRow}")->getFont()->setItalic(true);
            $currentRow++;

            for ($slot = 1; $slot <= 6; $slot++) {
                $ts = $timeSlots->where('slot_number', $slot)->first();
                $timeStr = $ts
                    ? $ts->start_time->format('H.i').' - '.$ts->end_time->format('H.i')
                    : sprintf('%02d.00 - %02d.45', 6 + $slot, 6 + $slot);

                $sheet->setCellValue("B{$currentRow}", $slot);
                $sheet->setCellValue("C{$currentRow}", $timeStr);

                $dayData = $sampleSchedule[$day] ?? [];
                $slotData = $dayData[$slot] ?? [];

                $cIdx = 4;
                foreach ($slotData as $classData) {
                    $sL = Coordinate::stringFromColumnIndex($cIdx);
                    $kL = Coordinate::stringFromColumnIndex($cIdx + 1);
                    $rL = Coordinate::stringFromColumnIndex($cIdx + 2);
                    $sheet->setCellValue("{$sL}{$currentRow}", $classData[0]);
                    $sheet->setCellValue("{$kL}{$currentRow}", $classData[1]);
                    $sheet->setCellValue("{$rL}{$currentRow}", $classData[2]);
                    $cIdx += 3;
                }

                $currentRow++;

                if ($slot === 3) {
                    $sheet->setCellValue("C{$currentRow}", '09.15 - 09.30');
                    $sheet->setCellValue("D{$currentRow}", 'Istirahat');
                    $sheet->mergeCells("D{$currentRow}:L{$currentRow}");
                    $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("D{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FCE4D6');
                    $sheet->getStyle("D{$currentRow}")->getFont()->setItalic(true);
                    $currentRow++;
                }

                if ($slot === 6) {
                    $sheet->setCellValue("C{$currentRow}", '11.30 - 12.15');
                    $sheet->setCellValue("D{$currentRow}", 'Istirahat');
                    $sheet->mergeCells("D{$currentRow}:L{$currentRow}");
                    $sheet->getStyle("D{$currentRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("D{$currentRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FCE4D6');
                    $sheet->getStyle("D{$currentRow}")->getFont()->setItalic(true);
                    $currentRow++;
                }
            }

            $dayEndRow = $currentRow - 1;
            $sheet->mergeCells("A{$dayStartRow}:A{$dayEndRow}");
            $align = $sheet->getStyle("A{$dayStartRow}")->getAlignment();
            $align->setVertical(Alignment::VERTICAL_CENTER)->setHorizontal(Alignment::HORIZONTAL_CENTER)->setTextRotation(90);
            $sheet->getStyle("A{$dayStartRow}")->getFont()->setBold(true);
            $sheet->getStyle("A{$dayStartRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('D9E1F2');
        }

        $lastRow = $currentRow - 1;
        $sheet->getStyle("A13:L{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle("A13:L{$lastRow}")->getFont()->setName('Arial')->setSize(9);

        $sheet->getColumnDimension('A')->setWidth(8);
        $sheet->getColumnDimension('B')->setWidth(7);
        $sheet->getColumnDimension('C')->setWidth(16);
        foreach (['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as $c) {
            $sheet->getColumnDimension($c)->setAutoSize(true);
        }
        $sheet->getRowDimension(13)->setRowHeight(30);
        $sheet->getRowDimension(14)->setRowHeight(25);
        $sheet->getRowDimension(15)->setRowHeight(22);

        $guruSheet = $spreadsheet->createSheet();
        $guruSheet->setTitle('Kode Guru');
        $guruSheet->setCellValue('A1', 'Kode Guru');
        $guruSheet->setCellValue('B1', 'Nama Guru');
        $guruSheet->setCellValue('C1', 'NIP / No. Identitas');
        $guruSheet->getStyle('A1:C1')->getFont()->setBold(true);
        $guruSheet->getStyle('A1:C1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('BDD7EE');

        $rowIdx = 2;
        foreach ($teachers as $teacher) {
            $guruSheet->setCellValue("A{$rowIdx}", $teacher->teacher_code);
            $guruSheet->setCellValue("B{$rowIdx}", $teacher->name);
            $guruSheet->setCellValue("C{$rowIdx}", $teacher->identity_number ?? '-');
            $rowIdx++;
        }
        $guruSheet->getColumnDimension('A')->setAutoSize(true);
        $guruSheet->getColumnDimension('B')->setAutoSize(true);
        $guruSheet->getColumnDimension('C')->setAutoSize(true);
        $guruSheet->getStyle('A1:C'.($rowIdx - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        $filename = 'contoh-format-import-jadwal.xlsx';

        return response()->stream(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Cache-Control' => 'max-age=0',
            ]
        );
    }

    /**
     * Import schedules from an Excel/CSV file and update related database time slots and classes.
     */
    public function import(ImportScheduleRequest $request): \Illuminate\Http\RedirectResponse
    {
        $file = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $highestRow = $sheet->getHighestRow();
            $highestColString = $sheet->getHighestColumn();
            $highestCol = Coordinate::columnIndexFromString($highestColString);

            $classes = [];
            for ($col = 4; $col <= $highestCol; $col += 3) {
                $className = trim((string) $sheet->getCell([$col, 14])->getValue());
                if (empty($className)) {
                    $className = trim((string) $sheet->getCell([$col, 13])->getValue());
                }
                if (! empty($className) && ! in_array(strtolower($className), ['hari', 'jp.ke', 'waktu', 'mata pelajaran', 'ko gu', 'ruang', 'kelas. ruang dan mata pelajaran'])) {
                    $classes[] = [
                        'name' => $className,
                        'start_col' => $col,
                    ];
                }
            }

            if (empty($classes)) {
                return redirect()->back()->with('error', 'Tidak ditemukan kolom kelas pada baris 14 di file Excel.');
            }

            $currentDay = '';
            $importedSchedulesCount = 0;
            $timeSlotsUpdated = 0;

            $schedulesToCreate = [];
            $classroomsToClear = [];

            $allDbClassrooms = Classroom::all();
            $allDbSubjects = Subject::all();
            $allDbRooms = \App\Models\Room::all();
            $allDbTeachers = User::where('role', 'teacher')->get();

            for ($row = 16; $row <= $highestRow; $row++) {
                $dayVal = trim((string) $sheet->getCell([1, $row])->getValue());
                if (! empty($dayVal)) {
                    $cleanedDay = strtolower(str_replace(["\n", "\r", ' '], '', $dayVal));
                    $dayMap = [
                        'senin' => 'Senin',
                        'selasa' => 'Selasa',
                        'rabu' => 'Rabu',
                        'kamis' => 'Kamis',
                        'jumat' => 'Jumat',
                        'sabtu' => 'Sabtu',
                        'minggu' => 'Minggu',
                    ];
                    if (isset($dayMap[$cleanedDay])) {
                        $currentDay = $dayMap[$cleanedDay];
                    }
                }

                if (empty($currentDay)) {
                    continue;
                }

                $jpKe = trim((string) $sheet->getCell([2, $row])->getValue());
                $waktu = trim((string) $sheet->getCell([3, $row])->getValue());

                if (! empty($jpKe) && is_numeric($jpKe) && ! empty($waktu)) {
                    $jpKeInt = (int) $jpKe;

                    $parsed = $this->parseWaktu($waktu);
                    if ($parsed) {
                        $timeSlot = TimeSlot::where('slot_number', $jpKeInt)->first();
                        if ($timeSlot) {
                            $timeSlot->update([
                                'start_time' => $parsed['start'],
                                'end_time' => $parsed['end'],
                                'is_active' => true,
                            ]);
                        } else {
                            TimeSlot::create([
                                'slot_number' => $jpKeInt,
                                'start_time' => $parsed['start'],
                                'end_time' => $parsed['end'],
                                'is_active' => true,
                            ]);
                        }
                        $timeSlotsUpdated++;
                    }
                }

                if (! empty($jpKe) && is_numeric($jpKe)) {
                    $parsed = $this->parseWaktu($waktu);
                    if ($parsed) {
                        $startStr = $parsed['start'];
                        $endStr = $parsed['end'];

                        foreach ($classes as $classInfo) {
                            $col = $classInfo['start_col'];
                            $subjName = trim((string) $sheet->getCell([$col, $row])->getValue());
                            $teacherCodeVal = trim((string) $sheet->getCell([$col + 1, $row])->getValue());
                            $roomVal = trim((string) $sheet->getCell([$col + 2, $row])->getValue());

                            if (empty($subjName) || in_array(strtolower($subjName), ['istirahat', 'upacara', 'dhuha', 'literasi'])) {
                                continue;
                            }

                            $targetClassroom = $allDbClassrooms->filter(function ($item) use ($classInfo) {
                                return str_replace([' ', '-'], '', strtolower($item->name)) === str_replace([' ', '-'], '', strtolower($classInfo['name']));
                            })->first();

                            if (! $targetClassroom) {
                                $targetClassroom = Classroom::create([
                                    'name' => $classInfo['name'],
                                    'level' => '10',
                                    'major' => 'Umum',
                                    'academic_year' => (date('Y').'/'.(date('Y') + 1)),
                                ]);
                                $allDbClassrooms = Classroom::all();
                            }

                            $classroomsToClear[$targetClassroom->id] = true;

                            $targetSubject = $allDbSubjects->filter(function ($item) use ($subjName) {
                                return strtolower($item->name) === strtolower($subjName) || strtolower($item->code) === strtolower($subjName);
                            })->first();

                            if (! $targetSubject) {
                                $targetSubject = Subject::create([
                                    'name' => $subjName,
                                    'code' => strtoupper(substr(str_replace(' ', '', $subjName), 0, 5)),
                                    'category' => 'Wajib',
                                ]);
                                $allDbSubjects = Subject::all();
                            }

                            $targetTeacher = null;
                            if (! empty($teacherCodeVal)) {
                                $targetTeacher = $allDbTeachers->filter(function ($item) use ($teacherCodeVal) {
                                    return strtolower($item->teacher_code) === strtolower($teacherCodeVal) ||
                                           strtolower($item->name) === strtolower($teacherCodeVal) ||
                                           $item->identity_number === $teacherCodeVal;
                                })->first();
                            }

                            if (! $targetTeacher) {
                                throw new \Exception("Guru dengan Kode/NIP '{$teacherCodeVal}' (pada baris {$row}, kolom kelas {$classInfo['name']}) tidak ditemukan di sistem. Harap daftarkan guru terlebih dahulu.");
                            }

                            if (! empty($roomVal)) {
                                $targetRoom = $allDbRooms->filter(function ($item) use ($roomVal) {
                                    return strtolower($item->name) === strtolower($roomVal) || strtolower($item->code) === strtolower($roomVal);
                                })->first();

                                if (! $targetRoom) {
                                    $targetRoom = \App\Models\Room::create([
                                        'name' => $roomVal,
                                        'code' => strtoupper(str_replace(' ', '', $roomVal)),
                                        'type' => 'Ruang Kelas',
                                        'is_active' => true,
                                    ]);
                                    $allDbRooms = \App\Models\Room::all();
                                }
                            }

                            $schedulesToCreate[] = [
                                'subject_id' => $targetSubject->id,
                                'classroom_id' => $targetClassroom->id,
                                'teacher_id' => $targetTeacher->id,
                                'day' => $currentDay,
                                'start_time' => $startStr,
                                'end_time' => $endStr,
                                'room' => $roomVal,
                            ];
                        }
                    }
                }
            }

            DB::transaction(function () use ($classroomsToClear, $schedulesToCreate, &$importedSchedulesCount) {
                Schedule::whereIn('classroom_id', array_keys($classroomsToClear))->delete();

                foreach ($schedulesToCreate as $schedData) {
                    Schedule::create($schedData);
                    $importedSchedulesCount++;
                }
            });

            return redirect()->back()->with('success', "Import berhasil! {$timeSlotsUpdated} Jam Pelajaran diperbarui, dan {$importedSchedulesCount} jadwal pelajaran untuk ".count($classroomsToClear).' kelas berhasil dimasukkan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses file: '.$e->getMessage());
        }
    }

    /**
     * Parse a WAKTU string like "07.00 - 07.45" or "07:00–07:45" into start/end H:i strings.
     *
     * @return array{start: string, end: string}|null
     */
    private function parseWaktu(string $waktu): ?array
    {
        if (empty($waktu)) {
            return null;
        }

        $normalized = preg_replace('/(\d{2})\.(\d{2})/', '$1:$2', $waktu);
        $normalized = preg_replace('/[\x{2013}\x{2014}\x{2012}\x{2212}]/u', '-', $normalized);
        $parts = preg_split('/\s*-\s*/', $normalized, 2);

        if (count($parts) !== 2) {
            return null;
        }

        $startRaw = trim($parts[0]);
        $endRaw = trim($parts[1]);

        $startTs = strtotime($startRaw);
        $endTs = strtotime($endRaw);

        if ($startTs === false || $endTs === false || $startTs === 0 || $endTs === 0) {
            return null;
        }

        return [
            'start' => date('H:i', $startTs),
            'end' => date('H:i', $endTs),
        ];
    }
}
