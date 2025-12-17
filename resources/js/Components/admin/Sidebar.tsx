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
    MessageSquare,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Sidebar({ className = "", userRole = "admin", isCollapsed = false, toggleSidebar }: { className?: string, userRole?: string, isCollapsed?: boolean, toggleSidebar?: () => void }) {
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
        { name: 'Lisensi & Produk', href: '/admin/lisensi', icon: ShieldCheck },
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
        <div className={cn(
            "pb-0 h-full border-r bg-white shadow-sm flex flex-col transition-all duration-300", 
            isCollapsed ? "w-20" : "w-64",
            className
        )}>
            {/* Header - Fixed */}
            <div className={cn(
                "border-b border-slate-50 shrink-0 flex items-center gap-3 transition-all",
                isCollapsed ? "px-4 py-6 justify-center" : "px-6 py-6"
            )}>
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
                    <School className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="font-bold text-xl text-slate-800 leading-none tracking-tight">SEKOLAH KITA</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Bisa Berkarya</div>
                    </div>
                )}
            </div>

            {/* Profile - Fixed */}
            <div className={cn("shrink-0", isCollapsed ? "p-2" : "px-4 py-4")}>
                <div className={cn(
                    "bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100 transition-all",
                    isCollapsed ? "p-2 justify-center bg-transparent border-none" : "p-3"
                )}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm shrink-0">
                        {profile.initials}
                    </div>
                    {!isCollapsed && (
                         <div className="overflow-hidden animate-in fade-in duration-300">
                            <div className="font-bold text-sm text-slate-900 truncate">{profile.name}</div>
                            <div className="text-xs text-slate-500 truncate">{profile.role}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2 hover-scroll">
                {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-1">
                        {group.groupLabel && !isCollapsed && (
                            <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4 animate-in fade-in duration-300">
                                {group.groupLabel}
                            </h4>
                        )}
                        {group.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.name : ''}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 group relative",
                                    isCollapsed ? "justify-center px-0" : "px-3",
                                    url.startsWith(item.href) 
                                        ? "bg-blue-50 text-blue-600 shadow-sm" 
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4 transition-colors shrink-0", url.startsWith(item.href) ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                {!isCollapsed && <span className="animate-in fade-in duration-300">{item.name}</span>}
                                {url.startsWith(item.href) && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                                )}
                            </Link>
                        ))}
                    </div>
                ))}
            </div>

            {/* Collapse Toggle */}
             <div className="p-2 flex justify-center border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={toggleSidebar} className="w-full text-slate-400 hover:text-slate-600">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> <span className="text-xs">Collapse Sidebar</span></div>}
                </Button>
            </div>


            {/* Footer - Fixed */}
            <div className={cn("border-t border-slate-100 shrink-0 bg-white z-10", isCollapsed ? "p-2" : "p-3")}>
                <div className="space-y-1">
                    {bottomItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : ''}
                             className={cn(
                                "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all hover:text-blue-600",
                                isCollapsed ? "justify-center px-0" : "px-3",
                                url.startsWith(item.href) 
                                    ? "bg-blue-50 text-blue-600 shadow-sm" 
                                    : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="animate-in fade-in duration-300">{item.name}</span>}
                        </Link>
                    ))}
                    <Link
                        href="/"
                        title={isCollapsed ? "Keluar" : ''}
                        className={cn(
                            "w-full flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all",
                             isCollapsed ? "justify-center px-0" : "px-3"
                        )}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="animate-in fade-in duration-300">Keluar</span>}
                    </Link>
                </div>
            </div>
        </div>
    );
}
