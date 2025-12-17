import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Video, Calendar as CalendarIcon, Clock, Users, Link as LinkIcon, Plus, Monitor, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/Components/ui/dialog';

export default function DaringIndex() {
    const [activeTab, setActiveTab] = useState('list');
    const [jitsiRoom, setJitsiRoom] = useState<string | null>(null);
    const [meetingTitle, setMeetingTitle] = useState('');

    // Mock Data
    const activeMeetings = [
        { id: 1, title: 'Matematika - Aljabar Linear', host: 'Budi Santoso', platform: 'Internal', time: '08:00 - 09:30', status: 'Live', participants: 25 },
        { id: 2, title: 'Bahasa Inggris - Speaking', host: 'Siti Aminah', platform: 'Zoom', time: '10:00 - 11:30', status: 'Scheduled', link: 'https://zoom.us/j/123456' },
        { id: 3, title: 'Fisika - Hukum Newton', host: 'Ahmad Dahlan', platform: 'GMeet', time: '13:00 - 14:30', status: 'Scheduled', link: 'https://meet.google.com/abc-defg-hij' },
    ];

    const startJitsi = () => {
        const roomName = `SekolahKita_${meetingTitle.replace(/\s+/g, '')}_${Math.floor(Math.random() * 1000)}`;
        setJitsiRoom(roomName);
    };

    return (
        <AdminLayout title="Daring (Online Meeting)">
            {jitsiRoom ? (
                // Jitsi View
                <div className="h-[calc(100vh-100px)] flex flex-col">
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="font-bold">Live Meeting: {meetingTitle}</span>
                        </div>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => setJitsiRoom(null)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Akhiri Meeting
                        </Button>
                    </div>
                    <div className="flex-1 bg-black rounded-b-xl overflow-hidden relative">
                         <iframe 
                            src={`https://meet.jit.si/${jitsiRoom}#config.prejoinPageEnabled=false`}
                            className="w-full h-full border-0"
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                        ></iframe>
                    </div>
                </div>
            ) : (
                // Dashboard View
                <div className="space-y-8">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ruang Kelas Online</h2>
                            <p className="text-slate-500">Kelola pembelajaran jarak jauh dengan video conference internal & eksternal.</p>
                        </div>
                        <div className="flex gap-2">
                             <Button 
                                variant={activeTab === 'list' ? 'secondary' : 'ghost'}
                                onClick={() => setActiveTab('list')}
                            >
                                <Monitor className="w-4 h-4 mr-2" />
                                Monitor Room
                            </Button>
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setActiveTab('create')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Buat Meeting Baru
                            </Button>
                        </div>
                    </div>

                    {activeTab === 'list' && (
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeMeetings.map((meeting) => (
                                <Card key={meeting.id} className="border-slate-200 hover:border-blue-300 transition-colors group">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={meeting.platform === 'Internal' ? 'default' : 'outline'} className={meeting.platform === 'Internal' ? 'bg-blue-600' : 'text-slate-600'}>
                                                {meeting.platform}
                                            </Badge>
                                            {meeting.status === 'Live' && (
                                                <Badge variant="destructive" className="animate-pulse">Live Now</Badge>
                                            )}
                                        </div>
                                        <CardTitle className="line-clamp-1 text-lg">{meeting.title}</CardTitle>
                                        <CardDescription>{meeting.host}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {meeting.time}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                {meeting.participants} Peserta
                                            </div>
                                            
                                            <div className="pt-4">
                                                {meeting.platform === 'Internal' ? (
                                                     <Button className="w-full" disabled={meeting.status !== 'Live'}>
                                                        Gabung Kelas <ArrowRight className="w-4 h-4 ml-2" />
                                                     </Button>
                                                ) : (
                                                    <a href={meeting.link} target="_blank" rel="noreferrer">
                                                        <Button variant="outline" className="w-full">
                                                            Buka {meeting.platform} <LinkIcon className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                         </div>
                    )}

                    {activeTab === 'create' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border-slate-200">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <CardTitle>Internal Meeting (Gratis)</CardTitle>
                                    <CardDescription>Mulai meeting instan menggunakan server internal sekolah. Unlimited duration.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Judul Meeting / Mapel</Label>
                                        <Input 
                                            placeholder="Contoh: Matematika X-A" 
                                            value={meetingTitle}
                                            onChange={(e) => setMeetingTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Host</Label>
                                        <Input defaultValue="Admin (Anda)" disabled className="bg-slate-50" />
                                    </div>
                                    <Button 
                                        className="w-full bg-blue-600 hover:bg-blue-700" 
                                        disabled={!meetingTitle}
                                        onClick={startJitsi}
                                    >
                                        Mulai Meeting Sekarang
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                                        <LinkIcon className="w-6 h-6" />
                                    </div>
                                    <CardTitle>External Platform</CardTitle>
                                    <CardDescription>Jadwalkan meeting menggunakan Google Meet atau Zoom.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Platform</Label>
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 bg-blue-50">Zoom</Button>
                                            <Button variant="outline" className="flex-1">GMeet</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Link Meeting</Label>
                                        <Input placeholder="https://..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tanggal</Label>
                                            <Input type="date" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Jam</Label>
                                            <Input type="time" />
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        Simpan Jadwal
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
