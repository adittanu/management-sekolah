import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Link, useForm, router } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Search, School, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { useState, FormEventHandler, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { useDebounce } from 'use-debounce';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";

interface User {
    id: number;
    name: string;
}

interface Classroom {
    id: number;
    name: string;
    level: string;
    major: string;
    academic_year: string;
    teacher_id: number | null;
    teacher?: User;
    students_count?: number;
}

interface Props {
    classrooms: {
        data: Classroom[];
        links: any[];
        meta: any;
    };
    teachers: User[];
    availableLevels: string[];
}

export default function KelasIndex({ classrooms, teachers, availableLevels }: Props) {
    const [searchQuery, setSearchQuery] = useState(new URLSearchParams(window.location.search).get('search') || '');
    const [selectedLevel, setSelectedLevel] = useState(new URLSearchParams(window.location.search).get('level') || 'Semua');
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [isEditClassOpen, setIsEditClassOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<Classroom | null>(null);
    const [classToDelete, setClassToDelete] = useState<Classroom | null>(null);
    const [debouncedSearch] = useDebounce(searchQuery, 300);

    // Initial load sync
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const search = queryParams.get('search');
        const level = queryParams.get('level');
        if (search !== null) setSearchQuery(search);
        if (level !== null) setSelectedLevel(level);
    }, []);

    useEffect(() => {
        const params: Record<string, any> = {};
        if (debouncedSearch) params.search = debouncedSearch;
        
        // Map display text to value for backend
        let levelValue = selectedLevel;
        if (selectedLevel !== 'Semua') params.level = levelValue;

        router.get(route('admin.kelas.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, [debouncedSearch, selectedLevel]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        level: '10',
        major: '',
        academic_year: new Date().getFullYear().toString() + '/' + (new Date().getFullYear() + 1).toString(),
        teacher_id: '',
    });

    const { 
        data: editData, 
        setData: setEditData, 
        put: editPut, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: editReset,
        clearErrors: editClearErrors 
    } = useForm({
        name: '',
        level: '10',
        major: '',
        academic_year: '',
        teacher_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.kelas.store'), {
            onSuccess: () => {
                setIsAddClassOpen(false);
                reset();
            },
        });
    };

    const handleEditClass = (kelas: Classroom) => {
        setClassToEdit(kelas);
        setEditData({
            name: kelas.name,
            level: kelas.level,
            major: kelas.major,
            academic_year: kelas.academic_year,
            teacher_id: kelas.teacher_id ? kelas.teacher_id.toString() : '',
        });
        editClearErrors();
        setIsEditClassOpen(true);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!classToEdit) return;

        editPut(route('admin.kelas.update', classToEdit.id), {
            onSuccess: () => {
                setIsEditClassOpen(false);
                editReset();
                setClassToEdit(null);
            },
        });
    };

    const handleDeleteClass = () => {
        if (!classToDelete) return;
        router.delete(route('admin.kelas.destroy', classToDelete.id), {
            onSuccess: () => setClassToDelete(null)
        });
    };

    return (
        <AdminLayout title="Data Rombongan Belajar">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Data Rombel</h2>
                        <p className="text-slate-500">Atur daftar kelas dan rombongan belajar.</p>
                    </div>
                    <Button 
                        onClick={() => setIsAddClassOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                    >
                        + Tambah Rombel
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Cari nama kelas atau wali kelas..." 
                            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        <Button 
                            key="Semua"
                            onClick={() => setSelectedLevel('Semua')}
                            variant={selectedLevel === 'Semua' ? 'secondary' : 'ghost'}
                            className={`whitespace-nowrap ${selectedLevel === 'Semua' ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            Semua
                        </Button>
                        {availableLevels.map((filter) => (
                           <Button 
                                key={filter}
                                onClick={() => setSelectedLevel(filter)}
                                variant={selectedLevel === filter ? 'secondary' : 'ghost'}
                                className={`whitespace-nowrap ${selectedLevel === filter ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                Kelas {filter}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {classrooms.data.length > 0 ? (
                        classrooms.data.map((kelas) => (
                            <div key={kelas.id} className="relative group">
                                <Link href={route('admin.kelas.show', kelas.id)}>
                                    <Card className="hover:shadow-xl transition-all border-slate-200 overflow-hidden cursor-pointer hover:-translate-y-1 bg-white h-full relative z-0">
                                        <CardContent className="p-0">
                                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 flex flex-col items-center justify-center text-white h-48 relative overflow-hidden">
                                                <div className="absolute top-4 left-4 z-10">
                                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                                        Tingkat {kelas.level}
                                                    </Badge>
                                                </div>
                                                <School className="w-16 h-16 opacity-90 mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                                <h3 className="text-3xl font-bold relative z-10">{kelas.name}</h3>
                                                
                                                {/* Decorative elements */}
                                                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                                                <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center justify-between text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-blue-500" />
                                                        <span className="font-semibold text-slate-700">{kelas.students_count || 0} Siswa</span>
                                                    </div>
                                                    <div className="w-px h-4 bg-slate-300"></div>
                                                    <span>Aktif</span>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Wali Kelas</div>
                                                    <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                        {kelas.teacher?.name || 'Belum ada wali kelas'}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white rounded-full">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => handleEditClass(kelas)} className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setClassToDelete(kelas)} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Hapus</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            <School className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">Tidak ada kelas yang ditemukan.</p>
                            <p className="text-sm">Coba ubah filter atau kata kunci pencarian.</p>
                        </div>
                    )}
                </div>

                {/* Add Class Modal */}
                <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">Tambah Kelas Baru</DialogTitle>
                            <DialogDescription>
                                Buat rombongan belajar baru untuk tahun ajaran ini.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={submit}>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="level" className="text-sm font-semibold text-slate-700">Tingkat Kelas</Label>
                                            <Input 
                                                id="level" 
                                                placeholder="Contoh: 10, 11, 12, atau Lainnya" 
                                                className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                                value={data.level}
                                                onChange={(e) => setData('level', e.target.value)}
                                            />
                                            {errors.level && <p className="text-red-500 text-xs">{errors.level}</p>}
                                        </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="className">Nama Kelas</Label>
                                            <Input 
                                                id="className" 
                                                placeholder="Contoh: X IPA 1" 
                                                className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                            />
                                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="major">Jurusan</Label>
                                            <Input 
                                                id="major" 
                                                placeholder="IPA / IPS / TKJ" 
                                                className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                                value={data.major}
                                                onChange={(e) => setData('major', e.target.value)}
                                            />
                                            {errors.major && <p className="text-red-500 text-xs">{errors.major}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="academic_year">Tahun Ajaran</Label>
                                        <Input 
                                            id="academic_year" 
                                            placeholder="2023/2024" 
                                            className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                            value={data.academic_year}
                                            onChange={(e) => setData('academic_year', e.target.value)}
                                        />
                                        {errors.academic_year && <p className="text-red-500 text-xs">{errors.academic_year}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="homeroom">Wali Kelas</Label>
                                        <select 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            value={data.teacher_id}
                                            onChange={(e) => setData('teacher_id', e.target.value)}
                                        >
                                            <option value="">Pilih Wali Kelas...</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                            ))}
                                        </select>
                                        {errors.teacher_id && <p className="text-red-500 text-xs">{errors.teacher_id}</p>}
                                    </div>
                                </div>

                                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex gap-3 border border-blue-100">
                                    <School className="w-5 h-5 shrink-0" />
                                    <p>Kelas baru akan otomatis aktif. Pastikan wali kelas belum memegang kelas lain untuk tahun ajaran yang sama.</p>
                                </div>
                            </div>

                            <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                                <Button type="button" variant="outline" onClick={() => setIsAddClassOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                    {processing ? 'Menyimpan...' : 'Buat Kelas'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Class Modal */}
                <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">Edit Kelas</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi rombongan belajar.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={submitEdit}>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-level" className="text-sm font-semibold text-slate-700">Tingkat Kelas</Label>
                                            <Input 
                                                id="edit-level" 
                                                placeholder="Contoh: 10, 11, 12, atau Lainnya" 
                                                className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                                value={editData.level}
                                                onChange={(e) => setEditData('level', e.target.value)}
                                            />
                                            {editErrors.level && <p className="text-red-500 text-xs">{editErrors.level}</p>}
                                        </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-className">Nama Kelas</Label>
                                            <Input 
                                                id="edit-className" 
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
                                        <Label htmlFor="edit-homeroom">Wali Kelas</Label>
                                        <select 
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

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!classToDelete} onOpenChange={(open: boolean) => !open && setClassToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Kelas <strong>{classToDelete?.name}</strong> akan dihapus permanen. Siswa di dalam kelas ini akan kehilangan asosiasi kelas.
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
            </div>
        </AdminLayout>
    );
}
