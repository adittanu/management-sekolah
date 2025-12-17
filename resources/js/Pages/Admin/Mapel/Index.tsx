import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { mockSubjects } from '@/data/mockData';
import { Search, Plus, BookOpen, Clock, User as UserIcon } from 'lucide-react';

export default function MapelIndex() {
    return (
        <AdminLayout title="Mata Pelajaran">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mata Pelajaran</h2>
                        <p className="text-slate-500">Atur daftar mata pelajaran dan guru pengampu.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Mapel
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Cari nama mapel atau guru..." 
                        className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockSubjects.map((subject) => (
                        <Card key={subject.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${subject.bg} ${subject.color}`}>
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                            <span className="sr-only">Edit</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </Button>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{subject.name}</h3>
                                
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                                        {subject.teacher}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                                        {subject.schedule}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add New Card Placeholder */}
                    <button className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all gap-3 bg-slate-50/50">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Tambah Mapel Baru</span>
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
