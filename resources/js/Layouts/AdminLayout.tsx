import { PropsWithChildren, useState, useEffect } from 'react';
import Sidebar from '@/Components/admin/Sidebar';
import ChatWidget from '@/Components/ChatWidget';
import { Head, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children, title, disableChatWidget = false, fullWidth = false }: PropsWithChildren<{ title?: string, disableChatWidget?: boolean, fullWidth?: boolean }>) {
    // Get role from Inertia props, passed from web.php
    // In a real app this might come from auth.user.role
    const { role } = usePage<any>().props;
    
    // Initialize state from localStorage if available
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved === 'true';
        }
        return false;
    });

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };
    
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <Head title={title} />
            
            {/* Sidebar - Fixed on desktop, hidden on mobile (for now) */}
            <div className="hidden md:block fixed inset-y-0 z-50">
                <Sidebar 
                    userRole={role as string} 
                    isCollapsed={isSidebarCollapsed} 
                    toggleSidebar={toggleSidebar} 
                />
            </div>

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen flex flex-col relative transition-all duration-300",
                isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                <div className={cn("flex-1 overflow-y-auto w-full mx-auto", fullWidth ? "p-0" : "p-6 md:p-8 max-w-7xl")}>
                    {children}
                </div>
            </main>

{/* Global Chat Widget */}
            {/* {!disableChatWidget && <ChatWidget currentUserRole={role as string} />} */}
        </div>
    );
}
