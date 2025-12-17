import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Link } from '@inertiajs/react';
import { mockStats, mockReports, mockAttendanceData } from '@/data/mockData';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                        <p className="text-slate-500">Ringkasan aktivitas sekolah hari ini.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {mockStats.map((stat, index) => {
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
                                    <BarChart data={mockAttendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#64748b', fontSize: 12 }} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#64748b', fontSize: 12 }} 
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar 
                                            dataKey="present" 
                                            name="Hadir"
                                            fill="#3b82f6" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={32}
                                            activeBar={{ fill: '#2563eb' }}
                                        />
                                        <Bar 
                                            dataKey="absent" 
                                            name="Tidak Hadir"
                                            fill="#f1f5f9" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={32}
                                        />
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
                                {mockReports.map((report) => (
                                    <div key={report.id} className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-slate-200">
                                            {report.avatar ? (
                                                 <img src={report.avatar} alt={report.user} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">SYS</div>
                                            )}
                                        </div>
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium leading-none text-slate-900">
                                                {report.user}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {report.action}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {report.time}
                                            </p>
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
        </AdminLayout>
    );
}
