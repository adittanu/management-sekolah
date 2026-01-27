import { Link, Head, useForm, router } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { School, User, GraduationCap, BookOpen, Quote, ChevronRight, Scan, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState, useRef, FormEventHandler } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Standard Email Login Form
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false as boolean,
    });

    // QR & Tab State
    const [loginMethod, setLoginMethod] = useState<'manual' | 'qr'>('manual');
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [isScannerRunning, setIsScannerRunning] = useState(false);
    
    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Refs
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerRegionId = "html5qr-code-login-region";

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', { hour12: false }).replace(/\./g, ':');
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    };

    // Handle Email Login Submit
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // QR Scanner Lifecycle
    useEffect(() => {
        // If we are not in QR mode, ensure scanner is stopped
        if (loginMethod !== 'qr') {
            stopScanner();
            return;
        }

        // Delay slightly to ensure DOM element exists (Tabs transition)
        const timer = setTimeout(() => {
            startScanner();
        }, 300);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [loginMethod]);

    const startScanner = async () => {
        if (scannerRef.current) return;
        
        try {
            const html5QrCode = new Html5Qrcode(scannerRegionId);
            scannerRef.current = html5QrCode;

            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };
            
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // ignore frame parse errors, typical in scanning
                }
            );
            setIsScannerRunning(true);
            setScannerError(null);
        } catch (err) {
            console.error("Failed to start scanner", err);
            setScannerError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            setIsScannerRunning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
            scannerRef.current = null;
            setIsScannerRunning(false);
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        try {
            // Assume QR code contains raw identity_number or token
            // Send to backend for verification
            stopScanner(); // Stop first
            
            axios.post(route('auth.qr-login'), { token: decodedText })
                .then((response: any) => { // Type as any for quick fix, properly define type later
                    alert('Login Berhasil!');
                    window.location.href = response.data.redirect_url;
                })
                .catch((error: any) => { // Type as any for quick fix
                    console.error("QR Login Failed", error);
                    setScannerError("QR Code tidak valid atau user tidak ditemukan.");
                    setIsScannerRunning(false); 
                });

        } catch (e) {
            console.log("Error processing scan:", e);
            setScannerError("Gagal memproses QR Code.");
        }
    };

    const handleOtpVerification = () => {
        if (otp.length < 6) return;
        
        setIsVerifying(true);
        
        // Mock API call simulation
        setTimeout(() => {
            setIsVerifying(false);
            alert('Login Berhasil!');
            router.visit('/dashboard'); // Mock redirect
        }, 1000);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-blue-100 selection:text-blue-900 font-sans">
            <Head title="Log in - Sekolah Kita" />

            {/* Left Column - Hero / Brand (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col relative bg-slate-900 text-white overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/assets/modern_school_login_hero_1765972823477.png" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent mix-blend-multiply" />
                    <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col p-12 justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                           <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                <School className="w-6 h-6 text-white" />
                           </div>
                           <span className="font-bold text-lg tracking-wide uppercase">Sekolah Kita</span>
                        </div>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <Quote className="w-12 h-12 text-blue-400 opacity-50 absolute -top-8 -left-4" />
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight relative">
                            Pendidikan Berkualitas untuk <span className="text-blue-400">Masa Depan</span> yang Cerah.
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed relative">
                            Platform manajemen sekolah terintegrasi untuk mendukung kegiatan belajar mengajar yang lebih efektif, efisien, dan menyenangkan.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400 font-medium tracking-wide">
                        <span>© 2025 Sekolah Kita</span>
                        <div className="h-1 w-1 rounded-full bg-slate-600" />
                        <span>v2.0.0</span>
                    </div>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-slate-50/50">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    
                    {/* Header for Mobile */}
                    <div className="lg:hidden text-center mb-8">
                         <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600 shadow-xl shadow-blue-200 mb-4">
                            <School className="w-8 h-8 text-white" />
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900">Sekolah Kita</h2>
                    </div>

                    <div className="text-center lg:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            {formatDate(currentTime)}
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang Kembali</h2>
                        <p className="text-slate-500">Silakan masuk untuk mengakses dashboard akademik Anda.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <Tabs defaultValue="manual" onValueChange={(val) => setLoginMethod(val as 'manual' | 'qr')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="manual" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Masuk Manual
                                </TabsTrigger>
                                <TabsTrigger value="qr" className="flex items-center gap-2">
                                    <Scan className="h-4 w-4" />
                                    Scan QR
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="manual">
                                <form onSubmit={submit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="login" className="text-slate-700 font-semibold">Email / NIS / NIP</Label>
                                        <Input 
                                            id="login" 
                                            type="text" 
                                            name="login"
                                            value={data.login}
                                            autoComplete="off" // Disable autocomplete to prevent browser/extension interference
                                            onChange={(e) => setData('login', e.target.value)}
                                            placeholder="Masukkan Email, NIS, atau NIP" 
                                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50" 
                                        />
                                        <InputError message={errors.login} className="mt-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                                            {canResetPassword && (
                                                <Link
                                                    href={route('password.request')}
                                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    Lupa Password?
                                                </Link>
                                            )}
                                        </div>
                                        <Input 
                                            id="password" 
                                            type="password" 
                                            name="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••" 
                                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50" 
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>
                                    
                                    <Button disabled={processing} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all rounded-xl">
                                        Masuk Aplikasi <ChevronRight className="w-5 h-5 ml-1" />
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="qr">
                                <div className="flex flex-col items-center justify-center min-h-[300px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-4">
                                    <div 
                                        id={scannerRegionId} 
                                        className="w-full max-w-[250px] overflow-hidden rounded-xl bg-slate-900 shadow-inner"
                                        style={{ minHeight: '250px' }} 
                                    />
                                    
                                    {!isScannerRunning && !scannerError && (
                                        <div className="mt-4 flex flex-col items-center text-slate-500">
                                            <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-600" />
                                            <p className="text-sm font-medium">Menyiapkan kamera...</p>
                                        </div>
                                    )}

                                    {scannerError && (
                                        <div className="mt-4 flex flex-col items-center text-red-500 text-center gap-3">
                                            <p className="text-sm font-medium max-w-[200px]">{scannerError}</p>
                                            <Button variant="outline" size="sm" onClick={() => startScanner()} className="border-red-200 text-red-600 hover:bg-red-50">
                                                <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
                                            </Button>
                                        </div>
                                    )}
                                    
                                    <p className="mt-6 text-sm text-slate-500 text-center max-w-[280px]">
                                        Arahkan kamera ke <span className="font-bold text-slate-700">QR Code Login</span> pada kartu pelajar atau pegawai Anda.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>

                         <div className="mt-8 relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 font-medium">Atau masuk sebagai demo</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <Link 
                                href={route('siswa.dashboard')}
                                className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-green-50/50 hover:border-green-200 border border-transparent transition-all hover:shadow-md cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-green-700">MURID</span>
                            </Link>
                            
                            <Link 
                                href={route('guru.dashboard')}
                                className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 border border-transparent transition-all hover:shadow-md cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-700">GURU</span>
                            </Link>

                            <Link 
                                href={route('admin.dashboard')}
                                className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 border border-transparent transition-all hover:shadow-md cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 group-hover:text-purple-700">ADMIN</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Verification Modal */}
            <Dialog open={showOtpModal} onOpenChange={(open) => {
                if (!open && !isVerifying) {
                    setShowOtpModal(false);
                    setOtp('');
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verifikasi Keamanan</DialogTitle>
                        <DialogDescription>
                            Masukkan 6 digit kode PIN/OTP yang muncul di aplikasi authenticator Anda.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex flex-col items-center justify-center py-4 gap-4">
                        <div className="w-full max-w-[240px]">
                            <Input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setOtp(val);
                                }}
                                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                                placeholder="000000"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowOtpModal(false)}
                            disabled={isVerifying}
                        >
                            Batal
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleOtpVerification}
                            disabled={otp.length !== 6 || isVerifying}
                        >
                            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verifikasi & Masuk
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}