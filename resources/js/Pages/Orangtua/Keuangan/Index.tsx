import ParentLayout from '@/Layouts/ParentLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { 
    Wallet, 
    TrendingDown, 
    TrendingUp, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    FileText, 
    Calendar,
    Users
} from 'lucide-react';
import { useState } from 'react';

interface Student {
    id: number;
    name: string;
    identity_number: string | null;
    class: string;
}

interface FinancialCategory {
    id: number;
    name: string;
    type: string;
    description: string | null;
}

interface FinancialTransaction {
    id: number;
    billing_id: number;
    amount: string;
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
    created_at: string;
}

interface Billing {
    id: number;
    student_id: number;
    financial_category_id: number;
    description: string;
    amount: string;
    discount: string;
    total_paid: string;
    due_date: string;
    status: string;
    student?: {
        id: number;
        name: string;
    };
    category?: FinancialCategory;
    transactions?: FinancialTransaction[];
}

interface Props {
    children: Student[];
    billings: Billing[];
    summary: {
        total_arrears: number;
        total_paid: number;
        unpaid_count: number;
    };
}

export default function KeuanganIndex({ children, billings, summary }: Props) {
    const [activeChildId, setActiveChildId] = useState<number | 'all'>('all');

    const formatCurrency = (amount: string | number) => {
        return `Rp ${Number(amount).toLocaleString('id-ID')}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'partial':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-red-50 text-red-700 border-red-200';
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Lunas';
            case 'partial':
                return 'Cicilan';
            default:
                return 'Belum Lunas';
        }
    };

    // Filter billings based on active child selection
    const filteredBillings = billings.filter((b) => 
        activeChildId === 'all' ? true : b.student_id === activeChildId
    );

    // Get all transactions for history tab
    const allTransactions = billings
        .flatMap((b) => (b.transactions || []).map((t) => ({
            ...t,
            billing: b
        })))
        .filter((t) => activeChildId === 'all' ? true : t.billing.student_id === activeChildId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calculate arrears for the current view
    const currentArrears = filteredBillings.reduce((sum, b) => {
        if (b.status === 'paid') return sum;
        const net = Number(b.amount) - Number(b.discount);
        return sum + (net - Number(b.total_paid));
    }, 0);

    const currentPaid = filteredBillings.reduce((sum, b) => sum + Number(b.total_paid), 0);
    const currentUnpaidCount = filteredBillings.filter((b) => b.status !== 'paid').length;

    return (
        <ParentLayout title="Keuangan & SPP Anak">
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl shadow-md shadow-blue-200 text-white">
                            <Wallet className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Informasi Keuangan Anak</h2>
                            <p className="text-slate-600 text-sm mt-1">Pantau tagihan pendidikan, uang sekolah, SPP bulanan, dan riwayat pembayaran siswa.</p>
                        </div>
                    </div>
                </div>

                {/* Child Filter Selectors */}
                {children.length > 1 && (
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
                        <button
                            onClick={() => setActiveChildId('all')}
                            className={`rounded-lg px-4 py-2 font-bold text-xs transition-all ${
                                activeChildId === 'all'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Semua Anak
                        </button>
                        {children.map((child) => (
                            <button
                                key={child.id}
                                onClick={() => setActiveChildId(child.id)}
                                className={`rounded-lg px-4 py-2 font-bold text-xs transition-all ${
                                    activeChildId === child.id
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {child.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card data-tour="card-tunggakan-spp" className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center justify-between">
                                Total Tunggakan Aktif
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className={`text-2xl font-bold ${currentArrears > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                {formatCurrency(currentArrears)}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {currentUnpaidCount} tagihan belum diselesaikan
                            </p>
                        </CardContent>
                    </Card>

                    <Card data-tour="card-pembayaran-spp" className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center justify-between">
                                Total Pembayaran Berhasil
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-2xl font-bold text-green-600">
                                {formatCurrency(currentPaid)}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Pembayaran yang dicatat oleh admin
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center justify-between">
                                Status Penagihan
                                <Users className="w-4 h-4 text-blue-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-2xl font-bold text-slate-800">
                                {activeChildId === 'all' ? `${children.length} Anak` : children.find(c => c.id === activeChildId)?.class}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2">
                                {activeChildId === 'all' ? 'Memantau seluruh tagihan anak terdaftar' : `Kelas anak terpilih`}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
                    {/* Billings List */}
                    <Card className="border-slate-200 shadow-sm lg:col-span-1 bg-white">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-4.5 h-4.5 text-blue-600" />
                                Daftar Tagihan Pendidikan
                            </CardTitle>
                            <CardDescription>Rincian tagihan sekolah untuk SPP, Uang Gedung, atau kegiatan ekstrakurikuler.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredBillings.length === 0 ? (
                                <div className="text-center py-16 text-slate-500">
                                    <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                                    <h4 className="text-base font-bold text-slate-800">Semua Tagihan Lunas!</h4>
                                    <p className="text-sm text-slate-500 mt-1">Tidak ada tunggakan pembayaran yang aktif saat ini.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                {activeChildId === 'all' && <TableHead className="font-semibold text-xs">Anak</TableHead>}
                                                <TableHead className="font-semibold text-xs">Tagihan</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">Nominal</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">Potongan</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">Sisa Tagihan</TableHead>
                                                <TableHead className="font-semibold text-xs">Batas Tempo</TableHead>
                                                <TableHead className="font-semibold text-xs">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredBillings.map((billing) => {
                                                const net = Number(billing.amount) - Number(billing.discount);
                                                const remaining = net - Number(billing.total_paid);
                                                return (
                                                    <TableRow key={billing.id} className="hover:bg-slate-50/50 transition-colors">
                                                        {activeChildId === 'all' && (
                                                            <TableCell className="font-semibold text-slate-800 py-4 text-xs">
                                                                {billing.student?.name}
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="py-4">
                                                            <div className="font-bold text-slate-800 text-xs">{billing.description}</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{billing.category?.name}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right text-slate-700 py-4 text-xs">
                                                            {formatCurrency(billing.amount)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-slate-500 py-4 text-xs">
                                                            {Number(billing.discount) > 0 ? formatCurrency(billing.discount) : '-'}
                                                        </TableCell>
                                                        <TableCell className={`text-right font-bold py-4 text-xs ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {formatCurrency(remaining)}
                                                        </TableCell>
                                                        <TableCell className="text-slate-500 py-4 text-xs">
                                                            {formatDate(billing.due_date)}
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold ${statusColor(billing.status)}`}>
                                                                {statusLabel(billing.status)}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History sidebar */}
                    <Card data-tour="card-riwayat-transaksi" className="border-slate-200 shadow-sm bg-white">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-4.5 h-4.5 text-green-600" />
                                Riwayat Transaksi
                            </CardTitle>
                            <CardDescription>Catatan pembayaran terbaru yang telah divalidasi tata usaha.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-6 space-y-4 max-h-[500px] overflow-y-auto">
                            {allTransactions.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs font-medium">Belum ada transaksi pembayaran.</p>
                                </div>
                            ) : (
                                allTransactions.map((trx) => (
                                    <div key={trx.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-3 flex flex-col gap-2 hover:border-slate-200 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block font-medium">{formatDate(trx.created_at)}</span>
                                                <span className="font-bold text-slate-800 text-xs block mt-0.5 truncate max-w-[200px]" title={trx.billing.description}>
                                                    {trx.billing.description}
                                                </span>
                                                {activeChildId === 'all' && (
                                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                        {trx.billing.student?.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="font-extrabold text-green-600 text-xs block">{formatCurrency(trx.amount)}</span>
                                                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 px-1 rounded inline-block mt-1">
                                                    {trx.payment_method}
                                                </span>
                                            </div>
                                        </div>
                                        {trx.reference_number && (
                                            <div className="text-[9px] text-slate-400 font-mono border-t border-slate-100 pt-1">
                                                Ref: {trx.reference_number}
                                            </div>
                                        )}
                                        {trx.notes && (
                                            <div className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                                                "{trx.notes}"
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ParentLayout>
    );
}
