import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ScanFace, MapPin, CheckCircle, XCircle, Clock, Calendar, Search, Users, UserCheck, BookOpen, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AbsensiIndex() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
    const [scanMessage, setScanMessage] = useState('');
    
    // Mock Data Stats
    const stats = {
        presentToday: 850,
        totalStudents: 900,
        late: 45,
        alpha: 5,
        teachersPresent: 48,
        totalTeachers: 50
    };

    // Mock Logs Siswa
    const studentLogs = [
        { id: 1, time: "06:45:12", name: "Ahmad Fulan", class: "XII-A", status: "Hadir", method: "Face Scan", location: "Gerbang Depan" },
        { id: 2, time: "06:48:30", name: "Siti Aminah", class: "XI-B", status: "Hadir", method: "Fingerprint", location: "Lobby" },
        { id: 3, time: "07:05:00", name: "Budi Santoso", class: "X-C", status: "Terlambat", method: "Face Scan", location: "Gerbang Depan" },
    ];

    // Mock Logs Guru
    const teacherLogs = [
        { id: 1, time: "07:00", name: "Pak Guru Fisika", mapel: "Fisika X-A", status: "Masuk", date: "2024-03-20" },
        { id: 2, time: "08:30", name: "Bu Guru MTK", mapel: "Matematika XI-B", status: "Selesai", date: "2024-03-20" },
    ];

    const handleSimulateScan = () => {
        setScanStatus('scanning');
        setScanMessage('Mendeteksi wajah...');
        
        setTimeout(() => {
            setScanMessage('Verifikasi lokasi GPS...');
            setTimeout(() => {
                const isSuccess = Math.random() > 0.2; // 80% success rate
                if (isSuccess) {
                    setScanStatus('success');
                    setScanMessage('Absensi Berhasil! Selamat Pagi, Ahmad Fulan.');
                } else {
                    setScanStatus('failed');
                    setScanMessage('Wajah tidak dikenali. Silakan coba lagi.');
                }
                
                setTimeout(() => {
                    setScanStatus('idle');
                    setScanMessage('');
                }, 3000);
            }, 1000);
        }, 1500);
    };

    return (
        <AdminLayout title="Absensi & Kehadiran">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Absensi Sekolah</h2>
                        <p className="text-slate-500">Monitoring kehadiran siswa & guru, scan wajah, dan rekap harian.</p>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={setActiveTab}>
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="dashboard" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
                        <TabsTrigger value="scan" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Mode Scan (Kios)</TabsTrigger>
                        <TabsTrigger value="siswa" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Log Siswa</TabsTrigger>
                        <TabsTrigger value="guru" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Log Guru</TabsTrigger>
                    </TabsList>

                     {/* DASHBOARD */}
                     <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50">
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Siswa Hadir</p>
                                            <div className="flex items-end gap-2 mt-2">
                                                <h3 className="text-3xl font-bold text-slate-900">{stats.presentToday}</h3>
                                                <span className="text-sm font-medium text-green-600 mb-1">94%</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">Total {stats.totalStudents} siswa</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-xl">
                                            <Users className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-green-500 h-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${(stats.presentToday / stats.totalStudents) * 100}%` }}></div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Terlambat</p>
                                            <div className="flex items-end gap-2 mt-2">
                                                <h3 className="text-3xl font-bold text-orange-600">{stats.late}</h3>
                                                <span className="text-sm font-medium text-orange-600 mb-1">+12</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">Siswa datang &gt; 07:00</p>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded-xl">
                                            <Clock className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-orange-500 h-full" style={{ width: '15%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>

                             <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Alpha / Membolos</p>
                                            <div className="flex items-end gap-2 mt-2">
                                                <h3 className="text-3xl font-bold text-red-600">{stats.alpha}</h3>
                                                <span className="text-sm font-medium text-red-600 mb-1">-2</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">Tanpa keterangan</p>
                                        </div>
                                        <div className="p-3 bg-red-50 rounded-xl">
                                            <XCircle className="w-6 h-6 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-red-500 h-full" style={{ width: '2%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Guru Hadir</p>
                                            <div className="flex items-end gap-2 mt-2">
                                                <h3 className="text-3xl font-bold text-blue-600">{stats.teachersPresent}</h3>
                                                <span className="text-sm font-medium text-slate-400 mb-1">/ {stats.totalTeachers}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">96% Kehadiran Staff</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-xl">
                                            <UserCheck className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                        <div className="bg-blue-500 h-full" style={{ width: `${(stats.teachersPresent / stats.totalTeachers) * 100}%` }}></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Content Grid */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* LEFT COLUMN: Trends & Monitoring */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Weekly Trend Chart (CSS) */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Tren Kehadiran Minggu Ini</CardTitle>
                                        <CardDescription>Perbandingan tingkat kehadiran siswa 7 hari terakhir.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 flex items-end justify-between gap-2 pt-4">
                                            {[95, 92, 98, 94, 88, 96, 94].map((val, i) => (
                                                <div key={i} className="flex-1 h-full flex flex-col items-center gap-2 group">
                                                    <div className="w-full bg-slate-100 rounded-t-lg relative flex-1 overflow-hidden">
                                                        <div 
                                                            className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-500 flex items-start justify-center pt-2"
                                                            style={{ height: `${val}%` }}
                                                        >
                                                            <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">{val}%</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Active Classes Monitoring */}
                                <Card className="border-none shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Monitoring Kelas Aktif</CardTitle>
                                            <CardDescription>Status pembelajaran yang sedang berlangsung saat ini.</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                                            Live Now
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {[
                                                { class: 'X-A', mapel: 'Matematika', teacher: 'Pak Budi', status: 'Active' },
                                                { class: 'X-B', mapel: 'B. Inggris', teacher: 'Bu Sarah', status: 'Active' },
                                                { class: 'XI-IPA', mapel: 'Fisika', teacher: 'Pak Eko', status: 'Active' },
                                                { class: 'XI-IPS', mapel: 'Sejarah', teacher: 'Bu Rina', status: 'Empty' },
                                                { class: 'XII-IPA', mapel: 'Kimia', teacher: 'Bu Desi', status: 'Active' },
                                                { class: 'XII-IPS', mapel: 'Kosong', teacher: '-', status: 'Empty' },
                                            ].map((item, i) => (
                                                <div key={i} className={`p-4 rounded-xl border ${item.status === 'Active' ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-60'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <Badge variant="secondary" className="font-bold">{item.class}</Badge>
                                                        {item.status === 'Active' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-sm truncate">{item.mapel}</h4>
                                                    <p className="text-xs text-slate-500 truncate">{item.teacher}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: Live Stream Activity */}
                            <div className="space-y-6">
                                <Card className="border-none shadow-sm h-full max-h-[800px] flex flex-col">
                                    <CardHeader className="pb-3 border-b border-slate-100">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <ScanFace className="w-4 h-4 text-blue-600" />
                                            Aktivitas Terbaru
                                        </CardTitle>
                                        <CardDescription>Log scan real-time.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-0">
                                        <div className="divide-y divide-slate-100">
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {i % 3 === 0 ? <CheckCircle className="w-5 h-5" /> : (i % 3 === 1 ? <Clock className="w-5 h-5 text-orange-500" /> : <ScanFace className="w-5 h-5" />)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <p className="text-sm font-bold text-slate-800 truncate">
                                                                {['Ahmad Fulan', 'Siti Aminah', 'Budi Santoso', 'Dewi Lestari'][i % 4]}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 font-mono">07:0{i}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            {i % 3 === 0 ? 'Hadir Tepat Waktu' : (i % 3 === 1 ? 'Terlambat (5m)' : 'Scan Wajah')}
                                                            <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                                                            <span className="text-[10px] opacity-70">Gerbang {i % 2 === 0 ? 'Depan' : 'Belakang'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <div className="p-3 border-t border-slate-100 bg-slate-50">
                                        <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 hover:text-blue-600">
                                            Lihat Semua Log <BookOpen className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                     </TabsContent>

                    {/* SCAN MODE (KIOS) */}
                    <TabsContent value="scan">
                        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <Card className="border-none shadow-lg overflow-hidden bg-black text-white relative h-[500px] flex flex-col justify-center items-center">
                                {/* Simulated Camera View */}
                                {scanStatus === 'idle' && (
                                    <div className="text-center space-y-4 opacity-70">
                                        <ScanFace className="w-24 h-24 mx-auto animate-pulse" />
                                        <p className="text-xl">Arahkan wajah Anda ke kamera</p>
                                    </div>
                                )}
                                {scanStatus === 'scanning' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10 p-8 text-center">
                                        <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-xl font-bold">{scanMessage}</p>
                                    </div>
                                )}
                                {scanStatus === 'success' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-600/90 backdrop-blur-md z-10 p-8 text-center animate-in zoom-in duration-300">
                                        <CheckCircle className="w-32 h-32 text-white mb-4" />
                                        <p className="text-2xl font-bold">{scanMessage}</p>
                                        <p className="mt-2 text-green-100">07:00:05 • Tepat Waktu</p>
                                    </div>
                                )}
                                {scanStatus === 'failed' && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/90 backdrop-blur-md z-10 p-8 text-center animate-in zoom-in duration-300">
                                        <XCircle className="w-32 h-32 text-white mb-4" />
                                        <p className="text-2xl font-bold">{scanMessage}</p>
                                    </div>
                                )}
                                
                                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur p-4 rounded-xl flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-green-400" />
                                        <span>Lokasi: Sekolah Kita (Gerbang Utama)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span>Camera Active</span>
                                    </div>
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <Card className="border-none shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Instruksi Absensi</CardTitle>
                                        <CardDescription>Ikuti langkah berikut untuk melakukan absensi mandiri.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">1</div>
                                            <p className="text-slate-600">Pastikan Anda berada di area sekolah (radius 50m). Lokasi GPS akan diverifikasi otomatis.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
                                            <p className="text-slate-600">Posisikan wajah di depan kamera. Pastikan pencahayaan cukup dan tidak memakai masker.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">3</div>
                                            <p className="text-slate-600">Tunggu hingga sistem mengenali wajah dan mencatat kehadiran Anda.</p>
                                        </div>

                                        <div className="pt-4">
                                            <Button 
                                                className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700"
                                                onClick={handleSimulateScan}
                                                disabled={scanStatus !== 'idle'}
                                            >
                                                <ScanFace className="w-5 h-5 mr-2" />
                                                Mulai Scan Wajah
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm bg-orange-50 border-orange-100">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-orange-800">Batas Keterlambatan</h4>
                                            <p className="text-sm text-orange-700 mt-1">Siswa dianggap terlambat jika absen setelah pukul <span className="font-bold">07:00</span>. Guru setelah pukul <span className="font-bold">07:15</span>.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* LOG SISWA */}
                     <TabsContent value="siswa">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Log Kehadiran Siswa</CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input placeholder="Cari siswa..." className="pl-9" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Waktu</TableHead>
                                            <TableHead>Nama Siswa</TableHead>
                                            <TableHead>Metode</TableHead>
                                            <TableHead>Lokasi</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {studentLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-mono text-xs">{log.time}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{log.name}</div>
                                                    <div className="text-xs text-slate-500">{log.class}</div>
                                                </TableCell>
                                                <TableCell className="text-slate-500">{log.method}</TableCell>
                                                <TableCell className="text-slate-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {log.location}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={log.status === 'Hadir' ? 'default' : 'destructive'} className={log.status === 'Hadir' ? 'bg-green-600' : 'bg-orange-500'}>
                                                        {log.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                     </TabsContent>

                     {/* LOG GURU */}
                     <TabsContent value="guru">
                        <Card className="border-none shadow-sm">
                             <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Log Mengajar Guru</CardTitle>
                                        <CardDescription>Absensi kehadiran guru di setiap mata pelajaran.</CardDescription>
                                    </div>
                                    <Button variant="outline">
                                        <Download className="w-4 h-4 mr-2" /> Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Jam Masuk</TableHead>
                                            <TableHead>Guru</TableHead>
                                            <TableHead>Mata Pelajaran</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teacherLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-mono text-xs">{log.time}</TableCell>
                                                <TableCell className="font-medium">{log.name}</TableCell>
                                                <TableCell className="text-blue-600 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-3 h-3" />
                                                        {log.mapel}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500">{log.date}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                                        {log.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                     </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
