import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ScanFace, MapPin, CheckCircle, XCircle, Clock, Calendar, Search, Users, UserCheck, BookOpen, Download, List, Grid, Save, User, Undo2, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Toaster } from "@/Components/ui/sonner"
import { router } from '@inertiajs/react';
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"

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

interface Props {
    attendances: Paginated<AttendanceModel>;
    schedules: ScheduleModel[];
}

interface Student extends StudentModel {
    status: AttendanceStatus;
}

export default function AbsensiIndex({ attendances, schedules }: Props) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isAttendanceSessionActive, setIsAttendanceSessionActive] = useState(false);
    
    // Derived Data for Current Class (using first schedule)
    const activeSchedule = schedules?.[0];
    const currentClass = activeSchedule ? {
        name: activeSchedule.classroom.name,
        subject: activeSchedule.subject.name,
        time: activeSchedule.start_time && activeSchedule.end_time ? `${activeSchedule.start_time} - ${activeSchedule.end_time}` : "07:30 - 09:00",
        teacher: activeSchedule.teacher_name || "Guru Mata Pelajaran",
        room: activeSchedule.room_name || "R. Kelas",
        totalStudents: activeSchedule.classroom.students?.length || 0
    } : {
        name: "Tidak ada jadwal",
        subject: "-",
        time: "-",
        teacher: "-",
        room: "-",
        totalStudents: 0
    };

    // Calculate Stats from Real Data
    const today = new Date().toISOString().split('T')[0];
    
    // Helper to normalize status
    const normalizeStatus = (s: string): AttendanceStatus => {
        const lower = s.toLowerCase();
        if (lower === 'hadir') return 'Hadir';
        if (lower === 'sakit') return 'Sakit';
        if (lower === 'izin') return 'Izin';
        if (lower === 'alpha') return 'Alpha';
        return 'Alpha'; // Default fallback
    };

    const statsData = attendances?.data || [];
    const presentTodayCount = statsData.filter(a => a.status === 'hadir' && a.date === today).length;
    const lateCount = 0; // Not tracked in model yet
    const alphaCount = statsData.filter(a => a.status === 'alpha' && a.date === today).length;
    // Total students is tricky with pagination, but we use unique students found in attendances or fall back to schedule
    const uniqueStudents = new Set(statsData.map(a => a.student_id));
    const totalStudentsCount = uniqueStudents.size || (activeSchedule?.classroom?.students?.length || 0);

    const stats = {
        presentToday: presentTodayCount,
        totalStudents: totalStudentsCount, // Approximate if paginated
        late: lateCount,
        alpha: alphaCount,
        teachersPresent: 48, // Mock for now as requested
        totalTeachers: 50    // Mock for now
    };

    // Initialize Students from Schedule for Entry Tab
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (activeSchedule?.classroom?.students) {
            // First try to use existing attendance data if available
            // Check if there are attendances for this schedule in statsData
            const existingAttendances = statsData.filter(a => a.schedule.id === activeSchedule.id);
            
            // Map students
            const mappedStudents: Student[] = activeSchedule.classroom.students.map(s => {
                // Check if this student has an attendance record for this schedule today
                const attendance = existingAttendances.find(a => a.student_id === s.id);
                
                return {
                    ...s,
                    status: attendance ? normalizeStatus(attendance.status) : 'Hadir' // Default to Hadir if no record
                };
            });
            
            setStudents(mappedStudents);
        }
    }, [activeSchedule, attendances]);

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
                return { ...student, status: nextStatus[student.status] };
            }
            return student;
        }));
    };

    // Initialize Students from Schedule for Entry Tab
    // const [students, setStudents] = useState<Student[]>([]); -- Already declared above

    // History for Undo
    // const historyRef = useRef<Student[]>([]); -- Already declared above

    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case 'Hadir': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200';
            case 'Sakit': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
            case 'Izin': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200';
            case 'Alpha': return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const handleStartAttendance = () => {
        setIsAttendanceSessionActive(true);
        setActiveTab('entry');
        toast("Sesi Absensi Dimulai", {
            description: `Kelas ${currentClass.name} - ${currentClass.subject}`,
        });
    };

    const handleSaveAttendance = () => {
        // Save current state to history before saving
        historyRef.current = JSON.parse(JSON.stringify(students));

        const activeScheduleId = activeSchedule?.id;

        if (!activeScheduleId) {
            toast.error("Tidak ada jadwal aktif untuk disimpan.");
            return;
        }

        router.post(route('admin.absensi.store'), {
            schedule_id: activeScheduleId,
            date: today,
            students: students.map(s => ({
                student_id: s.id,
                status: s.status.toLowerCase(),
            })),
        }, {
            onSuccess: () => {
                 toast.success("Data Tersimpan", {
                    description: `${students.filter(s => s.status === 'Hadir').length} Hadir, ${students.filter(s => s.status !== 'Hadir').length} Tidak Hadir`,
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
            <Badge variant="outline" className={`w-20 justify-center ${getStatusColor(student.status)}`}>
                {student.status}
            </Badge>
        </div>
    );

    return (
        <AdminLayout title="Absensi & Kehadiran">
            <Toaster position="bottom-right" />
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
                    </TabsList>

                    {/* DASHBOARD TAB */}
                    <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50">
                        
                        {/* SMART DASHBOARD CARD */}
                        <Card className="border-none shadow-md bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <CardContent className="p-8 relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-medium">Sedang Berlangsung Sekarang</span>
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-bold">{currentClass.subject}</h3>
                                        <div className="flex items-center gap-4 text-indigo-100 mt-2">
                                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm">
                                                <Users className="w-4 h-4" />
                                                <span>{currentClass.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <MapPin className="w-4 h-4" />
                                                <span>{currentClass.room}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleStartAttendance}
                                        size="lg" 
                                        className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-lg px-8 h-14 shadow-lg transition-transform hover:scale-105 active:scale-95 w-full md:w-auto"
                                    >
                                        Mulai Absen
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <p className="text-slate-500 text-sm font-medium">Siswa Hadir</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <h3 className="text-2xl font-bold text-slate-900">{stats.presentToday}</h3>
                                        <span className="text-sm font-medium text-emerald-600">94%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: '94%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <p className="text-slate-500 text-sm font-medium">Terlambat</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <h3 className="text-2xl font-bold text-amber-600">{stats.late}</h3>
                                        <span className="text-sm font-medium text-amber-600">+12</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-amber-500 h-full" style={{ width: '15%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <p className="text-slate-500 text-sm font-medium">Alpha</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <h3 className="text-2xl font-bold text-rose-600">{stats.alpha}</h3>
                                        <span className="text-sm font-medium text-rose-600">-2</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-rose-500 h-full" style={{ width: '5%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <p className="text-slate-500 text-sm font-medium">Guru Hadir</p>
                                    <div className="flex items-end gap-2 mt-2">
                                        <h3 className="text-2xl font-bold text-blue-600">{stats.teachersPresent}</h3>
                                        <span className="text-sm font-medium text-slate-400">/ {stats.totalTeachers}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: '96%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </TabsContent>

                    {/* ATTENDANCE ENTRY TAB */}
                    <TabsContent value="entry" className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    {currentClass.name}
                                    <span className="text-slate-300">|</span>
                                    <span className="font-normal text-slate-600">{currentClass.subject}</span>
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
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}

