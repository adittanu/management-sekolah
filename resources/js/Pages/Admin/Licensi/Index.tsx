import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Lock, ShieldCheck, CheckCircle2, Key, Phone } from 'lucide-react';

export default function LicensiIndex() {
    return (
        <AdminLayout title="Lisensi Aplikasi">
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pusat Aktivasi Lisensi</h2>
                    <p className="text-slate-500">Kelola status langganan dan akses fitur premium aplikasi Monitoring KBM.</p>
                </div>

                <div className="grid lg:grid-cols-[400px_1fr] gap-8">
                    {/* Dark Card */}
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-2xl">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16"></div>
                            
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">STATUS APLIKASI</div>
                                        <h3 className="text-3xl font-bold text-white">TRIAL VERSION</h3>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                        <Lock className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                                    <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">LICENSE KEY</div>
                                    <div className="font-mono text-xl tracking-wider text-red-400">BELUM ADA LISENSI</div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                                    <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">PEMILIK (SEKOLAH)</div>
                                    <div className="font-medium text-lg">Sekolah Kita Bisa Berkarya</div>
                                </div>
                            </div>
                        </div>

                        {/* Input Activation */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <h4 className="font-bold text-slate-900">Input Kode Aktivasi</h4>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input placeholder="Tempel kode" className="pl-9 bg-slate-50 border-slate-200" disabled />
                                    </div>
                                    <Button className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-lg shadow-blue-600/20">
                                        AKTIFKAN
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Features List */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-sm h-full bg-blue-50/50">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                    <h3 className="text-lg font-bold text-slate-900">Fitur Premium</h3>
                                </div>
                                
                                <ul className="space-y-5">
                                    {[
                                        "Unlimited Siswa & Guru",
                                        "Akses Penuh Laporan Historis",
                                        "Export PDF & Excel Tanpa Watermark",
                                        "Prioritas Support 24/7",
                                        "Update Fitur Otomatis",
                                        "Custom KOP Surat & Logo Sekolah"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="rounded-2xl bg-blue-600 p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-bold text-xl mb-2">Butuh Bantuan?</h4>
                                <p className="text-blue-100 text-sm mb-6 max-w-sm">
                                    Hubungi tim support kami jika Anda mengalami kendala aktivasi atau ingin melakukan pembelian lisensi baru.
                                </p>
                                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none font-bold">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Hubungi Support (WA)
                                </Button>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
