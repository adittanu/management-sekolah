<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\RaportData;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RaportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $semester = $request->input('semester', 1);
        $academicYear = $request->input('academic_year', date('Y').'/'.(date('Y') + 1));
        $reportType = $request->input('report_type', 'final');

        $studentClassroom = $user->classrooms()->first();
        $classroomId = $studentClassroom ? $studentClassroom->id : null;

        $raportData = null;

        if ($classroomId) {
            $raportData = $this->buildRaportData($user->id, $classroomId, $academicYear, $semester, $reportType);
        }

        // Build raport history for this student
        $raportHistory = collect();
        if ($classroomId) {
            $raportHistory = Grade::where('student_id', $user->id)
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

        return Inertia::render('Siswa/Raport', [
            'raportData' => $raportData,
            'raportHistory' => $raportHistory,
            'filters' => [
                'semester' => $semester,
                'academic_year' => $academicYear,
                'report_type' => $reportType,
            ],
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'semester' => 'required|integer|in:1,2',
            'academic_year' => 'required|string',
            'report_type' => 'nullable|string|in:mid,final',
        ]);

        $studentClassroom = $user->classrooms()->first();
        if (! $studentClassroom) {
            return redirect()->back()->with('error', 'Anda belum terdaftar di kelas manapun.');
        }

        $reportType = $validated['report_type'] ?? 'final';
        $raportData = $this->buildRaportData(
            $user->id,
            $studentClassroom->id,
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
            'attendance' => $raportData['attendance'] ?? null,
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
                $periodGrade = $grades->first(fn ($g) => $g->subject_id === $subject->id && $g->period === 'mid');
                $average = $periodGrade?->score;
                $description = $periodGrade?->description;
            } else {
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
