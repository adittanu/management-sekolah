import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Save, School, Bell, FileText, Database, Upload, Clock, Plus, Trash2, Music, AlertTriangle, Calendar, ShieldAlert, RefreshCw, Eraser, FileUp, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { mockSchedule } from '@/data/mockData';
import { Link } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

export default function SettingIndex() {
    const [activeTab, setActiveTab] = useState('profil');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<{ title: string, desc: string, action: () => void } | null>(null);
    const [confirmInput, setConfirmInput] = useState('');

    // State for Document Preview
    const [docHeader, setDocHeader] = useState({
        schoolName: "Sekolah Kita Bisa Berkarya",
        address: "Jl. Bergerak Berkarya Berdampak No. 123",
        contact: "Telp: (021) 1234567 | Email: info@sekolah.sch.id",
        kasek: "Dr. Budi Santoso, M.Pd",
        nip: "19800101 200501 1 001"
    });

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
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                    {[
                        { id: 'profil', label: 'Profil Sekolah', icon: School },
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
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group">
                                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                            <School className="w-10 h-10" />
                                        </div>
                                        <span className="text-xs text-slate-500 text-center">Klik gambar untuk ganti</span>
                                        <Input type="file" className="hidden" />
                                    </div>
                                </div>

                                {/* Form Section */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Nama Sekolah</Label>
                                        <Input 
                                            value={docHeader.schoolName} 
                                            onChange={(e) => setDocHeader({...docHeader, schoolName: e.target.value})} 
                                            className="h-11" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Alamat Lengkap</Label>
                                        <Input defaultValue="Jl. Bergerak Berkarya Berdampak" className="h-11" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Website</Label>
                                            <Input defaultValue="https://www.gendhis.a" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input defaultValue="kita.bisa.berkarya2018" className="h-11" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>NPSN</Label>
                                            <Input placeholder="Nomor Pokok Sekolah Nasional" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Akreditasi</Label>
                                            <Input placeholder="Contoh: A (Unggul)" className="h-11" />
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
                                                    value={docHeader.kasek}
                                                    onChange={(e) => setDocHeader({...docHeader, kasek: e.target.value})}
                                                    className="h-10" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>NIP / NIY</Label>
                                                <Input 
                                                    value={docHeader.nip}
                                                    onChange={(e) => setDocHeader({...docHeader, nip: e.target.value})}
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
                                                value={docHeader.address}
                                                onChange={(e) => setDocHeader({...docHeader, address: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kontak (Telp/Email)</Label>
                                            <Input 
                                                value={docHeader.contact}
                                                onChange={(e) => setDocHeader({...docHeader, contact: e.target.value})}
                                            />
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
                                                 <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white shrink-0">
                                                    <School className="w-5 h-5" />
                                                 </div>
                                                 <div className="text-center w-full">
                                                    <h3 className="font-bold text-sm uppercase">{docHeader.schoolName}</h3>
                                                    <p className="text-slate-600">{docHeader.address}</p>
                                                    <p className="text-slate-500">{docHeader.contact}</p>
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
                                                <p className="font-bold underline">{docHeader.kasek}</p>
                                                <p>NIP. {docHeader.nip}</p>
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
