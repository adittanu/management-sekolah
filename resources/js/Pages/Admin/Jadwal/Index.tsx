import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, Clock, MapPin, CalendarDays, Plus } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableScheduleCard, DroppableCell } from '@/Components/Jadwal/DragDropComponents';
import { Head, router } from '@inertiajs/react';

// Define Interfaces
interface Subject {
    id: number;
    name: string;
    code?: string;
}

interface Classroom {
    id: number;
    name: string;
    level?: string;
}

interface Teacher {
    id: number;
    name: string;
    nip?: string;
}

interface Schedule {
    id: number;
    subject_id: number;
    classroom_id: number;
    teacher_id: number;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    subject?: Subject;
    classroom?: Classroom;
    teacher?: Teacher;
}

interface Props {
    schedules: { data: Schedule[] };
    subjects: Subject[];
    classrooms: Classroom[];
    teachers: Teacher[];
}

export default function JadwalIndex({ schedules, subjects, classrooms, teachers }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDay, setSelectedDay] = useState('Semua');
    const [formState, setFormState] = useState({
        day: '',
        jam: '',
        subject: '',
        classId: '',
        room: ''
    });

    // Determine initial class from classrooms prop if available
    const [selectedClass, setSelectedClass] = useState(classrooms.length > 0 ? classrooms[0].name : '');
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const timeSlots = [1, 2, 3, 4, 5, 6, 7, 8];

    // Filter Logic for Days
    const visibleDays = selectedDay === 'Semua' ? days : [selectedDay];
    
    // Transform schedules data into grid format
    // Map time strings to jam slots. This is a heuristic based on start_time.
    // Example: 07:00 -> 1, 07:45 -> 2, etc.
    // Assuming standard 45 min lessons starting at 07:00
    const getJamFromTime = (time: string): number => {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute;
        const startMinutes = 7 * 60; // 07:00
        if (totalMinutes < startMinutes) return 1;
        const slot = Math.floor((totalMinutes - startMinutes) / 45) + 1;
        return slot > 8 ? 8 : slot; // Cap at 8 slots for now
    };

    // Transform raw schedules to the structure expected by the UI
    const transformedScheduleData = useMemo(() => {
        const data: Record<string, any[]> = {};
        
        // Initialize days
        days.forEach(day => {
            data[day] = [];
        });

        // Use schedules.data if paginated, otherwise assume array
        const scheduleList = schedules.data || [];

        scheduleList.forEach(schedule => {
            if (!schedule.subject || !schedule.classroom || !schedule.teacher) return;
            
            const jam = getJamFromTime(schedule.start_time);
            
            // Push to day bucket
            if (!data[schedule.day]) data[schedule.day] = [];
            
            data[schedule.day].push({
                id: schedule.id,
                jam: jam,
                subject: schedule.subject.name,
                class: schedule.classroom.name,
                teacher: schedule.teacher.name,
                room: schedule.room,
                time: `${schedule.start_time.substring(0, 5)} - ${schedule.end_time.substring(0, 5)}`,
                original: schedule // Keep original for reference
            });
        });

        return data;
    }, [schedules]);

    // Local state for drag-and-drop UI updates (optimistic UI)
    const [scheduleData, setScheduleData] = useState<any>(transformedScheduleData);

    // Sync state when props change
    useEffect(() => {
        setScheduleData(transformedScheduleData);
    }, [transformedScheduleData]);

    // Handle class selection change
    // If selectedClass is empty and we have classrooms, set the first one
    useEffect(() => {
        if (!selectedClass && classrooms.length > 0) {
            setSelectedClass(classrooms[0].name);
        }
    }, [classrooms]);

    const handleAddSchedule = (day: string = '', jam: string = '') => {
        const cls = classrooms.find(c => c.name === selectedClass);
        setFormState(prev => ({ 
            ...prev, 
            day, 
            jam, 
            classId: cls ? cls.id.toString() : '' 
        }));
        setIsAddScheduleOpen(true);
    };
    
    // ... Dnd Sensors ...
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // Drag starts after 10px movement
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Press and hold for 250ms to drag on touch
                tolerance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        // Parse IDs
        // Active ID: card-{day}-{jam}-... (We passed entire item data, but simpler to find in state)
        // Over ID: {day}-{jam}
        
        const activeData = active.data.current; // access data passed to Draggable
        if (!activeData) return;

        const [targetDay, targetJamStr] = (over.id as string).split('-');
        const targetJam = parseInt(targetJamStr);

        const sourceDay = activeData.day;
        const sourceJam = activeData.jam;
        const sourceClass = activeData.class;

        // Same slot check
        if (targetDay === sourceDay && targetJam === sourceJam) return;

        setScheduleData((prev: any) => {
            const newData = { ...prev };
            
            // 1. Remove from Source
            const sourceList = newData[sourceDay] || [];
            const itemIndex = sourceList.findIndex((s: any) => s.jam === sourceJam && s.class === sourceClass);
            if (itemIndex === -1) return prev; // Should not happen

            const [movedItem] = sourceList.splice(itemIndex, 1);
            newData[sourceDay] = [...sourceList]; // Update source day

            // 2. Check Target
            const targetList = newData[targetDay] || [];
            const targetItemIndex = targetList.findIndex((s: any) => s.jam === targetJam && s.class === selectedClass); 
            
            if (targetItemIndex !== -1) {
                // SWAP LOGIC
                // Target occupied by: targetList[targetItemIndex]
                const [swappedItem] = targetList.splice(targetItemIndex, 1);
                
                // Move swapped item to Source
                swappedItem.jam = sourceJam;
                swappedItem.day = sourceDay; 
                
                // Add swapped item to Source Day List
                newData[sourceDay].push(swappedItem);
            }

            // 3. Add Moved Item to Target
            movedItem.jam = targetJam;
            // movedItem.day = targetDay; // If data stores day
            
            if (!newData[targetDay]) newData[targetDay] = [];
            newData[targetDay].push(movedItem);

            return newData;
        });
    };

    // Helper to find item
    const getScheduleItem = (day: string, jam: number) => {
        const daySchedule = scheduleData[day] || [];
        return daySchedule.find((s: any) => s.jam === jam && s.class === selectedClass);
    };

    return (
        <AdminLayout title="Atur Jadwal KBM">
            <div className="space-y-6 w-full max-w-full">
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
                                    {classrooms.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
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

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between sticky top-0 z-30 overflow-hidden">
                     <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide min-w-0 flex-1">
                        <Button 
                             onClick={() => setSelectedDay('Semua')}
                             variant={selectedDay === 'Semua' ? 'secondary' : 'ghost'}
                             className={selectedDay === 'Semua' ? 'bg-slate-900 text-white hover:bg-slate-800 shrink-0' : 'text-slate-500 shrink-0'}
                        >
                            Semua Hari
                        </Button>
                        {days.map(day => (
                            <Button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                variant={selectedDay === day ? 'secondary' : 'ghost'}
                                className={selectedDay === day ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0' : 'text-slate-500 shrink-0'}
                            >
                                {day}
                            </Button>
                        ))}
                     </div>
                     
                     <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Cari Guru atau Mapel..." 
                            className="pl-10 bg-slate-50 border-slate-200 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-full">
                    <div className="overflow-x-auto w-full pb-3">
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            <div 
                                className={`grid divide-x divide-slate-100 border-b border-slate-200 ${visibleDays.length > 1 ? 'min-w-[1000px]' : 'w-full'}`}
                                style={{ gridTemplateColumns: `100px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                            >
                                {/* Header */}
                                <div className="p-4 flex items-center justify-center font-bold text-slate-400 bg-slate-50 text-xs tracking-wider sticky left-0 z-20 border-r border-slate-200">
                                    JAM KE
                                </div>
                                {visibleDays.map((day) => (
                                    <div key={day} className={`p-4 text-center font-bold text-sm uppercase tracking-wide ${day === 'Rabu' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className={`${visibleDays.length > 1 ? 'min-w-[1000px]' : 'w-full'}`}>
                                 {timeSlots.map((jam, index) => (
                                    <div 
                                        key={jam} 
                                        className={`grid divide-x divide-slate-100 ${index !== timeSlots.length - 1 ? 'border-b border-slate-100' : ''}`}
                                        style={{ gridTemplateColumns: `100px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                                    >
                                        {/* Time Slot Column */}
                                        <div className="bg-slate-50 p-4 sticky left-0 z-10 border-r border-slate-200 flex flex-col items-center justify-center gap-1 min-h-[140px]">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-sm text-sm">
                                                {jam}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400 mt-1 py-1 px-2 rounded bg-slate-100">
                                                07:{(jam * 45).toString().padStart(2, '0').slice(-2)}
                                            </div>
                                        </div>

                                        {/* Day Columns */}
                                        {visibleDays.map((day, dayIndex) => {
                                            const scheduleItem = getScheduleItem(day, jam);
                                            
                                            // Filter
                                            const isVisible = !searchQuery || (scheduleItem && (
                                                scheduleItem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                scheduleItem.teacher.toLowerCase().includes(searchQuery.toLowerCase())
                                            ));

                                            if (!isVisible && searchQuery) return <div key={dayIndex} className="bg-slate-50/10 min-h-[140px]"></div>;

                                            const cellId = `${day}-${jam}`;

                                            return (
                                                <div key={dayIndex} className="relative min-h-[140px] group">
                                                    <DroppableCell id={cellId}>
                                                        {scheduleItem ? (
                                                            <div className="p-2 h-full"> 
                                                                <DraggableScheduleCard 
                                                                    id={`card-${day}-${jam}-${scheduleItem.id}`}
                                                                    data={{ ...scheduleItem, day }}
                                                                >
                                                                    <Card className="h-full w-full bg-white hover:border-blue-300 border-slate-200 p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-move relative overflow-hidden">
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
                                                                </DraggableScheduleCard>
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 h-full">
                                                                <div 
                                                                    onClick={() => handleAddSchedule(day, jam.toString())}
                                                                    className="w-full h-full rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-blue-50 hover:border-blue-200"
                                                                >
                                                                    <Plus className="w-6 h-6 text-blue-400 mb-1" />
                                                                    <span className="text-xs text-blue-500 font-medium">Isi Jadwal</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </DroppableCell>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </DndContext>
                    </div>
                </div>

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
                                        {subjects.map((subj) => <SelectItem key={subj.id} value={subj.id.toString()}>{subj.name} ({subj.code})</SelectItem>)}
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
                                            {classrooms.map((cls) => <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>)}
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
