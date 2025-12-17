import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import {
    BookOpen,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    Users,
    Video,
    Clock,
    CheckSquare,
    Filter,
    PlayCircle,
    ExternalLink,
    GraduationCap,
    LogIn,
    Box,
    FileCode,
    UploadCloud,
    Download
} from 'lucide-react';

export default function LMSIndex() {
    const [view, setView] = useState<'DASHBOARD' | 'COURSE'>('DASHBOARD');
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false); // For Activities
    const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false); // For New Course
    const [contentType, setContentType] = useState<'SELECT' | 'DOC' | 'VIDEO' | 'H5P' | 'SCORM' | 'QUIZ' | 'ASSIGNMENT'>('SELECT');

    // State for Dynamic Data
    const [courses, setCourses] = useState([
        { id: 1, title: "Matematika Kelas X", category: "Sains", teacher: "Budi Santoso", progress: 65, cover: "bg-blue-600" },
        { id: 2, title: "Fisika Dasar XI", category: "Sains", teacher: "Siti Aminah", progress: 40, cover: "bg-indigo-600" },
        { id: 3, title: "Bahasa Inggris Conversation", category: "Bahasa", teacher: "John Doe", progress: 80, cover: "bg-green-600" },
        { id: 4, title: "Sejarah Indonesia", category: "Sosial", teacher: "Dewi Lestari", progress: 20, cover: "bg-orange-600" },
    ]);

    const [courseSections, setCourseSections] = useState([
        {
            id: 1, title: "General", items: [
                { id: 101, type: 'DOC', title: 'Silabus Mata Pelajaran', icon: FileText, color: 'text-blue-600' },
                { id: 102, type: 'FORUM', title: 'Forum Diskusi & Pengumuman', icon: Users, color: 'text-purple-600' }
            ]
        },
        {
            id: 2, title: "Topik 1: Pengenalan Aljabar", items: [
                { id: 201, type: 'VIDEO', title: 'Video Materi: Konsep Dasar Aljabar', icon: Video, color: 'text-red-600' },
                { id: 202, type: 'DOC', title: 'Modul Bacaan: Aljabar Linear.pdf', icon: FileText, color: 'text-blue-600' },
                { id: 203, type: 'H5P', title: 'Interactive Video: Latihan Soal', icon: Box, color: 'text-indigo-600' }
            ]
        },
        {
            id: 3, title: "Topik 2: Persamaan Linear", items: [
                { id: 301, type: 'SCORM', title: 'Materi Interaktif SCORM', icon: FileCode, color: 'text-orange-600' },
                { id: 302, type: 'ASSIGNMENT', title: 'Tugas: Penyelesaian Masalah', icon: GraduationCap, color: 'text-purple-600' },
                { id: 303, type: 'QUIZ', title: 'Kuis Harian 2', icon: CheckSquare, color: 'text-green-600' }
            ]
        }
    ]);

    const [newCourse, setNewCourse] = useState({ title: '', category: '', teacher: '' });

    const handleCreateCourse = () => {
        const course = {
            id: courses.length + 1,
            title: newCourse.title || "New Course",
            category: newCourse.category || "General",
            teacher: newCourse.teacher || "Admin",
            progress: 0,
            cover: "bg-slate-600"
        };
        setCourses([...courses, course]);
        setNewCourse({ title: '', category: '', teacher: '' });
        setIsCreateCourseOpen(false);
        // Auto navigate to the new course
        setSelectedCourse(course);
        setCourseSections([ // Reset sections for new course
            { id: 1, title: "General", items: [] },
            { id: 2, title: "Topic 1", items: [] },
            { id: 3, title: "Topic 2", items: [] },
            { id: 4, title: "Topic 3", items: [] },
        ]);
        setView('COURSE');
    };

    const handleAddTopic = () => {
        const newId = courseSections.length + 1;
        setCourseSections([...courseSections, {
            id: newId,
            title: `Topic ${courseSections.length}`,
            items: []
        }]);
    };

    const contentTypes = [
        { id: 'DOC', label: 'Dokumen', icon: FileText, desc: 'PDF, Word, PPT', color: 'bg-blue-100 text-blue-600' },
        { id: 'VIDEO', label: 'Video', icon: Video, desc: 'MP4, YouTube URL', color: 'bg-red-100 text-red-600' },
        { id: 'H5P', label: 'Interactive H5P', icon: Box, desc: 'Interactive Video, Quiz', color: 'bg-indigo-100 text-indigo-600' },
        { id: 'SCORM', label: 'SCORM Package', icon: FileCode, desc: 'E-Learning Standard', color: 'bg-orange-100 text-orange-600' },
        { id: 'QUIZ', label: 'Kuis Online', icon: CheckSquare, desc: 'Pilihan Ganda & Essay', color: 'bg-green-100 text-green-600' },
        { id: 'ASSIGNMENT', label: 'Tugas', icon: GraduationCap, desc: 'Upload File Siswa', color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <AdminLayout title="LMS (E-Learning)">
            {/* Create Course Dialog */}
            <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Course Baru</DialogTitle>
                        <DialogDescription>
                            Isi detail mata pelajaran baru. Struktur topik akan dibuat otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nama Mata Pelajaran</Label>
                            <Input 
                                placeholder="Contoh: Biologi Kelas XII" 
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Kategori / Jurusan</Label>
                            <Input 
                                placeholder="Contoh: Sains" 
                                value={newCourse.category}
                                onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Pengajar Utama</Label>
                            <Input 
                                placeholder="Nama Guru" 
                                value={newCourse.teacher}
                                onChange={(e) => setNewCourse({...newCourse, teacher: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateCourseOpen(false)}>Batal</Button>
                        <Button onClick={handleCreateCourse} className="bg-indigo-600">Buat Course</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Content Creator Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>

                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {contentType === 'SELECT' ? 'Tambahkan Aktivitas atau Sumber Daya' : `Buat ${contentTypes.find(c => c.id === contentType)?.label}`}
                        </DialogTitle>
                        <DialogDescription>
                            {contentType === 'SELECT' ? 'Pilih jenis konten yang ingin ditambahkan ke topik ini.' : 'Lengkapi detail konten berikut.'}
                        </DialogDescription>
                    </DialogHeader>

                    {contentType === 'SELECT' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                            {contentTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setContentType(type.id as any)}
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-500 transition-all group text-center"
                                >
                                    <div className={`p-4 rounded-full mb-3 group-hover:scale-110 transition-transform ${type.color}`}>
                                        <type.icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-semibold text-slate-700">{type.label}</span>
                                    <span className="text-xs text-slate-400 mt-1">{type.desc}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Judul Konten</Label>
                                <Input placeholder={`Masukkan judul ${contentTypes.find(c => c.id === contentType)?.label}...`} />
                            </div>
                            
                            {(contentType === 'DOC' || contentType === 'H5P' || contentType === 'SCORM') && (
                                <div className="grid gap-2">
                                    <Label>Upload File ({contentTypes.find(c => c.id === contentType)?.desc})</Label>
                                    <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                                        <p className="text-sm font-medium text-slate-700">Klik untuk upload atau drag & drop</p>
                                    </div>
                                </div>
                            )}
                             {contentType === 'VIDEO' && (
                                <div className="grid gap-2">
                                    <Label>Sumber Video</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Button variant="outline" className="flex-1">YouTube URL</Button>
                                        <Button variant="outline" className="flex-1">Upload MP4</Button>
                                    </div>
                                    <Input placeholder="https://youtube.com/watch?v=..." />
                                </div>
                            )}
                            {(contentType === 'QUIZ' || contentType === 'ASSIGNMENT') && (
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="grid gap-2"><Label>Start Date</Label><Input type="date" /></div>
                                     <div className="grid gap-2"><Label>Due Date</Label><Input type="date" /></div>
                                </div>
                            )}
                         </div>
                    )}
                    <DialogFooter>
                        {contentType !== 'SELECT' && <Button variant="ghost" onClick={() => setContentType('SELECT')}>Back</Button>}
                        {contentType !== 'SELECT' && <Button className="bg-indigo-600">Add Activity</Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-6">
                {/* Header Section */}
                {view === 'DASHBOARD' ? (
                    <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Course Dashboard</h2>
                            <p className="text-slate-500">Kelola mata pelajaran dan konten pembelajaran Anda.</p>
                        </div>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsCreateCourseOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Buat Course Baru
                        </Button>
                    </div>

                    {/* Dashboard Content */}
                    <div className="space-y-8 animate-in fade-in-50">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Mata Pelajaran</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-1">4</h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                                            <span className="bg-green-100 px-1.5 py-0.5 rounded">+1 Baru</span>
                                            <span className="text-slate-400">Semester ini</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                </CardContent>
                            </Card>
                             <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Tugas Belum Selesai</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-1">12</h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 font-medium">
                                            <span className="bg-orange-100 px-1.5 py-0.5 rounded">3 Deadline Dekat</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                </CardContent>
                            </Card>
                             <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Rata-rata Nilai</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-1">85.4</h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-indigo-600 font-medium">
                                            <span className="bg-indigo-100 px-1.5 py-0.5 rounded">Top 10%</span>
                                            <span className="text-slate-400">di Angkatan</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <GraduationCap className="w-8 h-8" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                         {/* Continue Learning Hero */}
                        <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
                            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 max-w-2xl">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-3">Lanjutkan Belajar</Badge>
                                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">Fisika Dasar XI: Hukum Newton & Gaya Gravitasi</h2>
                                    <p className="text-indigo-100 text-lg">Anda baru menyelesaikan 40% dari topik ini. Lanjutkan quiz terakhir untuk menyelesaikan modul.</p>
                                    <div className="flex gap-4 pt-2">
                                        <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-none">
                                            <PlayCircle className="w-5 h-5 mr-2" /> Lanjutkan Materi
                                        </Button>
                                        <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                                            Lihat Detail
                                        </Button>
                                    </div>
                                </div>
                                <div className="hidden md:block relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 flex items-center justify-center relative">
                                        <div className="text-center">
                                            <span className="text-4xl font-bold">40%</span>
                                            <p className="text-xs text-indigo-200 uppercase tracking-widest mt-1">Completed</p>
                                        </div>
                                         <svg className="absolute inset-0 w-full h-full -rotate-90 stroke-white" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="46" fill="none" strokeWidth="8" strokeDasharray="289" strokeDashoffset="173" strokeLinecap="round" className="opacity-100" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Course List Header */}
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Daftar Mata Pelajaran</h3>
                                <p className="text-slate-500">Akses semua materi pembelajaran Anda di sini.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input placeholder="Cari pelajaran..." className="pl-9" />
                                </div>
                                <Button variant="outline"><Filter className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses.map((course) => (
                                <Card key={course.id} className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden border-slate-200 flex flex-col h-full" onClick={() => { setSelectedCourse(course); setView('COURSE'); }}>
                                    <div className={`h-36 ${course.cover} relative`}>
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                        <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 backdrop-blur-sm border-none shadow-sm">{course.category}</Badge>
                                    </div>
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 min-w-[24px]">
                                                {course.teacher.charAt(0)}
                                            </div>
                                            <span className="truncate">{course.teacher}</span>
                                        </div>
                                        <div className="space-y-2 mt-auto">
                                            <div className="flex justify-between text-xs text-slate-500 font-medium">
                                                <span>Progress Selesai</span>
                                                <span className={course.progress === 100 ? 'text-green-600' : 'text-indigo-600'}>{course.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${course.progress}%` }} />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 text-right border-t border-slate-50 mt-auto bg-slate-50/50">
                                        <div className="w-full flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Terakhir: 2 jam lalu</span>
                                            <span className="text-xs font-bold text-indigo-600 group-hover:underline">Akses Kelas &rarr;</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                    </>
                ) : (
                    <>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
                         <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 cursor-pointer hover:text-indigo-600" onClick={() => setView('DASHBOARD')}>
                                <span>Dashboard</span> <span className="text-slate-300">/</span> <span>My Courses</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">{selectedCourse?.title}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">{selectedCourse?.category}</Badge>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Users className="w-4 h-4" /> {selectedCourse?.teacher}
                                </div>
                            </div>
                        </div>
                         <div className="flex gap-2">
                            <Button variant="outline"><Users className="w-4 h-4 mr-2" /> Participants</Button>
                            <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> Grades</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Course Content (Topics) */}
                        <div className="lg:col-span-3 space-y-6">
                            {courseSections.map((section) => (
                                <Card key={section.id} className="border-slate-200 shadow-sm">
                                    <CardHeader className="bg-slate-50/50 py-3 px-4 border-b">
                                        <CardTitle className="text-lg font-bold text-slate-800">{section.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-100">
                                            {section.items.map((item: any) => (
                                                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                                                    <div className={`p-3 rounded-lg bg-slate-100 ${item.color}`}>
                                                        <item.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{item.type}</span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <div className="p-4">
                                                 <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 w-full justify-start pl-2" onClick={() => setIsCreateOpen(true)}>
                                                    <Plus className="w-4 h-4 mr-2" /> Add an activity or resource
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {/* Add Topic Button */}
                            <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group" onClick={handleAddTopic}>
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    <Plus className="w-6 h-6 mb-1" />
                                    <span className="font-medium">Tambahkan Topik / Pertemuan Baru</span>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Blocks */}
                        {/* Sidebar / Blocks */}
                        <div className="space-y-6">
                            {/* Course Completion */}
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm">Course Completion</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <div className="text-3xl font-bold text-indigo-600 mb-1">65%</div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                            <div className="h-full bg-indigo-600 w-[65%]" />
                                        </div>
                                        <p className="text-xs text-slate-500">Status kelulusan Anda</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Upcoming Deadlines */}
                            <Card className="border-l-4 border-l-orange-500">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-orange-500" /> 
                                        Upcoming Deadlines
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg text-center min-w-[50px]">
                                            <span className="block text-xs font-bold uppercase">Oct</span>
                                            <span className="block text-xl font-bold">24</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 line-clamp-2">Tugas: Penyelesaian Masalah</p>
                                            <p className="text-xs text-slate-500 mt-1">Due in 2 days</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-slate-100 text-slate-600 p-2 rounded-lg text-center min-w-[50px]">
                                            <span className="block text-xs font-bold uppercase">Oct</span>
                                            <span className="block text-xl font-bold">28</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 line-clamp-2">Kuis Harian 2</p>
                                            <p className="text-xs text-slate-500 mt-1">Due next week</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Instructor Info */}
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm">Instructor</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {selectedCourse?.teacher.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{selectedCourse?.teacher}</p>
                                            <p className="text-xs text-slate-500">Teacher</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                        <Users className="w-3 h-3 mr-2" /> Message Instructor
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Resources */}
                             <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" /> 
                                        Quick Resources
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <a href="#" className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 group">
                                        <Download className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                                        <span>Download Syllabus PDF</span>
                                    </a>
                                     <a href="#" className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 group">
                                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                                        <span>Reference Book Link</span>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
