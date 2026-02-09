import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Search, Plus, Bell, Trash2, Edit2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { useForm, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface Announcement {
    id: number;
    title: string;
    content: string;
    is_active: boolean;
    created_at: string;
    posted_by?: {
        id: number;
        name: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAnnouncements {
    data: Announcement[];
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    announcements: PaginatedAnnouncements;
}

export default function AnnouncementIndex({ announcements }: Props) {
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('search') || '';
        }

        return '';
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== '') {
                router.get(
                    route('admin.pengumuman.index'),
                    { search: searchQuery },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            } else if (window.location.search.includes('search')) {
                router.get(
                    route('admin.pengumuman.index'),
                    {},
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success as string);
        }

        if (flash?.error) {
            toast.error(flash.error as string);
        }
    }, [flash]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        content: '',
        is_active: true,
    });

    const openAddModal = (): void => {
        setEditingAnnouncement(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (announcement: Announcement): void => {
        setEditingAnnouncement(announcement);
        setData({
            title: announcement.title,
            content: announcement.content,
            is_active: announcement.is_active,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleSubmit = (): void => {
        if (editingAnnouncement) {
            put(route('admin.pengumuman.update', editingAnnouncement.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    toast.success('Pengumuman berhasil diperbarui');
                },
                onError: () => {
                    toast.error('Gagal memperbarui pengumuman.');
                },
            });

            return;
        }

        post(route('admin.pengumuman.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                toast.success('Pengumuman berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan pengumuman.');
            },
        });
    };

    const confirmDelete = (): void => {
        if (!announcementToDelete) {
            return;
        }

        router.delete(route('admin.pengumuman.destroy', announcementToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setAnnouncementToDelete(null);
                toast.success('Pengumuman berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus pengumuman.');
            },
        });
    };

    return (
        <AdminLayout title="Pengumuman">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Bell className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pengumuman Sekolah</h2>
                        </div>
                        <p className="text-slate-500">Kelola pengumuman yang ditampilkan di dashboard guru.</p>
                    </div>
                    <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pengumuman
                    </Button>
                </div>

                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Cari judul atau isi pengumuman..."
                        className="pl-10 h-11 bg-white border-slate-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Isi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Diposting Oleh</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.data.length > 0 ? (
                                    announcements.data.map((announcement) => (
                                        <TableRow key={announcement.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-semibold text-slate-900">{announcement.title}</TableCell>
                                            <TableCell className="max-w-[420px]">
                                                <p className="text-sm text-slate-600 line-clamp-2">{announcement.content}</p>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${announcement.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {announcement.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">{announcement.posted_by?.name ?? '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(announcement)}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setAnnouncementToDelete(announcement)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                                            Belum ada pengumuman.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex items-center justify-between border-t bg-slate-50/50 px-6 py-4">
                            <div className="text-xs text-slate-500">
                                Menampilkan {announcements.from || 0} sampai {announcements.to || 0} dari {announcements.total} data
                            </div>
                            <div className="flex gap-1">
                                {announcements.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${link.active ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label.replace('&laquo; Previous', '<').replace('Next &raquo;', '>'),
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[560px]">
                        <DialogHeader>
                            <DialogTitle>{editingAnnouncement ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</DialogTitle>
                            <DialogDescription>
                                Informasi ini akan tampil pada dashboard guru.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Judul</Label>
                                <Input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Contoh: Rapat Dewan Guru" />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Isi Pengumuman</Label>
                                <Textarea value={data.content} onChange={(e) => setData('content', e.target.value)} rows={5} placeholder="Tulis isi pengumuman..." />
                                {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                            </div>

                            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                                <Label htmlFor="is_active" className="text-sm">Tampilkan di dashboard guru</Label>
                                <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                            <Button onClick={handleSubmit} disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                {processing ? 'Menyimpan...' : editingAnnouncement ? 'Simpan Perubahan' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={announcementToDelete !== null} onOpenChange={(open) => !open && setAnnouncementToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Pengumuman</AlertDialogTitle>
                            <AlertDialogDescription>
                                Pengumuman ini akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
