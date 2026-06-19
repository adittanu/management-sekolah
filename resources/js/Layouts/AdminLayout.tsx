import { PropsWithChildren, useState, useEffect } from 'react';
import Sidebar from '@/Components/admin/Sidebar';
import ChatWidget from '@/Components/ChatWidget';
import TourProvider from '@/Components/Tour/TourProvider';
import { Head, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Menu, X, HelpCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useTour } from '@/Components/Tour/TourContext';

export default function AdminLayout({ children, title, disableChatWidget = false, fullWidth = false }: PropsWithChildren<{ title?: string, disableChatWidget?: boolean, fullWidth?: boolean }>) {
    const { props } = usePage<any>();
    const role = props.role || props.auth?.user?.role || 'admin';
    return (
        <TourProvider role={role as string}>
            <AdminLayoutContent title={title} fullWidth={fullWidth} disableChatWidget={disableChatWidget}>
                {children}
            </AdminLayoutContent>
        </TourProvider>
    );
}

function AdminLayoutContent({ children, title, disableChatWidget = false, fullWidth = false }: PropsWithChildren<{ title?: string, disableChatWidget?: boolean, fullWidth?: boolean }>) {
    // Get role from Inertia props, passed from web.php
    const { props } = usePage<any>();
    const role = props.role || props.auth?.user?.role || 'admin';

    // Initialize state from localStorage if available
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved === 'true';
        }
        return false;
    });

    // Mobile menu state
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

            {/* Sidebar - Fixed on desktop, hidden on mobile */}
            <div className="hidden md:block fixed inset-y-0 z-50">
                <Sidebar
                    userRole={role as string}
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    {/* Sidebar Content */}
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
                            userRole={role as string}
                            isCollapsed={false}
                            toggleSidebar={() => setIsMobileMenuOpen(false)}
                            className="w-full border-none shadow-none h-full"
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen flex flex-col relative transition-all duration-300",
                isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                 {/* Mobile Header */}
                 <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-30">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                         {/* Mobile Hamburger */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="-ml-2"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="text-lg">SEKOLAH KITA</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={startTour}
                        title="Lihat Tour"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                    >
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </div>

                <div className={cn("flex-1 overflow-y-auto w-full mx-auto", fullWidth ? "p-0" : "p-4 md:p-8 max-w-7xl")}>
                    {children}
                </div>
            </main>

            {/* Global Chat Widget */}
            {/* {!disableChatWidget && <ChatWidget currentUserRole={role as string} />} */}
        </div>
    );
}
