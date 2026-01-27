import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Save, School as SchoolIcon, Bell, FileText, Database, Upload, Clock, Plus, Trash2, Music, AlertTriangle, Calendar, ShieldAlert, RefreshCw, Eraser, FileUp, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { mockSchedule } from '@/data/mockData';
import { Link, useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { toast } from 'sonner';

interface SchoolProps {
    id: number;
    name: string;
    app_name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    npsn: string;
    accreditation: string;
    headmaster_name: string;
    headmaster_id: string;
    logo: string | null;
}

export default function SettingIndex({ school }: { school: SchoolProps }) {
    const [activeTab, setActiveTab] = useState('profil');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<{ title: string, desc: string, action: () => void } | null>(null);
    const [confirmInput, setConfirmInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewLogo, setPreviewLogo] = useState<string | null>(school.logo ? `/storage/${school.logo}` : null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: school.name || '',
        app_name: school.app_name || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        website: school.website || '',
        npsn: school.npsn || '',
        accreditation: school.accreditation || '',
        headmaster_name: school.headmaster_name || '',
        headmaster_id: school.headmaster_id || '',
        logo: null as File | null,
    });

    useEffect(() => {
        if (recentlySuccessful) {
            toast.success("Pengaturan berhasil disimpan");
        }
    }, [recentlySuccessful]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.setting.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSecureAction = (title: string, desc: string, action: () => void) => {
        setActionToConfirm({ title, desc, action });
        setConfirmInput('');
        setConfirmOpen(true);
    };

    const executeAction = () => {
        if (confirmInput === 'KONFIRMASI') {
            actionToConfirm?.action();
            setConfirmOpen(false);
            alert("Aksi berhasil dijalankan (Simulasi)");
        }
    };

    // Calculate Schedule Stats
    const totalScheduleItems = Object.values(mockSchedule).reduce((acc, curr) => acc + curr.length, 0);
    const activeDays = Object.keys(mockSchedule).length;

    return (
        <AdminLayout title="Pengaturan Sistem">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan Sistem</h2>
                        <p className="text-slate-500">Konfigurasi profil sekolah, dokumen surat, jam KBM dan data sistem.</p>
                    </div>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                        onClick={handleSubmit}
                        disabled={processing}
                    >
                        {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                    {[
                        { id: 'profil', label: 'Profil Sekolah', icon: SchoolIcon },
                        { id: 'jadwal', label: 'Jadwal & Bel', icon: Bell },
                        { id: 'dokumen', label: 'Dokumen & KOP', icon: FileText },
                        { id: 'data', label: 'Data & System', icon: Database },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-8">
                        {activeTab === 'profil' && (
                            <div className="grid md:grid-cols-[240px_1fr] gap-8">
                                {/* Logo Section */}
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Logo Sekolah</Label>
                                    <div 
                                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewLogo ? (
                                            <img src={previewLogo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                                <SchoolIcon className="w-10 h-10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-medium">Klik untuk ganti</span>
                                        </div>
                                        <Input 
                                            type="file" 
                                            className="hidden" 
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                    </div>
                                    <div className="text-xs text-slate-500 text-center">
                                        Format: PNG, JPG (Max 2MB)
                                    </div>
                                    {errors.logo && <div className="text-red-500 text-xs text-center">{errors.logo}</div>}
                                </div>

                                {/* Form Section */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Nama Sekolah</Label>
                                            <Input 
                                                value={data.name} 
                                                onChange={(e) => setData('name', e.target.value)} 
                                                className="h-11" 
                                            />
                                            {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nama Aplikasi</Label>
                                            <Input 
                                                value={data.app_name} 
                                                onChange={(e) => setData('app_name', e.target.value)} 
                                                className="h-11" 
                                                placeholder="Contoh: Sekolah Kita"
                                            />
                                            {errors.app_name && <div className="text-red-500 text-xs">{errors.app_name}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Alamat Lengkap</Label>
                                        <Input 
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="h-11" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Website</Label>
                                            <Input 
                                                value={data.website}
                                                onChange={(e) => setData('website', e.target.value)}
                                                className="h-11" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input 
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="h-11" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>NPSN</Label>
                                            <Input 
                                                value={data.npsn}
                                                onChange={(e) => setData('npsn', e.target.value)}
                                                placeholder="Nomor Pokok Sekolah Nasional" 
                                                className="h-11" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Akreditasi</Label>
                                            <Input 
                                                value={data.accreditation}
                                                onChange={(e) => setData('accreditation', e.target.value)}
                                                placeholder="Contoh: A (Unggul)" 
                                                className="h-11" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'jadwal' && (
                             <div className="space-y-8">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>Jam Masuk Siswa</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input defaultValue="07:00" className="pl-10 h-10" type="time" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Jam Pulang (Reguler)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input defaultValue="15:30" className="pl-10 h-10" type="time" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Durasi 1 JP (Menit)</Label>
                                        <Input defaultValue="45" type="number" className="h-10" />
                                    </div>
                                </div>

                                {/* Link to Schedule Data */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-blue-900 mb-2">Ringkasan Master Jadwal</h3>
                                            <div className="flex gap-6 mt-4">
                                                <div>
                                                    <p className="text-sm text-blue-600/80">Hari Aktif</p>
                                                    <p className="text-2xl font-bold text-blue-800">{activeDays} Hari</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-blue-600/80">Total Sesi Terjadwal</p>
                                                    <p className="text-2xl font-bold text-blue-800">{totalScheduleItems} Sesi</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href="/admin/jadwal">
                                            <Button variant="outline" className="bg-white text-blue-700 border-blue-200 hover:bg-blue-100">
                                                Kelola Jadwal Lengkap <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                <div className="border rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-700">Pengaturan Bel Sekolah</h3>
                                        <Button size="sm" variant="outline" className="h-8">
                                            <Plus className="w-3 h-3 mr-1" /> Tambah Bel
                                        </Button>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {[
                                            { time: '07:00', type: 'Masuk', audio: 'bel_masuk.mp3' },
                                            { time: '09:30', type: 'Istirahat 1', audio: 'bel_istirahat.mp3' },
                                            { time: '10:00', type: 'Masuk Setelah Istirahat', audio: 'bel_masuk.mp3' },
                                            { time: '12:00', type: 'Istirahat Sholat', audio: 'bel_sholat.mp3' },
                                        ].map((bell, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors">
                                                <div className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{bell.time}</div>
                                                <div className="flex-1 font-medium text-slate-800">{bell.type}</div>
                                                <div className="text-xs text-slate-400 italic flex items-center gap-1">
                                                    <Music className="w-3 h-3" /> {bell.audio}
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        )}

                        {activeTab === 'dokumen' && (
                            <div className="grid md:grid-cols-[1fr_360px] gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-slate-800 border-b pb-2">Identitas Kepala Sekolah</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nama Lengkap</Label>
                                                <Input 
                                                    value={data.headmaster_name}
                                                    onChange={(e) => setData('headmaster_name', e.target.value)}
                                                    className="h-10" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>NIP / NIY</Label>
                                                <Input 
                                                    value={data.headmaster_id}
                                                    onChange={(e) => setData('headmaster_id', e.target.value)}
                                                    className="h-10" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-slate-800 border-b pb-2">Kop Surat & Kontak</h3>
                                        <div className="space-y-2">
                                            <Label>Alamat Lengkap</Label>
                                            <Input 
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kontak (Telp/Email)</Label>
                                            <Input 
                                                value={`Telp: ${data.phone} | Email: ${data.email}`}
                                                readOnly
                                                className="bg-slate-50"
                                            />
                                            <span className="text-xs text-slate-500">Diambil dari data Profil Sekolah</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PDF Preview */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" /> Preview Dokumen
                                    </Label>
                                    <div className="bg-slate-200 p-4 rounded-xl">
                                        <div className="bg-white aspect-[1/1.4] w-full shadow-lg p-6 text-[10px] flex flex-col relative overflow-hidden">
                                            {/* KOP */}
                                            <div className="flex border-b-2 border-slate-900 pb-2 mb-4 items-center gap-3">
                                                 <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden">
                                                    {previewLogo ? (
                                                        <img src={previewLogo} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <SchoolIcon className="w-5 h-5" />
                                                    )}
                                                 </div>
                                                 <div className="text-center w-full">
                                                    <h3 className="font-bold text-sm uppercase">{data.name}</h3>
                                                    <p className="text-slate-600">{data.address}</p>
                                                    <p className="text-slate-500">Telp: {data.phone} | Email: {data.email}</p>
                                                 </div>
                                            </div>

                                            {/* Body Placeholder */}
                                            <div className="space-y-2 text-slate-300">
                                                <div className="h-2 w-1/3 bg-slate-200 rounded"></div>
                                                <div className="h-2 w-1/4 bg-slate-200 rounded mb-4"></div>
                                                
                                                <div className="space-y-1">
                                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                    <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                                                </div>
                                            </div>

                                            {/* Signature */}
                                            <div className="mt-auto ml-auto text-right w-1/2">
                                                <p>Kepala Sekolah,</p>
                                                <div className="h-10 my-1 flex justify-end">
                                                    {/* Signature Placeholder */}
                                                    <div className="w-20 h-full border border-dashed border-slate-200 flex items-center justify-center text-slate-300 italic">
                                                        ttd
                                                    </div>
                                                </div>
                                                <p className="font-bold underline">{data.headmaster_name}</p>
                                                <p>NIP. {data.headmaster_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div className="space-y-8">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-800">Maintenance Mode</h4>
                                        <p className="text-sm text-amber-700 mb-3">Aktifkan mode maintenance untuk mencegah user login selain Admin saat perbaikan.</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-11 bg-slate-200 rounded-full relative cursor-pointer hover:bg-slate-300 transition-colors">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-600">Non-Aktif</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-red-500" />
                                        Zona Bahaya
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex items-center justify-between group hover:bg-red-50 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-red-700 text-sm">Reset Data Siswa</h4>
                                                <p className="text-xs text-red-600/80">Hapus semua data siswa dan nilai.</p>
                                            </div>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleSecureAction("Reset Data Siswa", "Tindakan ini akan menghapus seluruh data siswa dan nilai secara permanen.", () => console.log('Resetting Students...'))}
                                            >
                                                <RefreshCw className="w-3 h-3 mr-2" />
                                                Reset Data
                                            </Button>
                                        </div>
                                        
                                        <div className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex items-center justify-between group hover:bg-red-50 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-red-700 text-sm">Hapus Semua Laporan</h4>
                                                <p className="text-xs text-red-600/80">Kosongkan log presensi & jurnal.</p>
                                            </div>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleSecureAction("Hapus Laporan", "Semua laporan presensi dan jurnal akan dihapus permanen.", () => console.log('Clearing Reports...'))}
                                            >
                                                 <Eraser className="w-3 h-3 mr-2" />
                                                Clear Laporan
                                            </Button>
                                        </div>

                                        <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 flex items-center justify-between md:col-span-2">
                                            <div>
                                                <h4 className="font-bold text-blue-700 text-sm">Backup Database</h4>
                                                <p className="text-xs text-blue-600/80">Download file SQL untuk backup manual.</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                                                <Database className="w-3 h-3 mr-2" />
                                                Download SQL
                                            </Button>
                                        </div>

                                        <div className="border border-slate-200 bg-white rounded-xl p-4 flex items-center justify-between md:col-span-2">
                                            <div>
                                                <h4 className="font-bold text-slate-700 text-sm">Restore Database</h4>
                                                <p className="text-xs text-slate-500">Upload file SQL untuk mengembalikan data.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    <FileUp className="w-3 h-3 mr-2" />
                                                    Upload Backup
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Secure Action Dialog */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="sm:max-w-md bg-white border-red-100">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5" />
                                Konfirmasi Keamanan
                            </DialogTitle>
                            <DialogDescription>
                                {actionToConfirm?.desc}
                                <br />
                                Ketik <strong>KONFIRMASI</strong> untuk melanjutkan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input 
                                value={confirmInput} 
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder="Ketik KONFIRMASI"
                                className="border-red-200 focus-visible:ring-red-500"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Batal</Button>
                            <Button 
                                variant="destructive" 
                                onClick={executeAction}
                                disabled={confirmInput !== 'KONFIRMASI'}
                            >
                                Jalankan Aksi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
