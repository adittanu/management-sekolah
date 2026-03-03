import ParentLayout from '@/Layouts/ParentLayout';
import { Head, router } from '@inertiajs/react';
import { BookOpen, BookCheck, Clock, CheckCircle } from 'lucide-react';

interface Book {
    id: number;
    title: string;
    author: string;
    cover_image: string | null;
}

interface Loan {
    id: number;
    book: Book;
    loaned_at: string;
    returned_at: string | null;
    status: 'active' | 'returned' | 'overdue';
}

interface ReadingProgress {
    id: number;
    book: Book;
    current_page: number;
    total_pages: number | null;
    last_seen_at: string;
}

interface PageProps {
    children: { id: number; name: string }[];
    active_student_id: number | null;
    loans: Loan[];
    reading_progress: ReadingProgress[];
}

export default function PerpustakaanIndex({ children, active_student_id, loans, reading_progress }: PageProps) {
    const handleChildChange = (studentId: number) => {
        router.get('/orangtua/perpustakaan', { student_id: studentId }, { preserveState: true, preserveScroll: true });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'returned': return 'bg-green-100 text-green-700 border-green-200';
            case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Dipinjam';
            case 'returned': return 'Dikembalikan';
            case 'overdue': return 'Terlambat';
            default: return status;
        }
    };

    return (
        <ParentLayout title="Perpustakaan Anak">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        Aktivitas Perpustakaan
                    </h1>
                    <p className="text-slate-500">Pantau peminjaman buku dan progres membaca anak.</p>
                </div>

                {/* Child Selector Tabs (If multiple children) */}
                {children.length > 1 && (
                    <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-px">
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => handleChildChange(child.id)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                    ${active_student_id === child.id 
                                        ? 'border-blue-600 text-blue-600' 
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                            >
                                {child.name}
                            </button>
                        ))}
                    </div>
                )}

                {!active_student_id ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
                        Belum ada data anak.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Tab 1: Peminjaman Buku */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <BookCheck className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-bold text-slate-800">Riwayat Peminjaman</h2>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                {loans.length > 0 ? loans.map(loan => (
                                    <div key={loan.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="w-16 h-20 bg-slate-200 rounded border shrink-0 overflow-hidden text-center flex items-center justify-center">
                                            {loan.book.cover_image ? (
                                                <img src={`/storage/${loan.book.cover_image}`} alt={loan.book.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <BookOpen className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 line-clamp-1">{loan.book.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusStyles(loan.status)}`}>
                                                    {getStatusText(loan.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-2 line-clamp-1">{loan.book.author}</p>
                                            
                                            <div className="text-xs text-slate-500 space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>Pinjam: {new Date(loan.loaned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                {loan.returned_at && (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        <span>Kembali: {new Date(loan.returned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <BookCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                        <p>Belum ada riwayat peminjaman buku.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tab 2: Progress Membaca */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-slate-800">Progress Membaca (Digital)</h2>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                {reading_progress.length > 0 ? reading_progress.map(progress => {
                                    const percent = progress.total_pages ? Math.round((progress.current_page / progress.total_pages) * 100) : 0;
                                    
                                    return (
                                        <div key={progress.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                                            <div className="w-12 h-16 bg-slate-200 rounded border shrink-0 overflow-hidden flex flex-col justify-end relative">
                                                {progress.book.cover_image && (
                                                    <img src={`/storage/${progress.book.cover_image}`} alt={progress.book.title} className="absolute inset-0 w-full h-full object-cover z-0 opacity-50" />
                                                )}
                                                <div className="relative z-10 w-full bg-blue-600" style={{ height: `${percent}%` }}></div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900 line-clamp-1">{progress.book.title}</h3>
                                                <p className="text-xs text-slate-500 mb-3 ml-1">Terakhir baca: {new Date(progress.last_seen_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                                
                                                <div className="w-full relative pt-1">
                                                    <div className="flex mb-1 items-center justify-between">
                                                        <div>
                                                            <span className="text-xs font-semibold inline-block py-0.5 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                                                                Progress
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-semibold inline-block text-blue-600">
                                                                {percent}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-50">
                                                        <div style={{ width: `${percent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 text-right">Hal: {progress.current_page} / {progress.total_pages || '?'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                        <p>Belum ada progres baca e-book.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </ParentLayout>
    );
}
