import AdminLayout from '@/Layouts/AdminLayout';
import { mockClasses, mockUsers, mockSchedule } from '@/data/mockData';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { DataTable, ColumnDef } from '@/Components/admin/DataTable';

interface ShowProps {
    id: string;
}

export default function KelasShow({ id }: ShowProps) {
    const classId = parseInt(id);
    const kelas = mockClasses.find(c => c.id === classId) || mockClasses[0];
    
    // Define Student Type matching mock structure
    type Student = typeof mockUsers[0];
    const students = mockUsers.filter(u => u.role === 'SISWA');

    // Explicitly type the columns
    const studentColumns: ColumnDef<Student>[] = [
        {
            header: "Nama Siswa",
            accessorKey: "name",
            cell: (row: Student) => (
                <div className="flex items-center gap-3">
                    <img src={row.avatar} alt={row.name} className="w-8 h-8 rounded-full bg-slate-100" />
                    <div>
                        <div className="font-medium text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        { 
            header: "NISN", 
            accessorKey: "id", 
            cell: () => "00" + Math.floor(Math.random() * 8999999 + 1000000) 
        }, 
        { 
            header: "Status", 
            accessorKey: "status", 
            cell: (row: Student) => (
                <Badge 
                    variant={row.status === 'Aktif' || row.status === 'Terverifikasi' ? 'default' : 'secondary'} 
                    className={row.status === 'Aktif' || row.status === 'Terverifikasi' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                >
                    {row.status}
                </Badge>
            ) 
        },
    ];

    return (
        <AdminLayout title={`Kelas ${kelas.name}`}>
            <div className="space-y-6">
                {/* Header Section */}
                <div>
                    <Link href="/admin/kelas" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali ke Data Rombel
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-slate-900">{kelas.name}</h2>
                                <Badge variant="outline" className="text-lg py-1 px-3 border-blue-200 bg-blue-50 text-blue-700">
                                    Tingkat {kelas.tingkat}
                                </Badge>
                            </div>
                            <p className="text-slate-500">Tahun Ajaran 2024/2025 • Semester Ganjil</p>
                        </div>
                        <div className="flex bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-6">
                             <div className="text-center px-4 border-r border-slate-100 last:border-0">
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Wali Kelas</div>
                                <div className="font-semibold text-slate-800 flex items-center justify-center gap-2">
                                    <UserIcon className="w-4 h-4 text-blue-500" />
                                    {kelas.wali}
                                </div>
                             </div>
                             <div className="text-center px-4">
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Siswa</div>
                                <div className="font-semibold text-slate-800 flex items-center justify-center gap-2">
                                    <Users className="w-4 h-4 text-green-500" />
                                    {kelas.siswa} Siswa
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="siswa" className="w-full">
                    <TabsList className="bg-white border border-slate-200 p-1 w-full md:w-auto h-auto rounded-xl shadow-sm grid grid-cols-2 md:inline-flex">
                        <TabsTrigger value="siswa" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all">
                            Daftar Siswa
                        </TabsTrigger>
                        <TabsTrigger value="jadwal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-6 py-2.5 transition-all">
                            Jadwal Pelajaran
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="siswa" className="mt-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg">Data Siswa Kelas {kelas.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DataTable 
                                    data={students} 
                                    columns={studentColumns}
                                    onAction={() => {}}
                                    actionLabel="Tambah Siswa"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="jadwal" className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {Object.entries(mockSchedule).map(([day, schedules]) => (
                                <Card key={day} className="border-slate-200 shadow-sm overflow-hidden">
                                     <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
                                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500" /> 
                                            {day}
                                        </CardTitle>
                                     </CardHeader>
                                     <CardContent className="p-0">
                                        <div className="divide-y divide-slate-100">
                                            {schedules.map((schedule, idx) => (
                                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                                    <div className="w-16 shrink-0 flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-lg py-2">
                                                        <span className="text-xs font-bold">Jam Ke-</span>
                                                        <span className="text-xl font-bold">{schedule.jam}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-800 mb-1 truncate">{schedule.subject}</h4>
                                                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {schedule.time}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <UserIcon className="w-3.5 h-3.5" />
                                                                {schedule.teacher}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {schedule.room}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
