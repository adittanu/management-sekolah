import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, Clock, MapPin, CalendarDays, Plus, Trash2, Pencil, Sparkles, Loader2, AlertTriangle, CheckCircle2, X, Download, Upload } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableScheduleCard, DroppableCell } from '@/Components/Jadwal/DragDropComponents';
import { router, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';


// Define Interfaces
interface Subject {
    id: number;
    name: string;
    code?: string;
    teachers?: Teacher[];
}

interface Classroom {
    id: number;
    name: string;
    level?: string;
    is_mobile?: boolean;
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

interface Room {
    id: number;
    name: string;
    code: string;
    type: string;
    capacity?: number;
    is_active?: boolean;
}

interface Props {
    schedules: Schedule[];
    subjects: Subject[];
    classrooms: Classroom[];
    teachers: Teacher[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    classroomIdsWithSchedule?: number[];
    autoResult?: {
        auto_generate_saved?: number;
        auto_generate_errors?: string[];
        auto_generate_conflicts?: string[];
        auto_generate_warnings?: string[];
        auto_generate_unfulfilled?: string[];
        auto_generate_next_classroom_id?: number;
        auto_generate_next_classroom_name?: string;
        auto_generate_stats?: {
            total_lessons: number;
            scheduled: number;
            conflicts: number;
            fill_rate: number;
            classroom_id?: number;
        };
    } | null;
}

export default function JadwalIndex({ schedules, subjects, classrooms, teachers, timeSlots, rooms = [], classroomIdsWithSchedule = [], autoResult }: Props) {
    const SLOT_ROW_HEIGHT_PX = 140;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDay, setSelectedDay] = useState('Semua');
    const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
    const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);
    const [autoGenClassroomId, setAutoGenClassroomId] = useState('');
    const [autoGenClearExisting, setAutoGenClearExisting] = useState(false);
    const [autoGenRequirements, setAutoGenRequirements] = useState<Record<string, number>>({});
    const [autoGenProcessing, setAutoGenProcessing] = useState(false);
    const [autoGenPrompt, setAutoGenPrompt] = useState('');
    const [autoGenIsMobile, setAutoGenIsMobile] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importProcessing, setImportProcessing] = useState(false);

    // Use Inertia Form
    const { data, setData, processing, errors, reset, clearErrors } = useForm({
        day: '',
        jam: '',
        duration: '1',
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
    const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    // Use timeSlots from props instead of hardcoded array
    const activeTimeSlots = timeSlots.filter(ts => ts.is_active).sort((a, b) => a.slot_number - b.slot_number);

    // Filter Logic for Days
    const visibleDays = selectedDay === 'Semua' ? days : [selectedDay];

    // Helper to get time from TimeSlot object
    const getTimesFromSlot = (slotNumber: number) => {
        const slot = timeSlots.find(ts => ts.slot_number === slotNumber);
        if (slot) {
            return {
                start: slot.start_time.substring(0, 5),
                end: slot.end_time.substring(0, 5)
            };
        }
        // Fallback to calculation if slot not found
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
        return activeTimeSlots.find((slot) => {
            const slotStart = slot.start_time.substring(0, 5);
            return slotStart === normalized;
        });
    };

    const getSlotByEndTime = (time: string): TimeSlot | undefined => {
        const normalized = time.substring(0, 5);
        return activeTimeSlots.find((slot) => {
            const slotEnd = slot.end_time.substring(0, 5);
            return slotEnd === normalized;
        });
    };

    const getMaxSlotNumber = (): number => {
        return activeTimeSlots[activeTimeSlots.length - 1]?.slot_number ?? 15;
    };

    const getSlotRangeTimes = (startSlot: number, durationSlots: number): { start: string; end: string } => {
        const normalizedDuration = Number.isNaN(durationSlots) ? 1 : Math.max(1, durationSlots);
        const endSlotNumber = startSlot + normalizedDuration - 1;
        const startSlotData = activeTimeSlots.find((slot) => slot.slot_number === startSlot);
        const endSlotData = activeTimeSlots.find((slot) => slot.slot_number === endSlotNumber);

        const start = (startSlotData?.start_time ?? getTimesFromSlot(startSlot).start).substring(0, 5);
        const end = (endSlotData?.end_time ?? getTimesFromSlot(startSlot).end).substring(0, 5);

        return { start, end };
    };

    // Transform schedules data into grid format
    // Map time strings to jam slots.
    const getJamFromTime = (time: string): number => {
        const slot = getSlotByStartTime(time);
        if (slot) {
            return slot.slot_number;
        }
        // Fallback to calculation
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = hour * 60 + minute;
        const startMinutes = 7 * 60; // 07:00
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

    // Transform raw schedules to the structure expected by the UI
    const transformScheduleData = (scheduleList: Schedule[]): Record<string, ScheduleGridItem[]> => {
        const transformedData: Record<string, ScheduleGridItem[]> = {};

        // Initialize days
        days.forEach(day => {
            transformedData[day] = [];
        });

        // Use schedules.data if paginated, otherwise assume array
        const list = scheduleList || [];

        list.forEach(schedule => {
            if (!schedule.subject || !schedule.classroom || !schedule.teacher) return;

            const startSlot = getJamFromTime(schedule.start_time);
            const endSlot = Math.max(startSlot, getEndJamFromTime(schedule.end_time, startSlot));
            const durationSlots = Math.max(1, endSlot - startSlot + 1);

            // Push to day bucket
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
                original: schedule // Keep original for reference
            });
        });

        return transformedData;
    };

    const transformedScheduleData = useMemo(() => {
        return transformScheduleData(schedules);
    }, [schedules]);

    // Local state for drag-and-drop UI updates (optimistic UI)
    const [scheduleData, setScheduleData] = useState<Record<string, ScheduleGridItem[]>>(transformedScheduleData);

    // Sync state when props change
    useEffect(() => {
        setScheduleData(transformScheduleData(schedules));
    }, [schedules]);

    // Handle class selection change - REMOVED OLD LOGIC
    // New logic handled by viewMode effect above

    const handleAddSchedule = (day: string = '', jam: string = '') => {
        setEditingScheduleId(null);
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
            duration: '1',
            subject_id: '',
            classroom_id: initialClassId,
            teacher_id: initialTeacherId,
            room: '',
            start_time: start,
            end_time: end
        });
        setIsAddScheduleOpen(true);
    };

    const handleEditSchedule = (scheduleItem: ScheduleGridItem): void => {
        clearErrors();
        setEditingScheduleId(scheduleItem.id);

        setData({
            day: scheduleItem.day,
            jam: scheduleItem.startSlot.toString(),
            duration: scheduleItem.durationSlots.toString(),
            subject_id: scheduleItem.original.subject_id.toString(),
            classroom_id: scheduleItem.original.classroom_id.toString(),
            teacher_id: scheduleItem.original.teacher_id.toString(),
            room: scheduleItem.room || '',
            start_time: scheduleItem.original.start_time.substring(0, 5),
            end_time: scheduleItem.original.end_time.substring(0, 5),
        });

        setIsAddScheduleOpen(true);
    };

    const closeScheduleDialog = (): void => {
        setIsAddScheduleOpen(false);
        setEditingScheduleId(null);
        reset();
        clearErrors();
    };

    const handleSaveSchedule = () => {
        const normalizedJam = Number.parseInt(data.jam, 10);
        const normalizedDuration = Number.parseInt(data.duration, 10);

        let toSubmit = { ...data };

        if (data.jam) {
            const maxSlotNumber = getMaxSlotNumber();
            const safeDuration = Number.isNaN(normalizedDuration) ? 1 : Math.max(1, normalizedDuration);
            const endSlotNumber = normalizedJam + safeDuration - 1;

            if (endSlotNumber > maxSlotNumber) {
                toast.error('Durasi melewati jam pelajaran yang tersedia.');
                return;
            }

            const computedTimes = getSlotRangeTimes(normalizedJam, safeDuration);
            toSubmit.start_time = computedTimes.start;
            toSubmit.end_time = computedTimes.end;
        }

        // Ensure required fields are present
        if (!toSubmit.day || !toSubmit.jam || !toSubmit.subject_id || !toSubmit.classroom_id || !toSubmit.teacher_id) {
            toast.error('Mohon lengkapi semua data wajib!');
            return;
        }

        if (editingScheduleId) {
            router.put(route('admin.jadwal.update', editingScheduleId), toSubmit, {
                onSuccess: () => {
                    closeScheduleDialog();
                    toast.success('Jadwal berhasil diperbarui');
                },
                onError: () => {
                    toast.error('Gagal memperbarui jadwal. Periksa input anda.');
                }
            });
            return;
        }

        router.post(route('admin.jadwal.store'), toSubmit, {
            onSuccess: () => {
                closeScheduleDialog();
                toast.success('Jadwal berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan jadwal. Periksa input anda.');
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

        setScheduleData((prev) => {
            // Deep copy for mutation
            const newData = JSON.parse(JSON.stringify(prev)) as Record<string, ScheduleGridItem[]>;
            // ... (Simple move logic for UI responsiveness) ...
            // We can reuse the existing logic or simplify it just for visual feedback
            // But real update happens via API
             // 1. Remove from Source
            const sourceList = newData[sourceDay] || [];
            const itemIndex = sourceList.findIndex((scheduleItem) => scheduleItem.id === scheduleId);
            if (itemIndex === -1) return prev;

            const [movedItem] = sourceList.splice(itemIndex, 1);
            newData[sourceDay] = [...sourceList];

            // 2. Add to Target (If occupied, we might need to handle swap or reject)
            // For now, let's just push and let backend validate
            if (!newData[targetDay]) newData[targetDay] = [];

            // Check if target is occupied
            const targetList = newData[targetDay] || [];

            const durationSlots = Math.max(1, movedItem.durationSlots ?? 1);
            const targetEndSlot = targetJam + durationSlots - 1;
            if (targetEndSlot > getMaxSlotNumber()) {
                toast.error('Durasi mapel melebihi slot waktu yang tersedia.');
                return JSON.parse(JSON.stringify(previousData));
            }

            const isSameDimension = (item: ScheduleGridItem): boolean => {
                if (viewMode === 'class') {
                    return item.class === selectedFilterValue;
                }

                return item.teacher === selectedFilterValue;
            };

            const isRangeOverlap = (startA: number, endA: number, startB: number, endB: number): boolean => {
                return startA <= endB && startB <= endA;
            };

            const isOccupied = targetList
                .filter((item) => item.id !== scheduleId)
                .filter(isSameDimension)
                .some((item) => isRangeOverlap(item.startSlot, item.endSlot, targetJam, targetEndSlot));

            if (isOccupied) {
                // If occupied, revert (or handle swap later)
                toast.error('Slot waktu sudah terisi!');
                // MUST RETURN A NEW OBJECT TO TRIGGER RENDER
                return JSON.parse(JSON.stringify(previousData));
            }

            movedItem.jam = targetJam;
            movedItem.startSlot = targetJam;
            movedItem.endSlot = targetEndSlot;
            movedItem.durationSlots = durationSlots;
            movedItem.day = targetDay; // Update day
            // Update time display string for UI
            const movedTimes = getSlotRangeTimes(targetJam, durationSlots);
            movedItem.time = `${movedTimes.start} - ${movedTimes.end}`;

            newData[targetDay].push(movedItem);
            return newData;
        });

        // Backend Update
        const activeDuration = Math.max(1, activeData.durationSlots ?? 1);
        const movedTimes = getSlotRangeTimes(targetJam, activeDuration);

        router.put(route('admin.jadwal.update', scheduleId), {
            day: targetDay,
            start_time: movedTimes.start,
            end_time: movedTimes.end,
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
    const getScheduleItem = (day: string, jam: number): ScheduleGridItem | undefined => {
        const daySchedule = scheduleData[day] || [];
        if (viewMode === 'class') {
            return daySchedule.find((scheduleItem) => {
                return jam >= scheduleItem.startSlot && jam <= scheduleItem.endSlot && scheduleItem.class === selectedFilterValue;
            });
        } else {
             return daySchedule.find((scheduleItem) => {
                return jam >= scheduleItem.startSlot && jam <= scheduleItem.endSlot && scheduleItem.teacher === selectedFilterValue;
             });
        }
    };

    const getCardHeight = (durationSlots: number): number => {
        return durationSlots * SLOT_ROW_HEIGHT_PX - 16;
    };

    const selectedStartSlot = Number.parseInt(data.jam, 10);
    const maxDurationFromSelectedSlot = Number.isNaN(selectedStartSlot)
        ? 1
        : Math.max(1, getMaxSlotNumber() - selectedStartSlot + 1);
    const selectedTimeSlot = timeSlots.find((slot) => slot.slot_number.toString() === data.jam);

    // Sync mobile status when selected classroom in auto-generator changes
    useEffect(() => {
        if (autoGenClassroomId) {
            const cls = classrooms.find(c => c.id.toString() === autoGenClassroomId);
            setAutoGenIsMobile(cls?.is_mobile || false);
        } else {
            setAutoGenIsMobile(false);
        }
    }, [autoGenClassroomId, classrooms]);

    // Auto-Generate toast notifications
    useEffect(() => {
        if (!autoResult) return;

        if (autoResult.auto_generate_saved) {
            const classroom = classrooms.find(c => c.id === autoResult.auto_generate_stats?.classroom_id);
            const classroomName = classroom?.name ?? '';
            toast.success(`✅ Berhasil! ${autoResult.auto_generate_saved} jadwal dibuat untuk kelas ${classroomName}.`, {
                duration: 5000,
                description: autoResult.auto_generate_stats
                    ? `${autoResult.auto_generate_stats.scheduled}/${autoResult.auto_generate_stats.total_lessons} slot terisi (${autoResult.auto_generate_stats.fill_rate}%)`
                    : undefined,
            });
            if (classroom) {
                setViewMode('class');
                setSelectedFilterValue(classroom.name);
            }
        }
        if (autoResult.auto_generate_conflicts && autoResult.auto_generate_conflicts.length > 0) {
            autoResult.auto_generate_conflicts.forEach((c: string) => toast.warning(`⚠️ ${c}`, { duration: 6000 }));
        }
        if (autoResult.auto_generate_errors && autoResult.auto_generate_errors.length > 0) {
            autoResult.auto_generate_errors.forEach((e: string) => toast.error(`❌ Gagal: ${e}`, { duration: 6000 }));
        }
        if (autoResult.auto_generate_warnings && autoResult.auto_generate_warnings.length > 0) {
            autoResult.auto_generate_warnings.forEach((w: string) => toast.warning(`⚠️ ${w}`, { duration: 8000 }));
        }
        if (autoResult.auto_generate_unfulfilled && autoResult.auto_generate_unfulfilled.length > 0) {
            toast.warning(`⚠️ Mapel yang belum terpenuhi: ${autoResult.auto_generate_unfulfilled.join(', ')}`, { duration: 10000 });
        }
        if (autoResult.auto_generate_next_classroom_name) {
            toast.info(`💡 Kelas berikutnya belum punya jadwal: ${autoResult.auto_generate_next_classroom_name}`, { duration: 8000 });
        }
    }, [autoResult]);

    const toggleAutoGenSubject = (subjectId: string) => {
        setAutoGenRequirements(prev => {
            const updated = { ...prev };
            if (updated[subjectId]) {
                delete updated[subjectId];
            } else {
                updated[subjectId] = 2;
            }
            return updated;
        });
    };

    const updateAutoGenHours = (subjectId: string, hours: number) => {
        setAutoGenRequirements(prev => ({
            ...prev,
            [subjectId]: Math.max(1, Math.min(10, hours)),
        }));
    };

    const selectAllSubjects = () => {
        const all: Record<string, number> = {};
        subjects.forEach(s => {
            all[s.id.toString()] = 2;
        });
        setAutoGenRequirements(all);
    };

    const clearAllSubjects = () => {
        setAutoGenRequirements({});
    };

    const handleAutoGenerate = () => {
        if (!autoGenClassroomId) {
            toast.error('Pilih kelas terlebih dahulu');
            return;
        }
        const validRequirements = Object.entries(autoGenRequirements)
            .filter(([id, hours]) => id && hours > 0)
            .map(([id, hours]) => ({
                subject_id: parseInt(id),
                hours,
            }));
        if (validRequirements.length === 0) {
            toast.error('Pilih minimal satu mata pelajaran');
            return;
        }

        setAutoGenProcessing(true);
        setIsAutoGenerateOpen(false);

        router.post(route('admin.jadwal.auto-generate'), {
            classroom_id: parseInt(autoGenClassroomId),
            requirements: validRequirements,
            clear_existing: autoGenClearExisting,
            prompt: autoGenPrompt.trim() || undefined,
            is_mobile: autoGenIsMobile,
        }, {
            onFinish: () => setAutoGenProcessing(false),
        });
    };

    /** Auto-navigate to next classroom after a successful generate */
    const handleGoToNextClassroom = () => {
        if (autoResult?.auto_generate_next_classroom_id) {
            const nextId = autoResult.auto_generate_next_classroom_id.toString();
            setAutoGenClassroomId(nextId);
            setAutoGenRequirements({});
            setAutoGenClearExisting(false);
            setIsAutoGenerateOpen(true);
            toast.info(`Siap generate kelas: ${autoResult.auto_generate_next_classroom_name}`);
        }
    };

    /** Re-generate the same classroom */
    const handleRegenerateCurrent = () => {
        if (autoResult?.auto_generate_stats?.classroom_id) {
            const currentId = autoResult.auto_generate_stats.classroom_id.toString();
            setAutoGenClassroomId(currentId);
            setAutoGenClearExisting(true);
            setIsAutoGenerateOpen(true);
            toast.info('Generate ulang kelas yang sama (jadwal lama akan dihapus)');
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
                                        ? classrooms.map(c => {
                                            const hasSchedule = classroomIdsWithSchedule.includes(c.id);
                                            return (
                                                <SelectItem key={c.id} value={c.name}>
                                                    {hasSchedule ? '✅' : '⬜'} {c.name}
                                                </SelectItem>
                                            );
                                        })
                                        : teachers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            data-tour="btn-auto-generate"
                            onClick={() => setIsAutoGenerateOpen(true)}
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Auto Generate
                        </Button>
                        <a href={route('admin.jadwal.export')} target="_blank" rel="noopener noreferrer">
                            <Button
                                variant="outline"
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Excel
                            </Button>
                        </a>
                        <Button
                            variant="outline"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
                            onClick={() => setIsImportOpen(true)}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Import Excel
                        </Button>
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

                {/* Auto-generate result summary banner */}
                {autoResult?.auto_generate_saved && autoResult.auto_generate_stats?.classroom_id && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-purple-900">
                                        Generate selesai: {classrooms.find(c => c.id === autoResult.auto_generate_stats?.classroom_id)?.name}
                                    </p>
                                    <p className="text-xs text-purple-600">
                                        {autoResult.auto_generate_stats.scheduled}/{autoResult.auto_generate_stats.total_lessons} slot terisi ({autoResult.auto_generate_stats.fill_rate}%)
                                        {autoResult.auto_generate_errors && autoResult.auto_generate_errors.length > 0 && (
                                            <span className="text-red-500 ml-2">• {autoResult.auto_generate_errors.length} error</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRegenerateCurrent}
                                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                >
                                    🔄 Generate Ulang
                                </Button>
                                {autoResult.auto_generate_next_classroom_id && (
                                    <Button
                                        size="sm"
                                        onClick={handleGoToNextClassroom}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        ➡️ Generate Kelas: {autoResult.auto_generate_next_classroom_name}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
                                                scheduleItem.teacher.toLowerCase().includes(searchQuery.toLowerCase())
                                            ));

                                            if (!isVisible && searchQuery) return <div key={dayIndex} className="bg-slate-50/10 min-h-[140px]"></div>;

                                            const cellId = `${day}-${jam}`;

                                            return (
                                                <div key={dayIndex} className="relative min-h-[140px] group">
                                                    <DroppableCell id={cellId}>
                                                        {scheduleItem && isStartCell ? (
                                                            <div className="p-2 h-full relative overflow-visible">
                                                                <DraggableScheduleCard
                                                                    id={`card-${day}-${jam}-${scheduleItem.id}`}
                                                                    data={{ ...scheduleItem, day }}
                                                                >
                                                                    <div className="absolute inset-x-2 top-2 z-10" style={{ height: `${getCardHeight(scheduleItem.durationSlots)}px` }}>
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
                                                                                className="h-6 w-6 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditSchedule(scheduleItem);
                                                                                }}
                                                                            >
                                                                                <Pencil className="w-3 h-3" />
                                                                            </Button>
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
                                                                    </div>
                                                                </DraggableScheduleCard>
                                                            </div>
                                                        ) : scheduleItem && isCoveredCell ? (
                                                            <div className="p-2 h-full">
                                                                <div className="w-full h-full rounded-xl border border-transparent bg-slate-50/30" />
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

                <Dialog open={isAddScheduleOpen} onOpenChange={(open) => {
                    if (!open) {
                        closeScheduleDialog();
                    }
                }}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">{editingScheduleId ? 'Ubah Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}</DialogTitle>
                            <DialogDescription>
                                Masukkan detail jadwal KBM baru ke dalam slot waktu.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                        const selectedSlot = timeSlots.find(ts => ts.slot_number.toString() === val);
                                        if (selectedSlot) {
                                            setData(prev => ({ ...prev, jam: val, duration: '1', start_time: selectedSlot.start_time, end_time: selectedSlot.end_time }));
                                        }
                                    }}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Jam" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map((ts) => (
                                                <SelectItem key={ts.id} value={ts.slot_number.toString()}>
                                                    {`Jam ke-${ts.slot_number} (${ts.start_time} - ${ts.end_time})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedTimeSlot && (
                                        <p className="text-[11px] text-slate-500">
                                            {`Rentang: ${selectedTimeSlot.start_time} - ${selectedTimeSlot.end_time}`}
                                        </p>
                                    )}
                                    {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Durasi (JP)</Label>
                                    <Select value={data.duration} onValueChange={(val) => setData('duration', val)}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200" disabled={!data.jam}>
                                            <SelectValue placeholder="Pilih Durasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: maxDurationFromSelectedSlot }, (_, index) => {
                                                const duration = index + 1;
                                                return (
                                                    <SelectItem key={duration} value={duration.toString()}>
                                                        {duration} JP
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                                <div className="space-y-2">
                                    <Label>Mata Pelajaran</Label>
                                    <Select value={data.subject_id} onValueChange={(val) => {
                                        setData(prev => ({ ...prev, subject_id: val, teacher_id: '' })); // Reset teacher when subject changes
                                    }}>
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
                                    <Select
                                        value={data.teacher_id}
                                        onValueChange={(val) => setData('teacher_id', val)}
                                        disabled={!data.subject_id} // Disable if no subject selected
                                    >
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder={data.subject_id ? "Pilih Guru" : "Pilih Mapel Dahulu"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.subject_id ? (
                                                (() => {
                                                    const selectedSubject = subjects.find(s => s.id.toString() === data.subject_id);
                                                    const linkedTeachers = selectedSubject?.teachers || [];

                                                    // Show all teachers if no specific teachers linked, OR show only linked teachers
                                                    const displayTeachers = linkedTeachers.length > 0 ? linkedTeachers : teachers;

                                                    return displayTeachers.map((teacher) => (
                                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                            {teacher.name} {linkedTeachers.length > 0 ? '(Pengajar Mapel)' : ''}
                                                        </SelectItem>
                                                    ));
                                                })()
                                            ) : (
                                                <SelectItem value="dummy" disabled>Pilih Mata Pelajaran Terlebih Dahulu</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.teacher_id && <p className="text-xs text-red-500">{errors.teacher_id}</p>}
                                    {data.subject_id && subjects.find(s => s.id.toString() === data.subject_id)?.teachers?.length === 0 && (
                                        <p className="text-[10px] text-amber-600 mt-1">* Mapel ini belum memiliki guru spesifik. Menampilkan semua guru.</p>
                                    )}
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
                                    <Select value={data.room} onValueChange={(val) => setData('room', val)}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Pilih Ruangan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Tanpa Ruangan</SelectItem>
                                            {rooms.map((room) => (
                                                <SelectItem key={room.id} value={room.name}>
                                                    {room.name} ({room.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                            <Button variant="outline" onClick={closeScheduleDialog}>Batal</Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                onClick={handleSaveSchedule}
                                disabled={processing}
                            >
                                {processing ? 'Menyimpan...' : editingScheduleId ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {isAutoGenerateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setIsAutoGenerateOpen(false)} />
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto z-50">
                            <div className="p-6 pb-4 border-b border-slate-100 bg-purple-50/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        <h2 className="text-xl font-bold text-slate-900">Auto Generate Jadwal</h2>
                                    </div>
                                    <button onClick={() => setIsAutoGenerateOpen(false)} className="rounded-sm opacity-70 hover:opacity-100">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">Biarkan AI membuatkan jadwal KBM secara otomatis tanpa bentrok guru dan ruangan.</p>
                            </div>

                            <div className="p-6 space-y-5">
                            {/* Classroom Selection — single kelas only */}
                            <div className="space-y-2">
                            <Label>Pilih Kelas</Label>
                            <Select value={autoGenClassroomId} onValueChange={setAutoGenClassroomId}>
                                <SelectTrigger className="bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="Pilih 1 kelas yang akan dijadwalkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classrooms.map((cls) => {
                                        const hasSchedule = classroomIdsWithSchedule.includes(cls.id);
                                        return (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                {hasSchedule ? '✅' : '⬜'} {cls.name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {!autoGenClassroomId ? (
                                <p className="text-[11px] text-red-500 font-medium">
                                    * Wajib memilih kelas sebelum menggenerate jadwal
                                </p>
                            ) : Object.keys(autoGenRequirements).length === 0 ? (
                                <p className="text-[11px] text-amber-600 font-medium">
                                    * Pilih minimal satu mata pelajaran di bawah
                                </p>
                            ) : (
                                <p className="text-[10px] text-slate-400">
                                    Generate dilakukan per 1 kelas. Setelah selesai, Anda bisa lanjut ke kelas berikutnya.
                                </p>
                            )}
                            </div>

                            {/* Mobile Class Option */}
                            {autoGenClassroomId && (
                                <div className="flex items-center gap-3 p-3 bg-purple-50/50 border border-purple-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="autoGenIsMobile"
                                        checked={autoGenIsMobile}
                                        onChange={(e) => setAutoGenIsMobile(e.target.checked)}
                                        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div>
                                        <label htmlFor="autoGenIsMobile" className="text-sm font-medium text-purple-800 cursor-pointer flex items-center gap-1.5">
                                            <span>Jadikan Moving Class (Kelas Mobile)</span>
                                            {autoGenIsMobile ? (
                                                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase">Mobile</span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase">Fixed Class</span>
                                            )}
                                        </label>
                                        <p className="text-xs text-purple-600">
                                            Jika diaktifkan, KBM akan ditempatkan di ruang kelas mana saja yang kosong (moving class)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Clear Existing Option */}
                            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="clearExisting"
                                    checked={autoGenClearExisting}
                                    onChange={(e) => setAutoGenClearExisting(e.target.checked)}
                                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                />
                                <div>
                                    <label htmlFor="clearExisting" className="text-sm font-medium text-amber-800 cursor-pointer">
                                        Hapus jadwal yang sudah ada
                                    </label>
                                    <p className="text-xs text-amber-600">
                                        Centang jika ingin menghapus semua jadwal lama kelas ini sebelum generate baru
                                    </p>
                                </div>
                            </div>

                            {/* Subject Requirements - Multi Select */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Mata Pelajaran & Jam/Minggu</Label>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={selectAllSubjects} className="text-slate-600 border-slate-200 hover:bg-slate-50">
                                            Pilih Semua
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={clearAllSubjects} className="text-red-500 border-red-200 hover:bg-red-50">
                                            Hapus Semua
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pr-1">
                                    {subjects.map((subj) => {
                                        const isSelected = autoGenRequirements[subj.id.toString()] !== undefined;
                                        const hours = autoGenRequirements[subj.id.toString()] || 2;
                                        return (
                                            <div key={subj.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:border-purple-200'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleAutoGenSubject(subj.id.toString())}
                                                    className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-900 truncate">{subj.name}</div>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={10}
                                                            value={hours}
                                                            onChange={(e) => updateAutoGenHours(subj.id.toString(), parseInt(e.target.value) || 1)}
                                                            className="w-12 h-7 text-xs text-center bg-white border-purple-200"
                                                        />
                                                        <span className="text-[10px] text-slate-400">JP</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {Object.keys(autoGenRequirements).length > 0 && (
                                    <div className="text-xs text-slate-500">
                                        {Object.keys(autoGenRequirements).length} mapel dipilih • Total {Object.values(autoGenRequirements).reduce((a, b) => a + b, 0)} JP/minggu
                                    </div>
                                )}
                            </div>

                            {/* Free Text Prompt for AI */}
                            <div className="space-y-2">
                                <Label>Prompt untuk AI (opsional)</Label>
                                <textarea
                                    value={autoGenPrompt}
                                    onChange={(e) => setAutoGenPrompt(e.target.value)}
                                    placeholder="Contoh: Matematika dan Bahasa Indonesia diutamakan pagi hari. Fisika harus pakai Lab Fisika. Jam istirahat di slot 5. Setiap guru maksimal 4 jam per hari."
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                />
                                <p className="text-[10px] text-slate-400">Tulis instruksi tambahan agar AI lebih akurat dalam membuat jadwal.</p>
                            </div>

                            {/* Info */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800 flex gap-2">
                                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold mb-1">Cara kerja AI Scheduler:</p>
                                    <ul className="space-y-0.5 list-disc list-inside">
                                        <li>Memetakan ketersediaan guru (tidak bentrok antar kelas)</li>
                                        <li>Mapel inti (Matematika, B. Indonesia) diprioritaskan di pagi hari</li>
                                        <li>Ruangan lab otomatis untuk mapel sains</li>
                                        <li>Distribusi beban mengajar merata sepanjang minggu</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                            <div className="p-6 pt-2 bg-slate-50 border-t border-slate-100">
                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                                    <Button variant="outline" onClick={() => setIsAutoGenerateOpen(false)}>Batal</Button>
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700 text-white min-w-[160px]"
                                        onClick={handleAutoGenerate}
                                        disabled={autoGenProcessing || !autoGenClassroomId || Object.keys(autoGenRequirements).length === 0}
                                    >
                                        {autoGenProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Menggenerate...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate Jadwal
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Import Excel Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-700">
                            <Upload className="w-5 h-5" />
                            Import Jadwal dari Excel
                        </DialogTitle>
                        <DialogDescription>
                            Unggah file Excel dengan format jadwal pelajaran. Sistem akan secara otomatis memperbarui Jam Pelajaran dan Jadwal Kelas berdasarkan isi file.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Format Info */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">📋 Format File yang Diperlukan:</p>
                                <a
                                    href={route('admin.jadwal.template')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1 hover:bg-emerald-100 transition-colors shrink-0"
                                >
                                    <Download className="w-3 h-3" />
                                    Unduh Contoh File
                                </a>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li><strong>Baris 14:</strong> Nama kelas di kolom D, G, J, ... (setiap 3 kolom)</li>
                                <li><strong>Baris 15:</strong> Header Mata Pelajaran | Ko Gu | Ruang</li>
                                <li><strong>Baris 16+:</strong> Data jadwal dengan format HARI di kolom A, JP.KE di kolom B, WAKTU di kolom C</li>
                                <li><strong>Ko Gu:</strong> Harus sesuai Kode Guru yang terdaftar di sistem</li>
                                <li><strong>Format waktu:</strong> contoh <code>07.15 - 07.55</code></li>
                            </ul>
                            <p className="text-xs text-amber-600 border-t border-amber-200 pt-2">
                                💡 Sheet <strong>"Kode Guru"</strong> dalam file contoh berisi daftar semua kode guru yang terdaftar di sistem.
                            </p>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="import-file">File Excel / CSV</Label>
                            <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                                <input
                                    id="import-file"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                                />
                                <label htmlFor="import-file" className="cursor-pointer">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                                    {importFile ? (
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{importFile.name}</p>
                                            <p className="text-xs text-slate-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Klik untuk pilih file</p>
                                            <p className="text-xs text-slate-400">Format: .xlsx, .xls, atau .csv (maks. 10 MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p><strong>Perhatian:</strong> Import akan menghapus dan mengganti jadwal untuk kelas-kelas yang ada dalam file. Jam Pelajaran juga akan diperbarui sesuai file. Pastikan file sudah benar sebelum mengimport.</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setIsImportOpen(false); setImportFile(null); }} disabled={importProcessing}>
                            Batal
                        </Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={!importFile || importProcessing}
                            onClick={() => {
                                if (!importFile) return;
                                setImportProcessing(true);
                                const formData = new FormData();
                                formData.append('file', importFile);
                                router.post(route('admin.jadwal.import'), formData, {
                                    forceFormData: true,
                                    onSuccess: () => {
                                        setIsImportOpen(false);
                                        setImportFile(null);
                                        toast.success('Import jadwal berhasil!');
                                    },
                                    onError: (errors) => {
                                        toast.error(Object.values(errors)[0] as string ?? 'Gagal mengimport file.');
                                    },
                                    onFinish: () => setImportProcessing(false),
                                });
                            }}
                        >
                            {importProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Mengimport...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import Sekarang
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
