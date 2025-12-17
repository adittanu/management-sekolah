import AdminLayout from '@/Layouts/AdminLayout';
import { DataTable, ColumnDef } from '@/Components/admin/DataTable';
import { mockUsers } from '@/data/mockData';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    detail: string;
    avatar: string;
}

export default function UserIndex() {
    
    const columns: ColumnDef<User>[] = [
        {
            header: "User Info",
            accessorKey: "name",
            cell: (row: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                         <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Role & Status",
            accessorKey: "role",
            cell: (row: User) => (
                <div className="flex flex-col items-start gap-1">
                    <Badge variant="secondary" className={`
                        ${row.role === 'SISWA' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                        ${row.role === 'GURU' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                        ${row.role === 'WAKA' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                    `}>
                        {row.role}
                    </Badge>
                     <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {row.status}
                    </div>
                </div>
            )
        },
        {
            header: "Detail (Kelas)",
            accessorKey: "detail",
            cell: (row: User) => (
                <div className="text-sm font-medium text-slate-700">{row.detail}</div>
            )
        }
    ];

    const [activeTab, setActiveTab] = useState('Semua');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    const filteredUsers = activeTab === 'Semua' 
        ? mockUsers 
        : mockUsers.filter(user => user.role === activeTab);

    return (
        <AdminLayout title="Manajemen User">
            <div className="space-y-6">
                <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold">Manajemen Pengguna</h2>
                        <p className="text-blue-100 mt-2 max-w-xl">
                            Kelola data siswa, guru, dan staff administrasi. Anda dapat menambahkan user baru, mengatur role, dan memverifikasi pendaftaran.
                        </p>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,90.5,-6.2C90.9,8,89,22.1,83.2,35.2C77.4,48.3,67.7,60.4,55.9,69.5C44.1,78.6,30.2,84.7,15.8,85.8C1.4,86.9,-13.5,83,-27.3,77.3C-41.1,71.6,-53.8,64.1,-63.9,54.1C-74,44.1,-81.5,31.6,-84.9,17.9C-88.3,4.2,-87.6,-10.7,-81.6,-23.8C-75.6,-36.9,-64.3,-48.2,-52.1,-56.3C-39.9,-64.4,-26.8,-69.3,-13.4,-71.1C0,-72.9,13.4,-71.6,30.5,-83.6L44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                </div>

                <div className="flex gap-2 pb-2 overflow-x-auto">
                    {['Semua', 'SISWA', 'GURU', 'WAKA', 'ADMIN'].map((tab) => (
                        <Button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            variant={activeTab === tab ? 'default' : 'ghost'} 
                            className={`rounded-full px-6 transition-all ${activeTab === tab ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-900 bg-white shadow-sm hover:bg-slate-50'}`}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                <DataTable 
                    data={filteredUsers} 
                    columns={columns} 
                    actionLabel="Tambah User"
                    onAction={() => setIsAddUserOpen(true)}
                />

                {/* Add User Dialog */}
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-100 shadow-2xl">
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold text-slate-900">Tambah Pengguna Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan detail pengguna baru untuk didaftarkan ke sistem.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="px-6 py-4 space-y-6">
                            {/* Profile Upload Placeholder */}
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden">
                                    <div className="text-center group-hover:scale-110 transition-transform">
                                        <Icons.Camera className="w-6 h-6 text-slate-400 mx-auto" />
                                        <span className="text-[10px] text-slate-400 mt-1 block">Upload Foto</span>
                                    </div>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Format: JPG, PNG. Maks 2MB.
                                </p>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">Peran Pengguna (Role)</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['SISWA', 'GURU', 'WAKA', 'ADMIN'].map((role) => (
                                        <div 
                                            key={role}
                                            className={`
                                                cursor-pointer rounded-lg border px-4 py-2 text-center text-sm font-medium transition-all
                                                ${role === 'SISWA' ? 'hover:border-blue-500 hover:bg-blue-50' : ''}
                                                ${role === 'GURU' ? 'hover:border-purple-500 hover:bg-purple-50' : ''}
                                                ${role === 'WAKA' ? 'hover:border-orange-500 hover:bg-orange-50' : ''}
                                                ${role === 'ADMIN' ? 'hover:border-red-500 hover:bg-red-50' : ''}
                                                peer-checked:border-blue-600 peer-checked:bg-blue-50
                                            `}
                                        >
                                            <input type="radio" name="role" id={role} className="sr-only peer" />
                                            <label htmlFor={role} className="cursor-pointer w-full h-full block">
                                                {role}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input id="name" placeholder="Contoh: Budi Santoso" className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="nama@sekolah.sch.id" className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nisn">Nomor Induk (NISN/NIP)</Label>
                                    <Input id="nisn" placeholder="1234567890" className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kelas">Kelas (Opsional)</Label>
                                    <Input id="kelas" placeholder="Pilih Kelas..." className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500" />
                                </div>
                            </div>

                            {/* Info Alert */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                                <Icons.AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-amber-800">Verifikasi Akun Diperlukan</h4>
                                    <p className="text-xs text-amber-700 mt-1">
                                        Setelah ditambahkan, sistem akan mengirimkan email verifikasi otomatis. User harus memverifikasi email sebelum bisa login.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Batal</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">Simpan Pengguna</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
