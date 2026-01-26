import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function SarprasIndex() {
    return (
        <AdminLayout title="Sarana & Prasarana">
            <Head title="Sarana & Prasarana" />
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <h2 className="text-2xl font-bold mb-4">Manajemen Sarana & Prasarana</h2>
                    <p className="mb-4">Halaman ini digunakan untuk mengelola data aset, inventaris, dan fasilitas sekolah.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                            <h3 className="font-bold text-lg mb-2 text-blue-800">Total Aset</h3>
                            <p className="text-3xl font-bold text-blue-600">1,245</p>
                            <p className="text-sm text-blue-500">Item Terdaftar</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-green-50 border-green-100">
                            <h3 className="font-bold text-lg mb-2 text-green-800">Kondisi Baik</h3>
                            <p className="text-3xl font-bold text-green-600">1,100</p>
                            <p className="text-sm text-green-500">Siap Digunakan</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-100">
                            <h3 className="font-bold text-lg mb-2 text-yellow-800">Perlu Perbaikan</h3>
                            <p className="text-3xl font-bold text-yellow-600">145</p>
                            <p className="text-sm text-yellow-500">Dalam Penanganan</p>
                        </div>
                    </div>

                    <div className="mt-8 p-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        <p>Konten manajemen sarpras akan ditampilkan di sini</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
