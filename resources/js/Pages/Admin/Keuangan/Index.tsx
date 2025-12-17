import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Search, FileText, Download, Send, Plus, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function KeuanganIndex() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const stats = {
        totalIncome: "Rp 150.000.000",
        totalArrears: "Rp 25.500.000",
        monthlyTarget: "Rp 45.000.000",
        incomeThisMonth: "Rp 38.200.000"
    };

    const transactions = [
        { id: "TRX-001", date: "2024-03-10", student: "Ahmad Fulan", class: "X-A", type: "SPP Maret", amount: 500000, status: "Lunas" },
        { id: "TRX-002", date: "2024-03-10", student: "Siti Aminah", class: "XI-B", type: "Uang Gedung", amount: 2500000, status: "Cicilan 1" },
        { id: "TRX-003", date: "2024-03-09", student: "Budi Santoso", class: "XII-C", type: "SPP Maret", amount: 500000, status: "Lunas" },
        { id: "TRX-004", date: "2024-03-09", student: "Citra Kirana", class: "X-A", type: "Ekskul", amount: 150000, status: "Lunas" },
    ];

    const arrears = [
        { id: 1, student: "Eko Prasetyo", class: "XI-A", type: "SPP Februari", amount: 500000, daysLate: 15 },
        { id: 2, student: "Fajar Nugraha", class: "X-C", type: "Uang Buku", amount: 750000, daysLate: 30 },
        { id: 3, student: "Gita Gutawa", class: "XII-B", type: "SPP Maret", amount: 500000, daysLate: 5 },
    ];

    return (
        <AdminLayout title="Keuangan & SPP">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Keuangan Sekolah</h2>
                        <p className="text-slate-500">Manajemen tagihan SPP, pencatatan pembayaran, dan laporan keuangan.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white">
                            <Download className="w-4 h-4 mr-2" />
                            Laporan Bulanan
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Tagihan
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={setActiveTab}>
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="dashboard" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
                        <TabsTrigger value="tagihan" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Data Tagihan</TabsTrigger>
                        <TabsTrigger value="pembayaran" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Input Pembayaran</TabsTrigger>
                    </TabsList>

                    {/* DASHBOARD CONTENT */}
                    <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50 duration-500">
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Total Pemasukan (YTD)</p>
                                            <h3 className="text-2xl font-bold mt-1">{stats.totalIncome}</h3>
                                        </div>
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-blue-100 text-xs">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>+12% dari tahun lalu</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Pemasukan Bulan Ini</p>
                                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.incomeThisMonth}</h3>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">Target: {stats.monthlyTarget}</span>
                                            <span className="font-bold text-green-600">85%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[85%] rounded-full"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Total Tunggakan</p>
                                            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.totalArrears}</h3>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <TrendingDown className="w-5 h-5 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-red-600 text-xs">
                                        <span>Perlu ditindaklanjuti segera</span>
                                    </div>
                                </CardContent>
                            </Card>

                             <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Metode Pembayaran</p>
                                            <h3 className="text-2xl font-bold text-slate-900 mt-1">Transfer</h3>
                                        </div>
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-slate-500">
                                        Dominan digunakan (65%)
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
                            {/* Recent Transactions */}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle>Transaksi Terbaru</CardTitle>
                                    <CardDescription>5 pembayaran terakhir yang masuk sistem.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID Transaksi</TableHead>
                                                <TableHead>Siswa</TableHead>
                                                <TableHead>Jenis</TableHead>
                                                <TableHead>Jumlah</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((trx) => (
                                                <TableRow key={trx.id}>
                                                    <TableCell className="font-mono text-xs text-slate-500">{trx.id}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-slate-900">{trx.student}</div>
                                                        <div className="text-xs text-slate-500">{trx.class}</div>
                                                    </TableCell>
                                                    <TableCell>{trx.type}</TableCell>
                                                    <TableCell className="font-bold text-slate-700">Rp {trx.amount.toLocaleString('id-ID')}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            {trx.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                             {/* Arrears List */}
                             <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-red-600">Tunggakan Siswa</CardTitle>
                                    <CardDescription>Belum lunas &gt; 30 hari</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {arrears.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/30">
                                            <div>
                                                <div className="font-bold text-slate-800">{item.student} <span className="text-xs font-normal text-slate-500">({item.class})</span></div>
                                                <div className="text-xs text-red-600 font-medium">{item.type} • Telat {item.daysLate} hari</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-900 text-sm">Rp {item.amount.toLocaleString('id-ID')}</div>
                                                <button className="text-[10px] text-blue-600 hover:underline flex items-center justify-end gap-1 mt-1">
                                                    <Send className="w-3 h-3" /> Ingatkan
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100">
                                        Lihat Semua Tunggakan
                                    </Button>
                                </CardContent>
                             </Card>
                        </div>
                    </TabsContent>

                    {/* TAGIHAN CONTENT */}
                    <TabsContent value="tagihan">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Data Tagihan Siswa</CardTitle>
                                        <CardDescription>Kelola tagihan SPP, Uang Gedung, dan lainnya.</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-64">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input placeholder="Cari siswa atau ID..." className="pl-9" />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p>Tampilan tabel tagihan lengkap akan muncul di sini.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PEMBAYARAN CONTENT */}
                    <TabsContent value="pembayaran">
                         <div className="max-w-2xl mx-auto">
                            <Card className="border-none shadow-md">
                                <CardHeader className="bg-blue-600 text-white rounded-t-xl">
                                    <CardTitle>Input Pembayaran Baru</CardTitle>
                                    <CardDescription className="text-blue-100">Catat pembayaran tunai atau transfer dari siswa.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label>Cari Data Siswa</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input placeholder="Ketik Nama atau NIS..." className="pl-10 h-10" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <Label>Pilih Tagihan yang Dibayar</Label>
                                        <div className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <input type="checkbox" id="bill1" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                <label htmlFor="bill1" className="flex-1 flex justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    <span>SPP Maret 2024</span>
                                                    <span>Rp 500.000</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input type="checkbox" id="bill2" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                <label htmlFor="bill2" className="flex-1 flex justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    <span>Uang Buku Semester 2</span>
                                                    <span>Rp 750.000</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Metode Pembayaran</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button variant="outline" className="border-blue-600 text-blue-600 bg-blue-50">Tunai (Cash)</Button>
                                            <Button variant="outline">Transfer Bank</Button>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-lg font-bold">
                                            Proses Pembayaran (Rp 0)
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                         </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
