import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Search, Plus, BookOpen, Clock, User as UserIcon, Trash2, Edit2, Palette, Hash, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';
import { useForm, router } from '@inertiajs/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";

interface Subject {
    id: number;
    name: string;
    code: string;
    category: string | null;
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
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
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

    // Form handling
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        category: 'Wajib'
    });

    const openAddModal = () => {
        setEditingSubject(null);
        reset();
        clearErrors();
        setIsAddMapelOpen(true);
    };

    const openEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        setData({
            name: subject.name,
            code: subject.code,
            category: subject.category || 'Wajib'
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
                }
            });
        }
    };

    const handleSubmit = () => {
        if (editingSubject) {
            put(route('admin.mapel.update', editingSubject.id), {
                onSuccess: () => {
                    setIsAddMapelOpen(false);
                    reset();
                }
            });
        } else {
            post(route('admin.mapel.store'), {
                onSuccess: () => {
                    setIsAddMapelOpen(false);
                    reset();
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

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Cari nama mapel atau kode..." 
                        className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid */}
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
                                        <div className="flex items-center text-sm text-slate-600">
                                            <div className="w-8 flex justify-center">
                                                <UserIcon className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="text-slate-500 italic">Guru belum diatur</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600">
                                            <div className="w-8 flex justify-center">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="text-slate-500 italic">Jadwal belum diatur</span>
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
            </div>
        </AdminLayout>
    );
}
