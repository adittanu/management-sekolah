import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Scan, Mail, Loader2, RefreshCw } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    // Standard Email Login Form
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    // QR Login State
    const [loginMethod, setLoginMethod] = useState<'email' | 'qr'>('email');
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [isScannerRunning, setIsScannerRunning] = useState(false);
    
    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Refs
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerRegionId = "html5qr-code-full-region";

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
        if (scannerRef.current) return; // Already running logic might be tricky, best to ensure clean start
        
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
            const data = JSON.parse(decodedText);
            // Mock Verification
            if (data && data.type === 'login_token') {
                stopScanner(); // Stop scanning immediately
                setShowOtpModal(true);
            } else {
               // Maybe show a toast or error for invalid QR? 
               // For now just ignore non-login QRs or log them
               console.log("Invalid QR type:", data);
            }
        } catch (e) {
            console.log("Invalid JSON:", decodedText);
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
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Tabs defaultValue="email" onValueChange={(val) => setLoginMethod(val as 'email' | 'qr')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Login
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="flex items-center gap-2">
                        <Scan className="h-4 w-4" />
                        QR Code
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                    <form onSubmit={submit}>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4 block">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData(
                                            'remember',
                                            (e.target.checked || false) as false,
                                        )
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Forgot your password?
                                </Link>
                            )}

                            <PrimaryButton className="ms-4" disabled={processing}>
                                Log in
                            </PrimaryButton>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="qr">
                    <div className="flex flex-col items-center justify-center min-h-[300px] bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 p-4">
                        <div 
                            id={scannerRegionId} 
                            className="w-full max-w-sm overflow-hidden rounded-lg bg-black"
                            style={{ minHeight: '250px' }} 
                        />
                        
                        {!isScannerRunning && !scannerError && (
                            <div className="mt-4 flex flex-col items-center text-slate-500">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <p>Menyiapkan kamera...</p>
                            </div>
                        )}

                        {scannerError && (
                            <div className="mt-4 flex flex-col items-center text-red-500 text-center">
                                <p className="mb-2">{scannerError}</p>
                                <Button variant="outline" size="sm" onClick={() => startScanner()}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
                                </Button>
                            </div>
                        )}
                        
                        <p className="mt-4 text-sm text-slate-500 text-center">
                            Arahkan kamera ke QR Code Login Anda untuk masuk.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            {/* OTP Verification Modal */}
            <Dialog open={showOtpModal} onOpenChange={(open) => {
                // Prevent closing if verifying, otherwise allow closing (which should reset state ideally)
                if (!open && !isVerifying) {
                    setShowOtpModal(false);
                    setOtp('');
                    // Optional: restart scanner if they close modal? 
                    // For now, let's assume they might want to switch back to email or rescan manually
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
        </GuestLayout>
    );
}
