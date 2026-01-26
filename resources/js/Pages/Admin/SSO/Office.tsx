import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function OfficeFrame() {
    return (
        <AdminLayout 
            title="Office Integration" 
            disableChatWidget={true} 
            fullWidth={true}
        >
            <Head title="Office Integration" />
            
            <div className="flex flex-col h-[calc(100vh-64px)] w-full">
                <iframe 
                    src="https://smkn12office.edukati.my.id/"
                    className="w-full h-full border-none"
                    title="Office Integration"
                    allowFullScreen
                    allow="clipboard-write"
                />
            </div>
        </AdminLayout>
    );
}
