import AdminLayout from '@/Layouts/AdminLayout';
import { mockReports } from '@/data/mockData';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { FileText, Download, Filter, MoreVertical, BarChart3, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { useState } from 'react';

export default function LaporanIndex() {
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);

    // Mock Generated Files
    const generatedFiles = [
        { id: 1, name: "Rekap Absensi - November 2025", type: "PDF", size: "2.4 MB", date: "01 Des 2025", status: "Ready" },
        { id: 2, name: "Jurnal Mengajar - November 2025", type: "XLSX", size: "1.8 MB", date: "01 Des 2025", status: "Ready" },
        { id: 3, name: "Rekap Nilai UTS - Ganjil", type: "PDF", size: "4.2 MB", date: "15 Okt 2025", status: "Ready" },
        { id: 4, name: "Laporan Aktivitas Guru - Okt", type: "PDF", size: "1.2 MB", date: "01 Nov 2025", status: "Archived" },
    ];

    return (
        <AdminLayout title="Laporan & Rekapitulasi">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="bg-orange-100 p-2 rounded-lg">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">Laporan & Arsip</h2>
                        </div>
                        <p className="text-slate-500">Pusat data, rekapitulasi, dan log aktivitas sistem.</p>
                    </div>
                    <Button 
                        onClick={() => setIsGenerateOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Generate Laporan Baru
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText className="w-24 h-24" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Laporan Generated</p>
                            <h3 className="text-3xl font-bold">128</h3>
                            <div className="flex items-center gap-1 mt-2 text-xs text-blue-100 bg-white/10 w-fit px-2 py-1 rounded">
                                <CheckCircle className="w-3 h-3" /> 24 Bulan Ini
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">Aktivitas Hari Ini</p>
                                    <h3 className="text-3xl font-bold text-slate-800">45</h3>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <span className="font-bold">+12%</span> dari kemarin
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">Menunggu Review</p>
                                    <h3 className="text-3xl font-bold text-slate-800">12</h3>
                                </div>
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Perlu tindakan Waka Kurikulum</p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">Storage Used</p>
                                    <h3 className="text-3xl font-bold text-slate-800">2.4 GB</h3>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Download className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-purple-500 w-[45%] rounded-full"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <Tabs defaultValue="files" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200 p-1 w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto">
                        <TabsTrigger value="files" className="px-6 py-2.5 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Arsip File Laporan</TabsTrigger>
                        <TabsTrigger value="activity" className="px-6 py-2.5 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Log Aktivitas Sistem</TabsTrigger>
                    </TabsList>

                    <TabsContent value="files" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {generatedFiles.map((file) => (
                                <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border ${
                                            file.type === 'PDF' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                            {file.type}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{file.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {file.date}</span>
                                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {file.size}</span>
                                                {file.status === 'Ready' 
                                                    ? <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 h-5 px-1.5">Ready</Badge>
                                                    : <Badge variant="outline" className="text-slate-500 bg-slate-100 border-slate-200 h-5 px-1.5">Archived</Badge>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="hidden md:flex text-slate-500 hover:text-slate-900">Preview</Button>
                                        <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:border-blue-200">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="activity">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                    Live Feed
                                </h3>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filter Log
                                </Button>
                            </div>

                            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:h-[95%] before:w-px before:bg-slate-200">
                                {mockReports.map((report, i) => (
                                    <div key={i} className="relative pl-12 group">
                                        <div className="absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white shadow-sm overflow-hidden z-10 bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                             {report.avatar ? (
                                                 <img src={report.avatar} alt={report.user} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400">SYS</span>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">{report.user}</span>
                                                    <span className="text-slate-400 text-xs ml-2 font-normal">{report.time}</span>
                                                </div>
                                                <Badge variant="secondary" className="bg-white text-xs font-normal text-slate-500 shadow-none border border-slate-200">
                                                    {report.role}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed">{report.action}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Generate Report Dialog */}
                <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                            <DialogTitle className="text-xl font-bold text-slate-900">Generate Laporan Baru</DialogTitle>
                            <DialogDescription>
                                Pilih parameter laporan yang ingin dibuat.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Jenis Laporan</Label>
                                <Select>
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Pilih Jenis Laporan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="presensi_siswa">Rekapitulasi Presensi Siswa & Guru</SelectItem>
                                        <SelectItem value="jurnal_guru">Jurnal Mengajar Guru</SelectItem>
                                        <SelectItem value="nilai_akademik">Rekap Nilai Akademik</SelectItem>
                                        <SelectItem value="aktivitas_sistem">Log Aktivitas Sistem</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Periode Awal</Label>
                                    <Input type="date" className="bg-slate-50 border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Periode Akhir</Label>
                                    <Input type="date" className="bg-slate-50 border-slate-200" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Format Output</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 border border-slate-200 p-3 rounded-lg flex-1 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all">
                                        <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">PDF</div>
                                        <span className="text-sm font-medium text-slate-700">Dokumen PDF</span>
                                    </div>
                                    <div className="flex items-center gap-2 border border-slate-200 p-3 rounded-lg flex-1 cursor-pointer hover:bg-slate-50 hover:border-green-300 transition-all">
                                        <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">XLS</div>
                                        <span className="text-sm font-medium text-slate-700">Excel Spreadsheet</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex gap-2 items-start">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Proses generate mungkin memakan waktu beberapa saat tergantung banyaknya data. Notifikasi akan muncul saat file siap.</p>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Batal</Button>
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]">
                                <Download className="w-4 h-4 mr-2" />
                                Process
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
