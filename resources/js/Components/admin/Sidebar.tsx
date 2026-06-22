import { useEffect, useRef } from 'react';
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
    ChevronRight,
    ExternalLink,
    MapPin,
    Wrench,
    Trophy,
    Briefcase,
    Clock,
    Bell,
    FileEdit,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useTour } from '@/Components/Tour/TourContext';

export default function Sidebar({ className = "", userRole = "admin", isCollapsed = false, toggleSidebar }: { className?: string, userRole?: string, isCollapsed?: boolean, toggleSidebar?: () => void }) {
    const page = usePage<any>();
    const { url, props } = page;
    const authUser = page.props?.auth?.user;
    const { school_settings } = props as any;

    const activeRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
    }, [url]);

    // Define Menus based on Role
    type NavItem = {
        name: string;
        href: string;
        icon: React.ElementType;
        external?: boolean;
    };

    type NavGroup = {
        groupLabel: string;
        items: NavItem[];
    };

    let navGroups: NavGroup[] = [];

    if (userRole === 'student') {
        navGroups = [
            {
                groupLabel: "Menu Utama",
                items: [
                    { name: 'Dashboard', href: '/siswa/dashboard', icon: LayoutDashboard },
                ]
            },
            {
                groupLabel: "Akademik",
                items: [
                    { name: 'Raport Saya', href: '/siswa/rapor', icon: GraduationCap },
                    { name: 'Perpustakaan', href: '/siswa/perpustakaan', icon: BookOpen },
                ]
            }
        ];
    } else if (userRole === 'teacher') {
        navGroups = [
            {
                groupLabel: "Menu Utama",
                items: [
                    { name: 'Dashboard Guru', href: '/guru/dashboard', icon: LayoutDashboard },
                ]
            },
            {
                groupLabel: "Manajemen Kelas",
                items: [
                    { name: 'Kelas Perwalian', href: '/guru/kelas', icon: School },
                    { name: 'Jadwal Mengajar', href: '/guru/jadwal', icon: Calendar },
                    { name: 'Presensi', href: '/guru/absensi', icon: ScanFace },
                    { name: 'Input Nilai', href: '/guru/rapor/input', icon: FileText },
                    ...(authUser?.is_walikelas ? [{ name: 'Raport', href: '/guru/rapor/view', icon: GraduationCap }] : []),
                    { name: 'Perpustakaan', href: '/guru/perpustakaan', icon: BookOpen },
                ]
            },
            {
                groupLabel: "Kepegawaian",
                items: [
                    { name: 'Data Pribadi', href: '/guru/profile', icon: Users },
                ]
            }
        ];
    } else if (userRole === 'parent') {
        navGroups = [
            {
                groupLabel: "Menu Utama",
                items: [
                    { name: 'Dashboard', href: '/orangtua/dashboard', icon: LayoutDashboard },
                    { name: 'Berita & Pengumuman', href: '/orangtua/pengumuman', icon: Bell },
                ]
            },
            {
                groupLabel: "Monitoring Anak",
                items: [
                    { name: 'Kehadiran Harian', href: '/orangtua/kehadiran', icon: ScanFace },
                    { name: 'Raport Anak', href: '/orangtua/rapor', icon: GraduationCap },
                    { name: 'Peminjaman Buku', href: '/orangtua/perpustakaan', icon: BookOpen },
                    { name: 'Keuangan Anak', href: '/orangtua/keuangan', icon: Wallet },
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
                    { name: 'Data Rombel', href: '/admin/kelas', icon: School },
                    { name: 'Mata Pelajaran', href: '/admin/mapel', icon: BookOpen },
                    { name: 'Ruangan', href: '/admin/ruangan', icon: MapPin },
                    { name: 'Pengumuman', href: '/admin/pengumuman', icon: Bell },
                    { name: 'Generator Surat', href: '/admin/generator-surat', icon: FileEdit },
                    { name: 'Jam Pelajaran', href: '/admin/time-slot', icon: Clock },
                    // { name: 'Pesan', href: '/admin/chat', icon: MessageSquare },
                ]
            },
            {
                groupLabel: "Akademik",
                items: [
                    { name: 'Jadwal Pelajaran', href: '/admin/jadwal', icon: Calendar },
                    // { name: 'E-Learning (LMS)', href: '/admin/lms', icon: GraduationCap },
                    { name: 'Presensi', href: '/admin/absensi', icon: ScanFace },
                    { name: 'Input Nilai', href: '/admin/rapor/input', icon: FileText },
                    { name: 'Raport', href: '/admin/rapor/view', icon: GraduationCap },
                    { name: 'Perpustakaan', href: '/admin/perpustakaan', icon: BookOpen },
                    // { name: 'Kelas Online (Daring)', href: '/admin/daring', icon: Video },
                    // { name: 'Ekstrakulikuler', href: '/admin/ekskul', icon: Trophy },
                    // { name: 'PKL / Magang', href: '/admin/pkl', icon: Briefcase },
                ]
            },
            {
                groupLabel: "Administrasi",
                items: [
                    { name: 'Keuangan & SPP', href: '/admin/keuangan', icon: Wallet },
                ]
            },
            // {
            //     groupLabel: "Aplikasi Terintegrasi (SSO)",
            //     items: [
            //         { name: 'Office (Embedded)', href: '/admin/office-frame', icon: ExternalLink, external: false },
            //         { name: 'Masuk ke Office', href: 'https://smkn12bandung.edukati.com/', icon: ExternalLink, external: true },
            //         { name: 'Masuk ke Sekolah', href: 'https://smkn12bandung.sch.id/', icon: School, external: true },
            //     ]
            // }
        ];
    }

    // Add Bottom Items to Nav Groups (Settings Section)
    if (userRole === 'admin') {
        navGroups.push({
            groupLabel: "Pengaturan",
            items: [
                // // { name: 'Lisensi & Produk', href: '/admin/lisensi', icon: ShieldCheck },
                { name: 'Pengaturan', href: '/admin/setting', icon: Settings },
            ]
        });
    }

    // Determine Profile Label
    const getProfile = () => {
        if (userRole === 'student') {
            return { name: authUser?.name || 'Siswa Teladan', role: 'Murid Kelas X', initials: authUser?.name ? authUser.name.substring(0, 2).toUpperCase() : 'ST' };
        }
        if (userRole === 'teacher') {
            return { name: authUser?.name || 'Budi Santoso, S.Pd', role: 'Guru Matematika', initials: authUser?.name ? authUser.name.substring(0, 2).toUpperCase() : 'BS' };
        }
        if (userRole === 'parent') {
            return { name: authUser?.name || 'Orang Tua', role: 'Wali Murid', initials: authUser?.name ? authUser.name.substring(0, 2).toUpperCase() : 'OT' };
        }
        return { name: authUser?.name || 'Administrator', role: 'Super Admin', initials: authUser?.name ? authUser.name.substring(0, 2).toUpperCase() : 'AD' };
    };
    const profile = getProfile();
    const { startTour } = useTour();

    return (
        <div
            data-tour="sidebar"
            className={cn(
                "pb-0 h-full border-r bg-white shadow-sm flex flex-col transition-all duration-300 relative",
                isCollapsed ? "w-20" : "w-64",
                className
            )}
        >
            {/* Header - Fixed */}
            <div className={cn(
                "border-b border-slate-50 shrink-0 flex items-center transition-all relative",
                isCollapsed ? "px-2 py-4 justify-center flex-col gap-4 text-center" : "px-5 py-4 justify-between"
            )}>
                 {/* Logo Area */}
                <div className={cn("flex items-center gap-3 font-bold text-lg text-slate-800 transition-all", isCollapsed ? "flex-col justify-center" : "")}>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0 overflow-hidden">
                        {school_settings?.logo ? (
                            <img src={`/storage/${school_settings.logo}`} className="w-full h-full object-cover" alt="Logo" />
                        ) : (
                            <School className="w-4 h-4" />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <div className="leading-none tracking-tight uppercase truncate max-w-[140px]" title={school_settings?.app_name || 'Sekolah Kita'}>
                                {school_settings?.app_name || 'SEKOLAH KITA'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Toggle Button (Integrated in Header) */}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className={cn(
                        "rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors",
                         isCollapsed ? "absolute -right-3 top-6 bg-white border border-slate-200 shadow-sm rounded-full w-6 h-6 flex items-center justify-center p-0 z-50" : ""
                    )}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Profile - Fixed */}
            <div className={cn("shrink-0", isCollapsed ? "p-2" : "px-3 py-3")}>
                <div className={cn(
                    "bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100 transition-all",
                    isCollapsed ? "p-2 justify-center bg-transparent border-none" : "p-2.5"
                )}>
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm shrink-0">
                        {profile.initials}
                    </div>
                    {!isCollapsed && (
                         <div className="overflow-hidden animate-in fade-in duration-300">
                            <div className="font-bold text-sm text-slate-900 truncate">{profile.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{profile.role}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2 hover-scroll">
                {navGroups.map((group) => (
                    <div key={`${group.groupLabel}-${group.items[0]?.href ?? 'group'}`} className="space-y-1">
                        {group.groupLabel && !isCollapsed && (
                            <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4 animate-in fade-in duration-300">
                                {group.groupLabel}
                            </h4>
                        )}
                        {group.items.map((item) => {
                            // Map nav items to tour targets for all roles
                            const tourTargetMap: Record<string, string> = {
                                // Admin
                                '/admin/dashboard': 'nav-dashboard',
                                '/admin/user': 'nav-users',
                                '/admin/kelas': 'nav-kelas',
                                '/admin/mapel': 'nav-mapel',
                                '/admin/ruangan': 'nav-ruangan',
                                '/admin/pengumuman': 'nav-pengumuman',
                                '/admin/generator-surat': 'nav-generator-surat',
                                '/admin/time-slot': 'nav-time-slot',
                                '/admin/jadwal': 'nav-jadwal',
                                '/admin/absensi': 'nav-absensi',
                                '/admin/perpustakaan': 'nav-perpustakaan',
                                '/admin/keuangan': 'nav-keuangan',
                                '/admin/rapor/input': 'nav-rapor-input',
                                '/admin/rapor/view': 'nav-rapor-view',
                                '/admin/setting': 'nav-setting',
                                // Teacher
                                '/guru/dashboard': 'nav-dashboard',
                                '/guru/kelas': 'nav-kelas',
                                '/guru/jadwal': 'nav-jadwal',
                                '/guru/absensi': 'nav-absensi',
                                '/guru/perpustakaan': 'nav-perpustakaan',
                                '/guru/rapor/input': 'nav-rapor-input',
                                '/guru/rapor/view': 'nav-rapor-view',
                                '/guru/profile': 'nav-profile',
                                // Student
                                '/siswa/dashboard': 'nav-dashboard',
                                '/siswa/rapor': 'nav-rapor',
                                '/siswa/perpustakaan': 'nav-perpustakaan',
                                // Parent
                                '/orangtua/dashboard': 'nav-dashboard',
                                '/orangtua/pengumuman': 'nav-pengumuman',
                                '/orangtua/kehadiran': 'nav-kehadiran',
                                '/orangtua/rapor': 'nav-rapor',
                                '/orangtua/perpustakaan': 'nav-perpustakaan',
                                '/orangtua/keuangan': 'nav-keuangan',
                            };
                            const tourKey = tourTargetMap[item.href];
                            const pathname = url.split('?')[0];
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return item.external ? (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    data-tour={tourKey}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={isCollapsed ? item.name : ''}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 group relative",
                                        isCollapsed ? "justify-center px-0" : "px-3",
                                        "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4 transition-colors shrink-0", "text-slate-400 group-hover:text-slate-600")} />
                                    {!isCollapsed && <span className="animate-in fade-in duration-300">{item.name}</span>}
                                </a>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    ref={isActive ? activeRef : undefined}
                                    data-tour={tourKey}
                                    title={isCollapsed ? item.name : ''}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 group relative",
                                        isCollapsed ? "justify-center px-0" : "px-3",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 shadow-sm"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4 transition-colors shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                    {!isCollapsed && <span className="animate-in fade-in duration-300">{item.name}</span>}
                                    {item.href === '/orangtua/keuangan' && authUser?.unpaid_billings_count > 0 && (
                                        <span className={cn(
                                            "flex items-center justify-center rounded-full font-bold",
                                            isCollapsed 
                                                ? "absolute top-1 right-2 w-4 h-4 bg-red-500 text-white text-[9px] shadow-sm animate-pulse" 
                                                : "ml-auto h-5 w-5 bg-red-100 text-red-600 text-[10px]"
                                        )}>
                                            {authUser.unpaid_billings_count}
                                        </span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Footer - Fixed */}
            <div className={cn("border-t border-slate-100 shrink-0 bg-white z-10", isCollapsed ? "p-2" : "p-3")}>
                <div className="space-y-1">
                    <button
                        type="button"
                        onClick={startTour}
                        title={isCollapsed ? "Lihat Tour" : ''}
                        className={cn(
                            "w-full flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all",
                             isCollapsed ? "justify-center px-0" : "px-3"
                        )}
                    >
                        <HelpCircle className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="animate-in fade-in duration-300">Lihat Tour</span>}
                    </button>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
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
