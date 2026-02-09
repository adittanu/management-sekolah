import TeacherLayout from '@/Layouts/TeacherLayout';
import { Button } from '@/Components/ui/button';
import { Search, Clock, MapPin, CalendarDays } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { useState, useMemo } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';

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

interface ScheduleGridItem {
    id: number;
    jam: number;
    startSlot: number;
    endSlot: number;
    durationSlots: number;
    day: string;
    subject: string;
    class: string;
    teacher: string;
    room: string;
    time: string;
    original: Schedule;
}

interface TimeSlot {
    id: number;
    slot_number: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface Props {
    schedules: Schedule[];
    subjects: Subject[];
    classrooms: Classroom[];
    teachers: Teacher[];
    timeSlots: TimeSlot[];
    role: string;
}

export default function JadwalGuruIndex({ schedules, subjects, classrooms, teachers, timeSlots, role }: Props) {
    const SLOT_ROW_HEIGHT_PX = 140;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDay, setSelectedDay] = useState('Semua');

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const activeTimeSlots = timeSlots.filter((slot) => slot.is_active).sort((a, b) => a.slot_number - b.slot_number);

    // Filter Logic for Days
    const visibleDays = selectedDay === 'Semua' ? days : [selectedDay];
    
    const getTimesFromSlot = (slotNumber: number): { start: string; end: string } => {
        const slot = activeTimeSlots.find((timeSlot) => timeSlot.slot_number === slotNumber);
        if (slot) {
            return { start: slot.start_time, end: slot.end_time };
        }

        const startMinutes = 7 * 60 + (slotNumber - 1) * 45;
        const endMinutes = startMinutes + 45;

        const format = (mins: number) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        return { start: format(startMinutes), end: format(endMinutes) };
    };

    const getSlotByStartTime = (time: string): TimeSlot | undefined => {
        const normalized = time.substring(0, 5);
        return activeTimeSlots.find((slot) => slot.start_time === normalized);
    };

    const getSlotByEndTime = (time: string): TimeSlot | undefined => {
        const normalized = time.substring(0, 5);
        return activeTimeSlots.find((slot) => slot.end_time === normalized);
    };

    const getJamFromTime = (time: string): number => {
        const slot = getSlotByStartTime(time);
        if (slot) {
            return slot.slot_number;
        }

        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute;
        const startMinutes = 7 * 60;
        if (totalMinutes < startMinutes) return 1;
        const calculatedSlot = Math.floor((totalMinutes - startMinutes) / 45) + 1;
        return calculatedSlot > 15 ? 15 : calculatedSlot;
    };

    const getEndJamFromTime = (time: string, fallbackStartSlot: number): number => {
        const slot = getSlotByEndTime(time);
        if (slot) {
            return slot.slot_number;
        }

        return fallbackStartSlot;
    };

    const transformScheduleData = (scheduleList: Schedule[]): Record<string, ScheduleGridItem[]> => {
        const transformedData: Record<string, ScheduleGridItem[]> = {};

        days.forEach(day => {
            transformedData[day] = [];
        });

        const list = scheduleList || [];

        list.forEach(schedule => {
            if (!schedule.subject || !schedule.classroom || !schedule.teacher) return;

            const startSlot = getJamFromTime(schedule.start_time);
            const endSlot = Math.max(startSlot, getEndJamFromTime(schedule.end_time, startSlot));
            const durationSlots = Math.max(1, endSlot - startSlot + 1);

            if (!transformedData[schedule.day]) transformedData[schedule.day] = [];

            transformedData[schedule.day].push({
                id: schedule.id,
                jam: startSlot,
                startSlot,
                endSlot,
                durationSlots,
                day: schedule.day,
                subject: schedule.subject.name,
                class: schedule.classroom.name,
                teacher: schedule.teacher.name,
                room: schedule.room,
                time: `${schedule.start_time.substring(0, 5)} - ${schedule.end_time.substring(0, 5)}`,
                original: schedule
            });
        });

        return transformedData;
    };

    const scheduleData = useMemo(() => {
        return transformScheduleData(schedules);
    }, [schedules]);

    const getScheduleItem = (day: string, jam: number): ScheduleGridItem | undefined => {
        const daySchedule = scheduleData[day] || [];
        return daySchedule.find((scheduleItem) => jam >= scheduleItem.startSlot && jam <= scheduleItem.endSlot);
    };

    const getCardHeight = (durationSlots: number): number => {
        return durationSlots * SLOT_ROW_HEIGHT_PX - 16;
    };

    return (
        <TeacherLayout title="Jadwal Mengajar">
            <div className="space-y-6 w-full max-w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <CalendarDays className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Jadwal Mengajar</h2>
                        </div>
                        <p className="text-slate-500">Jadwal mengajar anda di setiap kelas.</p>
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
                            placeholder="Cari Mapel atau Kelas..." 
                            className="pl-10 bg-slate-50 border-slate-200 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-full">
                    <div className="overflow-x-auto w-full pb-3">
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
                                {activeTimeSlots.map((timeSlot, index) => (
                                <div 
                                    key={timeSlot.id} 
                                    className={`grid divide-x divide-slate-100 ${index !== activeTimeSlots.length - 1 ? 'border-b border-slate-100' : ''}`}
                                    style={{ gridTemplateColumns: `100px repeat(${visibleDays.length}, minmax(0, 1fr))` }}
                                >
                                    {/* Time Slot Column */}
                                    <div className="bg-slate-50 p-4 sticky left-0 z-10 border-r border-slate-200 flex flex-col items-center justify-center gap-1 min-h-[140px]">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-sm text-sm">
                                            {timeSlot.slot_number}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400 mt-1 py-1 px-2 rounded bg-slate-100">
                                            {timeSlot.start_time}
                                        </div>
                                    </div>

                                    {/* Day Columns */}
                                    {visibleDays.map((day, dayIndex) => {
                                        const jam = timeSlot.slot_number;
                                        const scheduleItem = getScheduleItem(day, jam);
                                        const isStartCell = Boolean(scheduleItem && scheduleItem.startSlot === jam);
                                        const isCoveredCell = Boolean(scheduleItem && scheduleItem.startSlot < jam);
                                        
                                        // Filter
                                        const isVisible = !searchQuery || (scheduleItem && (
                                            scheduleItem.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            scheduleItem.class.toLowerCase().includes(searchQuery.toLowerCase())
                                        ));

                                        if (!isVisible && searchQuery) return <div key={dayIndex} className="bg-slate-50/10 min-h-[140px]"></div>;

                                        return (
                                            <div key={dayIndex} className="relative min-h-[140px] group">
                                                {scheduleItem && isStartCell ? (
                                                    <div className="p-2 h-full relative overflow-visible">
                                                        <div className="absolute inset-x-2 top-2 z-10" style={{ height: `${getCardHeight(scheduleItem.durationSlots)}px` }}>
                                                    <Card className="h-full w-full bg-white border-slate-200 p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden">
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
                                                            <div className="font-bold text-sm text-slate-800 line-clamp-2 mb-1" title={scheduleItem.subject}>{scheduleItem.subject}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 bg-slate-50 w-fit px-2 py-1 rounded-full">
                                                            <MapPin className="w-3 h-3" />
                                                            {scheduleItem.room || '-'}
                                                        </div>
                                                    </Card>
                                                        </div>
                                                    </div>
                                                ) : scheduleItem && isCoveredCell ? (
                                                    <div className="p-2 h-full">
                                                        <div className="h-full w-full rounded-xl border border-transparent bg-slate-50/30" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 h-full">
                                                        <div className="h-full w-full rounded-xl border border-dashed border-slate-100 flex items-center justify-center">
                                                        {/* Empty Slot */}
                                                    </div>
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
            </div>
        </TeacherLayout>
    );
}
