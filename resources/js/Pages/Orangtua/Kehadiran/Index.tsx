import ParentLayout from '@/Layouts/ParentLayout';
import { Head, router } from '@inertiajs/react';
import { ScanFace, Calendar as CalendarIcon, Filter, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Attendance {
    id: number;
    date: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpha';
    notes: string | null;
    student: {
        id: number;
        name: string;
    };
    schedule: {
        id: number;
        subject: {
            name: string;
        };
    };
}

interface Summary {
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
}

interface PageProps {
    children: { id: number; name: string }[];
    attendances: Attendance[];
    summary: Summary;
    filters: {
        month: number;
        year: number;
        student_id: number | null;
    };
}

export default function KehadiranIndex({ children, attendances, summary, filters }: PageProps) {
    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        router.get('/orangtua/kehadiran', newFilters, { preserveState: true, preserveScroll: true });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'hadir': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'sakit': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'izin': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'alpha': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            hadir: 'bg-green-100 text-green-700 border-green-200',
            sakit: 'bg-amber-100 text-amber-700 border-amber-200',
            izin: 'bg-blue-100 text-blue-700 border-blue-200',
            alpha: 'bg-red-100 text-red-700 border-red-200'
        }[status] || 'bg-slate-100 text-slate-700 border-slate-200';

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles}`}>
                {status}
            </span>
        );
    };

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <ParentLayout title="Monitoring Kehadiran">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ScanFace className="w-6 h-6 text-blue-600" />
                        Monitoring Kehadiran Harian
                    </h1>
                    <p className="text-slate-500">Pantau riwayat kehadiran putra/putri Anda secara langsung.</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Filter className="w-4 h-4" />
                        <span>Filter Data:</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        {children.length > 1 && (
                            <select 
                                className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={filters.student_id || ''}
                                onChange={(e) => handleFilterChange('student_id', e.target.value)}
                            >
                                <option value="">Semua Anak</option>
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>{child.name}</option>
                                ))}
                            </select>
                        )}
                        
                        <select 
                            className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={filters.month}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                        >
                            {months.map((month, index) => (
                                <option key={index} value={index + 1}>{month}</option>
                            ))}
                        </select>
                        
                        <select 
                            className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Hadir</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary.hadir}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Sakit</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary.sakit}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Izin</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary.izin}</h3>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Alpha</p>
                            <h3 className="text-2xl font-bold text-slate-900">{summary.alpha}</h3>
                        </div>
                    </div>
                </div>

                {/* Attendance List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-600 bg-slate-50 uppercase border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                                    {children.length > 1 && !filters.student_id && <th className="px-6 py-4 font-semibold">Nama Anak</th>}
                                    <th className="px-6 py-4 font-semibold">Mata Pelajaran</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {attendances.length > 0 ? (
                                    attendances.map((attendance) => (
                                        <tr key={attendance.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                {new Date(attendance.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            {children.length > 1 && !filters.student_id && (
                                                <td className="px-6 py-4 text-slate-700">
                                                    {attendance.student.name}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-slate-700">
                                                {attendance.schedule?.subject?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(attendance.status)}
                                                    {getStatusBadge(attendance.status)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {attendance.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={children.length > 1 && !filters.student_id ? 5 : 4} className="px-6 py-12 text-center text-slate-500">
                                            Tidak ada riwayat kehadiran untuk periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ParentLayout>
    );
}
