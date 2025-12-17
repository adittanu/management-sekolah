import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/Components/ui/card';
import { Lock, ShieldCheck, CheckCircle2, Key, Phone, Sparkles, Zap, Star, Crown } from 'lucide-react';

export default function LicensiIndex() {
    return (
        <AdminLayout title="Lisensi Aplikasi">
            <div className="space-y-12">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-slate-900">Pilih Paket Lisensi</h2>
                    <p className="text-lg text-slate-500">Upgrade ke versi berbayar untuk membuka potensi penuh aplikasi dengan fitur canggih dan dukungan prioritas.</p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
                    {/* Premium Plan */}
                    <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck className="w-32 h-32 text-blue-600" />
                        </div>
                        <CardHeader className="pb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold w-fit mb-4">
                                <Star className="w-3 h-3 fill-current" />
                                POPULER
                            </div>
                            <CardTitle className="text-3xl font-bold text-slate-900">Premium</CardTitle>
                            <CardDescription className="text-lg mt-2">Solusi lengkap untuk manajemen sekolah modern.</CardDescription>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-slate-900">Rp 1.5jt</span>
                                <span className="text-slate-500">/ tahun</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="font-medium text-slate-900">Fitur Unggulan:</p>
                            <ul className="space-y-4">
                                {[
                                    "Unlimited Data Siswa & Guru",
                                    "Export Laporan (PDF/Excel) Tanpa Watermark",
                                    "Custom KOP Surat & Logo Sekolah",
                                    "Backup & Restore Database",
                                    "Akses Log Aktivitas Sistem",
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-8">
                            <Button className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg font-bold">
                                Pilih Premium
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Ultra Plan */}
                    <Card className="border-purple-200 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden bg-gradient-to-b from-white to-purple-50/50">
                         <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"></div>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-32 h-32 text-purple-600" />
                        </div>
                        <CardHeader className="pb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold w-fit mb-4 border border-purple-200">
                                <Crown className="w-3 h-3 fill-current" />
                                BEST VALUE
                            </div>
                            <CardTitle className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                Ultra <span className="text-purple-600">AI</span>
                            </CardTitle>
                            <CardDescription className="text-lg mt-2">Kecerdasan buatan untuk efisiensi maksimal.</CardDescription>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-slate-900">Rp 2.5jt</span>
                                <span className="text-slate-500">/ tahun</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="font-medium text-purple-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                Everything in Premium, plus:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "AI Smart Schedule Generator (Anti-Bentrok)",
                                    "Analisis Performa Siswa Berbasis AI",
                                    "Prediksi Nilai & Rekomendasi Pembelajaran",
                                    "Otomatisasi Laporan Wali Kelas",
                                    "Prioritas Support 24/7 (Jalur Khusus)",
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                        <div className="bg-purple-100 rounded-full p-0.5 mt-0.5">
                                            <Zap className="w-3.5 h-3.5 text-purple-600" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-8">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg font-bold shadow-lg shadow-purple-200 border-0">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Beli Ultra AI
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Activation Section */}
                <div className="max-w-4xl mx-auto pt-10 border-t">
                    <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20 -mr-20 -mt-20"></div>
                        
                        <div className="flex-1 space-y-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Sudah punya kode lisensi?</h3>
                                <p className="text-slate-400">Masukkan kode 16-digit yang Anda terima di email pembelian untuk mengaktifkan aplikasi.</p>
                            </div>
                            
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">STATUS SEKARANG</span>
                                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">TRIAL</span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Key className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                        <Input 
                                            placeholder="XXXX-XXXX-XXXX-XXXX" 
                                            className="pl-10 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-700 font-mono tracking-widest uppercase" 
                                        />
                                    </div>
                                    <Button className="h-12 bg-blue-600 hover:bg-blue-700 font-bold px-8">
                                        AKTIFKAN
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-px md:h-32 bg-slate-800"></div>

                        <div className="shrink-0 text-center md:text-left space-y-4 relative z-10">
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <div className="p-3 bg-white/10 rounded-full">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">Butuh Bantuan?</div>
                                    <div className="text-slate-400 text-sm">Tim kami siap membantu 24/7</div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full bg-transparent border-slate-700 text-white hover:bg-white/5 hover:text-white">
                                Chat WhatsApp Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
