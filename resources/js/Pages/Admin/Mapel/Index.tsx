import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { mockSubjects, mockUsers } from '@/data/mockData';
import { Search, Plus, BookOpen, Clock, User as UserIcon, Trash2, Edit2, Palette } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';

export default function MapelIndex() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddMapelOpen, setIsAddMapelOpen] = useState(false);
    
    // Derived state for Gurus
    const teachers = mockUsers.filter(u => u.role === 'GURU');

    // Filter Logic
    const filteredSubjects = mockSubjects.filter(subject => 
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const colors = [
        { name: 'Blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
        { name: 'Green', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
        { name: 'Purple', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
        { name: 'Orange', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
        { name: 'Pink', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    ];

    const [selectedColor, setSelectedColor] = useState(colors[0]);

    return (
        <AdminLayout title="Mata Pelajaran">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mata Pelajaran</h2>
                        </div>
                        <p className="text-slate-500">Atur daftar mata pelajaran, guru pengampu, dan alokasi waktu.</p>
                    </div>
                    <Button 
                        onClick={() => setIsAddMapelOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Mapel
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Cari nama mapel atau guru..." 
                        className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubjects.map((subject) => (
                        <Card key={subject.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                            {/* Decorative Top Border */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${subject.color.replace('text-', 'bg-')}`} />
                            
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${subject.bg} ${subject.color}`}>
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{subject.name}</h3>
                                <Badge variant="secondary" className="mb-4 font-normal text-slate-500 bg-slate-100">
                                    Semester Ganjil
                                </Badge>
                                
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <div className="w-8 flex justify-center">
                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="font-medium">{subject.teacher}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <div className="w-8 flex justify-center">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span>{subject.schedule || 'Jadwal belum diatur'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Card Placeholder */}
                    <button 
                        onClick={() => setIsAddMapelOpen(true)}
                        className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all gap-3 bg-slate-50/50"
                    >
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Tambah Mapel Baru</span>
                    </button>
                </div>

                {/* Add Mapel Modal */}
                <Dialog open={isAddMapelOpen} onOpenChange={setIsAddMapelOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">Tambah Mata Pelajaran</DialogTitle>
                            <DialogDescription>
                                Tambahkan mata pelajaran baru dan tetapkan guru pengampu.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Nama Mata Pelajaran</Label>
                                <Input placeholder="Contoh: Matematika Wajib" className="bg-slate-50 border-slate-200" />
                            </div>

                            <div className="space-y-2">
                                <Label>Guru Pengampu</Label>
                                <Select>
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Pilih Guru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Warna Label</Label>
                                <div className="flex gap-3">
                                    {colors.map((c) => (
                                        <div 
                                            key={c.name}
                                            onClick={() => setSelectedColor(c)}
                                            className={`
                                                w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all
                                                ${c.bg} ${c.text} border-2
                                                ${selectedColor.name === c.name ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'}
                                            `}
                                        >
                                            <Palette className="w-4 h-4" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Pilih warna untuk identifikasi visual di jadwal.</p>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsAddMapelOpen(false)}>Batal</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
