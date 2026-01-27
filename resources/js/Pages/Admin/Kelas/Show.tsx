import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Users, Calendar, Clock, MapPin, User as UserIcon, School, Trash2, Pencil, Search, Plus, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { DataTable, ColumnDef } from '@/Components/admin/DataTable';
import { useState, FormEventHandler, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Checkbox } from '@/Components/ui/checkbox';

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
    classroom: Classroom;
    teachers: User[];
    availableStudents: User[];
}

export default function KelasShow({ classroom, teachers, availableStudents }: Props) {
    const [isEditClassOpen, setIsEditClassOpen] = useState(false);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<Classroom | null>(null);
    const [studentToRemove, setStudentToRemove] = useState<User | null>(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    // Filter students only from relation
    const students = classroom.students || [];

    const getAvatarUrl = (user: User) => {
        if (user.avatar) return user.avatar;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
    };

    // --- Student Management Logic ---

    const filteredAvailableStudents = useMemo(() => {
        if (!studentSearchQuery) return availableStudents;
        return availableStudents.filter(s => 
            s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
            (s.identity_number && s.identity_number.includes(studentSearchQuery))
        );
    }, [availableStudents, studentSearchQuery]);

    const { post: postStudent, processing: processingStudent, reset: resetStudent } = useForm({
        student_ids: [] as number[]
    });

    const handleAddStudents = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.kelas.students.store', classroom.id), {
            student_ids: selectedStudents
        }, {
            onSuccess: () => {
                setIsAddStudentOpen(false);
                setSelectedStudents([]);
                resetStudent();
            }
        });
    };

    const handleRemoveStudent = () => {
        if (!studentToRemove) return;
        router.delete(route('admin.kelas.students.destroy', [classroom.id, studentToRemove.id]), {
            onSuccess: () => setStudentToRemove(null)
        });
    };

    const toggleStudentSelection = (studentId: number) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // --- Edit Class Logic ---

    const { 
        data: editData, 
        setData: setEditData, 
        put: editPut, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: editReset 
    } = useForm({
        name: classroom.name,
        level: classroom.level,
        major: classroom.major,
        academic_year: classroom.academic_year,
        teacher_id: classroom.teacher_id ? classroom.teacher_id.toString() : '',
    });

    const handleEditClass = () => {
        setEditData({
            name: classroom.name,
            level: classroom.level,
            major: classroom.major,
            academic_year: classroom.academic_year,
            teacher_id: classroom.teacher_id ? classroom.teacher_id.toString() : '',
        });
        setIsEditClassOpen(true);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();
        editPut(route('admin.kelas.update', classroom.id), {
            onSuccess: () => {
                setIsEditClassOpen(false);
            },
        });
    };

    const handleDeleteClass = () => {
        if (!classToDelete) return;
        router.delete(route('admin.kelas.destroy', classToDelete.id), {
            onSuccess: () => router.visit(route('admin.kelas.index'))
        });
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
            header: "NISN", 
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
        {
            header: "Aksi",
            accessorKey: "id", // Using ID as accessor to satisfy type, but rendering custom cell
            cell: (row: User) => (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setStudentToRemove(row)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )
        }
    ];

    const scheduleColumns: ColumnDef<Schedule>[] = [
        {
            header: "Hari",
            accessorKey: "day",
            cell: (row: Schedule) => <span className="font-medium capitalize">{row.day}</span>
        },
        {
            header: "Mata Pelajaran",
            accessorKey: "subject", // Fixed accessor
            cell: (row: Schedule) => (
                <div className="font-medium text-slate-900">{row.subject?.name || '-'}</div>
            )
        },
        {
            header: "Guru Pengampu",
            accessorKey: "teacher", // Fixed accessor
            cell: (row: Schedule) => (
                <div className="flex items-center gap-2">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600">{row.teacher?.name || '-'}</span>
                </div>
            )
        },
        {
            header: "Waktu",
            accessorKey: "start_time", // Fixed accessor
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
        <AdminLayout title={`Kelas ${classroom.name}`}>
            <div className="space-y-6">
                {/* Header Section */}
                <div>
                    <Link href={route('admin.kelas.index')} className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali ke Data Rombel
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-slate-900">{classroom.name}</h2>
                                <Badge variant="outline" className="text-lg py-1 px-3 border-blue-200 bg-blue-50 text-blue-700">
                                    Tingkat {classroom.level}
                                </Badge>
                            </div>
                            <p className="text-slate-500">Tahun Ajaran {classroom.academic_year} • Jurusan {classroom.major}</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="hidden md:flex bg-white p-2 rounded-xl shadow-sm border border-slate-100 gap-4 mr-4">
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
                            
                            <Button 
                                variant="outline" 
                                className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors"
                                onClick={handleEditClass}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </Button>

                            <Button 
                                variant="outline" 
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                                onClick={() => setClassToDelete(classroom)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                            </Button>
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
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Data Siswa Kelas {classroom.name}</CardTitle>
                                <Button size="sm" onClick={() => setIsAddStudentOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Siswa
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <DataTable 
                                    data={students} 
                                    columns={studentColumns}
                                    onAction={() => {}} // Disabled as we use custom action column
                                    // actionLabel="Tambah Siswa"
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
                                    Jadwal pelajaran untuk kelas ini belum diatur. Silakan hubungi bagian kurikulum atau atur di menu Jadwal.
                                </p>
                                <Link href={route('admin.jadwal.index')} className="mt-4">
                                    <Button variant="outline">Kelola Jadwal</Button>
                                </Link>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Edit Class Modal */}
                <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">Edit Data Kelas</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi rombongan belajar ini.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={submitEdit}>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-level" className="text-sm font-semibold text-slate-700">Tingkat Kelas</Label>
                                        <Input 
                                            id="edit-level" 
                                            placeholder="Contoh: 10, 11, 12" 
                                            className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                            value={editData.level}
                                            onChange={(e) => setEditData('level', e.target.value)}
                                        />
                                        {editErrors.level && <p className="text-red-500 text-xs">{editErrors.level}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-name">Nama Kelas</Label>
                                            <Input 
                                                id="edit-name" 
                                                placeholder="Contoh: X IPA 1" 
                                                className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                                value={editData.name}
                                                onChange={(e) => setEditData('name', e.target.value)}
                                            />
                                            {editErrors.name && <p className="text-red-500 text-xs">{editErrors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-major">Jurusan</Label>
                                            <Input 
                                                id="edit-major" 
                                                placeholder="IPA / IPS / TKJ" 
                                                className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                                value={editData.major}
                                                onChange={(e) => setEditData('major', e.target.value)}
                                            />
                                            {editErrors.major && <p className="text-red-500 text-xs">{editErrors.major}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-academic_year">Tahun Ajaran</Label>
                                        <Input 
                                            id="edit-academic_year" 
                                            placeholder="2023/2024" 
                                            className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                            value={editData.academic_year}
                                            onChange={(e) => setEditData('academic_year', e.target.value)}
                                        />
                                        {editErrors.academic_year && <p className="text-red-500 text-xs">{editErrors.academic_year}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-teacher">Wali Kelas</Label>
                                        <select 
                                            id="edit-teacher"
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            value={editData.teacher_id}
                                            onChange={(e) => setEditData('teacher_id', e.target.value)}
                                        >
                                            <option value="">Pilih Wali Kelas...</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                            ))}
                                        </select>
                                        {editErrors.teacher_id && <p className="text-red-500 text-xs">{editErrors.teacher_id}</p>}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                                <Button type="button" variant="outline" onClick={() => setIsEditClassOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={editProcessing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add Student Modal */}
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl h-[80vh] flex flex-col">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                            <DialogTitle className="text-xl font-bold text-slate-900">Tambah Siswa ke Kelas</DialogTitle>
                            <DialogDescription>
                                Pilih siswa untuk ditambahkan ke kelas <strong>{classroom.name}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-4 border-b border-slate-100 bg-white shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Cari nama siswa atau NISN..." 
                                    className="pl-10"
                                    value={studentSearchQuery}
                                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-2">
                                {filteredAvailableStudents.length > 0 ? (
                                    filteredAvailableStudents.map(student => (
                                        <div 
                                            key={student.id} 
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                selectedStudents.includes(student.id) 
                                                    ? 'bg-blue-50 border-blue-200' 
                                                    : 'hover:bg-slate-50 border-slate-100'
                                            }`}
                                            onClick={() => toggleStudentSelection(student.id)}
                                        >
                                            <Checkbox 
                                                checked={selectedStudents.includes(student.id)}
                                                onCheckedChange={() => toggleStudentSelection(student.id)}
                                            />
                                            <img 
                                                src={getAvatarUrl(student)} 
                                                alt={student.name} 
                                                className="w-10 h-10 rounded-full bg-slate-200"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">{student.name}</div>
                                                <div className="text-xs text-slate-500">{student.identity_number || 'No NISN'}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        {studentSearchQuery ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Tidak ada siswa tersedia untuk ditambahkan.'}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-between items-center">
                            <div className="text-sm text-slate-500">
                                {selectedStudents.length} siswa dipilih
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>Batal</Button>
                                <Button 
                                    onClick={handleAddStudents} 
                                    disabled={selectedStudents.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Tambahkan Siswa
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Class Confirmation Dialog */}
                <AlertDialog open={!!classToDelete} onOpenChange={(open: boolean) => !open && setClassToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Kelas <strong>{classToDelete?.name}</strong> akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteClass} className="bg-red-600 hover:bg-red-700 text-white">
                                Hapus Kelas
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Remove Student Confirmation Dialog */}
                <AlertDialog open={!!studentToRemove} onOpenChange={(open: boolean) => !open && setStudentToRemove(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Keluarkan Siswa?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin mengeluarkan <strong>{studentToRemove?.name}</strong> dari kelas ini?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRemoveStudent} className="bg-red-600 hover:bg-red-700 text-white">
                                Keluarkan
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}