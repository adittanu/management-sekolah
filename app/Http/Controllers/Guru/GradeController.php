<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\RaportData;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GradeController extends Controller
{
    /**
     * Input nilai for teacher - only shows their subjects and classrooms.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $mySubjects = Subject::whereHas('teachers', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        })->get();

        $myClassroomIds = Schedule::where('teacher_id', $user->id)
            ->pluck('classroom_id')
            ->unique();
        $myClassrooms = Classroom::whereIn('id', $myClassroomIds)->get();

        $classroomId = $request->input('classroom_id');
        $subjectId = $request->input('subject_id');
        $semester = $request->input('semester', 1);
        $academicYear = $request->input('academic_year', date('Y').'/'.(date('Y') + 1));
        $period = $request->input('period', 'final');

        $students = collect();
        $grades = collect();

        if ($classroomId && $subjectId) {
            $classroom = Classroom::with('students')->find($classroomId);
            $students = $classroom ? $classroom->students : collect();

            $gradeList = Grade::where('classroom_id', $classroomId)
                ->where('subject_id', $subjectId)
                ->where('academic_year', $academicYear)
                ->where('semester', $semester)
                ->where('period', $period)
                ->get();

            $grades = $gradeList->keyBy('student_id');
        }

        return Inertia::render('Guru/Rapor/InputNilai', [
            'myClassrooms' => $myClassrooms,
            'mySubjects' => $mySubjects,
            'students' => $students,
            'grades' => $grades,
            'filters' => [
                'classroom_id' => $classroomId,
                'subject_id' => $subjectId,
                'semester' => $semester,
                'academic_year' => $academicYear,
                'period' => $period,
            ],
        ]);
    }

    /**
     * Store grades for all students in a class.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'subject_id' => 'required|exists:subjects,id',
            'academic_year' => 'required|string',
            'semester' => 'required|integer|in:1,2',
            'period' => 'required|string|in:mid,final,daily',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:users,id',
            'grades.*.score' => 'nullable|numeric|min:0|max:100',
            'grades.*.description' => 'nullable|string|max:1000',
        ]);

        $saved = 0;

        foreach ($validated['grades'] as $gradeData) {
            if (! isset($gradeData['score']) && empty($gradeData['description'])) {
                continue;
            }

            Grade::updateOrCreate(
                [
                    'student_id' => $gradeData['student_id'],
                    'subject_id' => $validated['subject_id'],
                    'classroom_id' => $validated['classroom_id'],
                    'academic_year' => $validated['academic_year'],
                    'semester' => $validated['semester'],
                    'period' => $validated['period'],
                ],
                [
                    'teacher_id' => $user->id,
                    'score' => $gradeData['score'] ?? null,
                    'description' => $gradeData['description'] ?? null,
                ]
            );
            $saved++;
        }

        return redirect()->back()->with('success', "Berhasil menyimpan $saved nilai siswa");
    }

    /**
     * Raport view for teacher.
     */
    public function raport(Request $request)
    {
        $user = Auth::user();

        $homeroomClass = $user->homeroomClass;
        $myClassrooms = $homeroomClass ? collect([$homeroomClass]) : collect();

        $classroomId = $request->input('classroom_id');
        $semester = $request->input('semester', 1);
        $academicYear = $request->input('academic_year', date('Y').'/'.(date('Y') + 1));
        $studentId = $request->input('student_id');
        $reportType = $request->input('report_type', 'final');

        $students = collect();
        $raportData = null;

        if ($classroomId) {
            $classroom = Classroom::with('students')->find($classroomId);
            $students = $classroom ? $classroom->students : collect();

            if ($studentId) {
                $raportData = $this->buildRaportData($studentId, $classroomId, $academicYear, $semester, $reportType);
            }
        }

        // Build raport history for selected student
        $raportHistory = collect();
        if ($studentId && $classroomId) {
            $raportHistory = Grade::where('student_id', $studentId)
                ->where('classroom_id', $classroomId)
                ->selectRaw('DISTINCT academic_year, semester')
                ->orderByDesc('academic_year')
                ->orderByDesc('semester')
                ->get()
                ->map(function ($g) {
                    return [
                        'academic_year' => $g->academic_year,
                        'semester' => $g->semester,
                        'semester_label' => $g->semester === 1 ? 'Ganjil' : 'Genap',
                        'academic_year_label' => $g->academic_year,
                    ];
                });
        }

        return Inertia::render('Guru/Rapor/Raport', [
            'myClassrooms' => $myClassrooms,
            'students' => $students,
            'raportData' => $raportData,
            'raportHistory' => $raportHistory,
            'filters' => [
                'classroom_id' => $classroomId,
                'semester' => $semester,
                'academic_year' => $academicYear,
                'student_id' => $studentId,
                'report_type' => $reportType,
            ],
        ]);
    }

    /**
     * Store raport metadata.
     */
    public function storeRaportData(Request $request)
    {
        $validated = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'academic_year' => 'required|string',
            'semester' => 'required|integer|in:1,2',
            'report_type' => 'nullable|string|in:mid,final',
            'raport_entries' => 'nullable|array',
            'raport_entries.*.student_id' => 'required|exists:users,id',
            'raport_entries.*.cocurricular' => 'nullable|string|max:255',
            'raport_entries.*.extracurricular' => 'nullable|array',
            'raport_entries.*.extracurricular.*.name' => 'required|string|max:255',
            'raport_entries.*.extracurricular.*.description' => 'required|string|max:255',
            'raport_entries.*.teacher_notes' => 'nullable|string|max:1000',
            'raport_entries.*.raport_place' => 'nullable|string|max:255',
            'raport_entries.*.raport_date' => 'nullable|date',
            'raport_place' => 'nullable|string|max:255',
            'raport_date' => 'nullable|date',
        ]);

        $reportType = $validated['report_type'] ?? 'final';
        $saved = 0;
        $globalRaportPlace = $validated['raport_place'] ?? null;
        $globalRaportDate = $validated['raport_date'] ?? null;

        // Get all students in the classroom to ensure we can apply global metadata (place & date) to everyone
        $classroom = Classroom::with('students')->find($validated['classroom_id']);
        $studentIds = $classroom ? $classroom->students->pluck('id')->toArray() : [];

        $entriesByStudent = collect($validated['raport_entries'])->keyBy('student_id');

        foreach ($studentIds as $studentId) {
            $hasEntry = $entriesByStudent->has($studentId);

            if ($hasEntry) {
                $entry = $entriesByStudent->get($studentId);
                RaportData::updateOrCreate(
                    [
                        'student_id' => $studentId,
                        'classroom_id' => $validated['classroom_id'],
                        'academic_year' => $validated['academic_year'],
                        'semester' => $validated['semester'],
                        'report_type' => $reportType,
                    ],
                    [
                        'cocurricular' => $entry['cocurricular'] ?? null,
                        'extracurricular' => $entry['extracurricular'] ?? null,
                        'teacher_notes' => $entry['teacher_notes'] ?? null,
                        'raport_place' => $globalRaportPlace,
                        'raport_date' => $globalRaportDate,
                    ]
                );
                $saved++;
            } elseif ($globalRaportPlace !== null || $globalRaportDate !== null) {
                $existing = RaportData::where([
                    'student_id' => $studentId,
                    'classroom_id' => $validated['classroom_id'],
                    'academic_year' => $validated['academic_year'],
                    'semester' => $validated['semester'],
                    'report_type' => $reportType,
                ])->first();

                if ($existing) {
                    $existing->update([
                        'raport_place' => $globalRaportPlace,
                        'raport_date' => $globalRaportDate,
                    ]);
                } else {
                    RaportData::create([
                        'student_id' => $studentId,
                        'classroom_id' => $validated['classroom_id'],
                        'academic_year' => $validated['academic_year'],
                        'semester' => $validated['semester'],
                        'report_type' => $reportType,
                        'raport_place' => $globalRaportPlace,
                        'raport_date' => $globalRaportDate,
                        'cocurricular' => null,
                        'extracurricular' => null,
                        'teacher_notes' => null,
                    ]);
                }
                $saved++;
            }
        }

        return redirect()->back()->with('success', "Berhasil menyimpan data raport $saved siswa");
    }

    /**
     * Export raport as PDF using DomPDF.
     */
    public function exportPdf(Request $request)
    {
        $validated = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'student_id' => 'required|exists:users,id',
            'semester' => 'required|integer|in:1,2',
            'academic_year' => 'required|string',
            'report_type' => 'nullable|string|in:mid,final',
        ]);

        $reportType = $validated['report_type'] ?? 'final';
        $raportData = $this->buildRaportData(
            $validated['student_id'],
            $validated['classroom_id'],
            $validated['academic_year'],
            $validated['semester'],
            $reportType
        );

        $schoolSettings = \App\Models\School::first();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('raport-pdf', [
            'student' => $raportData['student'],
            'classroom' => $raportData['classroom'],
            'subjects' => $raportData['subjects'],
            'average' => $raportData['average'],
            'academicYear' => $raportData['academic_year'],
            'semester' => $raportData['semester'],
            'attendance' => $raportData['attendance'],
            'cocurricular' => $raportData['cocurricular'] ?? null,
            'extracurricular' => $raportData['extracurricular'] ?? [],
            'teacherNotes' => $raportData['teacher_notes'] ?? null,
            'parentNotes' => $raportData['parent_notes'] ?? null,
            'schoolSettings' => $schoolSettings ? $schoolSettings->toArray() : [],
            'reportType' => $reportType,
        ]);

        $filename = 'raport-'.str_replace([' ', '/'], '-', $raportData['student']->name).'-'.str_replace('/', '-', $raportData['academic_year']).'-s'.$raportData['semester'].'-'.$reportType.'.pdf';

        return $pdf->download($filename);
    }

    private function buildRaportData(int $studentId, int $classroomId, string $academicYear, int $semester, string $reportType = 'final'): array
    {
        $student = User::find($studentId);
        $classroom = Classroom::find($classroomId);

        $subjects = Subject::with('teachers')->get();

        $grades = Grade::where('student_id', $studentId)
            ->where('classroom_id', $classroomId)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->with('subject')
            ->get();

        $subjectGrades = [];
        $totalScore = 0;
        $subjectCount = 0;

        foreach ($subjects as $subject) {
            if ($reportType === 'mid') {
                // Tengah semester: gunakan nilai periode 'mid' saja
                $periodGrade = $grades->first(fn ($g) => $g->subject_id === $subject->id && $g->period === 'mid');
                $average = $periodGrade?->score;
                $description = $periodGrade?->description;
            } else {
                // Akhir semester: gunakan nilai periode 'final' atau rata-rata
                $midGrade = $grades->first(fn ($g) => $g->subject_id === $subject->id && $g->period === 'mid');
                $finalGrade = $grades->first(fn ($g) => $g->subject_id === $subject->id && $g->period === 'final');

                $scores = array_filter([
                    $midGrade?->score,
                    $finalGrade?->score,
                ], fn ($v) => $v !== null);

                $average = ! empty($scores) ? round(array_sum($scores) / count($scores), 2) : null;
                $description = $finalGrade?->description ?? $midGrade?->description;
            }

            if ($average !== null) {
                $totalScore += $average;
                $subjectCount++;
            }

            $subjectGrades[] = [
                'subject' => $subject->name,
                'daily' => null,
                'mid' => null,
                'final' => null,
                'average' => $average,
                'daily_desc' => null,
                'mid_desc' => null,
                'final_desc' => $description,
            ];
        }

        $classAverage = $subjectCount > 0 ? round($totalScore / $subjectCount, 2) : 0;

        $attendance = $this->buildAttendanceSummary($studentId, $classroomId, $academicYear, $semester);

        $raportMeta = RaportData::where('student_id', $studentId)
            ->where('classroom_id', $classroomId)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->where('report_type', $reportType)
            ->first();

        return [
            'student' => $student,
            'classroom' => $classroom,
            'subjects' => $subjectGrades,
            'average' => $classAverage,
            'academic_year' => $academicYear,
            'semester' => $semester,
            'report_type' => $reportType,
            'attendance' => $attendance,
            'cocurricular' => $raportMeta?->cocurricular,
            'extracurricular' => $raportMeta?->extracurricular ?? [],
            'teacher_notes' => $raportMeta?->teacher_notes,
            'parent_notes' => $raportMeta?->parent_notes,
            'raport_place' => $raportMeta?->raport_place,
            'raport_date' => $raportMeta?->raport_date?->format('d/m/Y'),
        ];
    }

    private function buildAttendanceSummary(int $studentId, int $classroomId, string $academicYear, int $semester): array
    {
        $dateRange = $this->getSemesterDateRange($academicYear, $semester);
        $scheduleIds = \App\Models\Schedule::where('classroom_id', $classroomId)->pluck('id');
        $attendances = \App\Models\Attendance::where('student_id', $studentId)
            ->whereIn('schedule_id', $scheduleIds)
            ->whereBetween('date', [$dateRange['start'], $dateRange['end']])
            ->get();

        return [
            'hadir' => $attendances->where('status', 'hadir')->count(),
            'sakit' => $attendances->where('status', 'sakit')->count(),
            'izin' => $attendances->where('status', 'izin')->count(),
            'alpha' => $attendances->where('status', 'alpha')->count(),
            'total' => $attendances->count(),
        ];
    }

    private function getSemesterDateRange(string $academicYear, int $semester): array
    {
        $parts = explode('/', $academicYear);
        $startYear = (int) ($parts[0] ?? date('Y'));

        if ($semester === 1) {
            return ['start' => "$startYear-07-01", 'end' => "$startYear-12-31"];
        }

        return ['start' => ($startYear + 1).'-01-01', 'end' => ($startYear + 1).'-06-30'];
    }
}
