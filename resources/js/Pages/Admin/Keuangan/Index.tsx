import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Search,
    FileText,
    Download,
    Plus,
    Calendar,
    Pencil,
    Trash2,
    Tag,
    Users,
    Eye,
    Filter,
    X,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';

interface FinancialCategory {
    id: number;
    name: string;
    type: string;
    description: string | null;
    default_amount: string | null;
    is_active: boolean;
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
    remaining?: number;
    student?: {
        id: number;
        name: string;
        identity_number: string | null;
        classrooms?: Array<{ id: number; name: string; pivot?: { is_active: boolean } }>;
    };
    category?: FinancialCategory;
}

interface FinancialTransaction {
    id: number;
    billing_id: number;
    amount: string;
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
    created_at: string;
    billing?: Billing;
    recorder?: {
        id: number;
        name: string;
    };
}

interface Student {
    id: number;
    name: string;
    identity_number: string | null;
    billings?: Billing[];
    classrooms?: Array<{ id: number; name: string; pivot?: { is_active: boolean } }>;
}

interface Props {
    students: Student[];
    classrooms: Array<{ id: number; name: string }>;
    categories: FinancialCategory[];
    recentTransactions: FinancialTransaction[];
    stats: {
        total_income: string;
        total_arrears: string;
        paid_count: number;
        unpaid_count: number;
    };
}

export default function KeuanganIndex({ students, classrooms = [], categories, recentTransactions, stats }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<FinancialCategory | null>(null);
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [showBillingDialog, setShowBillingDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showBillingDetailDialog, setShowBillingDetailDialog] = useState(false);
    const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [billingFilter, setBillingFilter] = useState<string>('all');
    const [classFilter, setClassFilter] = useState<string>('all');
    const [dialogStudentSearch, setDialogStudentSearch] = useState('');

    // Category form
    const categoryForm = useForm({
        name: '',
        type: 'income',
        description: '',
        default_amount: '',
        is_active: true,
    });

    // Billing form
    const billingForm = useForm({
        student_id: '',
        student_ids: [] as string[],
        classroom_id: '',
        target_type: 'single', // 'single', 'multiple', 'classroom', 'all'
        billing_type: 'one_time', // 'one_time', 'monthly'
        financial_category_id: '',
        description: '',
        amount: '',
        discount: '',
        due_date: '',
        monthly_start_month: '',
        monthly_start_year: new Date().getFullYear().toString(),
        monthly_end_month: '',
        monthly_end_year: new Date().getFullYear().toString(),
        monthly_due_day: '10',
    });

    // Payment form
    const paymentForm = useForm({
        billing_id: '',
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: '',
    });

    const handleSaveCategory = () => {
        if (selectedCategory) {
            categoryForm.patch(`/admin/keuangan/kategori/${selectedCategory.id}`, {
                onSuccess: () => {
                    setShowCategoryDialog(false);
                    setSelectedCategory(null);
                    categoryForm.reset();
                },
            });
        } else {
            categoryForm.post('/admin/keuangan/kategori', {
                onSuccess: () => {
                    setShowCategoryDialog(false);
                    categoryForm.reset();
                },
            });
        }
    };

    const handleDeleteCategory = (id: number) => {
        router.delete(`/admin/keuangan/kategori/${id}`, {
            preserveScroll: true,
        });
    };

    const handleSaveBilling = () => {
        if (selectedBilling) {
            billingForm.patch(`/admin/keuangan/tagihan/${selectedBilling.id}`, {
                onSuccess: () => {
                    setShowBillingDialog(false);
                    setSelectedBilling(null);
                    billingForm.reset();
                },
            });
        } else {
            billingForm.post('/admin/keuangan/tagihan', {
                onSuccess: () => {
                    setShowBillingDialog(false);
                    billingForm.reset();
                },
            });
        }
    };

    const handleDeleteBilling = (id: number) => {
        router.delete(`/admin/keuangan/tagihan/${id}`, {
            preserveScroll: true,
        });
    };

    const handleSavePayment = () => {
        paymentForm.post('/admin/keuangan/pembayaran', {
            onSuccess: () => {
                setShowPaymentDialog(false);
                setSelectedBilling(null);
                paymentForm.reset();
            },
        });
    };

    const openPaymentDialog = (billing: Billing) => {
        setSelectedBilling(billing);
        paymentForm.setData({
            billing_id: billing.id.toString(),
            amount: '',
            payment_method: 'cash',
            reference_number: '',
            notes: '',
        });
        setShowPaymentDialog(true);
    };

    const openEditCategoryDialog = (category: FinancialCategory) => {
        setSelectedCategory(category);
        categoryForm.setData({
            name: category.name,
            type: category.type,
            description: category.description || '',
            default_amount: category.default_amount || '',
            is_active: category.is_active,
        });
        setShowCategoryDialog(true);
    };

    const openNewCategoryDialog = () => {
        setSelectedCategory(null);
        categoryForm.reset();
        categoryForm.setData({
            name: '',
            type: 'income',
            description: '',
            default_amount: '',
            is_active: true,
        });
        setShowCategoryDialog(true);
    };

    const openEditBillingDialog = (billing: Billing) => {
        setSelectedBilling(billing);
        billingForm.setData({
            student_id: billing.student_id.toString(),
            student_ids: [],
            classroom_id: '',
            target_type: 'single',
            billing_type: 'one_time',
            financial_category_id: billing.financial_category_id.toString(),
            description: billing.description,
            amount: billing.amount,
            discount: billing.discount,
            due_date: billing.due_date,
            monthly_start_month: '',
            monthly_start_year: new Date().getFullYear().toString(),
            monthly_end_month: '',
            monthly_end_year: new Date().getFullYear().toString(),
            monthly_due_day: '10',
        });
        setShowBillingDialog(true);
    };

    const openNewBillingDialog = () => {
        setSelectedBilling(null);
        billingForm.reset();
        billingForm.setData({
            student_id: '',
            student_ids: [],
            classroom_id: '',
            target_type: 'single',
            billing_type: 'one_time',
            financial_category_id: '',
            description: '',
            amount: '',
            discount: '',
            due_date: '',
            monthly_start_month: '',
            monthly_start_year: new Date().getFullYear().toString(),
            monthly_end_month: '',
            monthly_end_year: new Date().getFullYear().toString(),
            monthly_due_day: '10',
        });
        setDialogStudentSearch('');
        setShowBillingDialog(true);
    };

    const getClassStudentCount = (classId: string) => {
        if (!classId) return 0;
        return students.filter(s => s.classrooms?.some(c => c.id.toString() === classId && c.pivot?.is_active)).length;
    };

    const getMonthsCount = () => {
        const sy = parseInt(billingForm.data.monthly_start_year);
        const sm = parseInt(billingForm.data.monthly_start_month);
        const ey = parseInt(billingForm.data.monthly_end_year);
        const em = parseInt(billingForm.data.monthly_end_month);
        if (isNaN(sy) || isNaN(sm) || isNaN(ey) || isNaN(em)) return 0;
        
        const startTotalMonths = sy * 12 + (sm - 1);
        const endTotalMonths = ey * 12 + (em - 1);
        if (endTotalMonths < startTotalMonths) return 0;
        return (endTotalMonths - startTotalMonths) + 1;
    };

    const filteredStudents = students.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.identity_number && s.identity_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatCurrency = (amount: string | number) => {
        return `Rp ${Number(amount).toLocaleString('id-ID')}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
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
                return 'Belum Bayar';
        }
    };

    // Gather all billings from students
    const allBillings: Billing[] = students.flatMap((s) =>
        (s.billings || []).map((b) => ({
            ...b,
            student: { id: s.id, name: s.name, identity_number: s.identity_number, classrooms: s.classrooms },
        }))
    );

    const filteredBillings = allBillings
        .filter((b) => {
            if (billingFilter === 'paid') return b.status === 'paid';
            if (billingFilter === 'unpaid') return b.status === 'unpaid';
            if (billingFilter === 'partial') return b.status === 'partial';
            return true;
        })
        .filter((b) => {
            if (classFilter === 'all') return true;
            return b.student?.classrooms?.some((c: any) => c.id.toString() === classFilter && c.pivot?.is_active);
        })
        .filter((b) => {
            if (!searchQuery) return true;
            return b.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.description.toLowerCase().includes(searchQuery.toLowerCase());
        });

    const incomeCategories = categories.filter((c) => c.type === 'income');
    const expenseCategories = categories.filter((c) => c.type === 'expense');

    return (
        <AdminLayout title="Keuangan & SPP">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Keuangan Sekolah</h2>
                        <p className="text-slate-500">Manajemen tagihan SPP, pencatatan pembayaran, dan laporan keuangan.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-white" onClick={() => openNewCategoryDialog()}>
                            <Tag className="w-4 h-4 mr-2" />
                            Kelola Kategori
                        </Button>
                        <Button data-tour="btn-buat-tagihan" className="bg-blue-600 hover:bg-blue-700" onClick={() => openNewBillingDialog()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Tagihan
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="dashboard" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger data-tour="tab-tagihan" value="tagihan" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                            Data Tagihan
                        </TabsTrigger>
                        <TabsTrigger value="pembayaran" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                            Input Pembayaran
                        </TabsTrigger>
                        <TabsTrigger value="kategori" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                            Kategori Keuangan
                        </TabsTrigger>
                    </TabsList>

                    {/* DASHBOARD */}
                    <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50 duration-500">
                        <div className="grid md:grid-cols-4 gap-4">
                            <Card data-tour="card-pemasukan" className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Total Pemasukan</p>
                                            <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.total_income)}</h3>
                                        </div>
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card data-tour="card-tunggakan" className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Total Tunggakan</p>
                                            <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.total_arrears)}</h3>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <TrendingDown className="w-5 h-5 text-red-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Tagihan Lunas</p>
                                            <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.paid_count}</h3>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">Tagihan Belum Lunas</p>
                                            <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.unpaid_count}</h3>
                                        </div>
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
                            {/* Recent Transactions */}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle>Transaksi Terbaru</CardTitle>
                                    <CardDescription>20 pembayaran terakhir yang masuk sistem.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentTransactions.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                            <p>Belum ada transaksi pembayaran.</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Siswa</TableHead>
                                                    <TableHead>Kategori</TableHead>
                                                    <TableHead>Jumlah</TableHead>
                                                    <TableHead>Metode</TableHead>
                                                    <TableHead>Tanggal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentTransactions.map((trx) => (
                                                    <TableRow key={trx.id}>
                                                        <TableCell>
                                                            <div className="font-medium text-slate-900">{trx.billing?.student?.name}</div>
                                                            <div className="text-xs text-slate-500">{trx.billing?.description}</div>
                                                        </TableCell>
                                                        <TableCell>{trx.billing?.category?.name}</TableCell>
                                                        <TableCell className="font-bold text-green-600">{formatCurrency(trx.amount)}</TableCell>
                                                        <TableCell className="text-sm text-slate-600 capitalize">{trx.payment_method}</TableCell>
                                                        <TableCell className="text-sm text-slate-500">{formatDate(trx.created_at)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Categories Overview */}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-blue-600">Kategori Keuangan</CardTitle>
                                    <CardDescription>Daftar kategori yang aktif.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {categories.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm">Belum ada kategori.</p>
                                        </div>
                                    ) : (
                                        categories.map((cat) => (
                                            <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-bold text-slate-800">{cat.name}</div>
                                                    <div className="text-xs text-slate-500 capitalize">{cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</div>
                                                </div>
                                                <div className="text-right">
                                                    {cat.default_amount && (
                                                        <div className="font-bold text-slate-900 text-sm">{formatCurrency(cat.default_amount)}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <Button variant="outline" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100" onClick={() => openNewCategoryDialog()}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah Kategori
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* TAGIHAN */}
                    <TabsContent value="tagihan">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Data Tagihan Siswa</CardTitle>
                                        <CardDescription>Kelola tagihan SPP, Uang Gedung, dan lainnya.</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-64">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Cari siswa atau deskripsi..."
                                                className="pl-9"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={classFilter}
                                            onChange={(e) => setClassFilter(e.target.value)}
                                        >
                                            <option value="all">Semua Kelas</option>
                                            {classrooms.map((c) => (
                                                <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                            ))}
                                        </select>
                                        <div className="flex gap-1">
                                            {['all', 'unpaid', 'partial', 'paid'].map((f) => (
                                                <Button
                                                    key={f}
                                                    variant={billingFilter === f ? 'default' : 'outline'}
                                                    size="sm"
                                                    className={billingFilter === f ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                                    onClick={() => setBillingFilter(f)}
                                                >
                                                    {f === 'all' ? 'Semua' : f === 'unpaid' ? 'Belum Bayar' : f === 'partial' ? 'Cicilan' : 'Lunas'}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openNewBillingDialog()}>
                                            <Plus className="w-4 h-4 mr-1" />
                                            Tagihan Baru
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredBillings.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                        <p>Belum ada data tagihan.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Siswa</TableHead>
                                                <TableHead>Kelas</TableHead>
                                                <TableHead>Kategori</TableHead>
                                                <TableHead>Deskripsi</TableHead>
                                                <TableHead className="text-right">Nominal</TableHead>
                                                <TableHead className="text-right">Bayar</TableHead>
                                                <TableHead className="text-right">Sisa</TableHead>
                                                <TableHead>Jatuh Tempo</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredBillings.map((billing) => {
                                                const remaining = Number(billing.amount) - Number(billing.discount) - Number(billing.total_paid);
                                                const activeClass = billing.student?.classrooms?.find((c: any) => c.pivot?.is_active)?.name || '-';
                                                return (
                                                    <TableRow key={billing.id}>
                                                        <TableCell>
                                                            <div className="font-medium text-slate-900">{billing.student?.name}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                                                {activeClass}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{billing.category?.name}</TableCell>
                                                        <TableCell className="text-sm">{billing.description}</TableCell>
                                                        <TableCell className="text-right font-bold text-slate-700">{formatCurrency(billing.amount)}</TableCell>
                                                        <TableCell className="text-right text-green-600">{formatCurrency(billing.total_paid)}</TableCell>
                                                        <TableCell className={`text-right font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {formatCurrency(remaining)}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-500">{formatDate(billing.due_date)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={statusColor(billing.status)}>
                                                                {statusLabel(billing.status)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex gap-1 justify-end">
                                                                {billing.status !== 'paid' && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-green-600 hover:bg-green-50 border-green-100"
                                                                        onClick={() => openPaymentDialog(billing)}
                                                                    >
                                                                        Bayar
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openEditBillingDialog(billing)}
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 hover:bg-red-50 border-red-100"
                                                                    onClick={() => handleDeleteBilling(billing.id)}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PEMBAYARAN */}
                    <TabsContent value="pembayaran">
                        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
                            {/* Student List */}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle>Pilih Siswa</CardTitle>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Cari siswa..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
                                    {filteredStudents.map((student) => {
                                        const unpaidCount = (student.billings || []).filter((b) => b.status !== 'paid').length;
                                        return (
                                            <div
                                                key={student.id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                    selectedStudentId === student.id
                                                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                                                        : 'hover:bg-slate-50'
                                                }`}
                                                onClick={() => setSelectedStudentId(student.id)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-slate-800">{student.name}</div>
                                                        <div className="text-xs text-slate-500">{student.identity_number || '-'}</div>
                                                    </div>
                                                    {unpaidCount > 0 && (
                                                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
                                                            {unpaidCount} belum lunas
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Student Billings */}
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle>
                                        {selectedStudentId
                                            ? `Tagihan ${students.find((s) => s.id === selectedStudentId)?.name}`
                                            : 'Pilih siswa untuk melihat tagihan'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!selectedStudentId ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                            <p>Pilih siswa dari daftar di sebelah kiri.</p>
                                        </div>
                                    ) : (
                                        (() => {
                                            const student = students.find((s) => s.id === selectedStudentId);
                                            const billings = (student?.billings || []).filter((b) => b.status !== 'paid');
                                            if (billings.length === 0) {
                                                return (
                                                    <div className="text-center py-12 text-slate-500">
                                                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                                                        <p className="text-green-600 font-medium">Semua tagihan sudah lunas!</p>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className="space-y-3">
                                                    {billings.map((billing) => {
                                                        const remaining = Number(billing.amount) - Number(billing.discount) - Number(billing.total_paid);
                                                        return (
                                                            <div key={billing.id} className="border rounded-lg p-4 flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-slate-800">{billing.description}</div>
                                                                    <div className="text-sm text-slate-500">{billing.category?.name} • Jatuh tempo: {formatDate(billing.due_date)}</div>
                                                                    <div className="mt-2">
                                                                        <Badge variant="outline" className={statusColor(billing.status)}>
                                                                            {statusLabel(billing.status)}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right ml-4">
                                                                    <div className="text-sm text-slate-500">Sisa: <span className="font-bold text-red-600">{formatCurrency(remaining)}</span></div>
                                                                    <Button
                                                                        size="sm"
                                                                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                                                                        onClick={() => openPaymentDialog({ ...billing, student: { id: student!.id, name: student!.name, identity_number: student!.identity_number } })}
                                                                    >
                                                                        Bayar
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* KATEGORI */}
                    <TabsContent value="kategori" className="space-y-6 animate-in fade-in-50 duration-500">
                        <div className="flex justify-end">
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openNewCategoryDialog()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Kategori
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-green-600">Kategori Pemasukan</CardTitle>
                                    <CardDescription>Kategori untuk pemasukan sekolah.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {incomeCategories.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm">Belum ada kategori pemasukan.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {incomeCategories.map((cat) => (
                                                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-bold text-slate-800">{cat.name}</div>
                                                        {cat.description && (
                                                            <div className="text-xs text-slate-500 mt-1">{cat.description}</div>
                                                        )}
                                                        {cat.default_amount && (
                                                            <div className="text-sm text-green-600 font-medium mt-1">
                                                                Default: {formatCurrency(cat.default_amount)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="outline" size="sm" onClick={() => openEditCategoryDialog(cat)}>
                                                            <Pencil className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-100" onClick={() => handleDeleteCategory(cat.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-red-600">Kategori Pengeluaran</CardTitle>
                                    <CardDescription>Kategori untuk pengeluaran sekolah.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {expenseCategories.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm">Belum ada kategori pengeluaran.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {expenseCategories.map((cat) => (
                                                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-bold text-slate-800">{cat.name}</div>
                                                        {cat.description && (
                                                            <div className="text-xs text-slate-500 mt-1">{cat.description}</div>
                                                        )}
                                                        {cat.default_amount && (
                                                            <div className="text-sm text-red-600 font-medium mt-1">
                                                                Default: {formatCurrency(cat.default_amount)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="outline" size="sm" onClick={() => openEditCategoryDialog(cat)}>
                                                            <Pencil className="w-3 h-3" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-100" onClick={() => handleDeleteCategory(cat.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Category Dialog */}
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
                        <DialogDescription>
                            {selectedCategory ? 'Perbarui informasi kategori keuangan.' : 'Buat kategori keuangan baru untuk pembayaran.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Nama Kategori *</Label>
                            <Input
                                id="cat-name"
                                placeholder="Contoh: SPP Bulanan"
                                value={categoryForm.data.name}
                                onChange={(e) => categoryForm.setData('name', e.target.value)}
                            />
                            {categoryForm.errors.name && (
                                <p className="text-red-500 text-xs">{categoryForm.errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-type">Tipe *</Label>
                            <select
                                id="cat-type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={categoryForm.data.type}
                                onChange={(e) => categoryForm.setData('type', e.target.value)}
                            >
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                            {categoryForm.errors.type && (
                                <p className="text-red-500 text-xs">{categoryForm.errors.type}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Deskripsi</Label>
                            <Input
                                id="cat-desc"
                                placeholder="Deskripsi kategori..."
                                value={categoryForm.data.description}
                                onChange={(e) => categoryForm.setData('description', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-amount">Nominal Default (Rp)</Label>
                            <Input
                                id="cat-amount"
                                type="number"
                                placeholder="0"
                                value={categoryForm.data.default_amount}
                                onChange={(e) => categoryForm.setData('default_amount', e.target.value)}
                            />
                            {categoryForm.errors.default_amount && (
                                <p className="text-red-500 text-xs">{categoryForm.errors.default_amount}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Batal</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleSaveCategory}
                            disabled={categoryForm.processing}
                        >
                            {categoryForm.processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Billing Dialog */}
            <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedBilling ? 'Edit Tagihan' : 'Buat Tagihan Baru'}</DialogTitle>
                        <DialogDescription>
                            {selectedBilling ? 'Perbarui informasi tagihan.' : 'Buat tagihan pembayaran untuk siswa.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {!selectedBilling && (
                            <div className="space-y-2">
                                <Label>Target Penerima *</Label>
                                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg">
                                    {[
                                        { value: 'single', label: 'Tunggal' },
                                        { value: 'multiple', label: 'Pilih Siswa' },
                                        { value: 'classroom', label: 'Per Kelas' },
                                        { value: 'all', label: 'Semua' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                                                billingForm.data.target_type === opt.value
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                            onClick={() => {
                                                billingForm.setData('target_type', opt.value);
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {billingForm.errors.target_type && (
                                    <p className="text-red-500 text-xs">{billingForm.errors.target_type}</p>
                                )}
                            </div>
                        )}

                        {selectedBilling ? (
                            <div className="space-y-2">
                                <Label htmlFor="bill-student">Siswa</Label>
                                <select
                                    id="bill-student"
                                    disabled
                                    className="flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-500"
                                    value={billingForm.data.student_id}
                                >
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                {billingForm.data.target_type === 'single' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="bill-student">Siswa *</Label>
                                        <select
                                            id="bill-student"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={billingForm.data.student_id}
                                            onChange={(e) => billingForm.setData('student_id', e.target.value)}
                                        >
                                            <option value="">Pilih siswa...</option>
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        {billingForm.errors.student_id && (
                                            <p className="text-red-500 text-xs">{billingForm.errors.student_id}</p>
                                        )}
                                    </div>
                                )}

                                {billingForm.data.target_type === 'multiple' && (
                                    <div className="space-y-2">
                                        <Label>Pilih Beberapa Siswa *</Label>
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                placeholder="Cari nama siswa..."
                                                value={dialogStudentSearch}
                                                onChange={(e) => setDialogStudentSearch(e.target.value)}
                                                className="flex-1 text-sm h-9"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const allIds = students.map(s => s.id.toString());
                                                    billingForm.setData('student_ids', allIds);
                                                }}
                                            >
                                                Pilih Semua
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    billingForm.setData('student_ids', []);
                                                }}
                                            >
                                                Kosongkan
                                            </Button>
                                        </div>
                                        <div className="border rounded-md p-2 h-40 overflow-y-auto space-y-1">
                                            {students
                                                .filter(s => s.name.toLowerCase().includes(dialogStudentSearch.toLowerCase()))
                                                .map(s => {
                                                    const isChecked = billingForm.data.student_ids.includes(s.id.toString());
                                                    return (
                                                        <label key={s.id} className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    const newIds = e.target.checked
                                                                        ? [...billingForm.data.student_ids, s.id.toString()]
                                                                        : billingForm.data.student_ids.filter(id => id !== s.id.toString());
                                                                    billingForm.setData('student_ids', newIds);
                                                                }}
                                                            />
                                                            <span>{s.name} ({s.identity_number || '-'})</span>
                                                        </label>
                                                    );
                                                })}
                                        </div>
                                        <p className="text-xs text-slate-500">{billingForm.data.student_ids.length} siswa terpilih.</p>
                                        {billingForm.errors.student_ids && (
                                            <p className="text-red-500 text-xs">{billingForm.errors.student_ids}</p>
                                        )}
                                    </div>
                                )}

                                {billingForm.data.target_type === 'classroom' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="bill-classroom">Kelas *</Label>
                                        <select
                                            id="bill-classroom"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={billingForm.data.classroom_id}
                                            onChange={(e) => billingForm.setData('classroom_id', e.target.value)}
                                        >
                                            <option value="">Pilih Kelas...</option>
                                            {classrooms.map((c) => (
                                                <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                            ))}
                                        </select>
                                        {billingForm.errors.classroom_id && (
                                            <p className="text-red-500 text-xs">{billingForm.errors.classroom_id}</p>
                                        )}
                                    </div>
                                )}

                                {billingForm.data.target_type === 'all' && (
                                    <div className="p-3 bg-blue-50/50 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span>Tagihan akan dibuat untuk semua <strong>{students.length}</strong> siswa aktif.</span>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="bill-category">Kategori *</Label>
                            <select
                                id="bill-category"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={billingForm.data.financial_category_id}
                                onChange={(e) => billingForm.setData('financial_category_id', e.target.value)}
                            >
                                <option value="">Pilih kategori...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {billingForm.errors.financial_category_id && (
                                <p className="text-red-500 text-xs">{billingForm.errors.financial_category_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bill-desc">Deskripsi *</Label>
                            <Input
                                id="bill-desc"
                                placeholder="Contoh: SPP Bulan Maret 2024"
                                value={billingForm.data.description}
                                onChange={(e) => billingForm.setData('description', e.target.value)}
                            />
                            {billingForm.errors.description && (
                                <p className="text-red-500 text-xs">{billingForm.errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bill-amount">Nominal (Rp) *</Label>
                                <Input
                                    id="bill-amount"
                                    type="number"
                                    placeholder="500000"
                                    value={billingForm.data.amount}
                                    onChange={(e) => billingForm.setData('amount', e.target.value)}
                                />
                                {billingForm.errors.amount && (
                                    <p className="text-red-500 text-xs">{billingForm.errors.amount}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bill-discount">Diskon (Rp)</Label>
                                <Input
                                    id="bill-discount"
                                    type="number"
                                    placeholder="0"
                                    value={billingForm.data.discount}
                                    onChange={(e) => billingForm.setData('discount', e.target.value)}
                                />
                            </div>
                        </div>

                        {!selectedBilling && (
                            <div className="space-y-2">
                                <Label>Tipe Tagihan *</Label>
                                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                                    {[
                                        { value: 'one_time', label: 'Sekali Bayar (Satu Tanggal)' },
                                        { value: 'monthly', label: 'Bulanan / Rutin (Rentang Periode)' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                                                billingForm.data.billing_type === opt.value
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                            onClick={() => {
                                                billingForm.setData('billing_type', opt.value);
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {billingForm.errors.billing_type && (
                                    <p className="text-red-500 text-xs">{billingForm.errors.billing_type}</p>
                                )}
                            </div>
                        )}

                        {(selectedBilling || billingForm.data.billing_type === 'one_time') ? (
                            <div className="space-y-2">
                                <Label htmlFor="bill-due">Tanggal Jatuh Tempo *</Label>
                                <Input
                                    id="bill-due"
                                    type="date"
                                    value={billingForm.data.due_date}
                                    onChange={(e) => billingForm.setData('due_date', e.target.value)}
                                />
                                {billingForm.errors.due_date && (
                                    <p className="text-red-500 text-xs">{billingForm.errors.due_date}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 border-t pt-4 mt-2">
                                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider text-blue-600">Rentang Periode Bulanan</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bulan Mulai *</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={billingForm.data.monthly_start_month}
                                            onChange={(e) => billingForm.setData('monthly_start_month', e.target.value)}
                                        >
                                            <option value="">Pilih Bulan...</option>
                                            {[
                                                { value: '1', label: 'Januari' },
                                                { value: '2', label: 'Februari' },
                                                { value: '3', label: 'Maret' },
                                                { value: '4', label: 'April' },
                                                { value: '5', label: 'Mei' },
                                                { value: '6', label: 'Juni' },
                                                { value: '7', label: 'Juli' },
                                                { value: '8', label: 'Agustus' },
                                                { value: '9', label: 'September' },
                                                { value: '10', label: 'Oktober' },
                                                { value: '11', label: 'November' },
                                                { value: '12', label: 'Desember' },
                                            ].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                        </select>
                                        {billingForm.errors.monthly_start_month && (
                                            <p className="text-red-500 text-xs">{billingForm.errors.monthly_start_month}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tahun Mulai *</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={billingForm.data.monthly_start_year}
                                            onChange={(e) => billingForm.setData('monthly_start_year', e.target.value)}
                                        >
                                            {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                                <option key={y} value={y.toString()}>{y}</option>
                                            ))}
                                        </select>
                                        {billingForm.errors.monthly_start_year && (
                                            <p className="text-red-500 text-xs">{billingForm.errors.monthly_start_year}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bulan Selesai *</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={billingForm.data.monthly_end_month}
                                            onChange={(e) => billingForm.setData('monthly_end_month', e.target.value)}
                                        >
                                            <option value="">Pilih Bulan...</option>
                                            {[
                                                { value: '1', label: 'Januari' },
                                                { value: '2', label: 'Februari' },
                                                { value: '3', label: 'Maret' },
                                                { value: '4', label: 'April' },
                                                { value: '5', label: 'Mei' },
                                                { value: '6', label: 'Juni' },
                                                { value: '7', label: 'Juli' },
                                                { value: '8', label: 'Agustus' },
                                                { value: '9', label: 'September' },
                                                { value: '10', label: 'Oktober' },
                                                { value: '11', label: 'November' },
                                                { value: '12', label: 'Desember' },
                                            ].map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                        </select>
                                        {billingForm.errors.monthly_end_month && (
                                            <p className="text-red-500 text-xs">{billingForm.errors.monthly_end_month}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tahun Selesai *</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={billingForm.data.monthly_end_year}
                                            onChange={(e) => billingForm.setData('monthly_end_year', e.target.value)}
                                        >
                                            {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                                <option key={y} value={y.toString()}>{y}</option>
                                            ))}
                                        </select>
                                        {billingForm.errors.monthly_end_year && (
                                            <p className="text-red-500 text-xs">{billingForm.errors.monthly_end_year}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bill-due-day">Tanggal Jatuh Tempo Bulanan *</Label>
                                    <Input
                                        id="bill-due-day"
                                        type="number"
                                        min="1"
                                        max="31"
                                        placeholder="10"
                                        value={billingForm.data.monthly_due_day}
                                        onChange={(e) => billingForm.setData('monthly_due_day', e.target.value)}
                                    />
                                    <p className="text-slate-400 text-xs leading-relaxed font-normal">
                                        Jatuh tempo setiap tanggal yang ditentukan (misal: tanggal 10 tiap bulan). Untuk bulan pendek seperti Februari, akan otomatis disesuaikan ke tanggal terakhir bulan tersebut.
                                    </p>
                                    {billingForm.errors.monthly_due_day && (
                                        <p className="text-red-500 text-xs">{billingForm.errors.monthly_due_day}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Live Preview Box */}
                        {!selectedBilling && (
                            (() => {
                                let studentCount = 0;
                                if (billingForm.data.target_type === 'single') {
                                    studentCount = billingForm.data.student_id ? 1 : 0;
                                } else if (billingForm.data.target_type === 'multiple') {
                                    studentCount = billingForm.data.student_ids.length;
                                } else if (billingForm.data.target_type === 'classroom') {
                                    studentCount = getClassStudentCount(billingForm.data.classroom_id);
                                } else if (billingForm.data.target_type === 'all') {
                                    studentCount = students.length;
                                }

                                const monthCount = billingForm.data.billing_type === 'one_time' ? 1 : getMonthsCount();
                                const totalRecords = studentCount * monthCount;
                                const amount = parseFloat(billingForm.data.amount) || 0;
                                const discount = parseFloat(billingForm.data.discount) || 0;
                                const netAmount = Math.max(0, amount - discount);
                                const totalBill = totalRecords * netAmount;

                                if (totalRecords > 0) {
                                    return (
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-2 mt-4">
                                            <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Ringkasan Tagihan Baru</div>
                                            <div className="grid grid-cols-2 gap-y-1 text-sm text-slate-600">
                                                <div>Target Siswa:</div>
                                                <div className="font-semibold text-slate-800 text-right">{studentCount} Siswa</div>
                                                <div>Jumlah Bulan:</div>
                                                <div className="font-semibold text-slate-800 text-right">{monthCount} Bulan</div>
                                                <div>Total Invoice:</div>
                                                <div className="font-semibold text-slate-800 text-right">{totalRecords} Invoice</div>
                                                <div className="border-t border-blue-100 my-1 col-span-2"></div>
                                                <div className="font-medium text-blue-900">Estimasi Total Tagihan:</div>
                                                <div className="font-bold text-blue-900 text-right">{formatCurrency(totalBill)}</div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBillingDialog(false)}>Batal</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleSaveBilling}
                            disabled={billingForm.processing}
                        >
                            {billingForm.processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Input Pembayaran</DialogTitle>
                        <DialogDescription>
                            Catat pembayaran untuk tagihan {selectedBilling?.description}
                            {selectedBilling?.student && ` (${selectedBilling.student.name})`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBilling && (
                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-slate-500">Tagihan:</span>
                                    <span className="ml-2 font-bold">{formatCurrency(selectedBilling.amount)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Diskon:</span>
                                    <span className="ml-2">{formatCurrency(selectedBilling.discount)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Sudah Bayar:</span>
                                    <span className="ml-2 text-green-600">{formatCurrency(selectedBilling.total_paid)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Sisa:</span>
                                    <span className="ml-2 font-bold text-red-600">
                                        {formatCurrency(Number(selectedBilling.amount) - Number(selectedBilling.discount) - Number(selectedBilling.total_paid))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="pay-amount">Jumlah Pembayaran (Rp) *</Label>
                            <Input
                                id="pay-amount"
                                type="number"
                                placeholder="Masukkan jumlah..."
                                value={paymentForm.data.amount}
                                onChange={(e) => paymentForm.setData('amount', e.target.value)}
                            />
                            {paymentForm.errors.amount && (
                                <p className="text-red-500 text-xs">{paymentForm.errors.amount}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Metode Pembayaran *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'cash', label: 'Tunai (Cash)', icon: Wallet },
                                    { value: 'transfer', label: 'Transfer Bank', icon: CreditCard },
                                ].map(({ value, label, icon: Icon }) => (
                                    <Button
                                        key={value}
                                        variant="outline"
                                        className={`h-auto py-3 ${
                                            paymentForm.data.payment_method === value
                                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                : ''
                                        }`}
                                        onClick={() => paymentForm.setData('payment_method', value)}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {label}
                                    </Button>
                                ))}
                            </div>
                            {paymentForm.errors.payment_method && (
                                <p className="text-red-500 text-xs">{paymentForm.errors.payment_method}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pay-ref">Nomor Referensi</Label>
                            <Input
                                id="pay-ref"
                                placeholder="Nomor transfer / referensi..."
                                value={paymentForm.data.reference_number}
                                onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pay-notes">Catatan</Label>
                            <Input
                                id="pay-notes"
                                placeholder="Catatan tambahan..."
                                value={paymentForm.data.notes}
                                onChange={(e) => paymentForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Batal</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSavePayment}
                            disabled={paymentForm.processing}
                        >
                            {paymentForm.processing ? 'Memproses...' : 'Proses Pembayaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
