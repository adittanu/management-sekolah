import AdminLayout from '@/Layouts/AdminLayout';
import { mockClasses } from '@/data/mockData';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Search, School, Users } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";

export default function KelasIndex() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('Semua');
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);

    const filteredClasses = mockClasses.filter(kelas => {
        const matchesSearch = kelas.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              kelas.wali.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = selectedLevel === 'Semua' || kelas.tingkat === selectedLevel.replace('Kelas ', '');
        return matchesSearch && matchesLevel;
    });

    return (
        <AdminLayout title="Manajemen Kelas">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Manajemen Kelas</h2>
                        <p className="text-slate-500">Atur daftar kelas dan rombongan belajar.</p>
                    </div>
                    <Button 
                        onClick={() => setIsAddClassOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                    >
                        + Tambah Kelas
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Cari nama kelas atau wali kelas..." 
                            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {['Semua', 'Kelas X', 'Kelas XI', 'Kelas XII'].map((filter) => (
                           <Button 
                                key={filter}
                                onClick={() => setSelectedLevel(filter)}
                                variant={selectedLevel === filter ? 'secondary' : 'ghost'}
                                className={`whitespace-nowrap ${selectedLevel === filter ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredClasses.length > 0 ? (
                        filteredClasses.map((kelas) => (
                            <Link href={`/admin/kelas/${kelas.id}`} key={kelas.id}>
                                <Card className="group hover:shadow-xl transition-all border-slate-200 overflow-hidden cursor-pointer hover:-translate-y-1 bg-white h-full">
                                    <CardContent className="p-0">
                                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 flex flex-col items-center justify-center text-white h-48 relative overflow-hidden">
                                            <div className="absolute top-4 left-4 z-10">
                                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                                    Tingkat {kelas.tingkat}
                                                </Badge>
                                            </div>
                                            <School className="w-16 h-16 opacity-90 mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                                            <h3 className="text-3xl font-bold relative z-10">{kelas.name}</h3>
                                            
                                            {/* Decorative elements */}
                                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                                            <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center justify-between text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    <span className="font-semibold text-slate-700">{kelas.siswa} Siswa</span>
                                                </div>
                                                <div className="w-px h-4 bg-slate-300"></div>
                                                <span>Aktif</span>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Wali Kelas</div>
                                                <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {kelas.wali}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            <School className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">Tidak ada kelas yang ditemukan.</p>
                            <p className="text-sm">Coba ubah filter atau kata kunci pencarian.</p>
                        </div>
                    )}
                </div>

                {/* Add Class Modal */}
                <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">Tambah Kelas Baru</DialogTitle>
                            <DialogDescription>
                                Buat rombongan belajar baru untuk tahun ajaran ini.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="level" className="text-sm font-semibold text-slate-700">Tingkat Kelas</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['X', 'XI', 'XII'].map((lvl) => (
                                            <div key={lvl} className="relative">
                                                <input type="radio" name="level" id={`lvl-${lvl}`} className="peer sr-only" />
                                                <label 
                                                    htmlFor={`lvl-${lvl}`}
                                                    className="flex items-center justify-center py-3 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 cursor-pointer transition-all"
                                                >
                                                    Kelas {lvl}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="className">Nama Kelas</Label>
                                        <Input id="className" placeholder="Contoh: X IPA 1" className="bg-slate-50 border-slate-200 focus:ring-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Kapasitas</Label>
                                        <div className="relative">
                                            <Input id="capacity" type="number" placeholder="36" className="pl-9 bg-slate-50 border-slate-200 focus:ring-blue-500" />
                                            <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="homeroom">Wali Kelas</Label>
                                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                        <option value="">Pilih Wali Kelas...</option>
                                        <option>Pak Budi Hartono</option>
                                        <option>Bu Siti Aminah</option>
                                        <option>Pak Joko</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex gap-3 border border-blue-100">
                                <School className="w-5 h-5 shrink-0" />
                                <p>Kelas baru akan otomatis aktif. Pastikan wali kelas belum memegang kelas lain untuk tahun ajaran yang sama.</p>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsAddClassOpen(false)}>Batal</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">Buat Kelas</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
