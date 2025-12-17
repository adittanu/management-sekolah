
export const mockUsers = [
    {
        id: 1,
        name: "Andi Saputra",
        email: "andi.saputra@sman3.belajar.id",
        role: "SISWA",
        status: "Terverifikasi",
        detail: "XII IPA 1",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andi"
    },
    {
        id: 2,
        name: "Budi Santoso",
        email: "budi.santoso@sman3.belajar.id",
        role: "WAKA",
        status: "Terverifikasi",
        detail: "-",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi"
    },
    {
        id: 3,
        name: "Pak Budi Hartono",
        email: "pak.budi.hartono@sman3.belajar.id",
        role: "GURU",
        status: "Aktif",
        detail: "-",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hartono"
    },
    {
        id: 4,
        name: "Bu Siti Aminah",
        email: "bu.siti.aminah@sman3.belajar.id",
        role: "GURU",
        status: "Aktif",
        detail: "-",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti"
    },
    {
        id: 5,
        name: "Citra Dewi",
        email: "citra.dewi@sman3.belajar.id",
        role: "SISWA",
        status: "Menunggu Verifikasi",
        detail: "X-2",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Citra"
    }
];

export const mockClasses = [
    { id: 1, name: "X-1", tingkat: "X", siswa: 36, wali: "Pak Budi Hartono" },
    { id: 2, name: "X-2", tingkat: "X", siswa: 36, wali: "Bu Siti Aminah" },
    { id: 3, name: "X-3", tingkat: "X", siswa: 35, wali: "Pak Joko" },
    { id: 4, name: "X-4", tingkat: "X", siswa: 36, wali: "Bu Rina" },
    { id: 5, name: "X-5", tingkat: "X", siswa: 36, wali: "Pak Tono" },
    { id: 6, name: "XI IPA 1", tingkat: "XI", siswa: 34, wali: "Bu Yanti" },
    { id: 7, name: "XI IPS 1", tingkat: "XI", siswa: 32, wali: "Pak Agus" },
    { id: 8, name: "XII IPA 1", tingkat: "XII", siswa: 30, wali: "Bu Susi" }
];

export const mockSchedule = {
    "Rabu": [
        { jam: 1, time: "07:00 - 07:45", subject: "Matematika", class: "XII IPA 1", room: "R. 101", teacher: "Pak Budi Hartono" },
        { jam: 2, time: "07:45 - 08:30", subject: "Matematika", class: "XII IPA 1", room: "R. 101", teacher: "Pak Budi Hartono" },
        { jam: 3, time: "08:30 - 09:15", subject: "Matematika", class: "XII IPS 2", room: "R. 102", teacher: "Pak Budi Hartono" },
    ],
    "Kamis": [
        { jam: 1, time: "07:00 - 07:45", subject: "Fisika", class: "X-1", room: "Lab Fisika", teacher: "Bu Siti Aminah" },
    ]
};

export const mockReports = [
    {
        id: 1,
        user: "Pak Budi Hartono",
        role: "GURU",
        action: "Mengisi Jurnal Kelas XII IPA 1",
        time: "2 jam yang lalu",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hartono"
    },
    {
        id: 2,
        user: "System",
        role: "SYSTEM",
        action: "Rekap bulanan generated",
        time: "5 jam yang lalu",
        avatar: ""
    },
    {
        id: 3,
        user: "Bu Siti Aminah",
        role: "GURU",
        action: "Mengisi Absensi Kelas X-2",
        time: "6 jam yang lalu",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti"
    }
];

export const mockStats = [
    { title: "Total Guru", value: "45", icon: "Users", color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Siswa", value: "1,240", icon: "GraduationCap", color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Jam Mengajar", value: "128", icon: "Clock", color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Laporan Masuk", value: "85%", icon: "FileText", color: "text-green-600", bg: "bg-green-100" }
];

export const mockSubjects = [
    { id: 1, name: "Matematika", teacher: "Pak Budi Hartono", schedule: "Senin, 07:00 - 09:00", color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, name: "B. Indo", teacher: "Bu Siti Aminah", schedule: "Senin, 09:30 - 11:00", color: "text-green-600", bg: "bg-green-50" },
    { id: 3, name: "Fisika", teacher: "Pak Bambang", schedule: "Senin, 12:30 - 14:00", color: "text-purple-600", bg: "bg-purple-50" },
    { id: 4, name: "B. Inggris", teacher: "Ms. Sarah", schedule: "Selasa, 07:00 - 08:30", color: "text-orange-600", bg: "bg-orange-50" },
    { id: 5, name: "Kimia", teacher: "Bu Ratna", schedule: "Selasa, 08:30 - 10:00", color: "text-pink-600", bg: "bg-pink-50" }
];

export const mockAttendanceData = [
    { day: 'Sen', present: 1150, absent: 90 },
    { day: 'Sel', present: 1180, absent: 60 },
    { day: 'Rab', present: 1200, absent: 40 },
    { day: 'Kam', present: 1210, absent: 30 },
    { day: 'Jum', present: 1100, absent: 140 },
    { day: 'Sab', present: 980, absent: 260 },
];
