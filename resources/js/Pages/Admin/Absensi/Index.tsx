import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
    ScanFace, MapPin, CheckCircle, XCircle, Clock, Calendar, Search, Users, UserCheck, 
    BookOpen, Download, List, Grid, Save, User, Undo2, ArrowRight, FileText, Upload,
    X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Toaster } from "@/Components/ui/sonner"
import { router } from '@inertiajs/react';
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"
import { ScrollArea } from "@/Components/ui/scroll-area"

// Types
type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';

interface StudentModel {
    id: number;
    name: string;
    nis: string;
    avatar_url?: string;
}

interface ClassroomModel {
    id: number;
    name: string;
    students: StudentModel[];
}

interface SubjectModel {
    id: number;
    name: string;
}

interface ScheduleModel {
    id: number;
    subject: SubjectModel;
    classroom: ClassroomModel;
    start_time?: string;
    end_time?: string;
    teacher_name?: string; // Optional if not available
    room_name?: string;   // Optional if not available
}

interface AttendanceModel {
    id: number;
    status: 'hadir' | 'sakit' | 'izin' | 'alpha';
    date: string;
    student_id: number;
    student: StudentModel;
    schedule: ScheduleModel;
}

interface Paginated<T> {
    data: T[];
    links: any[];
    meta: any;
}


interface Stats {
    present: number;
    sick: number;
    permit: number;
    alpha: number;
    late: number;
    teachersPresent: number;
    totalTeachers: number;
    totalStudents: number;
}


interface JournalModel {
    id: number;
    title: string;
    description: string;
    proof_file?: string;
    leave_letter_file?: string;
    date: string;
    schedule: ScheduleModel;
    teacher: {
        name: string;
        avatar_url?: string;
    };
    stats?: {
        hadir: number;
        sakit: number;
        izin: number;
        alpha: number;
        total: number;
    };
    teacher_status?: AttendanceStatus;
    attendance_details?: Student[];
}

interface Props {
    history: Paginated<JournalModel>;
    schedules: ScheduleModel[];
    stats: Stats;
    attendances: any; // Kept for backward compatibility if needed, but not used in new History Tab
}

interface Student extends StudentModel {
    status: AttendanceStatus;
    leaveLetterFile: File | null;
}

interface ExtendedSchedule extends ScheduleModel {
    has_attendance?: boolean;
}

export default function AbsensiIndex({ history, schedules, stats }: Props) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isAttendanceSessionActive, setIsAttendanceSessionActive] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
    
    // Modal State
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalStudents, setModalStudents] = useState<Student[]>([]);
    const [modalType, setModalType] = useState<'Hadir' | 'Absen'>('Hadir');

    // Teacher Attendance State
    const [teacherStatus, setTeacherStatus] = useState<AttendanceStatus>('Hadir');
    const [journalTopic, setJournalTopic] = useState('');
    const [journalContent, setJournalContent] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [leaveLetterFile, setLeaveLetterFile] = useState<File | null>(null);
    
    // Derived Data for Current Class
    const activeSchedule = selectedScheduleId ? schedules.find(s => s.id === selectedScheduleId) : null;
    
    const currentClass = activeSchedule ? {
        name: activeSchedule.classroom.name,
        subject: activeSchedule.subject.name,
        time: activeSchedule.start_time && activeSchedule.end_time ? `${activeSchedule.start_time} - ${activeSchedule.end_time}` : "07:30 - 09:00",
        teacher: (activeSchedule as any).teacher || { name: activeSchedule.teacher_name || "Guru Mata Pelajaran" }, // Adjusted to handle relationship object if present
        teacherName: (activeSchedule as any).teacher?.name || activeSchedule.teacher_name || "Guru Mata Pelajaran", // Prefer relation name, fallback to string
        room: activeSchedule.room_name || "R. Kelas",
        totalStudents: activeSchedule.classroom.students?.length || 0,
        hasAttendance: (activeSchedule as ExtendedSchedule).has_attendance
    } : null;

    // Helper to normalize status
    const normalizeStatus = (s: string): AttendanceStatus => {
        const lower = s.toLowerCase();
        if (lower === 'hadir') return 'Hadir';
        if (lower === 'sakit') return 'Sakit';
        if (lower === 'izin') return 'Izin';
        if (lower === 'alpha') return 'Alpha';
        return 'Alpha'; // Default fallback
    };
    
    const today = new Date().toISOString().split('T')[0];
    const statsData = (history?.data as any) || []; // Using history as fallback for now since attendances structure changed
    
    // Initialize Students from Schedule for Entry Tab

    const [students, setStudents] = useState<Student[]>([]);
    const isTeacherLeaveStatus = teacherStatus === 'Sakit' || teacherStatus === 'Izin';
    const [historyTeacherStatusFilter, setHistoryTeacherStatusFilter] = useState<'Semua' | AttendanceStatus>('Semua');
    const filteredHistory = history.data.filter((item) => {
        if (historyTeacherStatusFilter === 'Semua') {
            return true;
        }

        return normalizeStatus(item.teacher_status ?? 'hadir') === historyTeacherStatusFilter;
    });

    useEffect(() => {
        if (activeSchedule?.classroom?.students) {
            // Logic needs update since we don't fetch all attendances anymore in 'attendances' prop
            // We only have history (Journals).
            // For now, we rely on fresh fetch or we can't pre-fill if we don't load specific schedule attendance.
            // But let's keep it simple: Reset to default 'Hadir' or try to find in history if matches today + schedule
            
            // Try to find today's session in history
            const todaySession = history.data.find(h => 
                h.schedule.id === activeSchedule.id && h.date === today
            );
            
            // If we found a session, we would ideally need the detailed attendance records for that session
            // But 'history' only contains summary stats.
            // So for now, we just default to Hadir.
            // To properly support "Edit" mode, we would need to fetch attendance details for this schedule.
            
            const mappedStudents: Student[] = activeSchedule.classroom.students.map(s => {
                return {
                    ...s,
                    status: 'Hadir',
                    leaveLetterFile: null,
                };
            });
            
            setStudents(mappedStudents);
            
            // Reset Teacher Inputs when schedule changes
            setTeacherStatus(todaySession?.teacher_status || 'Hadir');
            setJournalTopic(todaySession?.title || '');
            setJournalContent(todaySession?.description || '');
            setProofFile(null);
            setLeaveLetterFile(null);
        }
    }, [activeSchedule, history]);

    useEffect(() => {
        if (!isTeacherLeaveStatus) {
            setLeaveLetterFile(null);
        }
    }, [isTeacherLeaveStatus]);

    // History for Undo
    const historyRef = useRef<Student[]>([]);

    const toggleStatus = (id: number) => {
        setStudents(prev => prev.map(student => {
            if (student.id === id) {
                const nextStatus: Record<AttendanceStatus, AttendanceStatus> = {
                    'Hadir': 'Sakit',
                    'Sakit': 'Izin',
                    'Izin': 'Alpha',
                    'Alpha': 'Hadir'
                };
                const updatedStatus = nextStatus[student.status];
                return {
                    ...student,
                    status: updatedStatus,
                    leaveLetterFile: updatedStatus === 'Sakit' || updatedStatus === 'Izin' ? student.leaveLetterFile : null,
                };
            }
            return student;
        }));
    };

    const handleStudentLeaveLetterFile = (studentId: number, file: File | null) => {
        setStudents((prev) => prev.map((student) =>
            student.id === studentId
                ? { ...student, leaveLetterFile: file }
                : student
        ));
    };

    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case 'Hadir': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200';
            case 'Sakit': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
            case 'Izin': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200';
            case 'Alpha': return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleStartAttendance = (scheduleId: number) => {
        setSelectedScheduleId(scheduleId);
        setIsAttendanceSessionActive(true);
        setActiveTab('entry');
        
        // Find the schedule to show toast immediately (optional)
        const sched = schedules.find(s => s.id === scheduleId);
        if (sched) {
            toast("Sesi Absensi Dimulai", {
                description: `Kelas ${sched.classroom.name} - ${sched.subject.name}`,
            });
        }
    };

    const handleSaveAttendance = () => {
        // Save current state to history before saving
        historyRef.current = JSON.parse(JSON.stringify(students));

        const activeScheduleId = activeSchedule?.id;

        if (!activeScheduleId) {
            toast.error("Tidak ada jadwal aktif untuk disimpan.");
            return;
        }

        const formData = new FormData();
        formData.append('schedule_id', activeScheduleId.toString());
        formData.append('date', today);
        formData.append('teacher_status', teacherStatus.toLowerCase());
        formData.append('journal_topic', journalTopic);
        formData.append('journal_content', journalContent);
        if (proofFile) {
            formData.append('proof_file', proofFile);
        }
        if (isTeacherLeaveStatus && leaveLetterFile) {
            formData.append('leave_letter_file', leaveLetterFile);
        }

        students.forEach((s, index) => {
            formData.append(`students[${index}][student_id]`, s.id.toString());
            formData.append(`students[${index}][status]`, s.status.toLowerCase());
            if ((s.status === 'Sakit' || s.status === 'Izin') && s.leaveLetterFile) {
                formData.append(`students[${index}][leave_letter_file]`, s.leaveLetterFile);
            }
        });

        router.post(route('admin.absensi.store'), formData, {
            onSuccess: () => {
                 toast.success("Data Tersimpan", {
                    description: `Absensi Siswa & Guru Berhasil Disimpan`,
                    action: {
                        label: "Undo",
                        onClick: () => {
                            // Revert UI state
                            setStudents(historyRef.current);
                            // Ideally, we would also revert the backend change here or handle undo properly
                            toast("Perubahan dibatalkan (UI Only)");
                        }
                    },
                });
            },
            onError: (errors) => {
                toast.error("Gagal menyimpan data absensi.");
                console.error(errors);
            }
        });
    };

    // --- Mock Data Stats for Dashboard ---
    // REMOVED: const stats = { ... } (Replaced by calculated stats above)

    // --- Components ---

    const StudentCard = ({ student }: { student: Student }) => (
        <div 
            onClick={() => toggleStatus(student.id)}
            className={`
                cursor-pointer group relative p-4 rounded-xl border-2 transition-all duration-200 
                ${student.status === 'Hadir' 
                    ? 'bg-white border-transparent shadow-sm hover:border-emerald-200 hover:shadow-md' 
                    : ''
                }
                ${student.status === 'Sakit' ? 'bg-blue-50 border-blue-200' : ''}
                ${student.status === 'Izin' ? 'bg-amber-50 border-amber-200' : ''}
                ${student.status === 'Alpha' ? 'bg-rose-50 border-rose-200' : ''}
            `}
        >
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                    <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{student.name}</h4>
                    <p className="text-xs text-slate-500">{student.nis}</p>
                </div>
                <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(student.status)}`}>
                    {student.status}
                </Badge>
            </div>
            {(student.status === 'Sakit' || student.status === 'Izin') && (
                <div className="mt-3 pt-3 border-t border-slate-200/70" onClick={(e) => e.stopPropagation()}>
                    <div className="border border-dashed border-slate-300 rounded-lg px-3 py-2 bg-white/80 hover:bg-white transition-colors relative">
                        <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentLeaveLetterFile(student.id, e.target.files ? e.target.files[0] : null)}
                            accept="image/*,application/pdf"
                        />
                        <p className="text-xs font-medium text-slate-600 truncate">
                            {student.leaveLetterFile ? student.leaveLetterFile.name : 'Upload surat siswa'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    const StudentListItem = ({ student }: { student: Student }) => (
        <div 
            onClick={() => toggleStatus(student.id)}
            className={`
                flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                ${student.status === 'Hadir' ? 'bg-white border-slate-100 hover:border-emerald-200' : ''}
                ${student.status === 'Sakit' ? 'bg-blue-50 border-blue-200' : ''}
                ${student.status === 'Izin' ? 'bg-amber-50 border-amber-200' : ''}
                ${student.status === 'Alpha' ? 'bg-rose-50 border-rose-200' : ''}
            `}
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {student.id}
                </div>
                <div>
                    <p className="font-medium text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.nis}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {(student.status === 'Sakit' || student.status === 'Izin') && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentLeaveLetterFile(student.id, e.target.files ? e.target.files[0] : null)}
                            accept="image/*,application/pdf"
                        />
                        <div className="text-[11px] px-2 py-1 rounded-md border border-dashed border-slate-300 text-slate-600 bg-white max-w-40 truncate">
                            {student.leaveLetterFile ? student.leaveLetterFile.name : 'Upload surat'}
                        </div>
                    </div>
                )}
                <Badge variant="outline" className={`w-20 justify-center ${getStatusColor(student.status)}`}>
                    {student.status}
                </Badge>
            </div>
        </div>
    );

    const handleOpenAttendanceModal = (item: JournalModel, type: 'Hadir' | 'Absen') => {
        if (!item.attendance_details) return;

        setModalTitle(`${type === 'Hadir' ? 'Siswa Hadir' : 'Siswa Absen (Sakit/Izin/Alpha)'} - ${item.schedule.classroom.name}`);
        setModalType(type);
        
        const filteredStudents = item.attendance_details.filter(s => {
            const status = normalizeStatus(s.status);
            if (type === 'Hadir') return status === 'Hadir';
            return ['Sakit', 'Izin', 'Alpha'].includes(status);
        });
        
        // Map to ensure shape matches Student interface if needed, currently reusing backend response structure
        // Backend response: { id, name, nis, avatar_url, status } which matches Student interface
        setModalStudents(filteredStudents as Student[]);
        setIsAttendanceModalOpen(true);
    };

    return (
        <AdminLayout title="Absensi & Kehadiran">
            <Toaster position="bottom-right" />
            
            {/* Attendance Details Modal */}
            <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{modalTitle}</DialogTitle>
                        <DialogDescription>
                            Daftar siswa yang {modalType === 'Hadir' ? 'hadir' : 'tidak hadir'} pada sesi ini.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                        {modalStudents.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                Tidak ada data siswa.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {modalStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                                <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{student.name}</p>
                                                <p className="text-xs text-slate-500">{student.nis}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(normalizeStatus(student.status))}>
                                            {normalizeStatus(student.status)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <div className="space-y-6 max-w-7xl mx-auto pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Absensi Sekolah</h2>
                        <p className="text-slate-500">Monitoring kehadiran siswa & guru real-time.</p>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-xl w-full md:w-auto grid grid-cols-2 md:inline-flex">
                        <TabsTrigger value="dashboard" className="rounded-lg px-4 py-2">Dashboard</TabsTrigger>
                        <TabsTrigger value="entry" className="rounded-lg px-4 py-2">Input Absensi</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg px-4 py-2">Riwayat</TabsTrigger>
                    </TabsList>

                    {/* DASHBOARD TAB */}
                    <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50">
                        
                        {/* Schedule List Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {schedules.map(schedule => (
                                <Card 
                                    key={schedule.id} 
                                    className={`
                                        border-none shadow-sm bg-white overflow-hidden hover:shadow-lg transition-all duration-300 group
                                        ${(schedule as ExtendedSchedule).has_attendance ? 'ring-2 ring-emerald-100 ring-offset-2' : ''}
                                    `}
                                >
                                    <div className={`h-1.5 w-full ${(schedule as ExtendedSchedule).has_attendance ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">
                                                    {schedule.classroom.name}
                                                </Badge>
                                                {(schedule as ExtendedSchedule).has_attendance && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none flex items-center gap-1 shadow-none">
                                                        <CheckCircle className="w-3 h-3" /> Sudah Absen
                                                    </Badge>
                                                )}
                                            </div>
                                            {schedule.start_time && schedule.end_time && (
                                                <div className="flex items-center text-slate-500 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md">
                                                    <Clock className="w-3 h-3 mr-1.5" />
                                                    {schedule.start_time} - {schedule.end_time}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1" title={schedule.subject.name}>
                                            {schedule.subject.name}
                                        </h3>
                                        
                                        <div className="space-y-3 mt-5 pt-5 border-t border-slate-50">
                                            <div className="flex items-center text-slate-600 text-sm">
                                                <div className="w-8 flex justify-center">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="truncate">{(schedule as any).teacher?.name || "Guru Mata Pelajaran"}</span>
                                            </div>
                                            <div className="flex items-center text-slate-600 text-sm">
                                                <div className="w-8 flex justify-center">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="truncate">{schedule.room_name || "R. Kelas"}</span>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={() => handleStartAttendance(schedule.id)}
                                            variant={(schedule as ExtendedSchedule).has_attendance ? "outline" : "default"}
                                            className={`
                                                w-full mt-6 transition-all shadow-sm
                                                ${(schedule as ExtendedSchedule).has_attendance 
                                                    ? 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-600' 
                                                    : 'bg-white text-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600'
                                                }
                                            `}
                                        >
                                            {(schedule as ExtendedSchedule).has_attendance ? 'Edit Absensi' : 'Mulai Absen'} 
                                            <ArrowRight className={`w-4 h-4 ml-2 transition-transform group-hover:translate-x-1`} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {schedules.length === 0 && (
                                <div className="col-span-full p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">Tidak ada jadwal aktif</h3>
                                    <p className="text-slate-500 mt-1">Belum ada jadwal pelajaran yang terdaftar hari ini.</p>
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-slate-500 text-sm font-medium">Siswa Hadir</p>
                                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 mb-3">
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.present}</h3>
                                        <span className="text-sm font-bold text-emerald-600 mb-1">
                                            {stats.totalStudents > 0 ? Math.round((stats.present / stats.totalStudents) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${stats.totalStudents > 0 ? (stats.present / stats.totalStudents) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-slate-500 text-sm font-medium">Sakit / Izin</p>
                                        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                                            <FileText className="w-4 h-4 text-amber-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 mb-3">
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.sick + stats.permit}</h3>
                                        <span className="text-sm font-medium text-amber-600 mb-1">Siswa</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${stats.totalStudents > 0 ? ((stats.sick + stats.permit) / stats.totalStudents) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-slate-500 text-sm font-medium">Alpha (Absen)</p>
                                        <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                                            <XCircle className="w-4 h-4 text-rose-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 mb-3">
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.alpha}</h3>
                                        <span className="text-sm font-medium text-rose-600 mb-1">Siswa</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${stats.totalStudents > 0 ? (stats.alpha / stats.totalStudents) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-slate-500 text-sm font-medium">Kehadiran Guru</p>
                                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <Users className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 mb-3">
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.teachersPresent}</h3>
                                        <span className="text-sm font-medium text-slate-400 mb-1">/ {stats.totalTeachers} Guru</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${stats.totalTeachers > 0 ? (stats.teachersPresent / stats.totalTeachers) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </TabsContent>


                    {/* ATTENDANCE ENTRY TAB */}
                    <TabsContent value="entry" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        
                        {!currentClass ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Pilih Jadwal Pelajaran</h3>
                                <p className="text-slate-500 max-w-md mb-6">
                                    Silakan pilih jadwal pelajaran yang ingin diabsen dari menu Dashboard terlebih dahulu.
                                </p>
                                <Button onClick={() => setActiveTab('dashboard')} variant="outline">
                                    Kembali ke Dashboard
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Teacher Attendance & Journal Section */}
                                <Card className="border-none shadow-sm bg-white overflow-hidden mb-6">
                                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <UserCheck className="w-5 h-5 text-indigo-600" />
                                            Presensi Guru & Jurnal Mengajar
                                        </CardTitle>
                                        <CardDescription>
                                            Input kehadiran guru dan jurnal kegiatan belajar mengajar (KBM) hari ini.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Teacher Info & Status */}
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex items-center gap-4 min-w-[300px]">
                                                <Avatar className="h-16 w-16 border-2 border-indigo-100">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentClass.teacher?.name || currentClass.teacherName}`} />
                                                    <AvatarFallback>GU</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">{currentClass.teacher?.name || currentClass.teacherName}</h4>
                                                    <p className="text-sm text-slate-500">Guru Mata Pelajaran</p>
                                                    <Badge variant="secondary" className="mt-1">
                                                        {currentClass.subject}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 space-y-2 w-full">
                                                <Label>Status Kehadiran Guru</Label>
                                                <div className="flex gap-2">
                                                    {(['Hadir', 'Sakit', 'Izin', 'Alpha'] as AttendanceStatus[]).map((status) => (
                                                        <div 
                                                            key={status}
                                                            onClick={() => setTeacherStatus(status)}
                                                            className={`
                                                                flex-1 p-3 rounded-lg border text-center cursor-pointer transition-all font-medium text-sm
                                                                ${teacherStatus === status 
                                                                    ? getStatusColor(status) + ' ring-2 ring-offset-1 ring-slate-200' 
                                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                }
                                                            `}
                                                        >
                                                            {status}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Journal Input */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="journal-topic">Materi / Topik Pembelajaran</Label>
                                                    <Input 
                                                        id="journal-topic" 
                                                        placeholder="Contoh: Aljabar Linear - Persamaan Kuadrat" 
                                                        value={journalTopic}
                                                        onChange={(e) => setJournalTopic(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="journal-content">Catatan / Kegiatan Pembelajaran (Opsional)</Label>
                                                    <Textarea 
                                                        id="journal-content" 
                                                        placeholder="Catatan kemajuan siswa, kendala, atau aktivitas kelas..." 
                                                        className="h-24 resize-none"
                                                        value={journalContent}
                                                        onChange={(e) => setJournalContent(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Bukti Kegiatan (Foto / Dokumen) - Opsional</Label>
                                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                                    <Input 
                                                        type="file" 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProofFile(e.target.files ? e.target.files[0] : null)}
                                                        accept="image/*,application/pdf"
                                                    />
                                                        <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-3">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {proofFile ? proofFile.name : "Klik untuk upload bukti mengajar"}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            JPG, PNG, atau PDF (Max 2MB)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {isTeacherLeaveStatus && (
                                            <div className="space-y-2">
                                                <Label>Surat Izin / Sakit (Opsional)</Label>
                                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer relative">
                                                    <Input
                                                        type="file"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLeaveLetterFile(e.target.files ? e.target.files[0] : null)}
                                                        accept="image/*,application/pdf"
                                                    />
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="bg-amber-50 text-amber-600 p-2 rounded-full">
                                                            <Upload className="w-4 h-4" />
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700 truncate">
                                                            {leaveLetterFile ? leaveLetterFile.name : 'Klik untuk upload surat izin/sakit'}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 shrink-0">JPG/PNG/PDF, Max 2MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            {currentClass.name}
                                            <span className="text-slate-300">|</span>
                                            <span className="font-normal text-slate-600">Presensi Siswa</span>
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Total: {students.length} Siswa • {students.filter(s => s.status === 'Hadir').length} Hadir
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setViewMode('list')}
                                            className={`h-8 px-3 ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                                        >
                                            <List className="w-4 h-4 mr-2" /> List
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setViewMode('grid')}
                                            className={`h-8 px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                                        >
                                            <Grid className="w-4 h-4 mr-2" /> Grid
                                        </Button>
                                    </div>
                                </div>
        
                                {/* Attendance List/Grid */}
                                <div className={`
                                    ${viewMode === 'grid' 
                                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                                        : 'flex flex-col gap-2'
                                    }
                                `}>
                                    {students.map((student) => (
                                        viewMode === 'grid' 
                                            ? <StudentCard key={student.id} student={student} />
                                            : <StudentListItem key={student.id} student={student} />
                                    ))}
                                </div>
        
                                {/* Floating Action Button for Save */}
                                <div className="fixed bottom-8 right-8 z-50">
                                    <Button 
                                        onClick={handleSaveAttendance}
                                        size="lg" 
                                        className="h-14 w-14 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white p-0 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Save className="w-6 h-6" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* HISTORY TAB */}
                    <TabsContent value="history" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="px-6 py-4 border-b bg-slate-50/50">
                                <CardTitle className="text-xl font-bold text-slate-900">Jurnal & Riwayat Absensi</CardTitle>
                                <CardDescription>Daftar riwayat kegiatan belajar mengajar dan absensi per sesi.</CardDescription>
                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    <span className="text-xs font-medium text-slate-500">Status guru:</span>
                                    {(['Semua', 'Hadir', 'Sakit', 'Izin', 'Alpha'] as const).map((status) => (
                                        <Button
                                            key={status}
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setHistoryTeacherStatusFilter(status)}
                                            className={`h-7 px-3 rounded-full border transition-colors ${historyTeacherStatusFilter === status ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                        >
                                            {status}
                                        </Button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {history.data.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900">Belum ada riwayat</h3>
                                        <p className="text-slate-500 mt-1">Belum ada data jurnal & absensi yang terekam.</p>
                                    </div>
                                ) : filteredHistory.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900">Tidak ada data sesuai filter</h3>
                                        <p className="text-slate-500 mt-1">Coba pilih status guru yang lain.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredHistory.map((item) => (
                                            <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Left: Schedule Info & Teacher */}
                                                    <div className="md:w-1/3 space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                                <AvatarImage src={item.teacher?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.teacher?.name}`} />
                                                                <AvatarFallback>{item.teacher?.name?.substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900 text-sm">{item.teacher?.name || "Guru Pengajar"}</h4>
                                                                <p className="text-xs text-slate-500">Guru Mapel</p>
                                                            </div>
                                                            {item.teacher_status && (
                                                                <Badge variant="outline" className={`ml-auto ${getStatusColor(normalizeStatus(item.teacher_status))}`}>
                                                                    {normalizeStatus(item.teacher_status)}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                                    {item.schedule.classroom.name}
                                                                </span>
                                                                <div className="flex items-center text-xs text-slate-500">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    {item.schedule.start_time} - {item.schedule.end_time}
                                                                </div>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900">{item.schedule.subject.name}</h3>
                                                            <div className="flex items-center text-xs text-slate-500">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                {item.date}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Middle: Journal Content */}
                                                    <div className="md:w-1/3 space-y-3 border-l md:border-l border-slate-100 md:pl-6">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Materi / Topik</h4>
                                                            <p className="text-sm font-medium text-slate-900">{item.title || "-"}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan KBM</h4>
                                                            <p className="text-sm text-slate-600 line-clamp-3">{item.description || "-"}</p>
                                                        </div>
                                                        {item.proof_file && (
                                                            <a 
                                                                href={`/storage/${item.proof_file}`} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline mt-2"
                                                            >
                                                                <FileText className="w-3 h-3" /> Lihat Bukti Mengajar
                                                            </a>
                                                        )}
                                                        {item.leave_letter_file && (
                                                            <a
                                                                href={`/storage/${item.leave_letter_file}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline mt-2"
                                                            >
                                                                <FileText className="w-3 h-3" /> Lihat Surat Izin/Sakit
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Right: Attendance Stats */}
                                                    <div className="md:w-1/3 md:pl-6 border-l md:border-l border-slate-100">
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ringkasan Kehadiran Siswa</h4>
                                                        
                                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                                            <div 
                                                                onClick={() => handleOpenAttendanceModal(item, 'Hadir')}
                                                                className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center cursor-pointer hover:bg-emerald-100 transition-colors group"
                                                            >
                                                                <div className="text-xl font-bold text-emerald-600 group-hover:scale-110 transition-transform">{item.stats?.hadir || 0}</div>
                                                                <div className="text-[10px] text-emerald-600 font-medium uppercase">Hadir</div>
                                                            </div>
                                                            <div 
                                                                onClick={() => handleOpenAttendanceModal(item, 'Absen')}
                                                                className="bg-rose-50 p-2 rounded-lg border border-rose-100 text-center cursor-pointer hover:bg-rose-100 transition-colors group"
                                                            >
                                                                <div className="text-xl font-bold text-rose-600 group-hover:scale-110 transition-transform">
                                                                    {(item.stats?.sakit || 0) + (item.stats?.izin || 0) + (item.stats?.alpha || 0)}
                                                                </div>
                                                                <div className="text-[10px] text-rose-600 font-medium uppercase">Absen</div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-slate-500">Sakit</span>
                                                                <span className="font-medium text-slate-900">{item.stats?.sakit || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-slate-500">Izin</span>
                                                                <span className="font-medium text-slate-900">{item.stats?.izin || 0}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-slate-500">Alpha</span>
                                                                <span className="font-medium text-slate-900">{item.stats?.alpha || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            
                            {/* Pagination */}
                            {history.data.length > 0 && (
                                <CardFooter className="flex items-center justify-between border-t bg-slate-50/50 px-6 py-4">
                                    <div className="text-xs text-slate-500">
                                        Menampilkan <strong>{filteredHistory.length}</strong> data terbaru
                                    </div>
                                    <div className="flex gap-1">
                                        {history.links.map((link, i) => (
                                            <Button
                                                key={i}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${link.active ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                            >
                                                <span dangerouslySetInnerHTML={{ 
                                                    __html: link.label
                                                        .replace('&laquo; Previous', '<')
                                                        .replace('Next &raquo;', '>') 
                                                }} />
                                            </Button>
                                        ))}
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
