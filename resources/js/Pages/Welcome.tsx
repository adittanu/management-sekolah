import { Link, Head } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { School, MapPin, Shield, User, GraduationCap, Lock, LogIn } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-50 flex flex-col relative">
            <Head title="Login Aplikasi" />

            {/* Blue Header Background */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-br from-blue-600 to-blue-700 z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                
                {/* Header Content */}
                <div className="text-center text-white mb-8 space-y-2">
                    <p className="text-sm font-medium tracking-widest opacity-90">{formatDate(currentTime)}</p>
                    <h1 className="text-6xl font-bold tracking-tight font-mono mb-6">{formatTime(currentTime)}</h1>
                    
                    <div className="flex flex-col items-center gap-4 mt-8">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 shadow-lg">
                            <div className="w-full h-full rounded-full border-2 border-blue-600 flex items-center justify-center">
                                <School className="w-10 h-10 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-wide drop-shadow-md">SEKOLAH KITA BISA BERKARYA</h2>
                            <p className="text-blue-100 mt-1 opacity-90">Sistem Informasi Monitoring KBM (Intelijen Kelas)</p>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="w-full max-w-md shadow-2xl border-none backdrop-blur-sm bg-white/95">
                    <CardContent className="p-8 pt-10">
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <Input id="username" placeholder="Masukkan username" className="pl-10 h-11" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <Input id="password" type="password" placeholder="Masukkan password" className="pl-10 h-11" />
                                </div>
                            </div>
                            
                            <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-lg font-medium shadow-lg shadow-blue-600/20">
                                <LogIn className="w-5 h-5 mr-2" />
                                Masuk Aplikasi
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-4">Pilih Akun Demo</p>
                            <div className="grid grid-cols-3 gap-4">
                                <button className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-105 shadow-lg shadow-green-500/20">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold">AGEN</span>
                                </button>
                                
                                <button className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-105 shadow-lg shadow-blue-500/20">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold">INTEL</span>
                                </button>

                                <Link 
                                    href={route('admin.dashboard')}
                                    className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold">ADMIN</span>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <a href="#" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">i</div>
                                Informasi Aplikasi & Pemesanan
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-slate-400 text-xs">
                    © 2025 Sekolah Kita Bisa Berkarya v1.0
                </div>
            </div>
        </div>
    );
}
