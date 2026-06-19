import TeacherLayout from '@/Layouts/TeacherLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useState, useEffect } from 'react';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    FileText, 
    Save, 
    GraduationCap, 
    BookOpen, 
    Loader2, 
    Search, 
    Award, 
    CheckCircle, 
    AlertCircle, 
    RefreshCw, 
    Wand2, 
    ArrowRight, 
    ArrowLeft,
    Check,
    Settings,
    FileSpreadsheet,
    HelpCircle
} from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code?: string;
}

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    identity_number?: string;
}

interface Grade {
    id?: number;
    student_id: number;
    score: number | null;
    description: string | null;
}

interface Props {
    myClassrooms: Classroom[];
    mySubjects: Subject[];
    students: Student[];
    grades: Record<string, Grade>;
    filters: {
        classroom_id: string | null;
        subject_id: string | null;
        semester: number;
        academic_year: string;
        period?: string;
    };
}

export default function InputNilai({ myClassrooms, mySubjects, students, grades, filters }: Props) {
    const [classroomId, setClassroomId] = useState(filters.classroom_id || '');
    const [subjectId, setSubjectId] = useState(filters.subject_id || '');
    const [semester, setSemester] = useState(filters.semester.toString());
    const [academicYear, setAcademicYear] = useState(filters.academic_year);
    const [period, setPeriod] = useState(filters.period || 'final');
    const [localGrades, setLocalGrades] = useState<Record<number, { score: string; description: string }>>({});
    const [isFiltering, setIsFiltering] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showConfig, setShowConfig] = useState(!filters.classroom_id || !filters.subject_id);

    useEffect(() => {
        const loaded: Record<number, { score: string; description: string }> = {};
        Object.keys(grades).forEach(key => {
            const grade = grades[key];
            loaded[grade.student_id] = {
                score: grade.score?.toString() || '',
                description: grade.description || '',
            };
        });
        setLocalGrades(loaded);
    }, [grades]);

    const handleFilterChange = (newClassroomId?: string, newSubjectId?: string) => {
        const cid = newClassroomId || classroomId;
        const sid = newSubjectId || subjectId;
        if (cid && sid) {
            setIsFiltering(true);
            router.get(route('guru.rapor.input'), {
                classroom_id: cid,
                subject_id: sid,
                semester,
                academic_year: academicYear,
                period,
            }, { 
                onFinish: () => {
                    setIsFiltering(false);
                    setShowConfig(false); // Auto collapse config on successful filter
                } 
            });
        }
    };

    const updateLocalGrade = (studentId: number, field: 'score' | 'description', value: string) => {
        setLocalGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId] || { score: '', description: '' },
                [field]: value,
            },
        }));
    };

    const handleSubmit = () => {
        if (!classroomId || !subjectId) {
            toast.error('Pilih kelas dan mata pelajaran terlebih dahulu');
            return;
        }

        const gradesArray = Object.entries(localGrades).map(([studentId, data]) => ({
            student_id: parseInt(studentId),
            score: data.score ? parseFloat(data.score) : null,
            description: data.description || null,
        })).filter(g => g.score !== null || g.description);

        if (gradesArray.length === 0) {
            toast.error('Masukkan minimal satu nilai sebelum menyimpan');
            return;
        }

        setIsSaving(true);
        router.post(route('guru.rapor.store'), {
            classroom_id: parseInt(classroomId),
            subject_id: parseInt(subjectId),
            academic_year: academicYear,
            semester: parseInt(semester),
            period,
            grades: gradesArray,
        }, {
            onSuccess: () => toast.success('Nilai berhasil disimpan ke database'),
            onError: () => toast.error('Gagal menyimpan nilai. Silakan periksa kembali input Anda'),
            onFinish: () => setIsSaving(false),
        });
    };

    // Auto generate descriptive achievements based on grades
    const autoGenerateDescriptions = () => {
        const updated = { ...localGrades };
        students.forEach(student => {
            const gradeData = updated[student.id] || { score: '', description: '' };
            if (gradeData.score) {
                const score = parseFloat(gradeData.score);
                let desc = '';
                const mapelName = mySubjects.find(s => s.id.toString() === subjectId)?.name || 'Mata Pelajaran';
                if (score >= 90) {
                    desc = `Sangat baik dalam memahami dan menguasai seluruh kompetensi dasar ${mapelName}, terutama dalam analisis materi lanjutan secara mandiri.`;
                } else if (score >= 80) {
                    desc = `Baik dalam memahami dan menyelesaikan sebagian besar tugas ${mapelName} dengan penguasaan konsep yang mantap.`;
                } else if (score >= 70) {
                    desc = `Cukup baik dalam memahami materi ${mapelName}, perlu sedikit bimbingan tambahan dalam menyelesaikan soal-soal aplikatif.`;
                } else if (score >= 60) {
                    desc = `Kurang menguasai kompetensi dasar ${mapelName}, perlu bimbingan dan latihan mandiri secara intensif di rumah.`;
                } else {
                    desc = `Sangat memerlukan pendampingan khusus, remedial, dan bimbingan terstruktur pada materi pokok ${mapelName}.`;
                }
                updated[student.id] = { ...gradeData, description: desc };
            }
        });
        setLocalGrades(updated);
        toast.success('Deskripsi capaian kompetensi berhasil dibuat otomatis!');
    };

    // Keyboard navigation helper
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: 'score' | 'description') => {
        if (e.key === 'ArrowDown' || (e.key === 'Enter' && field === 'score')) {
            e.preventDefault();
            const nextInput = document.querySelector<HTMLInputElement>(`[data-index="${index + 1}"][data-field="${field}"]`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevInput = document.querySelector<HTMLInputElement>(`[data-index="${index - 1}"][data-field="${field}"]`);
            if (prevInput) {
                prevInput.focus();
                prevInput.select();
            }
        }
    };

    // Search and filter students list
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Live grade input analytics
    const analytics = (() => {
        const total = students.length;
        let graded = 0;
        let sumScore = 0;
        const dist = { A: 0, B: 0, C: 0, D: 0, E: 0 };

        students.forEach(student => {
            const data = localGrades[student.id];
            if (data && data.score !== '') {
                graded++;
                const score = parseFloat(data.score);
                sumScore += score;
                if (score >= 90) dist.A++;
                else if (score >= 80) dist.B++;
                else if (score >= 70) dist.C++;
                else if (score >= 60) dist.D++;
                else dist.E++;
            }
        });

        const average = graded > 0 ? (sumScore / graded).toFixed(1) : '-';
        const progressPercent = total > 0 ? Math.round((graded / total) * 100) : 0;

        return { total, graded, average, progressPercent, dist };
    })();

    // Check if there are unsaved edits
    const hasUnsavedChanges = (() => {
        return students.some(student => {
            const local = localGrades[student.id] || { score: '', description: '' };
            const initial = grades[student.id] || { score: null, description: null };
            const initialScore = initial.score?.toString() || '';
            const initialDesc = initial.description || '';
            return local.score !== initialScore || local.description !== initialDesc;
        });
    })();

    const getLetterGrade = (score: number | null): string => {
        if (score === null) return '-';
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'E';
    };

    const getGradeBadgeStyles = (letter: string) => {
        switch (letter) {
            case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'B': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'C': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'D': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'E': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-400 border-slate-200';
        }
    };

    return (
        <TeacherLayout title="Input Nilai">
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-emerald-600 p-3 rounded-xl shadow-md shadow-emerald-200 text-white">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Input Nilai Siswa</h2>
                            <p className="text-slate-600 text-sm mt-1">Lakukan penilaian capaian belajar siswa secara cepat, terstruktur, dan terintegrasi dengan rapor.</p>
                        </div>
                    </div>
                    {students.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                data-tour="btn-config-rapor"
                                className="bg-white border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
                                onClick={() => setShowConfig(!showConfig)}
                            >
                                <Settings className="w-4 h-4 mr-2 text-slate-500" />
                                {showConfig ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                            </Button>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSaving} 
                                data-tour="btn-simpan-rapor"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 font-medium transition-all"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                {isSaving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Configuration / Filter Section */}
                {showConfig && (
                    <Card className="border-slate-200 shadow-sm transition-all duration-300">
                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-emerald-600" />
                                    Konfigurasi Kelas & Mata Pelajaran
                                </CardTitle>
                                {isFiltering && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                            </div>
                            <CardDescription>Pilih kelas, mata pelajaran, dan periode penilaian untuk memuat daftar siswa.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Kelas Ajar</Label>
                                    <Select value={classroomId} onValueChange={(v) => { setClassroomId(v); handleFilterChange(v, undefined); }}>
                                        <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                        <SelectContent>
                                            {myClassrooms.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Mata Pelajaran</Label>
                                    <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); handleFilterChange(undefined, v); }}>
                                        <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                                        <SelectContent>
                                            {mySubjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Semester & Tahun Ajaran</Label>
                                    <div className="flex gap-2">
                                        <Select value={semester} onValueChange={(v) => { setSemester(v); handleFilterChange(); }}>
                                            <SelectTrigger className="w-28 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Ganjil (1)</SelectItem>
                                                <SelectItem value="2">Genap (2)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input 
                                            value={academicYear} 
                                            onChange={(e) => setAcademicYear(e.target.value)} 
                                            onBlur={() => handleFilterChange()}
                                            placeholder="2025/2026" 
                                            className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Periode Penilaian</Label>
                                    <Select value={period} onValueChange={(v) => { setPeriod(v); handleFilterChange(); }}>
                                        <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mid">Tengah Semester (UTS)</SelectItem>
                                            <SelectItem value="final">Akhir Semester (UAS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Warning Unsaved Edits */}
                {hasUnsavedChanges && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-sm shadow-sm animate-fade-in">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <span className="font-semibold block md:inline">Perubahan Belum Disimpan!</span>
                                <span className="md:ml-2">Ada nilai siswa yang telah Anda edit tetapi belum disimpan ke database.</span>
                            </div>
                        </div>
                        <Button size="sm" onClick={handleSubmit} className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm w-full md:w-auto">
                            Simpan Perubahan
                        </Button>
                    </div>
                )}

                {/* Dashboard / Active Filtering View */}
                {isFiltering ? (
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Memuat data siswa dan nilai...</p>
                        </CardContent>
                    </Card>
                ) : students.length > 0 ? (
                    <div className="space-y-6">
                        {/* Selected Context & Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Active Configuration Summary Card */}
                            <Card className="border-slate-200 shadow-sm bg-slate-50/30 flex flex-col justify-between">
                                <CardHeader className="pb-2">
                                    <span className="text-xs uppercase font-semibold text-slate-400">Periode Aktif</span>
                                    <h3 className="text-lg font-bold text-slate-800 mt-1">
                                        Kelas {myClassrooms.find(c => c.id.toString() === classroomId)?.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm font-medium flex items-center gap-1 mt-0.5">
                                        <BookOpen className="w-4 h-4 text-emerald-600 inline" />
                                        {mySubjects.find(s => s.id.toString() === subjectId)?.name}
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md">
                                            Sem {semester === '1' ? 'Ganjil' : 'Genap'}
                                        </span>
                                        <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">
                                            TA {academicYear}
                                        </span>
                                        <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md">
                                            {period === 'mid' ? 'UTS' : 'UAS'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Analytics: Grading Progress */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-1">
                                    <span className="text-xs uppercase font-semibold text-slate-400">Progres Pengisian</span>
                                    <div className="flex items-baseline justify-between mt-1">
                                        <span className="text-2xl font-bold text-slate-800">{analytics.graded} / {analytics.total}</span>
                                        <span className="text-emerald-600 font-bold text-sm">{analytics.progressPercent}%</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div 
                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${analytics.progressPercent}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Siswa ternilai akan tercetak di lembar rapor.</p>
                                </CardContent>
                            </Card>

                            {/* Analytics: Class Average */}
                            <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
                                <CardHeader className="pb-1">
                                    <span className="text-xs uppercase font-semibold text-slate-400">Rata-Rata Kelas</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-3xl font-extrabold text-slate-800">{analytics.average}</span>
                                        <Award className="w-6 h-6 text-amber-500" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="text-xs text-slate-500">Dihitung otomatis dari nilai yang sudah masuk.</div>
                                </CardContent>
                            </Card>

                            {/* Analytics: Grade Distribution */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <span className="text-xs uppercase font-semibold text-slate-400">Distribusi Predikat</span>
                                </CardHeader>
                                <CardContent className="pt-1">
                                    <div className="flex justify-between items-center gap-2">
                                        {Object.entries(analytics.dist).map(([pred, val]) => (
                                            <div key={pred} className="flex flex-col items-center flex-1 bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-1">
                                                <span className="text-xs font-bold text-slate-500">{pred}</span>
                                                <span className={`text-sm font-extrabold mt-0.5 ${val > 0 ? 'text-slate-800' : 'text-slate-300'}`}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Grading Work Area */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                                    <CardTitle className="text-base font-bold text-slate-800">Daftar Penilaian Siswa</CardTitle>
                                </div>
                                
                                {/* Search & Quick Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
                                    <div className="relative flex-1 sm:w-64">
                                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="Cari nama siswa..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 h-9 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 shadow-none text-sm w-full"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        data-tour="btn-auto-desc"
                                        onClick={autoGenerateDescriptions}
                                        className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium h-9 text-xs flex items-center gap-1.5 shadow-none shrink-0"
                                    >
                                        <Wand2 className="w-3.5 h-3.5" />
                                        Buat Deskripsi Otomatis
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Keyboard shortcut helper bar */}
                                <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                        Ketik nilai (0-100) dan deskripsi kompetensi siswa di bawah ini.
                                    </span>
                                    <span className="hidden sm:inline">
                                        Navigasi cepat: gunakan <kbd className="px-1 bg-white border rounded shadow-sm text-slate-500 font-bold font-mono text-[9px]">↑</kbd> <kbd className="px-1 bg-white border rounded shadow-sm text-slate-500 font-bold font-mono text-[9px]">↓</kbd> atau <kbd className="px-1 bg-white border rounded shadow-sm text-slate-500 font-bold font-mono text-[9px]">Enter</kbd> untuk berpindah siswa.
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-slate-600">
                                        <thead>
                                            <tr className="border-b bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                                <th className="p-4 text-center w-12">No</th>
                                                <th className="p-4 text-left min-w-[200px]">Nama Siswa</th>
                                                <th className="p-4 text-center w-32">Nilai Akhir (0-100)</th>
                                                <th className="p-4 text-center w-20">Huruf</th>
                                                <th className="p-4 text-left">Capaian Kompetensi / Keterangan Rapor</th>
                                                <th className="p-4 text-center w-24">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map((student, index) => {
                                                    const gradeData = localGrades[student.id] || { score: '', description: '' };
                                                    const score = gradeData.score ? parseFloat(gradeData.score) : null;
                                                    const letterGrade = getLetterGrade(score);
                                                    
                                                    // Determine if changes were made
                                                    const initial = grades[student.id] || { score: null, description: null };
                                                    const initialScore = initial.score?.toString() || '';
                                                    const initialDesc = initial.description || '';
                                                    const isModified = gradeData.score !== initialScore || gradeData.description !== initialDesc;

                                                    // Validation border color
                                                    const isScoreInvalid = score !== null && (score < 0 || score > 100);
                                                    let rowBg = 'hover:bg-slate-50/50 transition-all';
                                                    if (isScoreInvalid) {
                                                        rowBg = 'bg-rose-50/20 hover:bg-rose-50/30 transition-all';
                                                    } else if (isModified) {
                                                        rowBg = 'bg-blue-50/10 hover:bg-blue-50/20 transition-all';
                                                    }

                                                    // Avatar Initials
                                                    const initials = student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                                                    return (
                                                        <tr key={student.id} className={rowBg}>
                                                            {/* Index */}
                                                            <td className="p-4 text-center text-xs text-slate-400 font-mono">
                                                                {index + 1}
                                                            </td>
                                                            
                                                            {/* Student Info */}
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border border-slate-200 uppercase">
                                                                        {initials}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-slate-800 text-sm">{student.name}</div>
                                                                        <div className="text-[10px] text-slate-400">NIS: {student.identity_number || '-'}</div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Score Input */}
                                                            <td className="p-4 text-center">
                                                                <div className="relative inline-block">
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        max={100}
                                                                        value={gradeData.score}
                                                                        onChange={(e) => updateLocalGrade(student.id, 'score', e.target.value)}
                                                                        className={`text-center w-24 h-9 font-semibold text-sm border shadow-none rounded-lg focus:ring-1 ${
                                                                            isScoreInvalid 
                                                                            ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/10' 
                                                                            : isModified 
                                                                                ? 'border-blue-400 focus:ring-blue-400 bg-blue-50/5' 
                                                                                : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                                                                        }`}
                                                                        placeholder="0-100"
                                                                        data-index={index}
                                                                        data-field="score"
                                                                        onKeyDown={(e) => handleKeyDown(e, index, 'score')}
                                                                    />
                                                                    {isScoreInvalid && (
                                                                        <span className="absolute -bottom-3 left-0 right-0 text-[8px] font-bold text-rose-500 whitespace-nowrap">
                                                                            Nilai 0 - 100
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Letter Grade Badge */}
                                                            <td className="p-4 text-center">
                                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-xs font-bold ${getGradeBadgeStyles(letterGrade)}`}>
                                                                    {letterGrade}
                                                                </span>
                                                            </td>

                                                            {/* Description Input */}
                                                            <td className="p-4">
                                                                <Input
                                                                    value={gradeData.description}
                                                                    onChange={(e) => updateLocalGrade(student.id, 'description', e.target.value)}
                                                                    placeholder="Tulis capaian kompetensi siswa yang menonjol..."
                                                                    className={`w-full h-9 border shadow-none rounded-lg focus:ring-1 text-xs ${
                                                                        isModified 
                                                                        ? 'border-blue-400 focus:ring-blue-400 bg-blue-50/5' 
                                                                        : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                                                                    }`}
                                                                    data-index={index}
                                                                    data-field="description"
                                                                    onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                                                                />
                                                            </td>

                                                            {/* Status Indicator */}
                                                            <td className="p-4 text-center">
                                                                {isModified ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                                                        Diedit
                                                                    </span>
                                                                ) : score !== null ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                                        <Check className="w-2.5 h-2.5" />
                                                                        Tersimpan
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100">
                                                                        Kosong
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                        Siswa dengan nama "{searchQuery}" tidak ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Step 1: Configuration Required State */
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Settings className="w-4.5 h-4.5 text-emerald-600" />
                                    Langkah Pertama: Pilih Parameter
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Silakan pilih kelas, mata pelajaran, dan periode penilaian di bawah untuk memuat lembar kerja.</p>
                            </div>
                        </div>
                        <CardContent className="pt-8 pb-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-6">
                                <FileSpreadsheet className="w-10 h-10" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Lembar Penilaian Belum Dimuat</h4>
                            <p className="text-slate-500 text-sm mt-2 mb-8">
                                Anda harus menentukan parameter kelas ajar dan mata pelajaran Anda untuk memuat daftar nama siswa dan riwayat penilaian yang tersimpan.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 w-full text-left">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Kelas</Label>
                                    <Select value={classroomId} onValueChange={(v) => { setClassroomId(v); handleFilterChange(v, undefined); }}>
                                        <SelectTrigger className="border-slate-200"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                        <SelectContent>
                                            {myClassrooms.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Mata Pelajaran</Label>
                                    <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); handleFilterChange(undefined, v); }}>
                                        <SelectTrigger className="border-slate-200"><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                                        <SelectContent>
                                            {mySubjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </TeacherLayout>
    );
}
