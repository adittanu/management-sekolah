import { PropsWithChildren } from 'react';
import Sidebar from '@/Components/admin/Sidebar';
import ChatWidget from '@/Components/ChatWidget';
import { Head, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children, title, disableChatWidget = false, fullWidth = false }: PropsWithChildren<{ title?: string, disableChatWidget?: boolean, fullWidth?: boolean }>) {
    // Get role from Inertia props, passed from web.php
    // In a real app this might come from auth.user.role
    const { role } = usePage<any>().props; 
    
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <Head title={title} />
            
            {/* Sidebar - Fixed on desktop, hidden on mobile (for now) */}
            <div className="hidden md:block fixed inset-y-0 z-50">
                <Sidebar userRole={role as string} />
            </div>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 min-h-screen flex flex-col relative">
                <div className={cn("flex-1 overflow-y-auto w-full mx-auto", fullWidth ? "p-0" : "p-6 md:p-8 max-w-7xl")}>
                    {children}
                </div>
            </main>

            {/* Global Chat Widget */}
            {!disableChatWidget && <ChatWidget currentUserRole={role as string} />}
        </div>
    );
}
