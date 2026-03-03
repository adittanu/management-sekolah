import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { FileEdit, ArrowLeft, Eye, Printer, Save, School as SchoolIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

interface School {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    headmaster_name?: string;
    headmaster_id?: string;
}

interface Letter {
    id: number;
    title: string;
    content: string;
    letter_number: string | null;
    letter_date: string | null;
    category: string;
}

interface Props {
    school: School;
    letter?: Letter;
}

const categories = [
    { value: 'umum', label: 'Umum' },
    { value: 'undangan', label: 'Undangan' },
    { value: 'pemberitahuan', label: 'Pemberitahuan' },
    { value: 'edaran', label: 'Surat Edaran' },
    { value: 'keterangan', label: 'Surat Keterangan' },
    { value: 'tugas', label: 'Surat Tugas' },
];

export default function CreateLetter({ school, letter }: Props) {
    const isEditing = !!letter;
    const [showPreview, setShowPreview] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        title: letter?.title || '',
        content: letter?.content || '',
        letter_number: letter?.letter_number || '',
        letter_date: letter?.letter_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        category: letter?.category || 'umum',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && letter) {
            put(route('admin.generator-surat.update', letter.id), {
                onSuccess: () => toast.success('Surat berhasil diperbarui'),
                onError: () => toast.error('Gagal memperbarui surat'),
            });
        } else {
            post(route('admin.generator-surat.store'), {
                onSuccess: () => toast.success('Surat berhasil dibuat'),
                onError: () => toast.error('Gagal membuat surat'),
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const logoUrl = school?.logo ? `/storage/${school.logo}` : null;

    return (
        <AdminLayout title={isEditing ? 'Edit Surat' : 'Buat Surat Baru'}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('admin.generator-surat.index')}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <FileEdit className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                {isEditing ? 'Edit Surat' : 'Buat Surat Baru'}
                            </h2>
                        </div>
                        <p className="text-slate-500 ml-12">Tulis konten surat dan lihat preview dengan kop surat.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Form Panel */}
                    <Card className="border border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Detail Surat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Kategori Surat</Label>
                                        <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tanggal Surat</Label>
                                        <Input
                                            type="date"
                                            value={data.letter_date}
                                            onChange={(e) => setData('letter_date', e.target.value)}
                                        />
                                        {errors.letter_date && <p className="text-xs text-red-500">{errors.letter_date}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Nomor Surat <span className="text-slate-400 text-xs">(opsional)</span></Label>
                                    <Input
                                        value={data.letter_number}
                                        onChange={(e) => setData('letter_number', e.target.value)}
                                        placeholder="Contoh: 001/SMAN1/III/2026"
                                    />
                                    {errors.letter_number && <p className="text-xs text-red-500">{errors.letter_number}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Judul / Perihal Surat</Label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Undangan Rapat Wali Murid"
                                    />
                                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Isi Surat</Label>
                                    <Textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={12}
                                        placeholder="Tulis isi surat di sini..."
                                        className="resize-y"
                                    />
                                    {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Surat'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)} className="xl:hidden">
                                        <Eye className="w-4 h-4 mr-2" />
                                        {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Live Preview Panel */}
                    <div className={`${showPreview ? 'block' : 'hidden'} xl:block`}>
                        <Card className="border border-slate-200 shadow-sm sticky top-8">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Preview Surat</CardTitle>
                                {isEditing && letter && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/admin/generator-surat/${letter.id}/print`, '_blank')}
                                    >
                                        <Printer className="w-4 h-4 mr-1" />
                                        Cetak
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-inner" style={{ fontFamily: "'Times New Roman', Times, serif", minHeight: '500px' }}>
                                    {/* KOP Surat */}
                                    <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-900 mb-6">
                                        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <SchoolIcon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-center">
                                            <h1 className="text-base font-bold uppercase tracking-wide">{school?.name || 'NAMA SEKOLAH'}</h1>
                                            <p className="text-xs text-slate-600">{school?.address || 'Alamat Sekolah'}</p>
                                            <p className="text-xs text-slate-500">
                                                {school?.phone && `Telp: ${school.phone}`}
                                                {school?.phone && school?.email && ' | '}
                                                {school?.email && `Email: ${school.email}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="text-center mb-6">
                                        <h2 className="text-sm font-bold uppercase underline tracking-wider">
                                            {categories.find(c => c.value === data.category)?.label?.toUpperCase() || 'SURAT'}
                                        </h2>
                                        {data.letter_number && (
                                            <p className="text-xs text-slate-500 mt-1">Nomor: {data.letter_number}</p>
                                        )}
                                    </div>

                                    {/* Perihal */}
                                    {data.title && (
                                        <div className="mb-4">
                                            <p className="text-sm"><strong>Perihal:</strong> {data.title}</p>
                                        </div>
                                    )}

                                    {/* Body */}
                                    <div className="text-sm leading-7 whitespace-pre-wrap text-justify min-h-[120px]">
                                        {data.content || <span className="text-slate-400 italic">Isi surat akan muncul di sini...</span>}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-end mt-12">
                                        <div className="text-center text-sm">
                                            <p className="mb-1">{formatDate(data.letter_date || new Date().toISOString())}</p>
                                            <p className="mb-16">Kepala Sekolah,</p>
                                            <p className="font-bold underline">{school?.headmaster_name || 'Nama Kepala Sekolah'}</p>
                                            {school?.headmaster_id && (
                                                <p className="text-xs text-slate-500">NIP. {school.headmaster_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
