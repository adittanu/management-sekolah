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
    LogOut 
} from 'lucide-react';

export default function Sidebar({ className = "" }: { className?: string }) {
    const { url } = usePage();

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User', href: '/admin/user', icon: Users },
        { name: 'Kelas', href: '/admin/kelas', icon: School },
        { name: 'Jadwal', href: '/admin/jadwal', icon: Calendar },
        { name: 'Mapel', href: '/admin/mapel', icon: BookOpen },
        { name: 'Laporan', href: '/admin/laporan', icon: FileText },
        { name: 'Daring (Online)', href: '/admin/daring', icon: Video },
    ];

    const bottomItems = [
        { name: 'Setting', href: '/admin/setting', icon: Settings },
        { name: 'Licensi', href: '/admin/licensi', icon: ShieldCheck },
    ];

    return (
        <div className={cn("pb-12 min-h-screen w-64 border-r bg-white shadow-sm flex flex-col", className)}>
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
                            AD
                        </div>
                        <div>
                            <div className="font-bold text-sm text-slate-900">Administrator</div>
                            <div className="text-xs text-slate-500">Admin</div>
                        </div>
                   </div>
                </div>

                <div className="px-3">
                    <div className="space-y-1">
                        {navItems.map((item) => (
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
                        <button
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
