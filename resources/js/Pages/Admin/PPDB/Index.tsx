import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Label } from '@/Components/ui/label';
import { Search, Filter, Download, UserPlus, FileText, CheckCircle, XCircle, Clock, Users, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function PPDBIndex() {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Mock Data: Pendaftar
    const applicants = [
        { id: 1, name: "Reza Rahadian", school: "SMP Negeri 1 Jakarta", avgScore: 88.5, date: "2024-05-01", status: "Verified" },
        { id: 2, name: "Bunga Citra Lestari", school: "SMP Al-Azhar", avgScore: 92.0, date: "2024-05-02", status: "Accepted" },
        { id: 3, name: "Tulus", school: "MTS Negeri 3 Bandung", avgScore: 75.5, date: "2024-05-03", status: "Pending" },
        { id: 4, name: "Isyana Sarasvati", school: "SMP Taruna Bakti", avgScore: 95.5, date: "2024-04-30", status: "Accepted" },
        { id: 5, name: "Raisa Andriana", school: "SMP 5 Depok", avgScore: 81.0, date: "2024-05-01", status: "Rejected" },
    ];

    const stats = {
        total: 450,
        verified: 320,
        accepted: 150,
        pending: 80
    };

    return (
        <AdminLayout title="PPDB Online">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Penerimaan Siswa Baru (PPDB)</h2>
                        <p className="text-slate-500">Tahun Ajaran 2024/2025 - Gelombang 1</p>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Konfigurasi Gelombang</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <UserPlus className="w-4 h-4 mr-2" /> Input Pendaftar Manual
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white border-blue-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Pendaftar</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</h3>
                                    <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">+12 Hari Ini</Badge>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users className="w-6 h-6" /></div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-white border-green-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Lulus Seleksi</p>
                                    <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</h3>
                                    <p className="text-xs text-slate-400 mt-1">Kuota: 200 Siswa</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl text-green-600"><CheckCircle className="w-6 h-6" /></div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-white border-orange-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Menunggu Verifikasi</p>
                                    <h3 className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</h3>
                                    <p className="text-xs text-slate-400 mt-1">Perlu tindakan segera</p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Clock className="w-6 h-6" /></div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-white border-red-100 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Ditolak / Gugur</p>
                                    <h3 className="text-3xl font-bold text-red-600 mt-2">50</h3>
                                    <p className="text-xs text-slate-400 mt-1">Tidak memenuhi syarat</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl text-red-600"><XCircle className="w-6 h-6" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={setActiveTab}>
                     <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="dashboard" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
                        <TabsTrigger value="applicants" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Data Pendaftar</TabsTrigger>
                        <TabsTrigger value="selection" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Seleksi & Pengumuman</TabsTrigger>
                    </TabsList>

                    {/* DASHBOARD TAB */}
                    <TabsContent value="dashboard" className="animate-in fade-in-50">
                        <div className="grid lg:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm h-full">
                                <CardHeader>
                                    <CardTitle>Alur Pendaftaran</CardTitle>
                                    <CardDescription>Status timeline PPDB saat ini.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                                        <div className="relative pl-8">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                                            <h4 className="font-bold text-slate-900">Pendaftaran Online</h4>
                                            <p className="text-sm text-slate-500">01 Mei - 30 Mei 2024</p>
                                            <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-200">Sedang Berlangsung</Badge>
                                        </div>
                                        <div className="relative pl-8 opacity-50">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200"></div>
                                            <h4 className="font-bold text-slate-900">Verifikasi Berkas</h4>
                                            <p className="text-sm text-slate-500">01 Juni - 05 Juni 2024</p>
                                        </div>
                                        <div className="relative pl-8 opacity-50">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200"></div>
                                            <h4 className="font-bold text-slate-900">Tes Seleksi Akademik</h4>
                                            <p className="text-sm text-slate-500">07 Juni 2024</p>
                                        </div>
                                        <div className="relative pl-8 opacity-50">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200"></div>
                                            <h4 className="font-bold text-slate-900">Pengumuman Kelulusan</h4>
                                            <p className="text-sm text-slate-500">10 Juni 2024</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="border-none shadow-sm bg-blue-600 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <CardHeader>
                                        <CardTitle className="text-white">Formulir PPDB</CardTitle>
                                        <CardDescription className="text-blue-100">Pratinjau formulir pendaftaran siswa.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div>
                                                <div className="flex-1 h-2 bg-white/20 rounded-full">
                                                    <div className="w-1/2 h-full bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-4 bg-white/20 rounded w-1/4"></div>
                                                <div className="h-10 bg-white/10 rounded border border-white/20"></div>
                                                <div className="h-4 bg-white/20 rounded w-1/3 mt-2"></div>
                                                <div className="h-10 bg-white/10 rounded border border-white/20"></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                        <Button variant="secondary" className="w-full font-bold text-blue-600">
                                            Edit Formulir <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* APPLICANTS TAB */}
                    <TabsContent value="applicants" className="animate-in fade-in-50">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Data Calon Siswa</CardTitle>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input placeholder="Cari nama / asal sekolah..." className="pl-9 w-64" />
                                        </div>
                                        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Lengkap</TableHead>
                                            <TableHead>Asal Sekolah</TableHead>
                                            <TableHead>Nilai Rata-rata</TableHead>
                                            <TableHead>Tgl Daftar</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applicants.map((a) => (
                                            <TableRow key={a.id}>
                                                <TableCell className="font-medium">{a.name}</TableCell>
                                                <TableCell className="text-slate-500">{a.school}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-slate-50 font-mono">{a.avgScore}</Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500">{a.date}</TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant={a.status === 'Rejected' ? 'destructive' : (a.status === 'Accepted' ? 'default' : 'secondary')}
                                                        className={a.status === 'Accepted' ? 'bg-green-600' : (a.status === 'Verified' ? 'bg-blue-600 text-white' : '')}
                                                    >
                                                        {a.status === 'Accepted' ? 'Lulus' : (a.status === 'Verified' ? 'Terverifikasi' : (a.status === 'Rejected' ? 'Gugur' : a.status))}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">Detail</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SELECTION TAB */}
                    <TabsContent value="selection" className="animate-in fade-in-50">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Seleksi & Pengumuman</CardTitle>
                                <CardDescription>Atur ambang batas nilai dan publikasi hasil seleksi.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label>Passing Grade (Nilai Minimal)</Label>
                                        <div className="flex gap-4">
                                            <Input type="number" defaultValue={80.0} className="w-24 text-center font-bold text-lg" />
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-500 mb-2">Siswa dengan nilai di bawah ini akan otomatis gugur.</p>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 w-[80%]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                         <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Status Pengumuman: Belum Rilis
                                         </h4>
                                         <p className="text-sm text-yellow-700 mt-1">Hasil seleksi masih bersifat internal. Calon siswa belum dapat melihat hasil.</p>
                                         <Button className="mt-4 bg-yellow-600 hover:bg-yellow-700 w-full">Rilis Pengumuman Sekarang</Button>
                                    </div>
                                </div>
                            </CardContent>
                             <CardContent className="border-t">
                                <div className="pt-4">
                                    <h4 className="font-medium mb-4">Simulasi Hasil Seleksi</h4>
                                    <div className="flex gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span>Lulus: 150</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span>Gugur: 300</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
