import AdminLayout from '@/Layouts/AdminLayout';
import { DataTable, ColumnDef } from '@/Components/admin/DataTable';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { useState, useEffect, FormEventHandler } from 'react';
import * as Icons from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { QRCodeSVG } from 'qrcode.react';
import { Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import InputError from '@/Components/InputError';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/Components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";

import { ImportUserWizard } from "@/Pages/Admin/User/Partials/ImportUserWizard";

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    identity_number: string | null;
    gender: 'L' | 'P' | null;
    avatar: string | null;
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props extends PageProps {
    users: PaginatedUsers;
    filters?: {
        search?: string;
    };
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'ADMIN',
    teacher: 'GURU',
    student: 'SISWA'
};

const getAvatarUrl = (user: User) => {
    if (user.avatar) return user.avatar;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;
};

export default function UserIndex({ users, filters }: Props) {
    const [qrUser, setQrUser] = useState<User | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Semua');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    
    // Search functionality
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.user.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    // Create User Form
    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'student' as 'admin' | 'teacher' | 'student',
        identity_number: '',
        gender: '' as 'L' | 'P' | '',
        avatar: '' // Placeholder if needed in future
    });

    const handleCreateUser: FormEventHandler = (e) => {
        e.preventDefault();
        createPost(route('admin.user.store'), {
            onSuccess: () => {
                setIsAddUserOpen(false);
                createReset();
            }
        });
    };

    // Edit User Form
    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors, reset: editReset, clearErrors: editClearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'student' as 'admin' | 'teacher' | 'student',
        identity_number: '',
        gender: '' as 'L' | 'P' | '',
        avatar: ''
    });

    const openEditModal = (user: User) => {
        setUserToEdit(user);
        setEditData({
            name: user.name,
            email: user.email,
            password: '', // Empty for no change
            role: user.role,
            identity_number: user.identity_number || '',
            gender: user.gender || '',
            avatar: user.avatar || ''
        });
        editClearErrors();
        setIsEditUserOpen(true);
    };

    const handleEditUser: FormEventHandler = (e) => {
        e.preventDefault();
        if (!userToEdit) return;
        
        editPut(route('admin.user.update', userToEdit.id), {
            onSuccess: () => {
                setIsEditUserOpen(false);
                editReset();
                setUserToEdit(null);
            }
        });
    };

    // Delete User
    const handleDeleteUser = () => {
        if (!userToDelete) return;
        router.delete(route('admin.user.destroy', userToDelete.id), {
            onSuccess: () => setUserToDelete(null)
        });
    };

    // Columns Definition
    const columns: ColumnDef<User>[] = [
        {
            header: "User Info",
            accessorKey: "name",
            cell: (row: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                         <img 
                            src={getAvatarUrl(row)} 
                            alt={row.name} 
                            className="w-full h-full object-cover" 
                        />
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
            cell: (row: User) => {
                const displayRole = ROLE_LABELS[row.role] || row.role.toUpperCase();
                return (
                    <div className="flex flex-col items-start gap-1">
                        <Badge variant="secondary" className={`
                            ${row.role === 'student' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                            ${row.role === 'teacher' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                            ${row.role === 'admin' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                        `}>
                            {displayRole}
                        </Badge>
                         <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <Icons.CheckCircle2 className="w-3 h-3" />
                            Aktif
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Detail (NIS/NIP)",
            accessorKey: "identity_number",
            cell: (row: User) => (
                <div className="text-sm font-medium text-slate-700">
                    {row.identity_number || '-'}
                </div>
            )
        },
        {
            header: "Aksi",
            accessorKey: "id",
            cell: (row: User) => (
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setQrUser(row)}
                        title="Lihat Kartu Identitas"
                    >
                        <Icons.QrCode className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => openEditModal(row)}
                        title="Edit User"
                    >
                        <Icons.Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => setUserToDelete(row)}
                        title="Hapus User"
                    >
                        <Icons.Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    // Client-side filtering for the current page of data
    // Note: server-side search handles the main filtering, this is just for the "tabs" on the current page
    const filteredUsers = activeTab === 'Semua' 
        ? users.data 
        : users.data.filter(user => {
            const roleLabel = ROLE_LABELS[user.role];
            return roleLabel === activeTab;
        });

    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout title="Manajemen User">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-card, #printable-card * {
                        visibility: visible;
                    }
                    #printable-card {
                        position: fixed;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: white;
                        z-index: 9999;
                        padding: 0;
                        margin: 0;
                    }
                    /* Ensure background graphics are printed */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

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

                {/* Import Wizard */}
                <ImportUserWizard 
                    isOpen={isImportOpen} 
                    onClose={() => setIsImportOpen(false)} 
                    onSuccess={() => {
                        setIsImportOpen(false);
                        // Optional: Refresh data (router.reload() happens automatically on success if backend redirects back)
                        router.reload({ only: ['users'] });
                    }} 
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-2 pb-2 overflow-x-auto w-full sm:w-auto">
                        {['Semua', 'SISWA', 'GURU', 'ADMIN'].map((tab) => (
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

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsImportOpen(true)}
                            className="gap-2 bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                        >
                            <Icons.UploadCloud className="w-4 h-4" />
                            Import Data
                        </Button>
                        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Icons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    type="search"
                                    placeholder="Cari nama atau email..."
                                    className="pl-9 bg-white border-slate-200"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>
                </div>

                <DataTable 
                    data={filteredUsers} 
                    columns={columns} 
                    actionLabel="Tambah User"
                    onAction={() => setIsAddUserOpen(true)}
                />

                {/* Server-side Pagination Links */}
                {users.links.length > 3 && (
                     <div className="flex justify-center mt-4 gap-1 flex-wrap">
                        {users.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`
                                    px-3 py-1 rounded-md text-sm border
                                    ${link.active 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }
                                    ${!link.url ? 'opacity-50 pointer-events-none' : ''}
                                `}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Add User Dialog */}
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-100 shadow-2xl">
                        <form onSubmit={handleCreateUser}>
                            <DialogHeader className="p-6 pb-2">
                                <DialogTitle className="text-xl font-bold text-slate-900">Tambah Pengguna Baru</DialogTitle>
                                <DialogDescription>
                                    Masukkan detail pengguna baru untuk didaftarkan ke sistem.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="px-6 py-4 space-y-6">
                                {/* Role Selection */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Peran Pengguna (Role)</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['student', 'teacher', 'admin'] as const).map((role) => (
                                            <div 
                                                key={role}
                                                onClick={() => setCreateData('role', role)}
                                                className={`
                                                    cursor-pointer rounded-lg border px-4 py-2 text-center text-sm font-medium transition-all
                                                    ${createData.role === role ? 
                                                        (role === 'student' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                                                         role === 'teacher' ? 'border-purple-500 bg-purple-50 text-purple-700' :
                                                         'border-red-500 bg-red-50 text-red-700')
                                                        : 'hover:bg-slate-50 text-slate-600'
                                                    }
                                                `}
                                            >
                                                {ROLE_LABELS[role]}
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={createErrors.role} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create-name">Nama Lengkap</Label>
                                        <Input 
                                            id="create-name" 
                                            placeholder="Contoh: Budi Santoso" 
                                            value={createData.name}
                                            onChange={(e) => setCreateData('name', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <InputError message={createErrors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-email">Email</Label>
                                        <Input 
                                            id="create-email" 
                                            type="email"
                                            placeholder="nama@sekolah.sch.id" 
                                            value={createData.email}
                                            onChange={(e) => setCreateData('email', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <InputError message={createErrors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-password">Password</Label>
                                        <Input 
                                            id="create-password" 
                                            type="password"
                                            placeholder="Minimal 8 karakter" 
                                            value={createData.password}
                                            onChange={(e) => setCreateData('password', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <InputError message={createErrors.password} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="create-identity">Nomor Induk (NISN/NIP)</Label>
                                        <Input 
                                            id="create-identity" 
                                            placeholder="Opsional" 
                                            value={createData.identity_number}
                                            onChange={(e) => setCreateData('identity_number', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <InputError message={createErrors.identity_number} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="create-gender">Jenis Kelamin</Label>
                                        <Select 
                                            value={createData.gender || ''} 
                                            onValueChange={(val) => setCreateData('gender', val as 'L' | 'P')}
                                        >
                                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Pilih..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={createErrors.gender} />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={createProcessing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                    {createProcessing ? 'Menyimpan...' : 'Simpan Pengguna'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-100 shadow-2xl">
                         <form onSubmit={handleEditUser}>
                            <DialogHeader className="p-6 pb-2">
                                <DialogTitle className="text-xl font-bold text-slate-900">Edit Pengguna</DialogTitle>
                                <DialogDescription>
                                    Perbarui detail informasi pengguna.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="px-6 py-4 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Peran Pengguna (Role)</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['student', 'teacher', 'admin'] as const).map((role) => (
                                            <div 
                                                key={role}
                                                onClick={() => setEditData('role', role)}
                                                className={`
                                                    cursor-pointer rounded-lg border px-4 py-2 text-center text-sm font-medium transition-all
                                                    ${editData.role === role ? 
                                                        (role === 'student' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                                                         role === 'teacher' ? 'border-purple-500 bg-purple-50 text-purple-700' :
                                                         'border-red-500 bg-red-50 text-red-700')
                                                        : 'hover:bg-slate-50 text-slate-600'
                                                    }
                                                `}
                                            >
                                                {ROLE_LABELS[role]}
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={editErrors.role} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">Nama Lengkap</Label>
                                        <Input 
                                            id="edit-name" 
                                            value={editData.name}
                                            onChange={(e) => setEditData('name', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <InputError message={editErrors.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-email">Email</Label>
                                        <Input 
                                            id="edit-email" 
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData('email', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <InputError message={editErrors.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password">Password Baru</Label>
                                        <Input 
                                            id="edit-password" 
                                            type="password"
                                            placeholder="Kosongkan jika tidak berubah" 
                                            value={editData.password}
                                            onChange={(e) => setEditData('password', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <p className="text-[10px] text-slate-500">Minimal 8 karakter jika diisi</p>
                                        <InputError message={editErrors.password} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-identity">Nomor Induk (NISN/NIP)</Label>
                                        <Input 
                                            id="edit-identity" 
                                            value={editData.identity_number}
                                            onChange={(e) => setEditData('identity_number', e.target.value)}
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                        <InputError message={editErrors.identity_number} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="edit-gender">Jenis Kelamin</Label>
                                        <Select 
                                            value={editData.gender || ''} 
                                            onValueChange={(val) => setEditData('gender', val as 'L' | 'P')}
                                        >
                                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Pilih..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Laki-laki</SelectItem>
                                                <SelectItem value="P">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={editErrors.gender} />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-6 pt-2 bg-slate-50/50">
                                <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={editProcessing} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!userToDelete} onOpenChange={(open: boolean) => !open && setUserToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Data pengguna <strong>{userToDelete?.name}</strong> akan dihapus permanen dari sistem.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">
                                Hapus Pengguna
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>


                {/* QR Code / ID Card Dialog */}
                <Dialog open={!!qrUser} onOpenChange={(open) => !open && setQrUser(null)}>
                    <DialogContent className="sm:max-w-[400px] p-0 bg-transparent border-none shadow-none">
                        <div id="printable-card" className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100 w-full max-w-[350px] mx-auto">
                            {/* Card Header */}
                            <div className="h-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl -ml-10 -mb-5"></div>
                                
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="text-white">
                                        <h3 className="font-bold text-lg tracking-wide">KARTU IDENTITAS</h3>
                                        <p className="text-blue-100 text-xs font-medium opacity-90">SMK Management System</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                                        <Icons.Shield className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="px-6 pb-8 -mt-12 relative z-20">
                                <div className="flex justify-center mb-4">
                                    <div className="p-1.5 bg-white rounded-2xl shadow-lg">
                                        <img 
                                            src={qrUser ? getAvatarUrl(qrUser) : ''} 
                                            alt={qrUser?.name} 
                                            className="w-24 h-24 rounded-xl object-cover bg-slate-100 border border-slate-100" 
                                        />
                                    </div>
                                </div>

                                <div className="text-center space-y-1 mb-6">
                                    <h2 className="font-bold text-xl text-slate-900 leading-tight">{qrUser?.name}</h2>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                            {qrUser ? ROLE_LABELS[qrUser.role] : ''}
                                        </span>
                                        {qrUser?.identity_number && (
                                            <span className="text-sm text-slate-500 font-medium border-l border-slate-200 pl-2">
                                                {qrUser.identity_number}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 font-mono pt-1">{qrUser?.email}</p>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 border-dashed flex flex-col items-center justify-center gap-3">
                                    {qrUser && (
                                        <QRCodeSVG 
                                            value={JSON.stringify({ 
                                                id: qrUser.id, 
                                                type: 'login_token', 
                                                timestamp: Date.now() 
                                            })}
                                            size={140}
                                            level="M"
                                            className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm"
                                        />
                                    )}
                                    <p className="text-[10px] text-slate-400 text-center max-w-[200px] leading-relaxed">
                                        Scan kode QR ini pada mesin absensi atau login sistem sekolah.
                                    </p>
                                </div>
                            </div>

                            {/* Print Footer - Hidden when printing */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 print:hidden">
                                <Button variant="outline" className="flex-1" onClick={() => setQrUser(null)}>
                                    Tutup
                                </Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint}>
                                    <Icons.Printer className="w-4 h-4 mr-2" />
                                    Cetak Kartu
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
