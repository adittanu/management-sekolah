import ParentLayout from '@/Layouts/ParentLayout';
import { Head } from '@inertiajs/react';
import { Bell, Calendar } from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    published_at: string;
    posted_by: {
        id: number;
        name: string;
        role: string;
    };
}

interface PaginationData {
    data: Announcement[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function PengumumanIndex({ announcements }: { announcements: PaginationData }) {
    return (
        <ParentLayout title="Pengumuman Sekolah">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pengumuman Sekolah</h1>
                        <p className="text-slate-500">Informasi dan berita terbaru dari pihak sekolah.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {announcements.data.length > 0 ? (
                        announcements.data.map((announcement) => (
                            <div key={announcement.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex gap-4 transition-all hover:shadow-md">
                                <div className="shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">{announcement.title}</h2>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(announcement.published_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <span>•</span>
                                        <span>Oleh: {announcement.posted_by.name}</span>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                                        {announcement.content}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
                            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">Belum Ada Pengumuman</h3>
                            <p>Saat ini belum ada pengumuman terbaru dari sekolah.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Details (if needed) */}
                {announcements.last_page > 1 && (
                    <div className="text-sm text-slate-500 text-center">
                        Halaman {announcements.current_page} dari {announcements.last_page}
                    </div>
                )}
            </div>
        </ParentLayout>
    );
}
