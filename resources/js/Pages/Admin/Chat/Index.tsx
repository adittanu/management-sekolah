import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Search, Phone, Video, Paperclip, Send, MoreVertical, Check, CheckCheck, Smile, Mic, Image, Sparkles, Bot } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { getBotResponse } from '@/lib/bot';

// Reusing Mock Data Structure (ideally shared)
type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isRead: boolean;
    isTool?: boolean;
    toolName?: string;
};

type Contact = {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    isOnline: boolean;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    phone?: string;
    email?: string;
    isBot?: boolean;
};

export default function ChatIndex() {
    const [activeChat, setActiveChat] = useState<Contact | null>(null);
    const [msgInput, setMsgInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Enhanced Mock Contacts
    const contacts: Contact[] = [
        { id: 'ai', name: 'AI Assistant', role: 'Bot', isOnline: true, lastMessage: 'Bisa bantu buatkan course?', lastMessageTime: 'Now', unreadCount: 1, isBot: true, phone: 'System', email: 'ai@system.internal' },
        { id: '1', name: 'Pak Budi (Guru MTK)', role: 'Guru', isOnline: true, lastMessage: 'Jangan lupa tugasnya ya', lastMessageTime: '10:30', unreadCount: 2, phone: '+62 812 3456 7890', email: 'budi.mtk@sekolah.sch.id' },
        { id: '2', name: 'Admin Sekolah', role: 'Admin', isOnline: false, lastMessage: 'Pembayaran SPP sudah dikonfirmasi', lastMessageTime: '09:15', unreadCount: 0, phone: '+62 811 1111 2222', email: 'admin@sekolah.sch.id' },
        { id: '3', name: 'Ani (Ketua Kelas)', role: 'Siswa', isOnline: true, lastMessage: 'Besok ada PR apa aja?', lastMessageTime: 'Yesterday', unreadCount: 5, phone: '+62 856 7890 1234', email: 'ani.siswa@sekolah.sch.id' },
        { id: '4', name: 'Bu Siti (Wali Kelas)', role: 'Guru', isOnline: true, lastMessage: 'Raport aman diambil besok', lastMessageTime: 'Yesterday', unreadCount: 0, phone: '+62 813 9999 8888', email: 'siti.wali@sekolah.sch.id' },
    ];

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', senderId: '1', text: 'Halo, tugas matematika dikumpulkan kapan ya?', timestamp: new Date(Date.now() - 1000000), isRead: true },
        { id: '2', senderId: 'me', text: 'Besok jam 12 siang pak.', timestamp: new Date(Date.now() - 900000), isRead: true },
        { id: '3', senderId: '1', text: 'Oke, jangan terlambat.', timestamp: new Date(Date.now() - 800000), isRead: true },
        { id: '4', senderId: '1', text: 'Jangan lupa tugasnya ya', timestamp: new Date(Date.now() - 10000), isRead: false },
    ]);

    // Set default active chat
    useEffect(() => {
        if (!activeChat && contacts.length > 0) {
            setActiveChat(contacts[0]);
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChat]);

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
        const currentInput = msgInput;
        setMsgInput('');

        // Handle Bot Response
        if (activeChat?.isBot) {
            getBotResponse(currentInput).then(responses => {
                responses.forEach((resp) => {
                    setTimeout(() => {
                        const botMsg: Message = {
                            id: Date.now().toString() + Math.random(),
                            senderId: activeChat.id,
                            text: resp.text,
                            timestamp: new Date(),
                            isRead: false,
                            isTool: resp.isTool,
                            toolName: resp.toolName
                        };
                        setMessages(prev => [...prev, botMsg]);
                    }, resp.delay || 1000);
                });
            });
            return;
        }

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

    return (
        <AdminLayout title="Pesan & Komunikasi" disableChatWidget fullWidth>
            <div className="h-screen md:h-screen bg-white shadow-sm border-l border-slate-200 overflow-hidden flex">
                
                {/* Left Sidebar - Contact List */}
                <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Pesan</h2>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4 text-slate-500" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input placeholder="Cari kontak..." className="pl-9 bg-slate-50" />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 bg-white">
                        <div className="divide-y divide-slate-50">
                            {contacts.map(contact => (
                                <div 
                                    key={contact.id}
                                    onClick={() => setActiveChat(contact)}
                                    className={cn(
                                        "p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50",
                                        activeChat?.id === contact.id ? "bg-blue-50/50 hover:bg-blue-50" : "",
                                        contact.isBot && "bg-indigo-50/30 hover:bg-indigo-50"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className={cn("h-12 w-12 border", contact.isBot ? "border-indigo-200" : "border-slate-100")}>
                                            <AvatarImage src={contact.avatar} />
                                            <AvatarFallback className={cn("font-bold", contact.isBot ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600")}>
                                                {contact.isBot ? <Sparkles className="w-6 h-6" /> : contact.name.substring(0,2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {contact.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={cn("font-semibold text-sm truncate flex items-center gap-1", activeChat?.id === contact.id ? "text-blue-700" : "text-slate-900")}>
                                                {contact.name}
                                                {contact.isBot && <span className="bg-indigo-500 text-white text-[10px] px-1.5 rounded-full font-bold">AI</span>}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">{contact.lastMessageTime}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{contact.lastMessage}</p>
                                    </div>
                                    {contact.unreadCount > 0 && (
                                        <div className="shrink-0 flex items-center">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                                {contact.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Area - Chat Window */}
                <div className="flex-1 flex flex-col bg-[#efeae2]/30 relative">
                     {/* Chat Header */}
                     {activeChat ? (
                        <>
                            <div className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 cursor-pointer">
                                        <AvatarImage src={activeChat.avatar} />
                                        <AvatarFallback className={cn("font-bold", activeChat.isBot ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600")}>
                                            {activeChat.isBot ? <Sparkles className="w-5 h-5" /> : activeChat.name.substring(0,2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-slate-800 cursor-pointer flex items-center gap-2">
                                            {activeChat.name}
                                            {activeChat.isBot && <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">AI Bot</span>}
                                        </h3>
                                        <p className="text-xs text-slate-500">{activeChat.isOnline ? 'Sedang Online' : 'Terakhir dilihat hari ini'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600">
                                        <Search className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600">
                                        <Phone className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600">
                                        <Video className="w-5 h-5" />
                                    </Button>
                                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                                    <Button variant="ghost" size="icon" className="text-slate-500">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <ScrollArea className="flex-1 p-6 bg-[url('https://camo.githubusercontent.com/854a93c27d64274c4f8f5a0b6ec77ce729d636b1d643950f14d9b2b53e878345/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67')] bg-repeat bg-[length:400px]">
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {messages.map((msg) => {
                                         const isMe = msg.senderId === 'me';
                                         const isTool = msg.isTool;
                                         
                                         if (isTool) {
                                            return (
                                                <div key={msg.id} className="flex w-full justify-start group mb-4">
                                                    <div className="max-w-[60%] rounded-xl bg-[#eff4ff] border border-blue-100 p-4 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                                                <Bot className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-bold text-blue-700 block uppercase tracking-wider">{msg.toolName || 'AI Tool'}</span>
                                                                <span className="text-[10px] text-blue-400">Processing Request...</span>
                                                            </div>
                                                        </div>
                                                        <div className="pl-1">
                                                            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-3">{msg.text}</p>
                                                            <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite] w-1/2 origin-left"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                         }
                                         
                                         return (
                                             <div key={msg.id} className={cn("flex w-full group", isMe ? "justify-end" : "justify-start")}>
                                                 <div className={cn(
                                                     "max-w-[70%] rounded-2xl px-5 py-3 text-sm shadow-sm relative",
                                                     isMe 
                                                     ? "bg-blue-600 text-white rounded-tr-none" 
                                                     : "bg-white text-slate-800 rounded-tl-none"
                                                 )}>
                                                     <p className="leading-relaxed">{msg.text}</p>
                                                     <div className={cn("text-[10px] mt-1 flex justify-end items-center gap-1 opacity-70", isMe ? "text-blue-100" : "text-slate-400")}>
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
                            <div className="h-20 bg-white border-t border-slate-200 px-6 flex items-center gap-4 shrink-0">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                    <Smile className="w-6 h-6" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                    <Paperclip className="w-6 h-6" />
                                </Button>
                                <Input 
                                    value={msgInput}
                                    onChange={(e) => setMsgInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={activeChat.isBot ? "Perintahkan AI..." : "Ketik pesan..."}
                                    className={cn("flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 h-11", activeChat.isBot && "focus-visible:ring-indigo-500")}
                                />
                                {msgInput.trim() ? (
                                    <Button onClick={handleSendMessage} className={cn("h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-700 shrink-0", activeChat.isBot && "bg-indigo-600 hover:bg-indigo-700")}>
                                        <Send className="w-5 h-5 ml-0.5" />
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                        <Mic className="w-6 h-6" />
                                    </Button>
                                )}
                            </div>
                        </>
                     ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                             <MessageCircle className="w-24 h-24 mb-4 opacity-20" />
                             <p className="text-lg font-medium">Pilih kontak untuk memulai percakapan</p>
                         </div>
                     )}
                </div>

                {/* Info Sidebar (Optional, hidden on small screens) */}
                {activeChat && (
                    <div className="w-72 bg-white border-l border-slate-200 hidden xl:block p-6">
                        <div className="text-center mb-6">
                            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-slate-50">
                                <AvatarImage src={activeChat.avatar} />
                                <AvatarFallback className={cn("text-2xl font-bold", activeChat.isBot ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600")}>
                                    {activeChat.isBot ? <Sparkles className="w-10 h-10" /> : activeChat.name.substring(0,2)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-lg font-bold text-slate-800">{activeChat.name}</h2>
                            <span className={cn("inline-block px-3 py-1 text-xs font-bold rounded-full mt-2 uppercase tracking-wide", activeChat.isBot ? "bg-indigo-100 text-indigo-600" : "bg-blue-50 text-blue-600")}>
                                {activeChat.role}
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Info Kontak</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>{activeChat.phone}</span>
                                    </div>
                                     <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-4 h-4 flex items-center justify-center text-slate-400 text-[10px] font-bold border rounded">@</div>
                                        <span className="truncate">{activeChat.email}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {!activeChat.isBot && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Media Bersama</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                                                <Image className="w-5 h-5" />
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="link" className="text-blue-600 text-xs px-0 mt-2">Lihat semua</Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
