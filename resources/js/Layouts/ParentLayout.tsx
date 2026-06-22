import { PropsWithChildren, useState } from 'react';
import Sidebar from '@/Components/admin/Sidebar';
import TourProvider from '@/Components/Tour/TourProvider';
import { Head, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Menu, X, HelpCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useTour } from '@/Components/Tour/TourContext';
import NotificationBell from '@/Components/admin/NotificationBell';

export default function ParentLayout({ children, title, fullWidth = false }: PropsWithChildren<{ title?: string, fullWidth?: boolean }>) {
    return (
        <TourProvider role="parent">
            <ParentLayoutContent title={title} fullWidth={fullWidth}>
                {children}
            </ParentLayoutContent>
        </TourProvider>
    );
}

function ParentLayoutContent({ children, title, fullWidth = false }: PropsWithChildren<{ title?: string, fullWidth?: boolean }>) {
    const role = 'parent';

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved === 'true';
        }
        return false;
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    const { startTour } = useTour();

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <Head title={title} />

            <div className="hidden md:block fixed inset-y-0 z-50">
                <Sidebar
                    userRole={role}
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                />
            </div>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left duration-300">
                        <div className="absolute right-2 top-2 z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="h-8 w-8 rounded-full"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Sidebar
                            userRole={role}
                            isCollapsed={false}
                            toggleSidebar={() => setIsMobileMenuOpen(false)}
                            className="w-full border-none shadow-none h-full"
                        />
                    </div>
                </div>
            )}

            <main className={cn(
                "flex-1 min-h-screen flex flex-col relative transition-all duration-300",
                isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                 <header className="bg-white border-b border-slate-200/60 px-4 md:px-8 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden -ml-2 text-slate-500 hover:bg-slate-100"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold text-slate-800 md:text-base leading-none">
                                {title || "Portal Orang Tua"}
                            </h1>
                            <span className="text-[10px] text-slate-400 font-medium hidden md:inline mt-1">
                                Monitoring Perkembangan & Keuangan Anak
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={startTour}
                            title="Lihat Tour"
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full w-10 h-10 border border-slate-100 shadow-sm bg-white"
                        >
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                <div className={cn("flex-1 overflow-y-auto w-full mx-auto", fullWidth ? "p-0" : "p-4 md:p-8 max-w-7xl")}>
                    {children}
                </div>
            </main>
        </div>
    );
}
