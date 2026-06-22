import ParentLayout from '@/Layouts/ParentLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useState, useRef } from 'react';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { 
    Award, 
    Download, 
    Printer, 
    User, 
    Loader2, 
    BookOpen, 
    Calendar, 
    MapPin, 
    School, 
    CheckCircle, 
    Info, 
    Star, 
    MessageSquare,
    Compass,
    ChevronDown,
    History,
    SlidersHorizontal,
    UserCheck
} from 'lucide-react';
import { printRaport } from '@/lib/raportPrint';

interface Student {
    id: number;
    name: string;
    email?: string;
    identity_number?: string;
    address?: string;
}

interface SubjectGrade {
    subject: string;
    daily: number | null;
    mid: number | null;
    final: number | null;
    average: number | null;
    daily_desc: string | null;
    mid_desc: string | null;
    final_desc: string | null;
}

interface RaportData {
    student: Student;
    classroom: { id: number; name: string; fase?: string };
    subjects: SubjectGrade[];
    average: number;
    academic_year: string;
    semester: number;
    attendance?: {
        hadir: number;
        sakit: number;
        izin: number;
        alpha: number;
        total: number;
    };
    cocurricular?: string;
    extracurricular?: Array<{ name: string; description: string }>;
    teacher_notes?: string;
    parent_notes?: string;
    raport_place?: string;
    raport_date?: string;
    report_type?: string;
}

interface Props {
    children: Student[];
    raportData: RaportData | null;
    filters: {
        semester: number;
        academic_year: string;
        student_id: string | null;
        report_type?: string;
    };
    raportHistory?: Array<{
        academic_year: string;
        semester: number;
        semester_label: string;
        academic_year_label: string;
    }>;
}

export default function Raport({ children, raportData, raportHistory = [], filters }: Props) {
    const { school_settings } = usePage<any>().props;
    const [studentId, setStudentId] = useState(filters.student_id || '');
    const [semester, setSemester] = useState(filters.semester.toString());
    const [academicYear, setAcademicYear] = useState(filters.academic_year);
    const [reportType, setReportType] = useState(filters.report_type || 'final');
    const [isFiltering, setIsFiltering] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isManualFilterOpen, setIsManualFilterOpen] = useState(false);
    const raportRef = useRef<HTMLDivElement>(null);

    const handleFilterChange = (overrides?: { studentId?: string; semester?: string; academicYear?: string; reportType?: string }) => {
        setIsFiltering(true);
        router.get(route('orangtua.rapor'), {
            student_id: overrides?.studentId ?? studentId,
            semester: overrides?.semester ?? semester,
            academic_year: overrides?.academicYear ?? academicYear,
            report_type: overrides?.reportType ?? reportType,
        }, { preserveState: true, onFinish: () => setIsFiltering(false) });
    };

    const handlePrint = () => {
        if (!raportData) return;
        printRaport(raportData, toast, school_settings);
    };

    const handleDownloadPdf = () => {
        if (!raportData) return;
        setIsDownloadingPdf(true);
        const params = new URLSearchParams({
            student_id: studentId?.toString() || '',
            semester: semester,
            academic_year: academicYear,
            report_type: reportType,
        });
        window.location.href = route('orangtua.rapor.export-pdf') + '?' + params.toString();
        setTimeout(() => setIsDownloadingPdf(false), 3000);
    };

    const buildDescription = (subj: SubjectGrade): string => {
        const parts: string[] = [];
        if (subj.daily_desc) parts.push(subj.daily_desc);
        if (subj.mid_desc) parts.push(subj.mid_desc);
        if (subj.final_desc) parts.push(subj.final_desc);
        return parts.join('. ');
    };

    const getSemesterLabel = (sem: number): string => {
        return sem === 1 ? 'Ganjil (I)' : 'Genap (II)';
    };

    return (
        <ParentLayout title="Raport Anak">
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-600 p-3 rounded-xl shadow-md shadow-indigo-200 text-white">
                            <Award className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Raport Perkembangan Anak</h2>
                            <p className="text-slate-600 text-sm mt-1">Pantau prestasi belajar akademis, riwayat kehadiran, serta ekskul anak Anda secara transparan.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column - Sidebar Filters */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Child Selection Card */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-indigo-600" />
                                    Pilih Anak
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Tentukan anak untuk memuat lembar rapor perkembangan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-600 text-xs font-semibold">Nama Anak</Label>
                                    <Select value={studentId} onValueChange={(v) => { setStudentId(v); setTimeout(() => handleFilterChange({ studentId: v }), 100); }}>
                                        <SelectTrigger className="border-slate-200"><SelectValue placeholder="Pilih Anak" /></SelectTrigger>
                                        <SelectContent>
                                            {children.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Riwayat Rapor Card */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <History className="w-4 h-4 text-indigo-600" />
                                    Riwayat Rapor Anak
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Pilih periode rapor dari riwayat yang telah disimpan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {!studentId ? (
                                    <div className="text-center py-4 text-slate-400 text-xs font-medium">
                                        Silakan pilih nama anak terlebih dahulu.
                                    </div>
                                ) : raportHistory.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {raportHistory.map((item, index) => {
                                            const isActive = semester === item.semester.toString() && academicYear === item.academic_year;
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSemester(item.semester.toString());
                                                        setAcademicYear(item.academic_year);
                                                        setTimeout(() => handleFilterChange({ semester: item.semester.toString(), academicYear: item.academic_year }), 100);
                                                    }}
                                                    className={`w-full justify-start text-xs font-semibold py-1.5 px-3 h-auto border transition-all ${
                                                        isActive
                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 hover:text-indigo-800'
                                                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                                                    <span className="truncate">{item.academic_year_label} - {item.semester_label}</span>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-slate-400 text-xs font-medium">
                                        Belum ada riwayat rapor tersimpan.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Collapsible Manual Filter Card */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setIsManualFilterOpen(!isManualFilterOpen)}
                                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                            >
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                                    Filter Manual
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isManualFilterOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isManualFilterOpen && (
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600 text-xs font-semibold">Semester</Label>
                                        <Select value={semester} onValueChange={(v) => setSemester(v)}>
                                            <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Ganjil (1)</SelectItem>
                                                <SelectItem value="2">Genap (2)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600 text-xs font-semibold">Periode Rapor</Label>
                                        <Select value={reportType} onValueChange={(v) => setReportType(v)}>
                                            <SelectTrigger className="border-slate-200"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mid">Tengah Semester</SelectItem>
                                                <SelectItem value="final">Akhir Semester</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-600 text-xs font-semibold">Tahun Ajaran</Label>
                                        <Input
                                            value={academicYear}
                                            onChange={(e) => setAcademicYear(e.target.value)}
                                            placeholder="2025/2026"
                                            className="border-slate-200"
                                        />
                                    </div>
                                    <Button onClick={() => handleFilterChange()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium w-full shadow-sm text-xs">
                                        Terapkan Filter Manual
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Right Column - Preview Area */}
                    <div className="space-y-6 lg:col-span-2">
                        {isFiltering ? (
                            <Card className="border-slate-200 shadow-sm">
                                <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                                    <p className="text-slate-500 font-medium">Memuat data rapor anak...</p>
                                </CardContent>
                            </Card>
                        ) : (raportData && raportHistory.some(h => h.semester.toString() === semester && h.academic_year === academicYear)) ? (
                            <div className="space-y-6">
                                {/* Actions Row */}
                                <div className="flex gap-2 justify-end">
                                    <Button onClick={handlePrint} data-tour="btn-cetak-rapor" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-100 transition-all text-xs">
                                        <Printer className="w-4 h-4 mr-2" />
                                        Cetak Rapor
                                    </Button>
                                    <Button onClick={handleDownloadPdf} data-tour="btn-unduh-rapor-pdf" variant="outline" disabled={isDownloadingPdf} className="border-slate-200 bg-white hover:bg-slate-50 shadow-sm text-slate-700 transition-all text-xs">
                                        {isDownloadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                        {isDownloadingPdf ? 'Mengunduh...' : 'Unduh PDF'}
                                    </Button>
                                </div>

                                {/* Classic A4 Style Report Preview Sheet */}
                                <div className="bg-white border border-slate-300 shadow-lg p-[15mm] max-w-[210mm] mx-auto text-slate-800 font-sans text-xs leading-normal">
                                    <div ref={raportRef}>
                                        {/* Profile Information Block */}
                                        <table className="w-full border-collapse mb-4 text-xs font-sans">
                                            <tbody>
                                                <tr>
                                                    <td className="border-none py-1 w-1/2 align-top">
                                                        <table className="w-full border-collapse">
                                                            <tbody>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold w-[120px] text-slate-500">Nama Murid</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">{raportData.student.name}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold text-slate-500">NIS</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">{raportData.student.identity_number || '-'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold text-slate-500">Sekolah</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">{school_settings?.name || 'Nama Sekolah'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold text-slate-500">Alamat</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">{raportData.student.address || '-'}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                    <td className="border-none py-1 w-1/2 align-top">
                                                        <table className="w-full border-collapse">
                                                            <tbody>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold w-[120px] text-slate-500">Kelas</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">{raportData.classroom.name}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold text-slate-500">Fase</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">
                                                                        {raportData.report_type === 'mid' ? 'Ujian Tengah Semester' : 'Ujian Akhir Semester'}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold text-slate-500">Semester</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">{getSemesterLabel(raportData.semester)}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border-none py-0.5 font-bold text-slate-500">Tahun Ajaran</td>
                                                                    <td className="border-none py-0.5 w-[15px] text-slate-400">:</td>
                                                                    <td className="border-none py-0.5 font-semibold text-slate-800">{raportData.academic_year}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Academic Grades Table */}
                                        <table className="w-full border-collapse border border-slate-300 mb-5 text-xs font-sans">
                                            <thead>
                                                <tr className="bg-slate-100">
                                                    <th className="border border-slate-300 p-2 text-center w-[35px] font-semibold text-slate-700">No</th>
                                                    <th className="border border-slate-300 p-2 text-left font-semibold text-slate-700">Mata Pelajaran</th>
                                                    <th className="border border-slate-300 p-2 text-center w-[80px] font-semibold text-slate-700">Nilai Akhir</th>
                                                    <th className="border border-slate-300 p-2 text-left font-semibold text-slate-700">Capaian Kompetensi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {raportData.subjects.map((subj, index) => {
                                                    const desc = buildDescription(subj);
                                                    return (
                                                        <tr key={index} className="hover:bg-slate-50/20">
                                                            <td className="border border-slate-300 p-2 text-center font-mono text-[11px]">{index + 1}</td>
                                                            <td className="border border-slate-300 p-2 text-left font-semibold text-slate-800">{subj.subject}</td>
                                                            <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">{subj.average ?? '-'}</td>
                                                            <td className="border border-slate-300 p-2 text-left text-[11px] leading-relaxed text-slate-600">{desc || '-'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        {/* Cocurricular Block */}
                                        <div className="mb-5">
                                            <table className="w-full border-collapse border border-slate-300 text-xs font-sans">
                                                <tbody>
                                                    <tr className="bg-slate-100">
                                                        <td className="border border-slate-300 p-2 font-bold text-left text-slate-700">Kokurikuler (Projek Penguatan Profil Pelajar Pancasila / P5)</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-slate-300 p-2 leading-relaxed text-slate-600">{raportData.cocurricular || '-'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Extracurriculars Table */}
                                        <div className="mb-5">
                                            <table className="w-full border-collapse border border-slate-300 text-xs font-sans">
                                                <thead>
                                                    <tr className="bg-slate-100">
                                                        <th className="border border-slate-300 p-2 text-center w-[35px] font-semibold text-slate-700">No</th>
                                                        <th className="border border-slate-300 p-2 text-left font-semibold text-slate-700">Ekstrakurikuler</th>
                                                        <th className="border border-slate-300 p-2 text-left font-semibold text-slate-700">Keterangan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {raportData.extracurricular && raportData.extracurricular.length > 0 ? (
                                                        raportData.extracurricular.map((extra, index) => (
                                                            <tr key={index}>
                                                                <td className="border border-slate-300 p-2 text-center font-mono">{index + 1}</td>
                                                                <td className="border border-slate-300 p-2 text-left font-semibold text-slate-800">{extra.name}</td>
                                                                <td className="border border-slate-300 p-2 text-left text-slate-600 leading-relaxed">{extra.description}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="border border-slate-300 p-2 text-center text-slate-400 font-medium">- Tidak ada kegiatan ekstrakurikuler terdaftar -</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Attendance & Notes Block */}
                                        <table className="w-full border-collapse mb-5 text-xs font-sans border-none">
                                            <tbody>
                                                <tr>
                                                    {/* Ketidakhadiran */}
                                                    <td className="w-[48%] align-top pr-[2%] border-none p-0">
                                                        <table className="w-full border-collapse border border-slate-300">
                                                            <tbody>
                                                                <tr className="bg-slate-100">
                                                                    <td colSpan={2} className="border border-slate-300 p-2 font-bold text-slate-700">Ketidakhadiran</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border border-slate-300 p-2 text-slate-600">Sakit</td>
                                                                    <td className="border border-slate-300 p-2 text-right font-semibold text-slate-800">{raportData.attendance?.sakit ?? 0} hari</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border border-slate-300 p-2 text-slate-600">Izin</td>
                                                                    <td className="border border-slate-300 p-2 text-right font-semibold text-slate-800">{raportData.attendance?.izin ?? 0} hari</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border border-slate-300 p-2 text-slate-600">Tanpa Keterangan (Alpha)</td>
                                                                    <td className="border border-slate-300 p-2 text-right font-semibold text-slate-800">{raportData.attendance?.alpha ?? 0} hari</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                    {/* Catatan Wali Kelas */}
                                                    <td className="w-[52%] align-top border-none p-0">
                                                        <table className="w-full border-collapse border border-slate-300">
                                                            <tbody>
                                                                <tr className="bg-slate-100">
                                                                    <td className="border border-slate-300 p-2 font-bold text-slate-700">Catatan Wali Kelas</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border border-slate-300 p-2 h-[100px] align-top italic leading-relaxed text-slate-600">
                                                                        {raportData.teacher_notes || 'Belum ada catatan wali kelas.'}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Parent Feedback Block */}
                                        <div className="mb-5">
                                            <table className="w-full border-collapse border border-slate-300 text-xs font-sans">
                                                <tbody>
                                                    <tr className="bg-slate-100">
                                                        <td className="border border-slate-300 p-2 font-bold text-slate-700">Tanggapan Orang Tua / Wali Murid</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-slate-300 p-2 h-[80px] align-top italic leading-relaxed text-slate-600">
                                                            {raportData.parent_notes || 'Belum ada tanggapan orang tua/wali murid.'}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Signatures Block */}
                                        <div className="mt-8 text-xs font-sans pt-4">
                                            <table className="w-full border-collapse table-fixed">
                                                <tbody>
                                                    <tr>
                                                        <td className="text-center align-top border-none p-0 w-1/3">
                                                            <div className="h-[100px]"></div>
                                                            <div className="w-[85%] mx-auto border-t border-slate-400 pt-1.5 font-bold text-slate-700">
                                                                Orang Tua Murid
                                                            </div>
                                                        </td>
                                                        <td className="text-center align-top border-none p-0 w-1/3">
                                                            <p className="text-center m-0 mb-1 text-slate-400 text-[10px]">Mengetahui,</p>
                                                            <div className="h-[81px]"></div>
                                                            <div className="w-[85%] mx-auto border-t border-slate-400 pt-1.5">
                                                                <strong className="font-bold text-slate-700">Kepala Sekolah</strong>
                                                                {school_settings?.headmaster_name && <p className="m-0.5 font-bold text-slate-800">{school_settings.headmaster_name}</p>}
                                                                {school_settings?.headmaster_id && <p className="m-0 text-[10px] text-slate-400">NIP. {school_settings.headmaster_id}</p>}
                                                            </div>
                                                        </td>
                                                        <td className="text-center align-top border-none p-0 w-1/3">
                                                            <p className="text-right m-0 mb-1 text-slate-400 text-[10px]">
                                                                {raportData.raport_place && raportData.raport_date ? `${raportData.raport_place}, ${raportData.raport_date}` : 'Tempat, Tanggal Rapor'}
                                                            </p>
                                                            <div className="h-[81px]"></div>
                                                            <div className="w-[85%] mx-auto border-t border-slate-400 pt-1.5 font-bold text-slate-700">
                                                                Wali Kelas
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Setup Instruction Empty State */
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-100 p-6">
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <Award className="w-4.5 h-4.5 text-indigo-600" />
                                        Rapor Belum Dimuat
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Pilih anak dan periode di sidebar kiri untuk melihat lembar rapor digital.</p>
                                </div>
                                <CardContent className="pt-10 pb-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                    <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-6">
                                        <User className="w-12 h-12" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800">Rapor Belum Dimuat</h4>
                                    <p className="text-slate-500 text-sm mt-2 mb-6">
                                        Pilih anak dari daftar di sidebar kiri untuk memuat lembar capaian prestasi belajar, kehadiran, dan catatan perkembangan kepribadian.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </ParentLayout>
    );
}
