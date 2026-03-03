import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Search, Plus, FileEdit, Trash2, Edit2, Printer, Share2, MessageCircle, Send, Facebook, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { useForm, router, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface Letter {
    id: number;
    title: string;
    content: string;
    letter_number: string | null;
    letter_date: string | null;
    category: string;
    created_at: string;
    created_by?: {
        id: number;
        name: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedLetters {
    data: Letter[];
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
}

interface Props {
    letters: PaginatedLetters;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
    umum: { label: 'Umum', color: 'bg-slate-100 text-slate-700' },
    undangan: { label: 'Undangan', color: 'bg-blue-100 text-blue-700' },
    pemberitahuan: { label: 'Pemberitahuan', color: 'bg-amber-100 text-amber-700' },
    edaran: { label: 'Edaran', color: 'bg-purple-100 text-purple-700' },
    keterangan: { label: 'Keterangan', color: 'bg-emerald-100 text-emerald-700' },
    tugas: { label: 'Surat Tugas', color: 'bg-rose-100 text-rose-700' },
};

export default function LetterGeneratorIndex({ letters }: Props) {
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('search') || '';
        }
        return '';
    });
    const [letterToDelete, setLetterToDelete] = useState<Letter | null>(null);
    const [letterToShare, setLetterToShare] = useState<Letter | null>(null);
    const { flash } = usePage<PageProps>().props;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== '') {
                router.get(
                    route('admin.generator-surat.index'),
                    { search: searchQuery },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            } else if (window.location.search.includes('search')) {
                router.get(
                    route('admin.generator-surat.index'),
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

    const confirmDelete = (): void => {
        if (!letterToDelete) return;

        router.delete(route('admin.generator-surat.destroy', letterToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setLetterToDelete(null);
                toast.success('Surat berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus surat.');
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AdminLayout title="Generator Surat">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <FileEdit className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Generator Surat</h2>
                        </div>
                        <p className="text-slate-500">Buat surat resmi sekolah dengan kop surat, cetak, atau bagikan.</p>
                    </div>
                    <Link href={route('admin.generator-surat.create')}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Surat Baru
                        </Button>
                    </Link>
                </div>

                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Cari judul, nomor, atau isi surat..."
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
                                    <TableHead>Judul Surat</TableHead>
                                    <TableHead>Nomor Surat</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Dibuat Oleh</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {letters.data.length > 0 ? (
                                    letters.data.map((letter) => (
                                        <TableRow key={letter.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-semibold text-slate-900 max-w-[280px]">
                                                <p className="line-clamp-1">{letter.title}</p>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {letter.letter_number || <span className="text-slate-400 italic">Belum ada</span>}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {formatDate(letter.letter_date)}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryLabels[letter.category]?.color || 'bg-slate-100 text-slate-600'}`}>
                                                    {categoryLabels[letter.category]?.label || letter.category}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">{letter.created_by?.name ?? '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <Link href={route('admin.generator-surat.edit', letter.id)}>
                                                        <Button variant="ghost" size="icon" title="Edit Surat">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon" className="text-emerald-600" title="Cetak Surat" onClick={() => window.open(`/admin/generator-surat/${letter.id}/print`, '_blank')}>
                                                        <Printer className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-indigo-600" title="Bagikan Surat" onClick={() => setLetterToShare(letter)}>
                                                        <Share2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => setLetterToDelete(letter)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                                            Belum ada surat. Klik "Buat Surat Baru" untuk mulai.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex items-center justify-between border-t bg-slate-50/50 px-6 py-4">
                            <div className="text-xs text-slate-500">
                                Menampilkan {letters.from || 0} sampai {letters.to || 0} dari {letters.total} data
                            </div>
                            <div className="flex gap-1">
                                {letters.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={`h-8 w-8 p-0 ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${link.active ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
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

                {/* Delete Confirmation */}
                <AlertDialog open={letterToDelete !== null} onOpenChange={(open) => !open && setLetterToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Surat</AlertDialogTitle>
                            <AlertDialogDescription>
                                Surat "{letterToDelete?.title}" akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Share Dialog */}
                <Dialog open={letterToShare !== null} onOpenChange={(open) => !open && setLetterToShare(null)}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Bagikan Surat</DialogTitle>
                            <DialogDescription>
                                Pilih platform untuk membagikan surat ini.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-4">
                            <Button
                                variant="outline"
                                className="flex items-center justify-start gap-3 h-12 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => {
                                    const text = encodeURIComponent(`*${letterToShare?.title}*\n${letterToShare?.letter_number ? `No: ${letterToShare.letter_number}\n` : ''}\n${letterToShare?.content}`);
                                    window.open(`https://wa.me/?text=${text}`, '_blank');
                                }}
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-base font-semibold">WhatsApp</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center justify-start gap-3 h-12 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                    const text = encodeURIComponent(`*${letterToShare?.title}*\n${letterToShare?.content}`);
                                    const url = encodeURIComponent(window.location.origin + `/admin/generator-surat/${letterToShare?.id}/print`);
                                    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                                }}
                            >
                                <Send className="w-5 h-5" />
                                <span className="text-base font-semibold">Telegram</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center justify-start gap-3 h-12 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                                onClick={() => {
                                    const url = encodeURIComponent(window.location.origin + `/admin/generator-surat/${letterToShare?.id}/print`);
                                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                }}
                            >
                                <Facebook className="w-5 h-5" />
                                <span className="text-base font-semibold">Facebook</span>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
