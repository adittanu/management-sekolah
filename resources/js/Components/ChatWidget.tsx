import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, MoreVertical, Search, Phone, Video, Image, Paperclip, ChevronLeft, User, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Mock Data Types
type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isRead: boolean;
};

type Contact = {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    isOnline: boolean;
    lastMessage?: string;
    unreadCount: number;
};

export default function ChatWidget({ currentUserRole = 'student' }: { currentUserRole?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState<Contact | null>(null);
    const [msgInput, setMsgInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mock Contacts based on Role
    const contacts: Contact[] = [
        { id: '1', name: 'Pak Budi (Guru MTK)', role: 'Guru', isOnline: true, lastMessage: 'Jangan lupa tugasnya ya', unreadCount: 2 },
        { id: '2', name: 'Admin Sekolah', role: 'Admin', isOnline: false, lastMessage: 'Pembayaran SPP sudah dikonfirmasi', unreadCount: 0 },
        { id: '3', name: 'Ani (Ketua Kelas)', role: 'Siswa', isOnline: true, lastMessage: 'Besok ada PR apa aja?', unreadCount: 5 },
    ];

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', senderId: '1', text: 'Halo, tugas matematika dikumpulkan kapan ya?', timestamp: new Date(Date.now() - 1000000), isRead: true },
        { id: '2', senderId: 'me', text: 'Besok jam 12 siang pak.', timestamp: new Date(Date.now() - 900000), isRead: true },
        { id: '3', senderId: '1', text: 'Oke, jangan terlambat.', timestamp: new Date(Date.now() - 800000), isRead: true },
        { id: '4', senderId: '1', text: 'Jangan lupa tugasnya ya', timestamp: new Date(Date.now() - 10000), isRead: false },
    ]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChat, isOpen]);

    const handleSendMessage = () => {
        if (!msgInput.trim()) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            text: msgInput,
            timestamp: new Date(),
            isRead: false
        };

        setMessages(prev => [...prev, newMsg]);
        setMsgInput('');

        // Simulate Reply
        setTimeout(() => {
            const replyMsg: Message = {
                id: (Date.now() + 1).toString(),
                senderId: activeChat?.id || '1',
                text: 'Baik, pesan diterima. (Auto-reply)',
                timestamp: new Date(),
                isRead: false
            };
            setMessages(prev => [...prev, replyMsg]);
        }, 2000);
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button 
                    onClick={() => setIsOpen(true)}
                    className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                    <MessageCircle className="w-8 h-8 text-white" />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between shrink-0">
                {activeChat ? (
                     <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 -ml-2" onClick={() => setActiveChat(null)}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="relative">
                            <Avatar className="h-9 w-9 border border-white/20">
                                <AvatarImage src={activeChat.avatar} />
                                <AvatarFallback className="text-slate-800 bg-white/90 font-bold">{activeChat.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            {activeChat.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-600 rounded-full"></span>}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-none">{activeChat.name}</h3>
                            <span className="text-[10px] text-blue-100 opacity-90">{activeChat.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                     </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-6 h-6" />
                        <h3 className="font-bold text-lg">School Chat</h3>
                    </div>
                )}
                
                <div className="flex items-center gap-1">
                    {activeChat && (
                        <>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                <Phone className="w-4 h-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                <Video className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
                {activeChat ? (
                    // Messaging View
                    <>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                <div className="text-center text-xs text-slate-400 my-4">Hari Ini</div>
                                {messages.map((msg) => {
                                    const isMe = msg.senderId === 'me';
                                    return (
                                        <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                isMe 
                                                ? "bg-blue-600 text-white rounded-tr-none" 
                                                : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                                            )}>
                                                {msg.text}
                                                <div className={cn("text-[10px] mt-1 flex justify-end items-center gap-1", isMe ? "text-blue-200" : "text-slate-400")}>
                                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    {isMe && (msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        
                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                <Paperclip className="w-5 h-5" />
                            </Button>
                            <Input 
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ketik pesan..." 
                                className="flex-1 border-slate-200 focus-visible:ring-blue-600"
                            />
                            <Button size="icon" className="bg-blue-600 hover:bg-blue-700" onClick={handleSendMessage}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    // Contact List View
                    <>
                        <div className="p-3 bg-white border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <Input placeholder="Cari teman atau guru..." className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm" />
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="divide-y divide-slate-100">
                                {contacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        className="p-4 flex items-center gap-3 hover:bg-blue-50 cursor-pointer transition-colors bg-white group"
                                        onClick={() => setActiveChat(contact)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-slate-100 group-hover:border-blue-200">
                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{contact.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            {contact.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className="font-semibold text-sm text-slate-900 truncate">{contact.name}</h4>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">12:30</span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate pr-4">{contact.lastMessage}</p>
                                        </div>
                                        {contact.unreadCount > 0 && (
                                            <div className="h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                {contact.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="p-4 text-center">
                                    <p className="text-xs text-slate-400">Tidak ada percakapan lainnya.</p>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                )}
            </div>
        </div>
    );
}
