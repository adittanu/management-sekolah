import AdminLayout from '@/Layouts/AdminLayout';
import { mockReports } from '@/data/mockData';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { FileText, Download, Filter, MoreVertical } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"

export default function LaporanIndex() {
    return (
        <AdminLayout title="Laporan & Rekapitulasi">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Laporan & Rekapitulasi</h2>
                    <p className="text-slate-500">Pantau aktivitas dan unduh laporan kehadiran.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {/* Feed Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                                    Feed Laporan Terbaru
                                </h3>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </Button>
                            </div>

                            <div className="space-y-8 relative before:absolute before:left-4 before:top-4 before:h-full before:w-px before:bg-slate-200">
                                {mockReports.map((report, i) => (
                                    <div key={i} className="relative pl-10 flex gap-4">
                                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm overflow-hidden z-10 bg-slate-100">
                                             {report.avatar ? (
                                                 <img src={report.avatar} alt={report.user} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-[10px]">SYS</div>
                                            )}
                                        </div>
                                        <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-bold text-slate-900">{report.user}</span>
                                                    <span className="text-slate-500 text-sm mx-2">•</span>
                                                    <span className="text-slate-500 text-sm">{report.time}</span>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </Button>
                                            </div>
                                            <p className="text-slate-700 mt-1">{report.action}</p>
                                            <div className="mt-3 flex gap-2">
                                                <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-500">
                                                    Jurnal Kelas
                                                </div>
                                                <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-500">
                                                    Kehadiran
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="relative pl-10">
                                     <Button variant="outline" className="w-full text-slate-500">
                                        Muat Lebih Banyak
                                     </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Export Card */}
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    Export Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">Pilih Guru</label>
                                    <Select>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="Pilih Guru..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Guru</SelectItem>
                                            <SelectItem value="budi">Pak Budi Hartono</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-300">Bulan</label>
                                    <Select>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="Pilih Bulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12">Desember 2025</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-500 mt-2">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Rekap
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-orange-50 border-orange-100 shadow-sm">
                            <CardContent className="p-6">
                                <h4 className="font-bold text-orange-800 mb-2">Perhatian</h4>
                                <p className="text-sm text-orange-700 leading-relaxed">
                                    Pastikan semua guru telah mengisi jurnal harian sebelum melakukan export rekapitulasi bulanan untuk memastikan keakuratan data.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
