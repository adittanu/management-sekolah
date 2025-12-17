import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, 
    Users, 
    School, 
    Calendar, 
    BookOpen, 
    FileText, 
    Settings, 
    ShieldCheck,
    Video,
    Wallet,
    ScanFace,
    UserPlus,
    GraduationCap,
    LogOut, 
    MessageSquare
} from 'lucide-react';

export default function Sidebar({ className = "", userRole = "admin" }: { className?: string, userRole?: string }) {
    const { url } = usePage();

    // Define Menus based on Role
    let navGroups = [];

    if (userRole === 'student') {
        navGroups = [
            {
                groupLabel: "Menu Utama",
                items: [
                    { name: 'Dashboard', href: '/siswa/dashboard', icon: LayoutDashboard },
                    { name: 'Jadwal Pelajaran', href: '/siswa/jadwal', icon: Calendar },
                    { name: 'Pesan', href: '/admin/chat', icon: MessageSquare },
                ]
            },
            {
                groupLabel: "Akademik",
                items: [
                   
                    { name: 'Kelas Saya (LMS)', href: '/siswa/lms', icon: GraduationCap },
                    { name: 'Tugas & Materi', href: '/siswa/tugas', icon: BookOpen },
                    { name: 'Riwayat Presensi', href: '/siswa/absensi', icon: ScanFace },
                ]
            },
            {
                groupLabel: "Laporan",
                items: [
                    { name: 'Kartu Hasil Studi', href: '/siswa/khs', icon: FileText },
                    { name: 'Tagihan SPP', href: '/siswa/keuangan', icon: Wallet },
                ]
            }
        ];
    } else if (userRole === 'teacher') {
        navGroups = [
            {
                groupLabel: "Menu Utama",
                items: [
                    { name: 'Dashboard Guru', href: '/guru/dashboard', icon: LayoutDashboard },
                    { name: 'Jadwal Mengajar', href: '/guru/jadwal', icon: Calendar },
                    { name: 'Pesan', href: '/admin/chat', icon: MessageSquare },
                ]
            },
            {
                groupLabel: "Manajemen Kelas",
                items: [
                    { name: 'Input Nilai', href: '/guru/nilai', icon: FileText },
                    { name: 'Input Presensi', href: '/guru/absensi', icon: ScanFace },
                    { name: 'E-Learning (LMS)', href: '/guru/lms', icon: GraduationCap },
                ]
            },
            {
                groupLabel: "Kepegawaian",
                items: [
                    { name: 'Data Pribadi', href: '/guru/profile', icon: Users },
                    { name: 'Slip Gaji', href: '/guru/gaji', icon: Wallet },
                ]
            }
        ];
    } else {
        // DEFAULT ADMIN
        navGroups = [
            {
                groupLabel: "", // Main
                items: [
                    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                ]
            },
            {
                groupLabel: "Master Data",
                items: [
                    { name: 'Manajemen User', href: '/admin/user', icon: Users },
                    { name: 'Data Kelas', href: '/admin/kelas', icon: School },
                    { name: 'Mata Pelajaran', href: '/admin/mapel', icon: BookOpen },
                    { name: 'Pesan', href: '/admin/chat', icon: MessageSquare },
                ]
            },
            {
                groupLabel: "Akademik",
                items: [
                    { name: 'Jadwal Pelajaran', href: '/admin/jadwal', icon: Calendar },
                    { name: 'E-Learning (LMS)', href: '/admin/lms', icon: GraduationCap },
                    { name: 'Presensi Siswa', href: '/admin/absensi', icon: ScanFace },
                    { name: 'Perpustakaan', href: '/admin/perpustakaan', icon: BookOpen },
                    { name: 'Kelas Online (Daring)', href: '/admin/daring', icon: Video },
                ]
            },
            {
                groupLabel: "Administrasi",
                items: [
                    { name: 'PPDB Online', href: '/admin/ppdb', icon: UserPlus },
                    { name: 'Keuangan & SPP', href: '/admin/keuangan', icon: Wallet },
                    { name: 'Laporan Sekolah', href: '/admin/laporan', icon: FileText },
                ]
            }
        ];
    }

    const bottomItems = [
        { name: 'Pengaturan', href: '/admin/setting', icon: Settings },
    ];

    // Determine Profile Label
    const getProfile = () => {
        if (userRole === 'student') return { name: 'Siswa Teladan', role: 'Murid Kelas X', initials: 'ST' };
        if (userRole === 'teacher') return { name: 'Budi Santoso, S.Pd', role: 'Guru Matematika', initials: 'BS' };
        return { name: 'Administrator', role: 'Super Admin', initials: 'AD' };
    };
    const profile = getProfile();

    return (
        <div className={cn("pb-12 min-h-screen w-64 border-r bg-white shadow-sm flex flex-col scrollbar-hide overflow-y-auto", className)}>
            <div className="space-y-4 py-4">
                <div className="px-6 py-2">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <School className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="leading-none">SEKOLAH KITA</div>
                            <div className="text-xs font-normal text-slate-500 mt-1">Bisa Berkarya</div>
                        </div>
                    </div>
                </div>
                
                <div className="px-4 py-2">
                   <div className="bg-slate-100 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {profile.initials}
                        </div>
                        <div>
                            <div className="font-bold text-sm text-slate-900">{profile.name}</div>
                            <div className="text-xs text-slate-500">{profile.role}</div>
                        </div>
                   </div>
                </div>

                <div className="px-3">
                    <div className="space-y-6">
                        {navGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="space-y-1">
                                {group.groupLabel && (
                                    <h4 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
                                        {group.groupLabel}
                                    </h4>
                                )}
                                {group.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-blue-600",
                                            url.startsWith(item.href) 
                                                ? "bg-blue-50 text-blue-600 shadow-sm font-semibold" 
                                                : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4", url.startsWith(item.href) ? "text-blue-600" : "text-slate-400")} />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto px-3 pt-4 border-t">
                    <div className="space-y-1">
                        {bottomItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-blue-600",
                                    url.startsWith(item.href) 
                                        ? "bg-blue-50 text-blue-600 shadow-sm" 
                                        : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/"
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            Keluar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
