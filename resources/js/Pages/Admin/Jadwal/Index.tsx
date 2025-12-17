import AdminLayout from '@/Layouts/AdminLayout';
import { mockSchedule, mockClasses, mockSubjects } from '@/data/mockData';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, Clock, MapPin, CalendarDays, Users, Plus } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';

export default function JadwalIndex() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDay, setSelectedDay] = useState('Semua');
    const [formState, setFormState] = useState({
        day: '',
        jam: '',
        subject: '',
        classId: '',
        room: ''
    });

    const [selectedClass, setSelectedClass] = useState(mockClasses[0].name); // Default to first class
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const timeSlots = [1, 2, 3, 4, 5, 6, 7, 8];

    // Filter Logic for Days
    const visibleDays = selectedDay === 'Semua' ? days : [selectedDay];
    
    const handleAddSchedule = (day: string = '', jam: string = '') => {
        const cls = mockClasses.find(c => c.name === selectedClass);
        setFormState(prev => ({ 
            ...prev, 
            day, 
            jam, 
            classId: cls ? cls.id.toString() : '' 
        }));
        setIsAddScheduleOpen(true);
    };

    return (
        <AdminLayout title="Atur Jadwal KBM">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <CalendarDays className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Atur Jadwal KBM</h2>
                        </div>
                        <p className="text-slate-500">Kelola jadwal mengajar guru dan penggunaan ruangan.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-[200px]">
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockClasses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button 
                            onClick={() => handleAddSchedule()}
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Jadwal
                        </Button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20">
                     <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        <Button 
                             onClick={() => setSelectedDay('Semua')}
                             variant={selectedDay === 'Semua' ? 'secondary' : 'ghost'}
                             className={selectedDay === 'Semua' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-500'}
                        >
                            Semua Hari
                        </Button>
                        {days.map(day => (
                            <Button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                variant={selectedDay === day ? 'secondary' : 'ghost'}
                                className={selectedDay === day ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-slate-500'}
                            >
                                {day}
                            </Button>
                        ))}
                     </div>
                     
                     <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Cari Guru atau Mapel..." 
                            className="pl-10 bg-slate-50 border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <div className="flex border-b border-slate-200 divide-x divide-slate-100">
                            <div className="w-24 p-4 flex items-center justify-center font-bold text-slate-400 bg-slate-50 text-xs tracking-wider sticky left-0 z-10">JAM KE</div>
                            {visibleDays.map((day) => (
                                <div key={day} className={`flex-1 p-4 text-center font-bold text-sm uppercase tracking-wide ${day === 'Rabu' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="divide-y divide-slate-100">
                            {timeSlots.map((jam) => (
                                <div key={jam} className="flex min-h-[140px] divide-x divide-slate-100">
                                    <div className="w-24 bg-slate-50 p-4 sticky left-0 z-10 border-r border-slate-200 flex flex-col items-center justify-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-sm text-sm">
                                            {jam}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400 mt-1 py-1 px-2 rounded bg-slate-100">
                                            07:{(jam * 45).toString().padStart(2, '0').slice(-2)}
                                        </div>
                                    </div>
                                    {visibleDays.map((day, dayIndex) => {
                                        // Filter Logic
                                        // @ts-ignore
                                        const scheduleItem = mockSchedule[day]?.find((s: any) => s.jam === jam && s.class === selectedClass);
                                        
                                        // Additional Search Filter
                                        const isVisible = !searchQuery || (scheduleItem && (
                                            scheduleItem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            scheduleItem.teacher.toLowerCase().includes(searchQuery.toLowerCase())
                                        ));

                                        if (!isVisible && searchQuery && !scheduleItem) return <div key={dayIndex} className="flex-1 bg-slate-50/30"></div>;
                                        if (!isVisible && searchQuery && scheduleItem) return <div key={dayIndex} className="flex-1 bg-slate-50/30"></div>;

                                        return (
                                            <div key={dayIndex} className="flex-1 p-2 relative group hover:bg-slate-50 transition-colors">
                                                {scheduleItem ? (
                                                    <Card className="h-full bg-white hover:border-blue-300 border-slate-200 p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer group/card relative overflow-hidden">
                                                        <div className={`absolute top-0 left-0 w-1 h-full ${
                                                            scheduleItem.subject === 'Matematika' ? 'bg-blue-500' :
                                                            scheduleItem.subject === 'Fisika' ? 'bg-purple-500' :
                                                            scheduleItem.subject === 'Kimia' ? 'bg-pink-500' : 'bg-orange-500'
                                                        }`}></div>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 border-slate-200 text-slate-600 font-medium rounded">
                                                                    {scheduleItem.class}
                                                                </Badge>
                                                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                                    <Clock className="w-3 h-3" />
                                                                    {scheduleItem.time.split(' - ')[0]}
                                                                </div>
                                                            </div>
                                                            <div className="font-bold text-sm text-slate-800 line-clamp-1 mb-1" title={scheduleItem.subject}>{scheduleItem.subject}</div>
                                                            <div className="text-xs text-slate-500 truncate" title={scheduleItem.teacher}>{scheduleItem.teacher}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 bg-slate-50 w-fit px-2 py-1 rounded-full">
                                                            <MapPin className="w-3 h-3" />
                                                            {scheduleItem.room}
                                                        </div>
                                                    </Card>
                                                ) : (
                                                    <div 
                                                        onClick={() => handleAddSchedule(day, jam.toString())}
                                                        className="w-full h-full rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-blue-50 hover:border-blue-200"
                                                    >
                                                        <Plus className="w-6 h-6 text-blue-400 mb-1" />
                                                        <span className="text-xs text-blue-500 font-medium">Isi Jadwal</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Add Schedule Dialog */}
                <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">Tambah Jadwal Pelajaran</DialogTitle>
                            <DialogDescription>
                                Masukkan detail jadwal KBM baru ke dalam slot waktu.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hari</Label>
                                    <Select value={formState.day} onValueChange={(val) => setFormState(s => ({ ...s, day: val }))}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Hari" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Jam Ke-</Label>
                                    <Select value={formState.jam} onValueChange={(val) => setFormState(s => ({ ...s, jam: val }))}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Jam" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map(t => <SelectItem key={t} value={t.toString()}>{t} (07:{(t*45).toString()})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Mata Pelajaran</Label>
                                <Select value={formState.subject} onValueChange={(val) => setFormState(s => ({ ...s, subject: val }))}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Pilih Mata Pelajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockSubjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name} - {s.teacher}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Kelas</Label>
                                    <Select value={formState.classId} onValueChange={(val) => setFormState(s => ({ ...s, classId: val }))}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockClasses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ruangan</Label>
                                    <Input 
                                        placeholder="Contoh: Lab Komputer" 
                                        className="bg-slate-50 border-slate-200"
                                        value={formState.room}
                                        onChange={(e) => setFormState(s => ({ ...s, room: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
                                <Clock className="w-4 h-4 shrink-0" />
                                <p>Pastikan tidak ada jadwal bentrok untuk Guru dan Ruangan yang dipilih pada jam tersebut.</p>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)}>Batal</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">Simpan Jadwal</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
