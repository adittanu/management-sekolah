import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Book, BookOpen, Search, Filter, Calendar, User, Download, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function PerpustakaanIndex() {
    const [activeTab, setActiveTab] = useState('katalog');

    // Mock Data: Buku (Katalog)
    const books = [
        { id: 1, title: "Matematika Dasar SMA", author: "Dr. Budi Santoso", category: "Pelajaran", stock: 15, cover: "https://placehold.co/150x220/2563eb/white?text=Math" },
        { id: 2, title: "Sejarah Indonesia Merdeka", author: "Prof. Aminah", category: "Sejarah", stock: 8, cover: "https://placehold.co/150x220/dc2626/white?text=Sejarah" },
        { id: 3, title: "Algoritma & Pemrograman", author: "Rahmat Hidayat", category: "Teknologi", stock: 5, cover: "https://placehold.co/150x220/16a34a/white?text=Algo" },
        { id: 4, title: "Laskar Pelangi", author: "Andrea Hirata", category: "Fiksi", stock: 3, cover: "https://placehold.co/150x220/d97706/white?text=Novel" },
        { id: 5, title: "Biologi Modern Kelas XII", author: "Sarah Wulandari", category: "Pelajaran", stock: 20, cover: "https://placehold.co/150x220/0cbdba/white?text=Biologi" },
        { id: 6, title: "English for Beginners", author: "John Doe", category: "Bahasa", stock: 12, cover: "https://placehold.co/150x220/9333ea/white?text=English" },
    ];

    // Mock Data: Peminjaman
    const loans = [
        { id: 1, student: "Ahmad Fulan", class: "XII-A", book: "Matematika Dasar SMA", borrowDate: "2024-03-01", returnDate: "2024-03-08", status: "Dipinjam" },
        { id: 2, student: "Siti Aminah", class: "XI-B", book: "Laskar Pelangi", borrowDate: "2024-02-25", returnDate: "2024-03-03", status: "Terlambat" },
        { id: 3, student: "Budi Santoso", class: "X-C", book: "Algoritma & Pemrograman", borrowDate: "2024-03-05", returnDate: "2024-03-12", status: "Dipinjam" },
        { id: 4, student: "Dewi Lestari", class: "XII-IPA", book: "Sejarah Indonesia", borrowDate: "2024-02-20", returnDate: "2024-02-27", status: "Dikembalikan" },
    ];

    return (
        <AdminLayout title="Perpustakaan Digital">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Perpustakaan Digital</h2>
                        <p className="text-slate-500">Katalog buku, manajemen peminjaman, dan akses E-Book.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <BookOpen className="w-4 h-4 mr-2" /> Tambah Buku Baru
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">Total Koleksi</p>
                                <h3 className="text-3xl font-bold text-blue-900">1,240</h3>
                                <p className="text-xs text-blue-500 mt-1">Judul Buku</p>
                            </div>
                            <Book className="w-10 h-10 text-blue-300" />
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 mb-1">Sedang Dipinjam</p>
                                <h3 className="text-3xl font-bold text-green-900">85</h3>
                                <p className="text-xs text-green-500 mt-1">Buku Keluar</p>
                            </div>
                            <User className="w-10 h-10 text-green-300" />
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 mb-1">Telat Pengembalian</p>
                                <h3 className="text-3xl font-bold text-orange-900">12</h3>
                                <p className="text-xs text-orange-500 mt-1">Siswa Terlambat</p>
                            </div>
                            <AlertCircle className="w-10 h-10 text-orange-300" />
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="katalog" className="space-y-6" onValueChange={setActiveTab}>
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="katalog" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                            <BookOpen className="w-4 h-4 mr-2" /> Katalog Buku
                        </TabsTrigger>
                        <TabsTrigger value="peminjaman" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                            <Calendar className="w-4 h-4 mr-2" /> Peminjaman
                        </TabsTrigger>
                        <TabsTrigger value="ebook" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                            <Eye className="w-4 h-4 mr-2" /> E-Book Reader
                        </TabsTrigger>
                    </TabsList>

                    {/* KATALOG TAB */}
                    <TabsContent value="katalog" className="space-y-6 animate-in fade-in-50">
                        <div className="flex gap-4 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="Cari judul buku, pengarang, atau ISBN..." className="pl-10" />
                            </div>
                            <Button variant="outline">
                                <Filter className="w-4 h-4 mr-2" /> Filter Kategori
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {books.map((book) => (
                                <Card key={book.id} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                    <div className="aspect-[2/3] bg-slate-200 relative overflow-hidden">
                                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                           <Button size="sm" variant="secondary" className="h-8">Detail</Button>
                                           <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">Pinjam</Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-3">
                                        <Badge variant="outline" className="mb-2 text-[10px] bg-slate-50">{book.category}</Badge>
                                        <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 min-h-[36px]" title={book.title}>{book.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1 truncate">{book.author}</p>
                                    </CardContent>
                                    <div className="px-3 pb-3 flex justify-between items-center text-xs text-slate-400">
                                        <span>Stok: <span className="text-slate-700 font-bold">{book.stock}</span></span>
                                        <button className="hover:text-blue-600"><BookOpen className="w-3 h-3" /></button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* PEMINJAMAN TAB */}
                    <TabsContent value="peminjaman" className="space-y-6 animate-in fade-in-50">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle>Data Peminjaman Aktif</CardTitle>
                                <CardDescription>Daftar siswa yang sedang meminjam buku perpustakaan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Siswa</TableHead>
                                            <TableHead>Judul Buku</TableHead>
                                            <TableHead>Tgl Pinjam</TableHead>
                                            <TableHead>Jatuh Tempo</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loans.map((loan) => (
                                            <TableRow key={loan.id}>
                                                <TableCell>
                                                    <div className="font-medium">{loan.student}</div>
                                                    <div className="text-xs text-slate-500">{loan.class}</div>
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-700">{loan.book}</TableCell>
                                                <TableCell className="text-slate-500">{loan.borrowDate}</TableCell>
                                                <TableCell className={loan.status === 'Terlambat' ? 'text-red-600 font-bold' : 'text-slate-500'}>
                                                    {loan.returnDate}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={loan.status === 'Terlambat' ? 'destructive' : (loan.status === 'Dikembalikan' ? 'secondary' : 'default')} className={loan.status === 'Dipinjam' ? 'bg-blue-600' : ''}>
                                                        {loan.status}
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

                    {/* E-BOOK READER TAB */}
                    <TabsContent value="ebook" className="space-y-6 animate-in fade-in-50">
                        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                            {/* E-Book List */}
                            <div className="space-y-4 overflow-y-auto pr-2">
                                <h3 className="font-bold text-lg text-slate-800 mb-2">Pustaka Digital Anda</h3>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex gap-3 group">
                                        <div className="w-12 h-16 bg-slate-200 rounded shrink-0 overflow-hidden">
                                            <img src={`https://placehold.co/100x140?text=PDF+${i}`} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600">Modul Pembelajaran TIK {i}</h4>
                                            <p className="text-xs text-slate-500 mt-1">Oleh Tim Kurikulum</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="secondary" className="text-[10px] h-5">PDF</Badge>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> 24 Halaman</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* PDF Viewer Simulation */}
                            <div className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                                <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700 text-slate-300">
                                    <span className="font-medium text-sm">Modul Pembelajaran TIK 1.pdf</span>
                                    <div className="flex gap-2 text-xs">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-slate-300">-</Button>
                                        <span className="flex items-center">100%</span>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-slate-300">+</Button>
                                        <div className="w-px h-4 bg-slate-600 mx-1"></div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-700 text-slate-300"><Download className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center bg-slate-100 relative">
                                    <div className="w-[80%] h-[95%] bg-white shadow-lg p-10 overflow-y-auto">
                                        <h1 className="text-3xl font-bold text-center mb-8">BAB I: Pengenalan Komputasi Awan</h1>
                                        <div className="space-y-4 text-justify text-slate-700 leading-relaxed">
                                            <p>Komputasi awan (Cloud Computing) adalah gabungan pemanfaatan teknologi komputer ('komputasi') dan pengembangan berbasis Internet ('awan'). Awan (cloud) adalah metafora dari internet, sebagaimana awan yang sering digambarkan di diagram jaringan komputer.</p>
                                            <div className="h-40 bg-blue-50 rounded-lg flex items-center justify-center my-6 border border-blue-100 text-blue-400">
                                                [Ilustrasi Cloud Computing]
                                            </div>
                                            <p>Sebuah layanan komputasi awan memiliki tiga karakteristik utama yang membedakannya dari hosting tradisional. Layanan ini bersifat "on-demand", yang berarti pengguna dapat berlangganan hanya yang dia butuhkan, dan membayar hanya untuk yang mereka gunakan saja.</p>
                                            <p>Layanan ini bersifat elastis, pengguna bisa menambah atau mengurangi jenis dan kapasitas layanan yang dia inginkan kapan saja dan sistem selalu bisa mengakomodasi perubahan tersebut.</p>
                                        </div>
                                        <div className="mt-10 text-center text-xs text-slate-400 border-t pt-4">
                                            Halaman 1 dari 24
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
