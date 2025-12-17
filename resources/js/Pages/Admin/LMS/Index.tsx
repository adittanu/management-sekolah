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
import { Separator } from "@/Components/ui/separator";
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
    Download,
    MessageSquare,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Menu,
    Send,
    UserCircle,
    Maximize2
} from 'lucide-react';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";

export default function LMSIndex() {
    const [view, setView] = useState<'DASHBOARD' | 'COURSE' | 'ACTIVITY'>('DASHBOARD');
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false); 
    const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
    const [contentType, setContentType] = useState<'SELECT' | 'DOC' | 'VIDEO' | 'H5P' | 'SCORM' | 'QUIZ' | 'ASSIGNMENT'>('SELECT');
    
    // Activity Detail State
    const [viewActivity, setViewActivity] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile/toggle

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
                { id: 102, type: 'FORUM', title: 'Forum Diskusi: Perkenalan', icon: Users, color: 'text-purple-600' }
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

    // Mock Detail Data Generator
    const getActivityDetail = (item: any) => {
        const details: any = { ...item };
        
        if (item.type === 'DOC') {
            details.fileSize = '2.4 MB';
            details.fileType = 'PDF Document';
            // Use a sample PDF for preview
            details.url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; 
            details.desc = 'Dokumen ini berisi panduan lengkap dan silabus untuk satu semester ke depan. Harap dibaca dengan teliti.';
        } else if (item.type === 'VIDEO') {
            details.duration = '14:20';
            details.source = 'YouTube';
            // Use a sample YouTube embed
            details.url = 'https://www.youtube.com/embed/jfKfPfyJRdk'; 
            details.desc = 'Video penjelasan mendalam mengenai konsep dasar yang akan kita pelajari minggu ini.';
        } else if (item.type === 'FORUM') {
            // Mock a conversation
            details.posts = [
                { 
                    id: 1, 
                    author: 'Pak Budi (Guru)', 
                    role: 'Teacher',
                    avatar: 'B',
                    content: 'Halo semuanya, selamat datang di kelas Matematika. Silakan perkenalkan diri kalian di thread ini ya. Sebutkan nama dan hobi kalian.', 
                    timestamp: '20 Oct 2023, 08:00' 
                },
                { 
                    id: 2, 
                    author: 'Ahmad Siswa', 
                    role: 'Student',
                    avatar: 'A',
                    content: 'Halo Pak Budi dan teman-teman! Nama saya Ahmad, hobi saya bermain futsal.', 
                    timestamp: '20 Oct 2023, 08:15' 
                },
                { 
                    id: 3, 
                    author: 'Siti Juara', 
                    role: 'Student',
                    avatar: 'S',
                    content: 'Hai Ahmad! Saya Siti, salam kenal semuanya. Saya suka membaca novel.', 
                    timestamp: '20 Oct 2023, 08:30' 
                },
                { 
                    id: 4, 
                    author: 'Doni Pratama', 
                    role: 'Student',
                    avatar: 'D',
                    content: 'Selamat pagi Pak. Izin bertanya, apakah materi minggu depan sudah bisa diakses?', 
                    timestamp: '20 Oct 2023, 09:00' 
                },
            ];
        } else if (item.type === 'SCORM') {
            details.attempts = 0;
            // Use a sample SCORM-like content (Wikipedia for demo purposes or a dummy iframe)
            details.url = 'https://en.wikipedia.org/wiki/SCORM'; 
            details.desc = 'Modul interaktif SCORM. Pastikan Anda menyelesaikan seluruh slide untuk mendapatkan nilai.';
            details.toc = ['Pengenalan', 'Bab 1: Dasar', 'Bab 2: Lanjutan', 'Kuis Akhir'];
        } else if (item.type === 'H5P') {
            // Sample H5P Embed (Arithmetic Quiz)
            details.url = 'https://h5p.org/h5p/embed/711';
            details.desc = 'Kerjakan latihan interaktif berikut ini.';
        } else if (item.type === 'ASSIGNMENT') {
            details.dueDate = '25 Oct 2023, 23:59';
            details.status = 'No submission';
            details.gradingStatus = 'Not graded';
            details.timeRemaining = '6 days 12 hours';
        } else if (item.type === 'QUIZ') {
            details.openDate = '20 Oct 2023, 08:00';
            details.closeDate = '20 Oct 2023, 10:00';
            details.timeLimit = '45 Menit';
            details.attemptsAllowed = 1;
            details.gradingMethod = 'Highest Grade';
        }

        return details;
    };

    // Navigation Helpers
    const getAllItems = () => courseSections.flatMap(section => section.items);

    const getNextItem = (currentId: number) => {
        const items = getAllItems();
        const currentIndex = items.findIndex(i => i.id === currentId);
        return currentIndex < items.length - 1 ? items[currentIndex + 1] : null;
    };

    const getPrevItem = (currentId: number) => {
        const items = getAllItems();
        const currentIndex = items.findIndex(i => i.id === currentId);
        return currentIndex > 0 ? items[currentIndex - 1] : null;
    };

    const handleOpenActivity = (item: any) => {
        setViewActivity(getActivityDetail(item));
        setView('ACTIVITY');
    };

    const handleNavigate = (item: any) => {
        if (item) {
            setViewActivity(getActivityDetail(item));
            setView('ACTIVITY');
            // Scroll to top
             const scrollElement = document.querySelector('[data-radix-scroll-area-viewport]');
             if (scrollElement) {
                 scrollElement.scrollTop = 0;
             }
        }
    };

    const renderActivityContent = (activity: any) => {
        if (!activity) return null;

        // --- DOCUMENT (PDF Preview) ---
        if (activity.type === 'DOC') {
            return (
                <div className="flex flex-col h-[calc(100vh-250px)]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{activity.title}</h3>
                            <p className="text-slate-500 text-sm">{activity.desc}</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                             <Download className="w-4 h-4" /> Download
                        </Button>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group">
                        <iframe 
                            src={activity.url} 
                            className="w-full h-full"
                            title="Document Preview"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:hidden bg-slate-50/50 backdrop-blur-sm">
                            <span className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-slate-600">
                                Click to interact / scroll
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        // --- VIDEO ---
        if (activity.type === 'VIDEO') {
            return (
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                         <iframe 
                            width="100%" 
                            height="100%" 
                            src={activity.url} 
                            title="Video Player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{activity.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{activity.desc}</p>
                    </div>
                </div>
            );
        }

        // --- FORUM (Chat View) ---
        if (activity.type === 'FORUM') {
            return (
                <div className="max-w-5xl mx-auto h-[calc(100vh-250px)] flex flex-col">
                    <div className="bg-indigo-50 p-6 rounded-t-xl border border-indigo-100 border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                            <MessageSquare className="w-6 h-6 text-indigo-600" />
                            <h3 className="text-xl font-bold text-indigo-900">{activity.title}</h3>
                        </div>
                        <p className="text-indigo-700">Diskusi terbuka untuk kelas.</p>
                    </div>
                    
                    <div className="flex-1 bg-white border border-slate-200 overflow-y-auto p-6 space-y-6">
                        {activity.posts.map((post: any) => (
                            <div key={post.id} className={`flex gap-4 ${post.role === 'Teacher' ? 'bg-amber-50/50 p-4 rounded-xl -mx-2' : ''}`}>
                                <Avatar className="w-10 h-10 border border-slate-200">
                                    <AvatarFallback className={post.role === 'Teacher' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}>
                                        {post.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900">{post.author}</span>
                                        {post.role === 'Teacher' && <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] h-5">Teacher</Badge>}
                                        <span className="text-xs text-slate-400">• {post.timestamp}</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed text-sm lg:text-base">{post.content}</p>
                                    <div className="mt-2 flex gap-4">
                                        <button className="text-xs font-semibold text-slate-400 hover:text-indigo-600">Reply</button>
                                        <button className="text-xs font-semibold text-slate-400 hover:text-indigo-600">Like</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-white border border-slate-200 border-t-0 rounded-b-xl">
                        <div className="flex gap-2">
                            <Input placeholder="Tulis balasan Anda..." className="flex-1" />
                            <Button className="bg-indigo-600 hover:bg-indigo-700"><Send className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </div>
            );
        }

        // --- SCORM / H5P (Embed) ---
        if (activity.type === 'SCORM' || activity.type === 'H5P') {
            return (
                <div className="h-[calc(100vh-250px)] flex flex-col">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                         <h3 className="text-xl font-bold text-slate-900">{activity.title}</h3>
                         <Button variant="outline" size="sm"><Maximize2 className="w-4 h-4 mr-2" /> Fullscreen</Button>
                    </div>
                    
                    <div className="flex-1 flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        {/* Sidebar TOC for SCORM */}
                        {activity.type === 'SCORM' && (
                            <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
                                <div className="p-4 border-b border-slate-200 font-bold text-slate-700 text-sm">Table of Contents</div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {activity.toc?.map((item: string, idx: number) => (
                                        <div key={idx} className={`p-2 rounded text-sm cursor-pointer ${idx === 0 ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Main Iframe */}
                        <div className="flex-1 relative bg-slate-100">
                             <iframe 
                                src={activity.url} 
                                className="w-full h-full"
                                title="Content Player"
                            />
                            {/* Overlay for demo purposes if iframe refuses to load */}
                            <div className="absolute top-0 right-0 p-2 bg-amber-100 text-amber-800 text-xs font-mono opacity-50 hover:opacity-100 transition-opacity">
                                Demo Simulation
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- ASSIGNMENT (Unchanged basically, just layout tweak) ---
        if (activity.type === 'ASSIGNMENT') {
            return (
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex gap-4">
                        <AlertCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
                        <div>
                            <h5 className="text-lg font-bold text-indigo-900 mb-2">Petunjuk Tugas</h5>
                            <p className="text-indigo-700 leading-relaxed">
                                Kerjakan soal-soal pada dokumen terlampir. Jawaban ditulis tangan, difoto/scan, lalu diupload dalam format PDF.
                                Pastikan nama dan nomor absen tertulis jelas pada lembar jawaban.
                            </p>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                             <h4 className="font-bold text-lg text-slate-800">Submission Status</h4>
                        </div>
                        <div className="divide-y divide-slate-100">
                            <div className="grid grid-cols-3 p-6 gap-4">
                                <div className="text-slate-500 font-medium">Submission status</div>
                                <div className="col-span-2">
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 text-sm">{activity.status}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 p-6 gap-4">
                                <div className="text-slate-500 font-medium">Grading status</div>
                                <div className="col-span-2 text-slate-900">{activity.gradingStatus}</div>
                            </div>
                            <div className="grid grid-cols-3 p-6 gap-4">
                                <div className="text-slate-500 font-medium">Due date</div>
                                <div className="col-span-2 text-slate-900 font-medium">{activity.dueDate}</div>
                            </div>
                            <div className="grid grid-cols-3 p-6 gap-4">
                                <div className="text-slate-500 font-medium">Time remaining</div>
                                <div className="col-span-2 text-orange-600 font-bold">{activity.timeRemaining}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8">
                            <UploadCloud className="w-5 h-5 mr-2" /> Add Submission
                        </Button>
                    </div>
                </div>
            );
        }

        // --- QUIZ (Unchanged) ---
        if (activity.type === 'QUIZ') {
            return (
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="border border-slate-200 rounded-xl p-10 text-center bg-white shadow-sm">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckSquare className="w-10 h-10 text-green-600" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 mb-2">Quiz: {activity.title}</h4>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                            Summary of your previous attempts. You have not attempted this quiz yet.
                        </p>
                        
                        <div className="flex justify-center gap-4">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 min-w-[200px] h-12 text-lg">
                                Attempt quiz now
                            </Button>
                        </div>
                    </div>

                     <div className="grid gap-6 md:grid-cols-3">
                         <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-sm">
                            <Label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Time Limit</Label>
                            <p className="text-2xl font-bold text-slate-900 mt-2">{activity.timeLimit}</p>
                         </div>
                         <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-sm">
                            <Label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Attempts Allowed</Label>
                            <p className="text-2xl font-bold text-slate-900 mt-2">{activity.attemptsAllowed}</p>
                         </div>
                         <div className="bg-white p-6 rounded-xl border border-slate-200 text-center shadow-sm">
                            <Label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Close Date</Label>
                            <p className="text-lg font-bold text-slate-900 mt-2 break-words">{activity.closeDate}</p>
                         </div>
                    </div>
                </div>
            );
        }

        return <div className="text-center py-20 text-slate-400">Content not available</div>;
    };

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
        setSelectedCourse(course);
        setCourseSections([ 
            { id: 1, title: "General", items: [] },
            { id: 2, title: "Topic 1", items: [] },
            { id: 3, title: "Topic 2", items: [] },
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

    // Main Render for Activity View
    if (view === 'ACTIVITY' && viewActivity) {
        const nextItem = getNextItem(viewActivity.id);
        const prevItem = getPrevItem(viewActivity.id);

        return (
            <AdminLayout title="LMS Activity">
                <div className="flex h-[calc(100vh-100px)] -m-6 overflow-hidden">
                    {/* Activity Sidebar */}
                    <div className={`w-80 border-r border-slate-200 bg-white flex flex-col transition-all ${isSidebarOpen ? '' : '-ml-80'}`}>
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 line-clamp-1">{selectedCourse?.title}</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-6">
                                {courseSections.map(section => (
                                    <div key={section.id}>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{section.title}</h4>
                                        <div className="space-y-1">
                                            {section.items.map(item => (
                                                <button 
                                                    key={item.id}
                                                    onClick={() => handleNavigate(item)}
                                                    className={`w-full flex items-start text-left gap-3 p-2 rounded-lg text-sm transition-colors ${viewActivity.id === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`mt-0.5 ${viewActivity.id === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                        {item.id < viewActivity.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <item.icon className="w-4 h-4" />}
                                                    </div>
                                                    <span className={`line-clamp-2 ${viewActivity.id === item.id ? 'font-semibold' : ''}`}>{item.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white md:bg-slate-50/50">
                        {/* Header w/ Toggle & Breadcrumbs */}
                        <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={!isSidebarOpen ? 'text-indigo-600' : 'text-slate-400'}>
                                    <Menu className="w-5 h-5" />
                                </Button>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="hover:text-indigo-600 cursor-pointer" onClick={() => setView('COURSE')}>{selectedCourse?.title}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{viewActivity.title}</span>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setView('COURSE')} className="hidden md:flex">Exit Activity</Button>
                        </div>

                        {/* Content Scroll Area */}
                        <ScrollArea className="flex-1">
                            <div className="p-6 md:p-10 max-w-7xl mx-auto w-full h-full"> 
                                {renderActivityContent(viewActivity)}
                            </div>
                        </ScrollArea>

                        {/* Footer Navigation */}
                        <div className="h-20 border-t border-slate-200 bg-white px-6 md:px-10 flex items-center justify-between shrink-0">
                            <div>
                                {prevItem && (
                                    <Button variant="ghost" onClick={() => handleNavigate(prevItem)} className="text-slate-500 hover:text-slate-900">
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        <div className="text-left">
                                            <div className="text-xs text-slate-400">Previous</div>
                                            <div className="font-medium max-w-[150px] truncate">{prevItem.title}</div>
                                        </div>
                                    </Button>
                                )}
                            </div>
                            <div>
                                {nextItem ? (
                                    <Button onClick={() => handleNavigate(nextItem)} className="bg-indigo-600 hover:bg-indigo-700 pl-4 pr-3 h-auto py-2">
                                        <div className="text-right mr-2">
                                            <div className="text-xs text-indigo-200">Next Activity</div>
                                            <div className="font-medium max-w-[150px] truncate">{nextItem.title}</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setView('COURSE')} className="h-auto py-2">
                                        Finish Course
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Default View (Dashboard / Course)
    // ... Copying the rest of the file to ensure no data loss during replacement
    // Since this is a full overwrite, I need to make sure I include the rest of the component.
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
                                                <div 
                                                    key={item.id} 
                                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                                                    onClick={() => handleOpenActivity(item)}
                                                >
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

                        </div>
                    </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
