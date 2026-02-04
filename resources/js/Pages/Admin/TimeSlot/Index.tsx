import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Search, Plus, Clock, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { useForm, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

interface TimeSlot {
    id: number;
    slot_number: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedTimeSlots {
    data: TimeSlot[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

interface Props {
    timeSlots: PaginatedTimeSlots;
}

export default function TimeSlotIndex({ timeSlots }: Props) {
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('search') || '';
        }
        return '';
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== '') {
                router.get(
                    route('admin.time-slot.index'),
                    { search: searchQuery },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            } else if (window.location.search.includes('search')) {
                 router.get(
                    route('admin.time-slot.index'),
                    {},
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
    const [timeSlotToDelete, setTimeSlotToDelete] = useState<TimeSlot | null>(null);
    const { flash } = usePage<PageProps>().props;

    // Listen for flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success as string);
        }
        if (flash?.error) {
            toast.error(flash.error as string);
        }
    }, [flash]);

    // Form handling
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        slot_number: '',
        start_time: '',
        end_time: '',
        is_active: true,
    });

    const openAddModal = () => {
        setEditingTimeSlot(null);
        reset();
        clearErrors();
        setIsAddModalOpen(true);
    };

    const openEditModal = (timeSlot: TimeSlot) => {
        setEditingTimeSlot(timeSlot);
        setData({
            slot_number: timeSlot.slot_number.toString(),
            start_time: timeSlot.start_time,
            end_time: timeSlot.end_time,
            is_active: timeSlot.is_active,
        });
        clearErrors();
        setIsAddModalOpen(true);
    };

    const handleDelete = (timeSlot: TimeSlot) => {
        setTimeSlotToDelete(timeSlot);
    };

    const confirmDelete = () => {
        if (timeSlotToDelete) {
            router.delete(route('admin.time-slot.destroy', timeSlotToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setTimeSlotToDelete(null);
                },
                onError: () => {
                    toast.error('Gagal menghapus jam pelajaran. Silakan coba lagi.');
                }
            });
        }
    };

    const handleSubmit = () => {
        if (editingTimeSlot) {
            put(route('admin.time-slot.update', editingTimeSlot.id), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                    toast.success('Jam pelajaran berhasil diperbarui');
                },
                onError: () => {
                    toast.error('Gagal memperbarui jam pelajaran. Periksa input anda.');
                }
            });
        } else {
            post(route('admin.time-slot.store'), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                    toast.success('Jam pelajaran berhasil ditambahkan');
                },
                onError: () => {
                    toast.error('Gagal menambahkan jam pelajaran. Periksa input anda.');
                }
            });
        }
    };

    return (
        <AdminLayout title="Jam Pelajaran">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Jam Pelajaran</h2>
                        </div>
                        <p className="text-slate-500">Atur master data jam pelajaran yang akan digunakan di jadwal KBM.</p>
                    </div>
                    <Button 
                        onClick={openAddModal}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Jam
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Cari jam ke-..." 
                        className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Content */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[80px]">#</TableHead>
                                <TableHead>Jam Ke-</TableHead>
                                <TableHead>Jam Mulai</TableHead>
                                <TableHead>Jam Selesai</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {timeSlots.data && timeSlots.data.length > 0 ? (
                                timeSlots.data.map((timeSlot, index) => (
                                    <TableRow key={timeSlot.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium text-slate-500">
                                            {(timeSlots.current_page - 1) * timeSlots.per_page + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-blue-600">{timeSlot.slot_number}</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">Jam Ke-{timeSlot.slot_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-slate-600">{timeSlot.start_time}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-slate-600">{timeSlot.end_time}</span>
                                        </TableCell>
                                        <TableCell>
                                            {timeSlot.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => openEditModal(timeSlot)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(timeSlot)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        Tidak ada data jam pelajaran.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                     <div className="text-sm text-slate-500">
                        Menampilkan {timeSlots.from || 0} sampai {timeSlots.to || 0} dari {timeSlots.total} data
                    </div>
                    <div className="flex gap-1">
                        {timeSlots.links.map((link, index) => (
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

                {/* Add/Edit Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {editingTimeSlot ? 'Edit Jam Pelajaran' : 'Tambah Jam Pelajaran'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingTimeSlot ? 'Edit detail jam pelajaran.' : 'Tambahkan jam pelajaran baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="slot_number">Jam Ke-</Label>
                                    <Input 
                                        id="slot_number"
                                        type="number"
                                        min="1"
                                        value={data.slot_number}
                                        onChange={e => setData('slot_number', e.target.value)}
                                        placeholder="1" 
                                        className="bg-slate-50 border-slate-200" 
                                    />
                                    {errors.slot_number && <p className="text-sm text-red-500">{errors.slot_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Jam Mulai</Label>
                                    <Input 
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={e => setData('start_time', e.target.value)}
                                        className="bg-slate-50 border-slate-200" 
                                    />
                                    {errors.start_time && <p className="text-sm text-red-500">{errors.start_time}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">Jam Selesai</Label>
                                    <Input 
                                        id="end_time"
                                        type="time"
                                        value={data.end_time}
                                        onChange={e => setData('end_time', e.target.value)}
                                        className="bg-slate-50 border-slate-200" 
                                    />
                                    {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active" className="text-base">Status Aktif</Label>
                                    <p className="text-sm text-slate-500">Jam pelajaran ini akan ditampilkan di jadwal</p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <span className="font-semibold">Info:</span> Pastikan jam mulai dan jam selesai tidak tumpang tindih dengan jam pelajaran lain.
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                            <Button onClick={handleSubmit} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!timeSlotToDelete} onOpenChange={(open) => !open && setTimeSlotToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Jam pelajaran ke-<strong>{timeSlotToDelete?.slot_number}</strong> akan dihapus permanen.
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
