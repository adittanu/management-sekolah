import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Search, Plus, MapPin, Trash2, Edit2, Building2, Users, ArrowUpDown, AlertTriangle, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

interface Room {
    id: number;
    name: string;
    code: string;
    type: string;
    capacity: number;
    building: string | null;
    floor: string | null;
    is_active: boolean;
    notes: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRooms {
    data: Room[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

interface Props {
    rooms: PaginatedRooms;
    roomTypes: string[];
}

const ROOM_TYPE_COLORS: Record<string, string> = {
    'Ruang Kelas': 'bg-blue-50 text-blue-700 border-blue-200',
    'Laboratorium': 'bg-purple-50 text-purple-700 border-purple-200',
    'Ruang Guru': 'bg-green-50 text-green-700 border-green-200',
    'Ruang Kepala Sekolah': 'bg-amber-50 text-amber-700 border-amber-200',
    'Perpustakaan': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Aula': 'bg-rose-50 text-rose-700 border-rose-200',
    'Ruang BK': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Lapangan': 'bg-orange-50 text-orange-700 border-orange-200',
};

function getRoomTypeColor(type: string): string {
    return ROOM_TYPE_COLORS[type] || 'bg-slate-50 text-slate-700 border-slate-200';
}

const ROOM_TYPES_OPTIONS = [
    'Ruang Kelas',
    'Laboratorium',
    'Ruang Guru',
    'Ruang Kepala Sekolah',
    'Perpustakaan',
    'Aula',
    'Ruang BK',
    'Lapangan',
    'Ruang Praktik',
    'Gudang',
    'Lainnya',
];

export default function RuanganIndex({ rooms, roomTypes = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('search') || '';
        }
        return '';
    });
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
    const [filterType, setFilterType] = useState<string>(
        () => new URLSearchParams(window.location.search).get('type') || ''
    );

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'Ruang Kelas',
        capacity: 30,
        building: '',
        floor: '',
        is_active: true,
        notes: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            type: 'Ruang Kelas',
            capacity: 30,
            building: '',
            floor: '',
            is_active: true,
            notes: '',
        });
        setFormErrors({});
    };

    // Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const params: Record<string, string> = {};
            if (searchQuery) params.search = searchQuery;
            if (filterType) params.type = filterType;
            router.get(route('admin.ruangan.index'), params, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, filterType]);

    const openAddDialog = () => {
        resetForm();
        setEditingRoom(null);
        setIsAddRoomOpen(true);
    };

    const openEditDialog = (room: Room) => {
        resetForm();
        setEditingRoom(room);
        setFormData({
            name: room.name,
            code: room.code,
            type: room.type,
            capacity: room.capacity,
            building: room.building || '',
            floor: room.floor || '',
            is_active: room.is_active,
            notes: room.notes || '',
        });
        setIsAddRoomOpen(true);
    };

    const handleSubmit = () => {
        const submitData = { ...formData, capacity: Number(formData.capacity) };
        setIsProcessing(true);
        setFormErrors({});

        const onFinish = () => setIsProcessing(false);
        const onError = (errors: Record<string, string>) => {
            setFormErrors(errors);
            toast.error('Terjadi kesalahan validasi');
            onFinish();
        };

        if (editingRoom) {
            router.put(route('admin.ruangan.update', editingRoom.id), submitData, {
                onSuccess: () => {
                    toast.success('Ruangan berhasil diupdate');
                    setIsAddRoomOpen(false);
                    setEditingRoom(null);
                    resetForm();
                },
                onError,
                onFinish,
            });
        } else {
            router.post(route('admin.ruangan.store'), submitData, {
                onSuccess: () => {
                    toast.success('Ruangan berhasil ditambahkan');
                    setIsAddRoomOpen(false);
                    resetForm();
                },
                onError,
                onFinish,
            });
        }
    };

    const handleDelete = () => {
        if (!deletingRoom) return;

        router.delete(route('admin.ruangan.destroy', deletingRoom.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Ruangan berhasil dihapus');
                setDeletingRoom(null);
            },
            onError: () => {
                setDeletingRoom(null);
                toast.error('Gagal menghapus ruangan. Mungkin masih digunakan di jadwal.');
            },
        });
    };

    return (
        <AdminLayout title="Master Data Ruangan">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-emerald-100 p-2 rounded-lg">
                                <MapPin className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Master Data Ruangan</h2>
                        </div>
                        <p className="text-slate-500">Kelola data ruangan, lab, dan fasilitas sekolah.</p>
                    </div>
                    <Button onClick={openAddDialog} data-tour="btn-add-ruangan" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Ruangan
                    </Button>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama ruangan, kode, atau gedung..."
                            className="pl-10 bg-white border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-[200px]">
                        <Select value={filterType} onValueChange={(val) => setFilterType(val === 'all' ? '' : val)}>
                            <SelectTrigger className="bg-white border-slate-200">
                                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {roomTypes.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-2 rounded-lg">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{rooms.total}</p>
                                    <p className="text-xs text-slate-500">Total Ruangan</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {new Set(rooms.data.filter(r => r.building).map(r => r.building)).size}
                                    </p>
                                    <p className="text-xs text-slate-500">Gedung</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <ArrowUpDown className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {rooms.data.filter(r => r.type === 'Laboratorium').length}
                                    </p>
                                    <p className="text-xs text-slate-500">Laboratorium</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Users className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {rooms.data.reduce((sum, r) => sum + r.capacity, 0)}
                                    </p>
                                    <p className="text-xs text-slate-500">Total Kapasitas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="font-semibold text-slate-700">Kode</TableHead>
                                <TableHead className="font-semibold text-slate-700">Nama Ruangan</TableHead>
                                <TableHead className="font-semibold text-slate-700">Tipe</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-center">Kapasitas</TableHead>
                                <TableHead className="font-semibold text-slate-700">Gedung</TableHead>
                                <TableHead className="font-semibold text-slate-700">Lantai</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                                        <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p className="font-medium">Belum ada data ruangan</p>
                                        <p className="text-sm">Klik "Tambah Ruangan" untuk menambahkan.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rooms.data.map((room) => (
                                    <TableRow key={room.id} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{room.code}</code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium text-slate-900">{room.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${getRoomTypeColor(room.type)} text-[11px] font-medium`}>
                                                {room.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="w-3 h-3 text-slate-400" />
                                                <span className="font-medium">{room.capacity}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{room.building || '-'}</TableCell>
                                        <TableCell className="text-slate-600">{room.floor || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={room.is_active ? 'default' : 'secondary'} className={room.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                                                {room.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => openEditDialog(room)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setDeletingRoom(room)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {rooms.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                            <p className="text-sm text-slate-500">
                                Menampilkan {rooms.from}-{rooms.to} dari {rooms.total} ruangan
                            </p>
                            <div className="flex gap-1">
                                {rooms.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        className={link.active ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add/Edit Dialog */}
                <Dialog open={isAddRoomOpen} onOpenChange={(open) => {
                    if (!open) { setIsAddRoomOpen(false); setEditingRoom(null); resetForm(); }
                }}>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>{editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan'}</DialogTitle>
                            <DialogDescription>
                                {editingRoom ? 'Perbarui informasi ruangan.' : 'Tambahkan ruangan baru ke dalam sistem.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Ruangan *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Contoh: R.101, Lab Fisika"
                                        className="bg-slate-50"
                                    />
                                    {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Kode *</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="Contoh: R101, LAB-FIS"
                                        className="bg-slate-50"
                                    />
                                    {formErrors.code && <p className="text-xs text-red-500">{formErrors.code}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipe Ruangan *</Label>
                                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                        <SelectTrigger className="bg-slate-50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROOM_TYPES_OPTIONS.map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Kapasitas *</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                        className="bg-slate-50"
                                    />
                                    {formErrors.capacity && <p className="text-xs text-red-500">{formErrors.capacity}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Gedung</Label>
                                    <Input
                                        value={formData.building}
                                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                        placeholder="Contoh: Gedung A"
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lantai</Label>
                                    <Input
                                        value={formData.floor}
                                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                        placeholder="Contoh: 1, 2, 3"
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Catatan</Label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Catatan tambahan tentang ruangan ini..."
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Ruangan aktif
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setIsAddRoomOpen(false); setEditingRoom(null); resetForm(); }}>Batal</Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleSubmit}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Menyimpan...' : editingRoom ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deletingRoom} onOpenChange={(open) => { if (!open) setDeletingRoom(null); }}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                Hapus Ruangan
                            </DialogTitle>
                            <DialogDescription>
                                Apakah anda yakin ingin menghapus <strong>{deletingRoom?.name}</strong>?
                                Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeletingRoom(null)}>Batal</Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleDelete}
                            >
                                Ya, Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
