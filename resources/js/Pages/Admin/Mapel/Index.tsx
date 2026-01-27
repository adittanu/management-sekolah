import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Search, Plus, BookOpen, Clock, User as UserIcon, Trash2, Edit2, Palette, Hash, Tag, AlertTriangle, Info, LayoutGrid, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';
import { useForm, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

interface Subject {
    id: number;
    name: string;
    code: string;
    category: string | null;
    teachers?: Teacher[];
}

interface Teacher {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSubjects {
    data: Subject[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

interface Props {
    subjects: PaginatedSubjects;
    teachers: Teacher[];
}

const COLORS = [
    { name: 'Blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    { name: 'Green', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    { name: 'Purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    { name: 'Orange', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    { name: 'Pink', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    { name: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    { name: 'Rose', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    { name: 'Cyan', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
];

const getSubjectColor = (id: number) => COLORS[id % COLORS.length];

export default function MapelIndex({ subjects, teachers = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('search') || '';
        }
        return '';
    });
    const [isAddMapelOpen, setIsAddMapelOpen] = useState(false);
    
    // Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== '') {
                router.get(
                    route('admin.mapel.index'),
                    { search: searchQuery },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            } else if (window.location.search.includes('search')) {
                 router.get(
                    route('admin.mapel.index'),
                    {},
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const { flash } = usePage<PageProps>().props;
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // State for conflict handling
    const [conflictData, setConflictData] = useState<any[] | null>(null);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

    // Listen for flash messages and conflict data
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success as string);
        }
        if (flash?.error) {
            toast.error(flash.error as string);
        }
        // Check for conflict data in flash messages
        if (flash?.conflict_data) {
            setConflictData(flash.conflict_data);
            setIsConflictModalOpen(true);
        }
    }, [flash]);

    // Form handling
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        category: 'Wajib',
        teacher_ids: [] as number[],
    });

    const openAddModal = () => {
        setEditingSubject(null);
        reset();
        clearErrors();
        setIsAddMapelOpen(true);
    };

    const openEditModal = (subject: Subject & { teachers?: Teacher[] }) => {
        setEditingSubject(subject);
        setData({
            name: subject.name,
            code: subject.code,
            category: subject.category || 'Wajib',
            teacher_ids: subject.teachers?.map(t => t.id) || []
        });
        clearErrors();
        setIsAddMapelOpen(true);
    };

    const handleDelete = (subject: Subject) => {
        setSubjectToDelete(subject);
    };

    const confirmDelete = () => {
        if (subjectToDelete) {
            router.delete(route('admin.mapel.destroy', subjectToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setSubjectToDelete(null);
                    setConflictData(null);
                },
                onError: (errors) => {
                    // Conflict handled by flash message effect
                    if (!errors.error && !flash?.conflict_data) {
                         toast.error('Gagal menghapus mata pelajaran. Silakan coba lagi.');
                    }
                }
            });
        }
    };

    const handleForceDelete = () => {
        if (subjectToDelete) {
            toast.loading('Menghapus paksa data...', { id: 'force-delete' });
            router.delete(route('admin.mapel.destroy', subjectToDelete.id) + '?force=true', {
                preserveScroll: true,
                onSuccess: () => {
                    setSubjectToDelete(null);
                    setConflictData(null);
                    setIsConflictModalOpen(false);
                    toast.success('Mata pelajaran dan data terkait berhasil dihapus paksa.', { id: 'force-delete' });
                },
                onError: (errors) => {
                    console.error('Force delete error:', errors);
                    toast.error('Gagal menghapus paksa data. Silakan coba lagi.', { id: 'force-delete' });
                }
            });
        } else {
            toast.error('Tidak ada data yang dipilih untuk dihapus.');
        }
    };


    const handleSubmit = () => {
        if (editingSubject) {
            put(route('admin.mapel.update', editingSubject.id), {
                onSuccess: () => {
                    setIsAddMapelOpen(false);
                    reset();
                    toast.success('Mata pelajaran berhasil diperbarui');
                },
                onError: () => {
                    toast.error('Gagal memperbarui mata pelajaran. Periksa input anda.');
                }
            });
        } else {
            post(route('admin.mapel.store'), {
                onSuccess: () => {
                    setIsAddMapelOpen(false);
                    reset();
                    toast.success('Mata pelajaran berhasil ditambahkan');
                },
                onError: () => {
                    toast.error('Gagal menambahkan mata pelajaran. Periksa input anda.');
                }
            });
        }
    };

    return (
        <AdminLayout title="Mata Pelajaran">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mata Pelajaran</h2>
                        </div>
                        <p className="text-slate-500">Atur daftar mata pelajaran, kategori, dan kode mapel.</p>
                    </div>
                    <Button 
                        onClick={openAddModal}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Mapel
                    </Button>
                </div>

                {/* Search and View Toggle */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input 
                            placeholder="Cari nama mapel atau kode..." 
                            className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Tampilan Grid"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Tampilan List"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                        {/* Content */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.data.map((subject) => {
                            const color = getSubjectColor(subject.id);
                            return (
                                <Card key={subject.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                    {/* Decorative Top Border */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${color.text.replace('text-', 'bg-')}`} />
                                    
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(subject);
                                                    }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(subject);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{subject.name}</h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 border-slate-200">
                                                {subject.code}
                                            </Badge>
                                            <Badge variant="secondary" className={`font-normal ${color.bg} ${color.text}`}>
                                                {subject.category || 'Umum'}
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                            <div className="flex items-start text-sm text-slate-600">
                                                <div className="w-8 flex justify-center mt-0.5">
                                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {subject.teachers && subject.teachers.length > 0 ? (
                                                        subject.teachers.slice(0, 3).map((teacher, idx) => (
                                                            <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs border border-slate-200">
                                                                {teacher.name.split(' ')[0]}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-500 italic">Guru belum diatur</span>
                                                    )}
                                                    {subject.teachers && subject.teachers.length > 3 && (
                                                        <span className="text-xs text-slate-400 self-center">+{subject.teachers.length - 3} lainnya</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Add New Card Placeholder */}
                        <button 
                            onClick={openAddModal}
                            className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all gap-3 bg-slate-50/50"
                        >
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-medium">Tambah Mapel Baru</span>
                        </button>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[80px]">#</TableHead>
                                    <TableHead>Nama Mata Pelajaran</TableHead>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.data && subjects.data.length > 0 ? (
                                    subjects.data.map((subject, index) => {
                                        const color = getSubjectColor(subject.id);
                                        return (
                                            <TableRow key={subject.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-medium text-slate-500">
                                                    {(subjects.current_page - 1) * subjects.per_page + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-semibold text-slate-700">{subject.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 border-slate-200">
                                                        {subject.code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`font-normal ${color.bg} ${color.text}`}>
                                                        {subject.category || 'Umum'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                            onClick={() => openEditModal(subject)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(subject)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            Tidak ada data mata pelajaran.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                     <div className="text-sm text-slate-500">
                        Menampilkan {subjects.from || 0} sampai {subjects.to || 0} dari {subjects.total} data
                    </div>
                    <div className="flex gap-1">
                        {subjects.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, { search: searchQuery }, { preserveState: true, preserveScroll: true })}
                                className={!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>


                {/* Add Mapel Modal */}
                <Dialog open={isAddMapelOpen} onOpenChange={setIsAddMapelOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingSubject ? 'Edit detail mata pelajaran.' : 'Tambahkan mata pelajaran baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Mata Pelajaran</Label>
                                <Input 
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Contoh: Matematika Wajib" 
                                    className="bg-slate-50 border-slate-200" 
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Kode Mapel</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input 
                                            id="code"
                                            value={data.code}
                                            onChange={e => setData('code', e.target.value)}
                                            placeholder="MTK-01" 
                                            className="pl-9 bg-slate-50 border-slate-200" 
                                        />
                                    </div>
                                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Select value={data.category} onValueChange={val => setData('category', val)}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Wajib">Wajib</SelectItem>
                                            <SelectItem value="Peminatan">Peminatan</SelectItem>
                                            <SelectItem value="Muatan Lokal">Muatan Lokal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teachers">Guru Pengajar</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-2 bg-slate-50">
                                    {teachers.map((teacher) => (
                                        <div key={teacher.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`teacher-${teacher.id}`}
                                                value={teacher.id}
                                                checked={data.teacher_ids.includes(teacher.id)}
                                                onChange={(e) => {
                                                    const id = parseInt(e.target.value);
                                                    if (e.target.checked) {
                                                        setData('teacher_ids', [...data.teacher_ids, id]);
                                                    } else {
                                                        setData('teacher_ids', data.teacher_ids.filter(tid => tid !== id));
                                                    }
                                                }}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor={`teacher-${teacher.id}`} className="text-sm font-normal cursor-pointer select-none">
                                                {teacher.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Pilih guru yang dapat mengajar mata pelajaran ini.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                                <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <span className="font-semibold">Info:</span> Warna kartu akan digenerate secara otomatis berdasarkan ID mata pelajaran untuk konsistensi visual.
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsAddMapelOpen(false)}>Batal</Button>
                            <Button onClick={handleSubmit} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!subjectToDelete} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Mata pelajaran <strong>{subjectToDelete?.name}</strong> akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                {/* Conflict / Force Delete Dialog */}
                <AlertDialog open={isConflictModalOpen} onOpenChange={setIsConflictModalOpen}>
                    <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <AlertDialogHeader>
                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                <AlertTriangle className="w-6 h-6" />
                                <AlertDialogTitle className="text-xl">Data Sedang Digunakan!</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-slate-600">
                                Mata pelajaran <strong>{subjectToDelete?.name}</strong> tidak dapat dihapus karena sedang digunakan di data berikut.
                                <br />
                                Anda dapat membatalkan atau <strong>menghapus paksa</strong> (data terkait juga akan terhapus).
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        {conflictData && conflictData.length > 0 && (
                            <div className="my-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Jadwal Terkait ({conflictData.length})
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {conflictData.map((item: any) => (
                                        <div key={item.id} className="text-sm bg-white p-2 rounded border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <span className="font-medium text-slate-700">{item.classroom}</span>
                                                <span className="mx-2 text-slate-300">|</span>
                                                <span className="text-slate-500">{item.day}, {item.time}</span>
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {item.teacher}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-red-50 p-3 rounded-lg flex gap-3 text-red-700 text-sm mb-4">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>
                                <strong>Peringatan:</strong> Menghapus paksa akan menghapus mata pelajaran ini DAN seluruh jadwal yang terkait secara permanen. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setIsConflictModalOpen(false);
                                setConflictData(null);
                                setSubjectToDelete(null);
                            }}>
                                Batal
                            </AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleForceDelete} 
                                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                            >
                                Hapus Paksa & Bersihkan Data
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
