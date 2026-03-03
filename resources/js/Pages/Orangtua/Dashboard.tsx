import ParentLayout from '@/Layouts/ParentLayout';
import { Head } from '@inertiajs/react';
import { Users, ScanFace, Building } from 'lucide-react';

interface ChildData {
    id: number;
    name: string;
    identity_number: string;
    class: string;
    attendance_today: string;
    avatar: string | null;
}

interface Stats {
    total_children: number;
    present_today: number;
    absent_today: number;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    published_at: string;
}

export default function Dashboard({ children, stats, announcements }: { children: ChildData[], stats: Stats, announcements: Announcement[] }) {
    return (
        <ParentLayout title="Dashboard Orangtua">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard Orangtua</h1>
                    <p className="text-slate-500">Pantau aktivitas dan kehadiran anak Anda di sekolah.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Anak Terdaftar</p>
                                <h3 className="text-3xl font-bold mt-1 text-blue-600">{stats.total_children}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Hadir Hari Ini</p>
                                <h3 className="text-3xl font-bold mt-1 text-green-600">{stats.present_today}</h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <ScanFace className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Tidak Hadir (Izin/Sakit/Alpha)</p>
                                <h3 className="text-3xl font-bold mt-1 text-red-600">{stats.absent_today}</h3>
                            </div>
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <Building className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Children List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold">Data Anak</h2>
                        {children.map(child => (
                            <div key={child.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row gap-4 items-center">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                                    {child.avatar ? (
                                        <img src={`/storage/${child.avatar}`} alt={child.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-400">{child.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-slate-900">{child.name}</h3>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1 text-sm text-slate-600">
                                        <span>NIS: {child.identity_number}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>Kelas: {child.class}</span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:mt-0 px-4 py-2 rounded-lg bg-slate-50 border text-center font-medium">
                                    <span className="text-xs text-slate-500 block mb-1">Status Hari Ini</span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${child.attendance_today === 'hadir' ? 'bg-green-100 text-green-700' : 
                                          child.attendance_today === 'alpha' ? 'bg-red-100 text-red-700' : 
                                          child.attendance_today === 'Belum Ada Data' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {child.attendance_today}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Announcements */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold">Pengumuman Terbaru</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y">
                            {announcements.length > 0 ? announcements.map(announcement => (
                                <div key={announcement.id} className="p-4">
                                    <div className="text-xs text-slate-500 mb-1">
                                        {new Date(announcement.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1">{announcement.title}</h3>
                                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">{announcement.content}</p>
                                </div>
                            )) : (
                                <div className="p-6 text-center text-slate-500 text-sm">
                                    Belum ada pengumuman
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ParentLayout>
    );
}
