import AdminLayout from '@/Layouts/AdminLayout';
import { mockSchedule } from '@/data/mockData';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
// Add Users import
import { Search, Clock, MapPin, User, CalendarDays, Users } from 'lucide-react';
import { Card } from '@/Components/ui/card';

export default function JadwalIndex() {
    return (
        <AdminLayout title="Atur Jadwal KBM">
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <CalendarDays className="w-8 h-8 text-blue-600" />
                        <h2 className="text-2xl font-bold text-slate-900">Atur Jadwal KBM</h2>
                    </div>
                    <p className="text-slate-500">Kelola jadwal mengajar guru mingguan.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                     <div className="flex items-center gap-4 text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                        <CalendarDays className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Rabu, 17 Desember 2025</span>
                        <div className="h-4 w-px bg-slate-300 mx-2"></div>
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="font-mono font-bold text-slate-800">11:37:09</span>
                     </div>
                     
                     <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Cari Guru / Kelas..." className="pl-10" />
                     </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        <div className="w-24 p-4 flex items-center justify-center font-bold text-slate-400 bg-slate-50 border-r text-sm">JAM KE</div>
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                            <div key={day} className={`flex-1 p-4 text-center font-bold relative ${day === 'Rabu' ? 'text-blue-600' : 'text-slate-600'}`}>
                                {day}
                                {day === 'Rabu' && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5, 6].map((jam) => (
                            <div key={jam} className="flex min-h-[120px]">
                                <div className="w-24 bg-slate-50 p-4 border-r border-slate-100 flex flex-col items-center justify-center gap-1">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm text-sm">
                                        {jam}
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">07:00</span>
                                </div>
                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day, dayIndex) => {
                                    // Find schedule for this day and jam
                                    // @ts-ignore
                                    const scheduleItem = mockSchedule[day]?.find((s: any) => s.jam === jam);

                                    return (
                                        <div key={dayIndex} className="flex-1 p-2 border-r border-slate-100 last:border-0 relative group">
                                            {scheduleItem ? (
                                                <Card className="h-full bg-gradient-to-br from-purple-500 to-purple-600 border-none text-white p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer">
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-purple-100 text-xs font-medium mb-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                                                            <Users className="w-3 h-3" />
                                                            {scheduleItem.class}
                                                        </div>
                                                        <div className="font-bold text-sm">{scheduleItem.subject}</div>
                                                    </div>
                                                    <div className="flex items-end justify-between mt-2">
                                                        <div className="flex items-center gap-1 text-[10px] opacity-90">
                                                            <MapPin className="w-3 h-3" />
                                                            {scheduleItem.room}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ) : (
                                                <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors cursor-pointer">
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-blue-200 group-hover:text-blue-600 transition-colors">
                                                        +
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
        </AdminLayout>
    );
}
