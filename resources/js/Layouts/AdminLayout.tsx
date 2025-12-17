import { PropsWithChildren } from 'react';
import Sidebar from '@/Components/admin/Sidebar';
import { Head } from '@inertiajs/react';

export default function AdminLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Head title={title} />
            
            {/* Sidebar - Fixed on desktop, hidden on mobile (for now) */}
            <div className="hidden md:block fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 min-h-screen flex flex-col">
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
