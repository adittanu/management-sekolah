import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Save, School, Bell, FileText, Database, Upload } from 'lucide-react';
import { useState } from 'react';

export default function SettingIndex() {
    const [activeTab, setActiveTab] = useState('profil');

    return (
        <AdminLayout title="Pengaturan Sistem">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan Sistem</h2>
                        <p className="text-slate-500">Konfigurasi profil sekolah, dokumen surat, jam KBM dan data sistem.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                    {[
                        { id: 'profil', label: 'Profil Sekolah', icon: School },
                        { id: 'jadwal', label: 'Jadwal & Bel', icon: Bell },
                        { id: 'dokumen', label: 'Dokumen & KOP', icon: FileText },
                        { id: 'data', label: 'Data & System', icon: Database },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-8">
                        {activeTab === 'profil' && (
                            <div className="grid md:grid-cols-[240px_1fr] gap-8">
                                {/* Logo Section */}
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Logo Sekolah</Label>
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group">
                                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                            <School className="w-10 h-10" />
                                        </div>
                                        <span className="text-xs text-slate-500 text-center">Klik gambar untuk ganti</span>
                                        <Input type="file" className="hidden" />
                                    </div>
                                </div>

                                {/* Form Section */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Nama Sekolah</Label>
                                        <Input defaultValue="Sekolah Kita Bisa Berkarya" className="h-11" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Alamat Lengkap</Label>
                                        <Input defaultValue="Jl. Bergerak Berkarya Berdampak" className="h-11" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Website</Label>
                                            <Input defaultValue="https://www.gendhis.a" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input defaultValue="kita.bisa.berkarya2018" className="h-11" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab !== 'profil' && (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                <span className="p-4 rounded-full bg-slate-50 mb-4">
                                    <Database className="w-8 h-8 opacity-20" />
                                </span>
                                <p>Pengaturan {activeTab} akan segera tersedia.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
