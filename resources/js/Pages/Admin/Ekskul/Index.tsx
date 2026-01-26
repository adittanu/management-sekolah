import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function EkskulIndex() {
    return (
        <AdminLayout title="Ekstrakulikuler">
            <Head title="Ekstrakulikuler" />
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <h2 className="text-2xl font-bold mb-4">Kegiatan Ekstrakulikuler</h2>
                    <p className="mb-4">Halaman ini digunakan untuk mengelola kegiatan, jadwal, dan keanggotaan ekstrakulikuler.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="p-4 border rounded-lg bg-purple-50 border-purple-100">
                            <h3 className="font-bold text-lg mb-2 text-purple-800">Total Ekskul</h3>
                            <p className="text-3xl font-bold text-purple-600">12</p>
                            <p className="text-sm text-purple-500">Aktif Berjalan</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-pink-50 border-pink-100">
                            <h3 className="font-bold text-lg mb-2 text-pink-800">Total Anggota</h3>
                            <p className="text-3xl font-bold text-pink-600">850</p>
                            <p className="text-sm text-pink-500">Siswa Terdaftar</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-orange-50 border-orange-100">
                            <h3 className="font-bold text-lg mb-2 text-orange-800">Prestasi</h3>
                            <p className="text-3xl font-bold text-orange-600">24</p>
                            <p className="text-sm text-orange-500">Tahun Ini</p>
                        </div>
                    </div>

                    <div className="mt-8 p-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        <p>Konten manajemen ekstrakulikuler akan ditampilkan di sini</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
