import { Link, Head } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { School, User, GraduationCap, Lock, LogIn, BookOpen, Quote, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const [currentTime, setCurrentTime] = useState(new Date());

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

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-blue-100 selection:text-blue-900 font-sans">
            <Head title="Login - Sekolah Kita" />

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
                        <form className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-700 font-semibold">Username / NIS / NIP</Label>
                                <Input 
                                    id="username" 
                                    placeholder="Contoh: 12345678" 
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50" 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                                    <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">Lupa Password?</a>
                                </div>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50" 
                                />
                            </div>
                            
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all rounded-xl">
                                Masuk Aplikasi <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>
                        </form>

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
        </div>
    );
}
