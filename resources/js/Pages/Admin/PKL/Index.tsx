import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function PKLIndex() {
    return (
        <AdminLayout title="Praktik Kerja Lapangan">
            <Head title="Praktik Kerja Lapangan" />
            
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <h2 className="text-2xl font-bold mb-4">Manajemen PKL / Magang</h2>
                    <p className="mb-4">Halaman ini digunakan untuk memonitor kegiatan PKL siswa, penempatan industri, dan penilaian.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="p-4 border rounded-lg bg-teal-50 border-teal-100">
                            <h3 className="font-bold text-lg mb-2 text-teal-800">Siswa PKL</h3>
                            <p className="text-3xl font-bold text-teal-600">120</p>
                            <p className="text-sm text-teal-500">Sedang Magang</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-indigo-50 border-indigo-100">
                            <h3 className="font-bold text-lg mb-2 text-indigo-800">Mitra Industri</h3>
                            <p className="text-3xl font-bold text-indigo-600">45</p>
                            <p className="text-sm text-indigo-500">Perusahaan Kerjasama</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-cyan-50 border-cyan-100">
                            <h3 className="font-bold text-lg mb-2 text-cyan-800">Guru Pembimbing</h3>
                            <p className="text-3xl font-bold text-cyan-600">15</p>
                            <p className="text-sm text-cyan-500">Guru Aktif</p>
                        </div>
                    </div>

                    <div className="mt-8 p-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        <p>Konten manajemen PKL akan ditampilkan di sini</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
