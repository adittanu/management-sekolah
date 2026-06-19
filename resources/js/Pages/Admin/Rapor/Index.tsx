import AdminLayout from '@/Layouts/AdminLayout';
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
    Info, 
    Plus, 
    Trash2,
    Search,
    Award,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Wand2,
    Check,
    Settings,
    ChevronDown,
    ChevronUp,
    FileSpreadsheet,
    Calendar,
    MapPin
} from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code?: string;
    teachers?: Teacher[];
}

interface Classroom {
    id: number;
    name: string;
}

interface Teacher {
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

interface RaportEntry {
    cocurricular: string;
    extracurricular: Array<{ name: string; description: string }>;
    teacher_notes: string;
    raport_place: string;
    raport_date: string;
}

interface Props {
    classrooms: Classroom[];
    subjects: Subject[];
    teachers: Teacher[];
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

export default function Index({ classrooms, subjects, teachers, students, grades, filters }: Props) {
    const [classroomId, setClassroomId] = useState(filters.classroom_id || '');
    const [subjectId, setSubjectId] = useState(filters.subject_id || '');
    const [semester, setSemester] = useState(filters.semester.toString());
    const [academicYear, setAcademicYear] = useState(filters.academic_year);
    const [period, setPeriod] = useState(filters.period || 'final');
    const [activeTab, setActiveTab] = useState<'nilai' | 'raport'>('nilai');
    const [isFiltering, setIsFiltering] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [localGrades, setLocalGrades] = useState<Record<number, { score: string; description: string }>>({});
    const [raportEntries, setRaportEntries] = useState<Record<number, RaportEntry>>({});
    const [globalRaportPlace, setGlobalRaportPlace] = useState('');
    const [globalRaportDate, setGlobalRaportDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showConfig, setShowConfig] = useState(!filters.classroom_id || !filters.subject_id);
    const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

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

    const handleFilterChange = (overrides?: { classroomId?: string; subjectId?: string; semester?: string; academicYear?: string; period?: string }) => {
        const cid = overrides?.classroomId ?? classroomId;
        const sid = overrides?.subjectId ?? subjectId;
        const sem = overrides?.semester ?? semester;
        const acYear = overrides?.academicYear ?? academicYear;
        const prd = overrides?.period ?? period;

        if (cid && sid) {
            setIsFiltering(true);
            router.get(route('admin.rapor.input'), {
                classroom_id: cid,
                subject_id: sid,
                semester: sem,
                academic_year: acYear,
                period: prd,
            }, { 
                preserveState: true, 
                onFinish: () => {
                    setIsFiltering(false);
                    setShowConfig(false);
                } 
            });
        }
    };

    const initRaportEntry = (studentId: number) => {
        if (!raportEntries[studentId]) {
            setRaportEntries(prev => ({
                ...prev,
                [studentId]: { cocurricular: '', extracurricular: [], teacher_notes: '', raport_place: '', raport_date: '' },
            }));
        }
    };

    const updateRaportEntry = (studentId: number, field: keyof RaportEntry, value: any) => {
        initRaportEntry(studentId);
        setRaportEntries(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value },
        }));
    };

    const addExtracurricular = (studentId: number) => {
        initRaportEntry(studentId);
        setRaportEntries(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                extracurricular: [...prev[studentId].extracurricular, { name: '', description: '' }],
            },
        }));
    };

    const updateExtracurricular = (studentId: number, index: number, field: 'name' | 'description', value: string) => {
        const updated = [...(raportEntries[studentId]?.extracurricular || [])];
        updated[index] = { ...updated[index], [field]: value };
        setRaportEntries(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], extracurricular: updated },
        }));
    };

    const removeExtracurricular = (studentId: number, index: number) => {
        const updated = [...(raportEntries[studentId]?.extracurricular || [])];
        updated.splice(index, 1);
        setRaportEntries(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], extracurricular: updated },
        }));
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

    const handleSubmitNilai = () => {
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
        router.post(route('admin.rapor.store'), {
            classroom_id: parseInt(classroomId),
            subject_id: parseInt(subjectId),
            academic_year: academicYear,
            semester: parseInt(semester),
            period: period,
            grades: gradesArray,
        }, {
            onSuccess: () => toast.success('Nilai berhasil disimpan ke database'),
            onError: () => toast.error('Gagal menyimpan nilai. Silakan periksa kembali input Anda'),
            onFinish: () => setIsSaving(false),
        });
    };

    const handleSubmitRaportData = () => {
        if (!classroomId) {
            toast.error('Pilih kelas terlebih dahulu');
            return;
        }

        const entries = Object.entries(raportEntries).map(([studentId, data]) => ({
            student_id: parseInt(studentId),
            cocurricular: data.cocurricular || null,
            extracurricular: data.extracurricular.length > 0 ? data.extracurricular.filter(e => e.name) : null,
            teacher_notes: data.teacher_notes || null,
            raport_place: data.raport_place || null,
            raport_date: data.raport_date || null,
        })).filter(e => e.cocurricular || e.extracurricular || e.teacher_notes);

        if (entries.length === 0 && !globalRaportPlace && !globalRaportDate) {
            toast.error('Masukkan minimal satu data raport atau tempat & tanggal');
            return;
        }

        setIsSaving(true);
        router.post(route('admin.rapor.store-raport-data'), {
            classroom_id: parseInt(classroomId),
            academic_year: academicYear,
            semester: parseInt(semester),
            report_type: period, // Maps period UTS/UAS directly to report_type
            raport_entries: entries,
            raport_place: globalRaportPlace || null,
            raport_date: globalRaportDate || null,
        }, {
            onSuccess: () => toast.success('Data pelengkap raport berhasil disimpan'),
            onError: () => toast.error('Gagal menyimpan data pelengkap. Silakan coba kembali'),
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
                const mapelName = subjects.find(s => s.id.toString() === subjectId)?.name || 'Mata Pelajaran';
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

    const getLetterGrade = (score: number | null): string => {
        if (score === null || score === undefined) return '-';
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

    // Filtering students list client-side
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

    // Check for unsaved changes
    const hasUnsavedChanges = (() => {
        if (activeTab === 'nilai') {
            return students.some(student => {
                const local = localGrades[student.id] || { score: '', description: '' };
                const initial = grades[student.id] || { score: null, description: null };
                const initialScore = initial.score?.toString() || '';
                const initialDesc = initial.description || '';
                return local.score !== initialScore || local.description !== initialDesc;
            });
        } else {
            return Object.keys(raportEntries).length > 0;
        }
    })();

    return (
        <AdminLayout title="Input Nilai & Data Rapor">
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-emerald-600 p-3 rounded-xl shadow-md shadow-emerald-200 text-white">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Input Nilai & Rapor</h2>
                            <p className="text-slate-600 text-sm mt-1">Kelola penilaian siswa, capaian kompetensi, kokurikuler, dan catatan wali kelas sebagai administrator.</p>
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
                            
                            {activeTab === 'nilai' ? (
                                <Button 
                                    onClick={handleSubmitNilai} 
                                    disabled={isSaving} 
                                    data-tour="btn-simpan-rapor"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 font-medium transition-all"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isSaving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleSubmitRaportData} 
                                    disabled={isSaving} 
                                    data-tour="btn-simpan-rapor"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 font-medium transition-all"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isSaving ? 'Menyimpan...' : 'Simpan Data Rapor'}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Filters */}
                {showConfig && (
                    <Card className="border-slate-200 shadow-sm transition-all duration-300">
                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-emerald-600" />
                                    Filter Pembelajaran & Periode
                                </CardTitle>
                                {isFiltering && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                            </div>
                            <CardDescription>Pilih kelas, mata pelajaran, dan periode untuk memuat lembar kerja penilaian.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Kelas</Label>
                                    <Select value={classroomId} onValueChange={(v) => { setClassroomId(v); handleFilterChange({ classroomId: v }); }}>
                                        <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                        <SelectContent>
                                            {classrooms.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Mata Pelajaran</Label>
                                    <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); handleFilterChange({ subjectId: v }); }}>
                                        <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Semester</Label>
                                    <Select value={semester} onValueChange={(v) => { setSemester(v); handleFilterChange({ semester: v }); }}>
                                        <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Ganjil (1)</SelectItem>
                                            <SelectItem value="2">Genap (2)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Periode</Label>
                                    <Select value={period} onValueChange={(v) => { setPeriod(v); handleFilterChange({ period: v }); }}>
                                        <SelectTrigger className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mid">Tengah Semester (UTS)</SelectItem>
                                            <SelectItem value="final">Akhir Semester (UAS)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Tahun Ajaran</Label>
                                    <Input 
                                        value={academicYear} 
                                        onChange={(e) => setAcademicYear(e.target.value)} 
                                        onBlur={() => handleFilterChange()}
                                        placeholder="2025/2026" 
                                        className="border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Warning Unsaved */}
                {hasUnsavedChanges && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-sm shadow-sm">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <span className="font-semibold block md:inline">Perubahan Belum Disimpan!</span>
                                <span className="md:ml-2">Ada data penilaian yang Anda edit tetapi belum dikirim ke database.</span>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={activeTab === 'nilai' ? handleSubmitNilai : handleSubmitRaportData} 
                            className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm w-full md:w-auto"
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                )}

                {isFiltering ? (
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Memuat data siswa...</p>
                        </CardContent>
                    </Card>
                ) : students.length > 0 ? (
                    <div className="space-y-6">
                        {/* Tab Switcher & Stats */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    data-tour="tab-nilai"
                                    onClick={() => setActiveTab('nilai')}
                                    className={`rounded-lg px-4 font-semibold text-xs transition-all h-8 ${
                                        activeTab === 'nilai' 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                    Input Nilai Akademik
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    data-tour="tab-catatan-raport"
                                    onClick={() => setActiveTab('raport')}
                                    className={`rounded-lg px-4 font-semibold text-xs transition-all h-8 ${
                                        activeTab === 'raport' 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Info className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                                    Catatan & Ekskul Rapor
                                </Button>
                            </div>
                        </div>

                        {/* Active Selection Details Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Card className="border-slate-200 shadow-sm bg-slate-50/30 flex flex-col justify-between">
                                <CardHeader className="pb-2">
                                    <span className="text-xs uppercase font-semibold text-slate-400">Parameter Aktif</span>
                                    <h3 className="text-lg font-bold text-slate-800 mt-1">
                                        Kelas {classrooms.find(c => c.id.toString() === classroomId)?.name}
                                    </h3>
                                    <p className="text-slate-600 text-sm font-medium flex items-center gap-1 mt-0.5">
                                        <BookOpen className="w-4 h-4 text-emerald-600 inline" />
                                        {subjects.find(s => s.id.toString() === subjectId)?.name}
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                                            Sem {semester === '1' ? 'Ganjil' : 'Genap'}
                                        </span>
                                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                                            TA {academicYear}
                                        </span>
                                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
                                            {period === 'mid' ? 'UTS' : 'UAS'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stats 2: Progres */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-1">
                                    <span className="text-xs uppercase font-semibold text-slate-400">Progres Penilaian</span>
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
                                    <p className="text-xs text-slate-500 mt-2">Menampilkan progres input nilai akademik siswa.</p>
                                </CardContent>
                            </Card>

                            {/* Stats 3: Rata-Rata */}
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

                            {/* Stats 4: Predikat */}
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <span className="text-xs uppercase font-semibold text-slate-400">Distribusi Predikat</span>
                                </CardHeader>
                                <CardContent className="pt-1">
                                    <div className="flex justify-between items-center gap-1.5">
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

                        {/* TAB 1: INPUT NILAI AKADEMIK */}
                        {activeTab === 'nilai' && (
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                                        <CardTitle className="text-base font-bold text-slate-800">Daftar Nilai Siswa</CardTitle>
                                    </div>
                                    
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
                                    {/* Keyboard Navigation Helper */}
                                    <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Gunakan kolom di bawah untuk mengedit nilai akhir (0-100) dan catatan kompetensi siswa.</span>
                                        <span className="hidden sm:inline">Navigasi: <kbd className="px-1 bg-white border rounded shadow-sm text-slate-500">↑</kbd> <kbd className="px-1 bg-white border rounded shadow-sm text-slate-500">↓</kbd> atau <kbd className="px-1 bg-white border rounded shadow-sm text-slate-500">Enter</kbd></span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-slate-600">
                                            <thead>
                                                <tr className="border-b bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                                    <th className="p-4 text-center w-12">No</th>
                                                    <th className="p-4 text-left min-w-[200px]">Nama Siswa</th>
                                                    <th className="p-4 text-center w-32">Nilai Akhir (0-100)</th>
                                                    <th className="p-4 text-center w-20">Predikat</th>
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

                                                        const isScoreInvalid = score !== null && (score < 0 || score > 100);
                                                        let rowBg = 'hover:bg-slate-50/50 transition-all';
                                                        if (isScoreInvalid) {
                                                            rowBg = 'bg-rose-50/20 hover:bg-rose-50/30 transition-all';
                                                        } else if (isModified) {
                                                            rowBg = 'bg-blue-50/10 hover:bg-blue-50/20 transition-all';
                                                        }

                                                        const initials = student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                                                        return (
                                                            <tr key={student.id} className={rowBg}>
                                                                <td className="p-4 text-center text-xs text-slate-400 font-mono">{index + 1}</td>
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border border-slate-200 uppercase">{initials}</div>
                                                                        <div>
                                                                            <div className="font-semibold text-slate-800 text-sm">{student.name}</div>
                                                                            <div className="text-[10px] text-slate-400">NIS: {student.identity_number || '-'}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
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
                                                                            <span className="absolute -bottom-3 left-0 right-0 text-[8px] font-bold text-rose-500 whitespace-nowrap">Nilai 0 - 100</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-xs font-bold ${getGradeBadgeStyles(letterGrade)}`}>
                                                                        {letterGrade}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4">
                                                                    <Input
                                                                        value={gradeData.description}
                                                                        onChange={(e) => updateLocalGrade(student.id, 'description', e.target.value)}
                                                                        placeholder="Tulis capaian kompetensi siswa yang menonjol..."
                                                                        className={`w-full h-9 border shadow-none rounded-lg focus:ring-1 text-xs ${
                                                                            isModified 
                                                                            ? 'border-blue-400 focus:ring-blue-400 bg-blue-50/5' 
                                                                            : 'border-slate-200 focus:ring-emerald-500'
                                                                        }`}
                                                                        data-index={index}
                                                                        data-field="description"
                                                                        onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                                                                    />
                                                                </td>
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
                                                            Siswa tidak ditemukan.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* TAB 2: DATA PELENGKAP RAPOR */}
                        {activeTab === 'raport' && (
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <CardTitle className="text-base font-bold text-slate-800">Catatan Wali Kelas & Ekskul</CardTitle>
                                            <CardDescription className="text-xs text-slate-500 mt-0.5">Lengkapi tempat tanda tangan, tanggal cetak rapor, kokurikuler, ekskul, dan catatan wali kelas.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    {/* Global Raport Config */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border border-blue-100/50 rounded-2xl shadow-sm">
                                        <div className="space-y-1.5">
                                            <Label className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                                Tempat Penerbitan Rapor (Kota)
                                            </Label>
                                            <Input
                                                value={globalRaportPlace}
                                                onChange={(e) => setGlobalRaportPlace(e.target.value)}
                                                placeholder="Contoh: Jakarta Selatan"
                                                className="border-slate-200 focus:ring-blue-500 focus:border-blue-500 h-9 bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                Tanggal Penerbitan Rapor
                                            </Label>
                                            <Input
                                                type="date"
                                                value={globalRaportDate}
                                                onChange={(e) => setGlobalRaportDate(e.target.value)}
                                                className="border-slate-200 focus:ring-blue-500 focus:border-blue-500 h-9 bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Accordion List of Students */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                                            <span>Daftar Siswa ({filteredStudents.length} orang)</span>
                                            <span>Klik baris siswa untuk membuka form detail</span>
                                        </div>

                                        {filteredStudents.map((student, index) => {
                                            const entry = raportEntries[student.id] || {
                                                cocurricular: '', extracurricular: [], teacher_notes: '', raport_place: '', raport_date: '',
                                            };
                                            const isExpanded = expandedStudentId === student.id;
                                            
                                            // Badges for fill status
                                            const exCount = entry.extracurricular.length;
                                            const hasCocurr = entry.cocurricular.trim().length > 0;
                                            const hasNotes = entry.teacher_notes.trim().length > 0;

                                            return (
                                                <div 
                                                    key={student.id} 
                                                    className={`border rounded-xl transition-all ${
                                                        isExpanded 
                                                        ? 'border-blue-300 ring-1 ring-blue-100 bg-white' 
                                                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/20'
                                                    }`}
                                                >
                                                    {/* Header (Trigger) */}
                                                    <div 
                                                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                                                        onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 border border-slate-200 uppercase">
                                                                {student.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-800 text-sm">{index + 1}. {student.name}</h4>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {hasCocurr ? (
                                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Kokurikuler: {entry.cocurricular}</span>
                                                                    ) : (
                                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-100">Belum ada kokurikuler</span>
                                                                    )}
                                                                    
                                                                    {hasNotes ? (
                                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Catatan Terisi</span>
                                                                    ) : (
                                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-100">Belum ada catatan</span>
                                                                    )}

                                                                    {exCount > 0 ? (
                                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">{exCount} Ekskul</span>
                                                                    ) : (
                                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-100">0 Ekskul</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-slate-400">
                                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Form Body */}
                                                    {isExpanded && (
                                                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                                            {/* Left: Kokurikuler & Notes */}
                                                            <div className="space-y-4">
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-slate-600 text-xs font-semibold">Kegiatan Kokurikuler</Label>
                                                                    <Input
                                                                        value={entry.cocurricular}
                                                                        onChange={(e) => updateRaportEntry(student.id, 'cocurricular', e.target.value)}
                                                                        placeholder="Contoh: Projek Penguatan Profil Pelajar Pancasila (P5)"
                                                                        className="border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-xs h-9 bg-white"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-slate-600 text-xs font-semibold">Catatan Wali Kelas / Perkembangan Karakter</Label>
                                                                    <textarea
                                                                        className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg p-3 text-xs bg-white min-h-[90px] outline-none shadow-none text-slate-700"
                                                                        value={entry.teacher_notes}
                                                                        onChange={(e) => updateRaportEntry(student.id, 'teacher_notes', e.target.value)}
                                                                        placeholder="Tuliskan catatan kemajuan belajar, motivasi, atau saran pembinaan karakter untuk siswa ini..."
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Right: Extracurricular Activities */}
                                                            <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="text-slate-700 font-bold text-xs">Kegiatan Ekstrakurikuler</Label>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md shadow-none px-2.5"
                                                                        onClick={() => addExtracurricular(student.id)}
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Ekskul
                                                                    </Button>
                                                                </div>

                                                                {entry.extracurricular.length > 0 ? (
                                                                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                                                                        {entry.extracurricular.map((ex, exIdx) => (
                                                                            <div key={exIdx} className="flex gap-2 items-center bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                                                                                <Input
                                                                                    value={ex.name}
                                                                                    onChange={(e) => updateExtracurricular(student.id, exIdx, 'name', e.target.value)}
                                                                                    placeholder="Nama Ekskul (misal: Pramuka)"
                                                                                    className="flex-1 h-8 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-xs px-2.5"
                                                                                />
                                                                                <Input
                                                                                    value={ex.description}
                                                                                    onChange={(e) => updateExtracurricular(student.id, exIdx, 'description', e.target.value)}
                                                                                    placeholder="Keterangan predikat/nilai"
                                                                                    className="flex-1 h-8 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-xs px-2.5"
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
                                                                                    onClick={() => removeExtracurricular(student.id, exIdx)}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-xs text-slate-400 bg-white">
                                                                        Belum ada kegiatan ekstrakurikuler yang ditambahkan.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Step 1: Config Needed State */
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Settings className="w-4.5 h-4.5 text-emerald-600" />
                                    Langkah Pertama: Konfigurasi Pembelajaran
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Silakan pilih parameter kelas, mata pelajaran, dan periode penilaian di bawah.</p>
                            </div>
                        </div>
                        <CardContent className="pt-8 pb-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-6">
                                <FileSpreadsheet className="w-10 h-10" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800">Lembar Penilaian Belum Dimuat</h4>
                            <p className="text-slate-500 text-sm mt-2 mb-8">
                                Anda harus menentukan filter kelas ajar, mata pelajaran, dan periode terlebih dahulu untuk memuat lembar kerja nilai dan data pelengkap rapor.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 w-full text-left">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Kelas</Label>
                                    <Select value={classroomId} onValueChange={(v) => { setClassroomId(v); handleFilterChange({ classroomId: v }); }}>
                                        <SelectTrigger className="border-slate-200"><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                                        <SelectContent>
                                            {classrooms.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Mata Pelajaran</Label>
                                    <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); handleFilterChange({ subjectId: v }); }}>
                                        <SelectTrigger className="border-slate-200"><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
