import TeacherLayout from '@/Layouts/TeacherLayout';
import { Users, Calendar, Clock, MapPin, User as UserIcon, School, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { DataTable, ColumnDef } from '@/Components/admin/DataTable';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    identity_number?: string;
}

interface Schedule {
    id: number;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    subject?: {
        id: number;
        name: string;
    };
    teacher?: {
        id: number;
        name: string;
    };
}

interface Classroom {
    id: number;
    name: string;
    level: string;
    major: string;
    academic_year: string;
    teacher_id: number | null;
    teacher?: User;
    students?: User[];
    students_count?: number;
    schedules?: Schedule[];
}

interface Props {
    classroom: Classroom | null;
    isWaliKelas: boolean;
}

export default function GuruKelasShow({ classroom, isWaliKelas }: Props) {
    // If teacher is not assigned as wali kelas
    if (!isWaliKelas || !classroom) {
        return (
            <TeacherLayout title="Kelas Perwalian">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Belum Menjadi Wali Kelas</h2>
                    <p className="text-slate-500 max-w-md">
                        Anda belum ditugaskan sebagai wali kelas untuk rombongan belajar manapun.
                        Silakan hubungi administrator untuk penempatan wali kelas.
                    </p>
                </div>
            </TeacherLayout>
        );
    }

    const students = classroom.students || [];

    const getAvatarUrl = (user: User) => {
        if (user.avatar) return user.avatar;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
    };

    // --- DataTable Columns ---

    const studentColumns: ColumnDef<User>[] = [
        {
            header: "Nama Siswa",
            accessorKey: "name",
            cell: (row: User) => (
                <div className="flex items-center gap-3">
                    <img src={getAvatarUrl(row)} alt={row.name} className="w-8 h-8 rounded-full bg-slate-100" />
                    <div>
                        <div className="font-medium text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        { 
            header: "NIS", 
            accessorKey: "identity_number", 
            cell: (row: User) => row.identity_number || '-'
        }, 
        { 
            header: "Status", 
            accessorKey: "role", 
            cell: (row: User) => (
                <Badge 
                    variant="default" 
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                >
                    Aktif
                </Badge>
            ) 
        },
    ];

    const scheduleColumns: ColumnDef<Schedule>[] = [
        {
            header: "Hari",
            accessorKey: "day",
            cell: (row: Schedule) => <span className="font-medium capitalize">{row.day}</span>
        },
        {
            header: "Mata Pelajaran",
            accessorKey: "subject",
            cell: (row: Schedule) => (
                <div className="font-medium text-slate-900">{row.subject?.name || '-'}</div>
            )
        },
        {
            header: "Guru Pengampu",
            accessorKey: "teacher",
            cell: (row: Schedule) => (
                <div className="flex items-center gap-2">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600">{row.teacher?.name || '-'}</span>
                </div>
            )
        },
        {
            header: "Waktu",
            accessorKey: "start_time",
            cell: (row: Schedule) => (
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>{row.start_time.substring(0, 5)} - {row.end_time.substring(0, 5)}</span>
                </div>
            )
        },
        {
            header: "Ruangan",
            accessorKey: "room",
            cell: (row: Schedule) => (
                <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{row.room}</span>
                </div>
            )
        }
    ];

    return (
        <TeacherLayout title={`Kelas Perwalian - ${classroom.name}`}>
            <div className="space-y-6">
                {/* Header Section */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                <School className="w-4 h-4" />
                                <span className="font-medium">Kelas Perwalian Anda</span>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-slate-900">{classroom.name}</h2>
                                <Badge variant="outline" className="text-lg py-1 px-3 border-blue-200 bg-blue-50 text-blue-700">
                                    Tingkat {classroom.level}
                                </Badge>
                            </div>
                            <p className="text-slate-500">Tahun Ajaran {classroom.academic_year} • Jurusan {classroom.major}</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="flex bg-white p-2 rounded-xl shadow-sm border border-slate-100 gap-4">
                                 <div className="text-center px-4 border-r border-slate-100 last:border-0">
                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Wali Kelas</div>
                                    <div className="font-semibold text-slate-800 flex items-center justify-center gap-2">
                                        <UserIcon className="w-4 h-4 text-blue-500" />
                                        {classroom.teacher?.name || 'Belum ditentukan'}
                                    </div>
                                 </div>
                                 <div className="text-center px-4">
                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Siswa</div>
                                    <div className="font-semibold text-slate-800 flex items-center justify-center gap-2">
                                        <Users className="w-4 h-4 text-green-500" />
                                        {students.length} Siswa
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="siswa" className="w-full">
                    <TabsList className="bg-white border border-slate-200 p-1 w-full md:w-auto h-auto rounded-xl shadow-sm grid grid-cols-2 md:inline-flex">
                        <TabsTrigger value="siswa" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            Daftar Siswa
                        </TabsTrigger>
                        <TabsTrigger value="jadwal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Jadwal Pelajaran
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="siswa" className="mt-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg">Data Siswa Kelas {classroom.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DataTable 
                                    data={students} 
                                    columns={studentColumns}
                                    onAction={() => {}}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="jadwal" className="mt-6">
                        {classroom.schedules && classroom.schedules.length > 0 ? (
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                    <CardTitle className="text-lg">Jadwal Pelajaran</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <DataTable 
                                        data={classroom.schedules} 
                                        columns={scheduleColumns}
                                        onAction={() => {}}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">Belum ada jadwal</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                    Jadwal pelajaran untuk kelas ini belum diatur. Silakan hubungi bagian kurikulum.
                                </p>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </TeacherLayout>
    );
}
