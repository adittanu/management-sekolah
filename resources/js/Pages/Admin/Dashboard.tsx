import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import * as Icons from 'lucide-react';
import { LucideIcon, BookOpen, Clock, Calendar, AlertCircle, CheckCircle2, Trophy, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stat {
    title: string;
    value: string;
    icon: string;
    bg: string;
    color: string;
}

interface Report {
    id: number;
    user: string;
    action: string;
    time: string;
    avatar: string | null;
}

interface AttendanceDataPoint {
    day: string;
    present: number;
    absent: number;
}


interface Schedule {
    class: string;
    subject: string;
    time: string;
    room: string;
    count: string;
    status: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    created_at: string;
    posted_by?: {
        name: string;
    };
}

interface Props {
    role?: string;
    totalStudents?: number;
    totalTeachers?: number;
    totalClasses?: number;
    totalSubjects?: number;
    attendanceData?: AttendanceDataPoint[];
    reports?: Report[];
    todayStats?: {
        present: number;
        sick: number;
        permit: number;
        absent: number;
    };
    // Teacher specific props
    schedules?: Schedule[];
    userName?: string;
    classCount?: number;
    announcements?: Announcement[];
}

export default function Dashboard({ 
    role = 'admin', 
    totalStudents = 0,
    totalTeachers = 0,
    totalClasses = 0,
    totalSubjects = 0,
    attendanceData = [], 
    reports = [],
    schedules = [],
    userName = 'Guru',
    classCount = 0,
    announcements = [],
}: Props) {
    
    // Admin Dashboard Component
    const AdminDashboard = () => {
        // Map real props to the UI card format
        const stats: Stat[] = [
            {
                title: 'Total Siswa',
                value: totalStudents.toString(),
                icon: 'Users',
                bg: 'bg-blue-100',
                color: 'text-blue-600'
            },
            {
                title: 'Total Guru',
                value: totalTeachers.toString(),
                icon: 'GraduationCap',
                bg: 'bg-green-100',
                color: 'text-green-600'
            },
            {
                title: 'Total Kelas',
                value: totalClasses.toString(),
                icon: 'School',
                bg: 'bg-orange-100',
                color: 'text-orange-600'
            },
            {
                title: 'Mata Pelajaran',
                value: totalSubjects.toString(),
                icon: 'BookOpen',
                bg: 'bg-purple-100',
                color: 'text-purple-600'
            }
        ];

        return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Admin</h2>
                    <p className="text-slate-500">Ringkasan aktivitas sekolah hari ini.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[stat.icon];
                    return (
                        <Card key={index} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    {IconComponent && <IconComponent className="h-4 w-4" />}
                                </div>
                            </CardHeader>
                            <CardContent className="bg-white pt-4">
                                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    +2.5% dari bulan lalu
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart Area Placeholder */}
                <Card className="col-span-4 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Statistik Kehadiran</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 pt-4">
                         <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="present" name="Hadir" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} activeBar={{ fill: '#2563eb' }} />
                                    <Bar dataKey="absent" name="Tidak Hadir" fill="#f1f5f9" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                    </CardContent>
                </Card>

                {/* Recent Reports / Feed */}
                <Card className="col-span-3 border-none shadow-sm bg-blue-50/50">
                    <CardHeader>
                        <CardTitle>Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {reports.map((report) => (
                                <div key={report.id} className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-slate-200">
                                        {report.avatar ? (
                                             <img src={report.avatar} alt={report.user} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">SYS</div>
                                        )}
                                    </div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none text-slate-900">{report.user}</p>
                                        <p className="text-sm text-slate-500">{report.action}</p>
                                        <p className="text-xs text-slate-400">{report.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/admin/laporan" className="w-full mt-6 text-sm text-blue-600 font-medium hover:underline block text-center">
                            Lihat Semua Notifikasi
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Akses Cepat</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Tambah User', icon: Icons.UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/user' },
                        { label: 'Atur Kelas', icon: Icons.School, color: 'text-orange-600', bg: 'bg-orange-50', href: '/admin/kelas' },
                        { label: 'Atur Jadwal', icon: Icons.CalendarRange, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/jadwal' },
                        { label: 'Cek Laporan', icon: Icons.FileBarChart, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/laporan' },
                    ].map((action, i) => (
                        <Link 
                            key={i} 
                            href={action.href}
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            <span className="font-medium text-slate-700">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
        );
    };

    // Student Dashboard Component
    const StudentDashboard = () => (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Icons.GraduationCap className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-blue-100">
                        <Icons.Sun className="w-4 h-4" />
                        <span className="text-sm font-medium">Selamat Pagi, Semangat Belajar!</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Halo, Siswa Teladan! 👋</h2>
                    <p className="text-blue-100 max-w-xl">
                        Kamu memiliki <span className="font-bold text-white">2 Tugas</span> yang harus dikumpulkan hari ini dan <span className="font-bold text-white">1 Ujian</span> minggu depan.
                    </p>
                </div>
                <div className="relative z-10 flex gap-3">
                     <Button className="bg-white text-blue-600 hover:bg-blue-50 border-none">
                        <Icons.Calendar className="w-4 h-4 mr-2" /> Lihat Jadwal
                     </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                 {/* Today's Schedule using Mock Data */}
                 <Card className="col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                             <Icons.Clock className="w-5 h-5 text-blue-600" />
                             Jadwal Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                             {[
                                 { time: '07:30 - 09:00', mapel: 'Matematika Wajib', code: 'X-IPA-1', status: 'Selesai', color: 'bg-green-100 text-green-700' },
                                 { time: '09:00 - 10:30', mapel: 'Fisika Dasar', code: 'Lab Fisika', status: 'Sedang Berlangsung', color: 'bg-blue-100 text-blue-700', active: true },
                                 { time: '10:45 - 12:15', mapel: 'Bahasa Indonesia', code: 'R-202', status: 'Akan Datang', color: 'bg-slate-100 text-slate-700' },
                             ].map((item, idx) => (
                                 <div key={idx} className={`flex items-center p-4 rounded-xl border ${item.active ? 'border-blue-200 bg-blue-50/50' : 'border-slate-100'}`}>
                                     <div className="min-w-[100px] text-sm font-medium text-slate-500">{item.time}</div>
                                     <div className="flex-1">
                                         <h4 className="font-bold text-slate-800">{item.mapel}</h4>
                                         <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                             <Icons.MapPin className="w-3 h-3" /> {item.code}
                                         </p>
                                     </div>
                                     <Badge className={`${item.color} border-none`}>{item.status}</Badge>
                                 </div>
                             ))}
                        </div>
                    </CardContent>
                 </Card>

                 {/* Assignments / Tasks */}
                 <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-orange-50/50">
                        <CardHeader>
                            <CardTitle className="text-base text-orange-800">Tugas Mendesak</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                     <Badge className="bg-orange-100 text-orange-700 border-none shadow-none text-[10px]">TUGAS</Badge>
                                     <span className="text-xs font-bold text-orange-600">Hari Ini!</span>
                                </div>
                                <h5 className="font-bold text-sm text-slate-800 mb-1">Latihan Soal Aljabar</h5>
                                <p className="text-xs text-slate-500">Matematika Wajib • Bu Rina</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                     <Badge className="bg-purple-100 text-purple-700 border-none shadow-none text-[10px]">KUIS</Badge>
                                     <span className="text-xs font-bold text-slate-400">Besok</span>
                                </div>
                                <h5 className="font-bold text-sm text-slate-800 mb-1">Quiz Hukum Newton</h5>
                                <p className="text-xs text-slate-500">Fisika • Pak Budi</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Kehadiran Saya</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="text-center py-4">
                                <div className="text-4xl font-bold text-green-600 mb-1">98%</div>
                                <p className="text-xs text-slate-500">Total Kehadiran Semester Ini</p>
                                <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-green-500 w-[98%]"></div>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );

    // Teacher Dashboard Component
    const TeacherDashboard = () => (
        <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="md:col-span-3 bg-white border-none shadow-sm overflow-hidden relative">
                    <div className="flex flex-col md:flex-row p-6 md:p-8 relative z-10">
                        <div className="flex-1">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                                <Icons.Coffee className="w-3 h-3" /> RUANG GURU
                             </div>
                             <h2 className="text-2xl font-bold text-slate-900 mb-2">Selamat Pagi, {userName}! 👨‍🏫</h2>
                             <p className="text-slate-500 mb-6 max-w-lg">
                                 Anda memiliki <span className="font-bold text-slate-900">{classCount} Kelas</span> hari ini. Jangan lupa untuk mengisi jurnal mengajar setelah kelas selesai.
                             </p>
                             <div className="flex gap-3">
                                 <Link href={route('guru.absensi')}>
                                     <Button className="bg-blue-600 hover:bg-blue-700">
                                         <Icons.ClipboardList className="w-4 h-4 mr-2" /> Absensi
                                     </Button>
                                 </Link>
                                 <Link href={route('guru.jadwal')}>
                                     <Button variant="outline">
                                         <Icons.Calendar className="w-4 h-4 mr-2" /> Lihat Jadwal
                                     </Button>
                                 </Link>
                             </div>
                        </div>
                        <div className="hidden md:flex items-center justify-end w-1/3">
                            {/* Illustration Placeholder */}
                             <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center relative">
                                  <div className="text-6xl">📊</div>
                                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-sm">
                                      <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                                          <TrendingUp className="w-3 h-3" /> +12%
                                      </div>
                                  </div>
                             </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-slate-900 text-white border-none shadow-sm flex flex-col justify-between">
                    <CardHeader>
                         <CardTitle className="text-slate-200 text-sm">Total Siswa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-1">{totalStudents}</div>
                        <p className="text-xs text-slate-400">Total siswa aktif di sekolah</p>
                    </CardContent>
                    <div className="p-4 bg-white/5 mt-auto">
                        <Link href="#" className="flex items-center justify-between text-xs font-medium text-blue-300 hover:text-white transition-colors">
                            <span>Lihat Detail</span>
                            <Icons.ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                 {/* Teaching Schedule */}
                 <div className="space-y-4">
                     <div className="flex items-center justify-between">
                         <h3 className="font-bold text-slate-900 flex items-center gap-2">
                             <Icons.Clock className="w-5 h-5 text-slate-400" /> Jadwal Mengajar Hari Ini
                         </h3>
                     </div>
                     <div className="space-y-3">
                         {schedules.length > 0 ? (
                            schedules.map((schedule, i) => (
                             <Card key={i} className="border-slate-200 hover:border-blue-400 transition-colors cursor-pointer group">
                                 <CardContent className="p-4 flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                                         {schedule.class.split('-')[0] || schedule.class.substring(0, 2)}
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex justify-between mb-1">
                                             <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{schedule.subject}</h4>
                                             <span className="text-xs font-semibold text-slate-500">{schedule.time}</span>
                                         </div>
                                         <div className="flex items-center gap-3 text-xs text-slate-500">
                                              <span className="flex items-center gap-1"><Icons.MapPin className="w-3 h-3" /> {schedule.room}</span>
                                              <span className="flex items-center gap-1"><Icons.Users className="w-3 h-3" /> {schedule.count}</span>
                                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                schedule.status === 'Sedang Berlangsung' ? 'bg-blue-100 text-blue-700' :
                                                schedule.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-500'
                                              }`}>{schedule.status}</span>
                                         </div>
                                     </div>
                                 </CardContent>
                             </Card>
                            ))
                         ) : (
                             <Card className="border-slate-200 border-dashed">
                                 <CardContent className="p-8 text-center text-slate-500">
                                     <Icons.CalendarX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                     <p>Tidak ada jadwal mengajar hari ini.</p>
                                 </CardContent>
                             </Card>
                         )}
                     </div>
                 </div>

                 {/* Notifications / Admin Info */}
                 <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="font-bold text-slate-900 flex items-center gap-2">
                             <Icons.Bell className="w-5 h-5 text-slate-400" /> Pengumuman Sekolah
                         </h3>
                     </div>
                     {announcements.length > 0 ? (
                        <div className="space-y-3">
                            {announcements.map((announcement) => (
                                <Card key={announcement.id} className="border-none bg-yellow-50/50">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-slate-900">{announcement.title}</h5>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{announcement.content}</p>
                                                <div className="mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                                    {`Diposting oleh ${announcement.posted_by?.name ?? 'Admin'} • ${new Date(announcement.created_at).toLocaleString('id-ID')}`}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                     ) : (
                        <Card className="border-none bg-yellow-50/50">
                            <CardContent className="p-4 space-y-4">
                                <p className="text-xs text-slate-600">Belum ada pengumuman sekolah.</p>
                            </CardContent>
                        </Card>
                     )}
                  </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Dashboard">
            {role === 'student' ? <StudentDashboard /> : role === 'teacher' ? <TeacherDashboard /> : <AdminDashboard />}
        </AdminLayout>
    );
}
