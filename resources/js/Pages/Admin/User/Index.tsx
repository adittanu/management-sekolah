import AdminLayout from '@/Layouts/AdminLayout';
import { DataTable, ColumnDef } from '@/Components/admin/DataTable';
import { mockUsers } from '@/data/mockData';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

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
                    {['Semua', 'SISWA', 'GURU', 'WAKA', 'ADMIN'].map((tab, i) => (
                        <Button 
                            key={tab} 
                            variant={i === 0 ? 'default' : 'ghost'} 
                            className={`rounded-full px-6 ${i === 0 ? 'bg-blue-600 hover:bg-blue-700' : 'text-slate-500 hover:text-slate-900 bg-white shadow-sm'}`}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                <DataTable 
                    data={mockUsers} 
                    columns={columns} 
                    actionLabel="Tambah User"
                    onAction={() => alert('Tambah User clicked')}
                />
            </div>
        </AdminLayout>
    );
}
