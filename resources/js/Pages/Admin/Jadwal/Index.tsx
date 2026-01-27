import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, Clock, MapPin, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableScheduleCard, DroppableCell } from '@/Components/Jadwal/DragDropComponents';
import { router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

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
    schedules: Schedule[]; // Changed from { data: Schedule[] } to Schedule[] because we switched to get()
    subjects: Subject[];
    classrooms: Classroom[];
    teachers: Teacher[];
}

export default function JadwalIndex({ schedules, subjects, classrooms, teachers }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDay, setSelectedDay] = useState('Semua');
    const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class'); // New State

    // Use Inertia Form
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        day: '',
        jam: '',
        subject_id: '',
        classroom_id: '',
        teacher_id: '',
        room: '',
        start_time: '',
        end_time: ''
    });

    // Generic selection state (can be class ID or teacher ID)
    // We store the ID as string to be consistent, or name if that's what we used before.
    // The previous code used `selectedClass` storing NAME. Let's switch to ID for better reliability,
    // or keep using Name if it's easier for the current prop structure.
    // Looking at previous code: `selectedClass` stored NAME.
    // Let's make it generic: `selectedFilterValue`
    
    const [selectedFilterValue, setSelectedFilterValue] = useState('');

    // Initialize selection when mode or data changes
    useEffect(() => {
        if (viewMode === 'class') {
            if (classrooms.length > 0 && !classrooms.find(c => c.name === selectedFilterValue)) {
                setSelectedFilterValue(classrooms[0].name);
            }
        } else {
            if (teachers.length > 0 && !teachers.find(t => t.name === selectedFilterValue)) {
                setSelectedFilterValue(teachers[0].name);
            }
        }
    }, [viewMode, classrooms, teachers]);
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const timeSlots = [1, 2, 3, 4, 5, 6, 7, 8];

    // Filter Logic for Days
    const visibleDays = selectedDay === 'Semua' ? days : [selectedDay];
    
    // Helper to calculate time from slot
    const getTimesFromSlot = (slot: number) => {
        const startMinutes = 7 * 60 + (slot - 1) * 45;
        const endMinutes = startMinutes + 45;
        
        const format = (mins: number) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };
        
        return { start: format(startMinutes), end: format(endMinutes) };
    }

    // Transform schedules data into grid format
    // Map time strings to jam slots.
    const getJamFromTime = (time: string): number => {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute;
        const startMinutes = 7 * 60; // 07:00
        if (totalMinutes < startMinutes) return 1;
        const slot = Math.floor((totalMinutes - startMinutes) / 45) + 1;
        return slot > 8 ? 8 : slot; // Cap at 8 slots for now
    };

    // Transform raw schedules to the structure expected by the UI
    const transformScheduleData = (scheduleList: Schedule[]) => {
        const data: Record<string, any[]> = {};
        
        // Initialize days
        days.forEach(day => {
            data[day] = [];
        });

        // Use schedules.data if paginated, otherwise assume array
        const list = scheduleList || [];

        list.forEach(schedule => {
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
    };

    const transformedScheduleData = useMemo(() => {
        return transformScheduleData(schedules);
    }, [schedules]);

    // Local state for drag-and-drop UI updates (optimistic UI)
    const [scheduleData, setScheduleData] = useState<any>(transformedScheduleData);

    // Sync state when props change
    useEffect(() => {
        setScheduleData(transformScheduleData(schedules));
    }, [schedules]);

    // Handle class selection change - REMOVED OLD LOGIC
    // New logic handled by viewMode effect above

    const handleAddSchedule = (day: string = '', jam: string = '') => {
        clearErrors();
        
        let start = '';
        let end = '';
        
        if (jam) {
            const times = getTimesFromSlot(parseInt(jam));
            start = times.start;
            end = times.end;
        }

        // Pre-fill based on view mode
        let initialClassId = '';
        let initialTeacherId = '';

        if (viewMode === 'class') {
            const cls = classrooms.find(c => c.name === selectedFilterValue);
            initialClassId = cls ? cls.id.toString() : '';
        } else {
            const tch = teachers.find(t => t.name === selectedFilterValue);
            initialTeacherId = tch ? tch.id.toString() : '';
        }

        setData({
            day: day,
            jam: jam,
            subject_id: '',
            classroom_id: initialClassId,
            teacher_id: initialTeacherId,
            room: '',
            start_time: start,
            end_time: end
        });
        setIsAddScheduleOpen(true);
    };

    const handleSaveSchedule = () => {
        // Calculate times if jam is selected but times are empty (fallback)
        let toSubmit: any = { ...data };
        if (data.jam && (!data.start_time || !data.end_time)) {
             const times = getTimesFromSlot(parseInt(data.jam));
             toSubmit.start_time = times.start;
             toSubmit.end_time = times.end;
        }

        // Ensure required fields are present
        if (!toSubmit.day || !toSubmit.jam || !toSubmit.subject_id || !toSubmit.classroom_id || !toSubmit.teacher_id) {
            toast.error('Mohon lengkapi semua data wajib!');
            return;
        }

        post(route('admin.jadwal.store'), {
            // @ts-ignore
            data: toSubmit,
            onSuccess: () => {
                setIsAddScheduleOpen(false);
                reset();
                toast.success('Jadwal berhasil ditambahkan');
            },
            onError: (err) => {
                toast.error('Gagal menambahkan jadwal. Periksa input anda.');
                console.error(err);
            }
        });
    };

    const handleDeleteSchedule = (id: number) => {
        if (confirm('Apakah anda yakin ingin menghapus jadwal ini?')) {
            router.delete(route('admin.jadwal.destroy', id), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => toast.success('Jadwal berhasil dihapus')
            });
        }
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
        const activeData = active.data.current; // access data passed to Draggable
        if (!activeData) return;

        const [targetDay, targetJamStr] = (over.id as string).split('-');
        const targetJam = parseInt(targetJamStr);

        const sourceDay = activeData.day;
        const sourceJam = activeData.jam;
        const scheduleId = activeData.id;

        // Same slot check
        if (targetDay === sourceDay && targetJam === sourceJam) return;

        // Optimistic update
        // Deep copy needed to properly revert state later if needed
        const previousData = JSON.parse(JSON.stringify(scheduleData));
        
        setScheduleData((prev: any) => {
            // Deep copy for mutation
            const newData = JSON.parse(JSON.stringify(prev));
            // ... (Simple move logic for UI responsiveness) ...
            // We can reuse the existing logic or simplify it just for visual feedback
            // But real update happens via API
             // 1. Remove from Source
            const sourceList = newData[sourceDay] || [];
            const itemIndex = sourceList.findIndex((s: any) => s.id === scheduleId);
            if (itemIndex === -1) return prev; 

            const [movedItem] = sourceList.splice(itemIndex, 1);
            newData[sourceDay] = [...sourceList]; 

            // 2. Add to Target (If occupied, we might need to handle swap or reject)
            // For now, let's just push and let backend validate
            if (!newData[targetDay]) newData[targetDay] = [];
            
            // Check if target is occupied
            const targetList = newData[targetDay];
            
            let isOccupied = false;
            
            if (viewMode === 'class') {
                // Class Mode: Check if slot occupied by SAME CLASS
                isOccupied = targetList.some((s:any) => s.jam === targetJam && s.class === selectedFilterValue);
            } else {
                 // Teacher Mode: Check if slot occupied by SAME TEACHER
                 isOccupied = targetList.some((s:any) => s.jam === targetJam && s.teacher === selectedFilterValue);
            }
            
            if (isOccupied) {
                // If occupied, revert (or handle swap later)
                toast.error('Slot waktu sudah terisi!');
                // MUST RETURN A NEW OBJECT TO TRIGGER RENDER
                return JSON.parse(JSON.stringify(previousData)); 
            }

            movedItem.jam = targetJam;
            movedItem.day = targetDay; // Update day
            // Update time display string for UI
            const newTimes = getTimesFromSlot(targetJam);
            movedItem.time = `${newTimes.start} - ${newTimes.end}`;

            newData[targetDay].push(movedItem);
            return newData;
        });

        // Backend Update
        const newTimes = getTimesFromSlot(targetJam);
        
        router.put(route('admin.jadwal.update', scheduleId), {
            day: targetDay,
            start_time: newTimes.start,
            end_time: newTimes.end,
            subject_id: activeData.original.subject_id,
            classroom_id: activeData.original.classroom_id,
            teacher_id: activeData.original.teacher_id,
            room: activeData.original.room,
        }, {
            preserveState: true, // Keep view mode and selection active
            preserveScroll: true, // Keep scroll position
            onSuccess: () => {
                toast.success('Jadwal berhasil dipindahkan');
            },
            onError: (err) => {
                const message = (Object.values(err)[0] as string) || 'Terjadi kesalahan yang tidak diketahui';
                toast.error('Gagal memindahkan jadwal: ' + message);
                // Revert UI - Explicitly set state back to previousData
                setScheduleData(previousData);
            }
        });
    };

    // Helper to find item
    const getScheduleItem = (day: string, jam: number) => {
        const daySchedule = scheduleData[day] || [];
        if (viewMode === 'class') {
            return daySchedule.find((s: any) => s.jam === jam && s.class === selectedFilterValue);
        } else {
             return daySchedule.find((s: any) => s.jam === jam && s.teacher === selectedFilterValue);
        }
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
                        {/* View Mode Toggle */}
                        <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                            <Button 
                                variant={viewMode === 'class' ? 'secondary' : 'ghost'} 
                                size="sm"
                                onClick={() => setViewMode('class')}
                                className={viewMode === 'class' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}
                            >
                                Kelas
                            </Button>
                            <Button 
                                variant={viewMode === 'teacher' ? 'secondary' : 'ghost'} 
                                size="sm"
                                onClick={() => setViewMode('teacher')}
                                className={viewMode === 'teacher' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}
                            >
                                Guru
                            </Button>
                        </div>

                        <div className="w-[250px]">
                            <Select value={selectedFilterValue} onValueChange={setSelectedFilterValue}>
                                <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                                    <SelectValue placeholder={viewMode === 'class' ? "Pilih Kelas" : "Pilih Guru"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {viewMode === 'class' 
                                        ? classrooms.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)
                                        : teachers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)
                                    }
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
                                                {getTimesFromSlot(jam).start}
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
                                                                    <Card className="h-full w-full bg-white hover:border-blue-300 border-slate-200 p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-move relative overflow-hidden group/card">
                                                                        <div className={`absolute top-0 left-0 w-1 h-full ${
                                                                            scheduleItem.subject === 'Matematika' ? 'bg-blue-500' :
                                                                            scheduleItem.subject === 'Fisika' ? 'bg-purple-500' :
                                                                            scheduleItem.subject === 'Kimia' ? 'bg-pink-500' : 'bg-orange-500'
                                                                        }`}></div>
                                                                        
                                                                        <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity flex gap-1">
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteSchedule(scheduleItem.id);
                                                                                }}
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>

                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-2 pr-6">
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
                                                                            {scheduleItem.room || '-'}
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
                                    <Select value={data.day} onValueChange={(val) => setData('day', val)}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Hari" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.day && <p className="text-xs text-red-500">{errors.day}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Jam Ke-</Label>
                                    <Select value={data.jam} onValueChange={(val) => {
                                        const times = getTimesFromSlot(parseInt(val));
                                        setData(prev => ({ ...prev, jam: val, start_time: times.start, end_time: times.end }));
                                    }}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Jam" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map(t => <SelectItem key={t} value={t.toString()}>{t} (07:{(t*45).toString().padStart(2, '0').slice(-2)})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Mata Pelajaran</Label>
                                <Select value={data.subject_id} onValueChange={(val) => setData('subject_id', val)}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Pilih Mata Pelajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subj) => <SelectItem key={subj.id} value={subj.id.toString()}>{subj.name} ({subj.code})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.subject_id && <p className="text-xs text-red-500">{errors.subject_id}</p>}
                            </div>

                             <div className="space-y-2">
                                <Label>Guru Pengajar</Label>
                                <Select value={data.teacher_id} onValueChange={(val) => setData('teacher_id', val)}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Pilih Guru" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.teacher_id && <p className="text-xs text-red-500">{errors.teacher_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Kelas</Label>
                                    <Select value={data.classroom_id} onValueChange={(val) => setData('classroom_id', val)}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classrooms.map((cls) => <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.classroom_id && <p className="text-xs text-red-500">{errors.classroom_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Ruangan</Label>
                                    <Input 
                                        placeholder="Contoh: Lab Komputer" 
                                        className="bg-slate-50 border-slate-200"
                                        value={data.room}
                                        onChange={(e) => setData('room', e.target.value)}
                                    />
                                    {errors.room && <p className="text-xs text-red-500">{errors.room}</p>}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
                                <Clock className="w-4 h-4 shrink-0" />
                                <p>Pastikan tidak ada jadwal bentrok untuk Guru dan Ruangan yang dipilih pada jam tersebut.</p>
                            </div>
                             {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800">
                                    <p>Terdapat kesalahan input. Mohon periksa kembali.</p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)}>Batal</Button>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                onClick={handleSaveSchedule}
                                disabled={processing}
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
