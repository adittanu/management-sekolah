import AdminLayout from '@/Layouts/AdminLayout';
import { mockClasses } from '@/data/mockData';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, School, Users } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

export default function KelasIndex() {
    return (
        <AdminLayout title="Manajemen Kelas">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Manajemen Kelas</h2>
                        <p className="text-slate-500">Atur daftar kelas dan rombongan belajar.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        + Tambah Kelas
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Cari nama kelas..." className="pl-10" />
                    </div>
                    <div className="flex gap-2">
                        {['Semua', 'Kelas X', 'Kelas XI', 'Kelas XII'].map((filter, i) => (
                           <Button 
                                key={filter}
                                variant={i === 0 ? 'secondary' : 'ghost'}
                                className={i === 0 ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-slate-500'}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {mockClasses.map((kelas) => (
                        <Card key={kelas.id} className="group hover:shadow-lg transition-all border-slate-200 overflow-hidden cursor-pointer">
                            <CardContent className="p-0">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 flex flex-col items-center justify-center text-white h-48 relative overflow-hidden">
                                     <div className="absolute top-4 left-4">
                                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                                            Tingkat {kelas.tingkat}
                                        </Badge>
                                     </div>
                                     <School className="w-16 h-16 opacity-80 mb-4 group-hover:scale-110 transition-transform duration-300" />
                                     <h3 className="text-3xl font-bold">{kelas.name}</h3>
                                     
                                     {/* Decorative circles */}
                                     <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                     <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                </div>
                                <div className="p-4 bg-white">
                                    <div className="flex items-center justify-center gap-2 text-slate-600 bg-slate-50 py-2 rounded-lg mb-3">
                                        <Users className="w-4 h-4" />
                                        <span className="font-semibold">{kelas.siswa} Siswa</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Wali Kelas</div>
                                        <div className="font-medium text-slate-800">{kelas.wali}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
