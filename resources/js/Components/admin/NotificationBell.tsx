import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
    Bell, 
    Wallet, 
    ScanFace, 
    Check, 
    CheckSquare, 
    RefreshCw, 
    AlertCircle, 
    Calendar 
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';
import { playNotificationChime } from '@/lib/sound';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationBell() {
    const page = usePage<any>();
    const unreadNotifications = page.props?.auth?.user?.unread_notifications || [];
    const unreadCount = unreadNotifications.length;
    const prevCount = useRef(unreadCount);
    const [isSyncing, setIsSyncing] = useState(false);

    // Audio chime effect on new unread notification
    useEffect(() => {
        if (unreadCount > prevCount.current) {
            playNotificationChime();
        }
        prevCount.current = unreadCount;
    }, [unreadCount]);

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        router.post(route('orangtua.notifications.read', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Notifikasi ditandai telah dibaca');
            }
        });
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        router.post(route('orangtua.notifications.read-all'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Semua notifikasi ditandai telah dibaca');
            }
        });
    };

    const handleSync = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsSyncing(true);
        router.post(route('orangtua.notifications.trigger-recap'), {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsSyncing(false);
                toast.success('Data rekap dan tagihan berhasil diperbarui');
            }
        });
    };

    const getIcon = (data: any) => {
        if (data.type === 'billing_reminder') {
            return (
                <div className={cn(
                    "p-2 rounded-xl text-white shrink-0 shadow-sm",
                    data.interval === 'overdue' ? "bg-red-500 shadow-red-100" : "bg-amber-500 shadow-amber-100"
                )}>
                    <Wallet className="w-4 h-4" />
                </div>
            );
        }
        return (
            <div className="p-2 rounded-xl text-white bg-blue-500 shadow-sm shadow-blue-100 shrink-0">
                <ScanFace className="w-4 h-4" />
            </div>
        );
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full hover:bg-slate-100/80 transition-colors w-10 h-10 flex items-center justify-center border border-slate-100 shadow-sm bg-white"
                >
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-extrabold items-center justify-center">
                                {unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xl mt-2 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                {/* Header Section */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <div>
                        <DropdownMenuLabel className="p-0 text-sm font-bold text-slate-800">
                            Notifikasi Baru
                        </DropdownMenuLabel>
                        <p className="text-[10px] text-slate-500 font-medium">{unreadCount} belum dibaca</p>
                    </div>
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={isSyncing}
                            title="Perbarui Data"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin text-indigo-600")} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                title="Tandai semua dibaca"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                                <CheckSquare className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Notification Items List */}
                <div className="max-h-[350px] overflow-y-auto py-1 space-y-1 scrollbar-thin">
                    {unreadNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="bg-slate-50 text-slate-400 p-3 rounded-full mb-3">
                                <Check className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-700 text-xs font-bold">Semua Sudah Dibaca</p>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                                Anda tidak memiliki notifikasi baru. Klik ikon refresh untuk memperbarui rekap teranyar.
                            </p>
                        </div>
                    ) : (
                        unreadNotifications.map((notif: any) => {
                            const data = notif.data;
                            return (
                                <DropdownMenuItem 
                                    key={notif.id}
                                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group focus:bg-slate-50 outline-none"
                                >
                                    {getIcon(data)}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {data.title}
                                            </p>
                                            <span className="text-[9px] font-medium text-slate-400 shrink-0">
                                                {formatDate(notif.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 leading-relaxed break-words font-medium">
                                            {data.message}
                                        </p>
                                        {data.type === 'billing_reminder' && (
                                            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-semibold text-slate-400">
                                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>Jatuh Tempo: {data.due_date}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                        className="h-6 w-6 rounded-full border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center text-slate-400 hover:text-indigo-600 shrink-0 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Tandai dibaca"
                                    >
                                        <Check className="w-3 h-3" />
                                    </button>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
