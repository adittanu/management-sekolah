import { useCallback, useEffect, useState } from 'react';
import { Joyride, EVENTS, STATUS, Step } from 'react-joyride';
import { router } from '@inertiajs/react';
import { TourContext } from './TourContext';

const TOUR_STORAGE_KEY_PREFIX = 'app-tour-completed-';

interface TourStepExtra {
    target: string;
    title: string;
    content: string;
    pathname: string;
    placement?: Step['placement'];
    disableBeacon?: boolean;
}

const tourStepsByRole: Record<string, TourStepExtra[]> = {
    admin: [
        // 1. DASHBOARD
        {
            target: '[data-tour="sidebar"]',
            title: 'Selamat Datang di Panel Admin!',
            content: 'Ini adalah sidebar navigasi utama untuk mengelola seluruh aspek sekolah. Gunakan menu di bawah ini untuk mengakses berbagai fitur.',
            pathname: '/admin/dashboard',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '[data-tour="nav-dashboard"]',
            title: 'Dashboard Utama',
            content: 'Menu ini menampilkan grafik, statistik penting sekolah, dan ringkasan data siswa serta staf pengajar secara keseluruhan.',
            pathname: '/admin/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-users"]',
            title: 'Menu Manajemen User',
            content: 'Menu ini digunakan untuk mengelola akun pengguna sekolah (Siswa, Guru, Orangtua, dan Admin). Klik Selanjutnya untuk berpindah ke halaman Manajemen User.',
            pathname: '/admin/dashboard',
            placement: 'right',
        },
        
        // 2. MANAJEMEN USER
        {
            target: '[data-tour="btn-import-users"]',
            title: 'Daftar & Import Pengguna',
            content: 'Di sini Anda dapat mencari, menyaring, menambah, atau mengedit akun pengguna. Anda juga bisa mengimpor data secara massal dengan file Excel/CSV.',
            pathname: '/admin/user',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-kelas"]',
            title: 'Menu Data Rombel',
            content: 'Sekarang mari kita lihat menu untuk mengelola kelas dan rombongan belajar. Klik Selanjutnya untuk berpindah ke halaman Data Rombel.',
            pathname: '/admin/user',
            placement: 'right',
        },

        // 3. DATA ROMBEL
        {
            target: '[data-tour="btn-add-kelas"]',
            title: 'Kelola Rombongan Belajar (Kelas)',
            content: 'Di halaman ini, Anda dapat memetakan rombel, menetapkan wali kelas, dan memantau siswa per kelas secara real-time.',
            pathname: '/admin/kelas',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-mapel"]',
            title: 'Menu Mata Pelajaran',
            content: 'Selanjutnya, mari beralih ke pengelolaan mata pelajaran. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/kelas',
            placement: 'right',
        },

        // 4. MATA PELAJARAN
        {
            target: '[data-tour="btn-add-mapel"]',
            title: 'Kelola Mata Pelajaran',
            content: 'Di halaman ini, Anda dapat membuat mata pelajaran baru, menentukan kategori wajib/peminatan, serta menugaskan guru pengajar.',
            pathname: '/admin/mapel',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-ruangan"]',
            title: 'Menu Ruangan',
            content: 'Mari beralih ke pengelolaan ruangan sekolah. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/mapel',
            placement: 'right',
        },

        // 5. RUANGAN
        {
            target: '[data-tour="btn-add-ruangan"]',
            title: 'Kelola Ruangan & Lab',
            content: 'Atur master data ruangan, laboratorium, lapangan, dan kapasitasnya untuk menghindari konflik pemakaian ruangan.',
            pathname: '/admin/ruangan',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-pengumuman"]',
            title: 'Menu Pengumuman',
            content: 'Mari kita lihat menu untuk menyebarkan pengumuman sekolah. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/ruangan',
            placement: 'right',
        },

        // 6. PENGUMUMAN
        {
            target: '[data-tour="btn-add-pengumuman"]',
            title: 'Buat & Bagikan Pengumuman',
            content: 'Gunakan halaman ini untuk mempublikasikan pengumuman penting kepada siswa, guru, maupun orangtua, lengkap dengan fitur cetak dan bagikan.',
            pathname: '/admin/pengumuman',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-generator-surat"]',
            title: 'Menu Generator Surat',
            content: 'Selanjutnya, kita akan melihat fitur pembuatan surat resmi secara instan. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/pengumuman',
            placement: 'right',
        },

        // 7. GENERATOR SURAT
        {
            target: '[data-tour="btn-create-surat"]',
            title: 'Generator Surat Resmi',
            content: 'Hasilkan surat dinas, edaran, maupun surat keterangan berformat resmi lengkap dengan kop surat otomatis.',
            pathname: '/admin/generator-surat',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-time-slot"]',
            title: 'Menu Jam Pelajaran',
            content: 'Mari beralih ke konfigurasi waktu jam pelajaran (time slots). Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/generator-surat',
            placement: 'right',
        },

        // 8. JAM PELAJARAN
        {
            target: '[data-tour="btn-add-timeslot"]',
            title: 'Konfigurasi Jam Pelajaran',
            content: 'Atur slot waktu kegiatan belajar mengajar (KBM) harian untuk menjadi acuan algoritma penjadwalan AI.',
            pathname: '/admin/time-slot',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-jadwal"]',
            title: 'Menu Jadwal Pelajaran',
            content: 'Sekarang, mari kita buat Jadwal Pelajaran menggunakan AI. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/time-slot',
            placement: 'right',
        },

        // 9. JADWAL PELAJARAN
        {
            target: '[data-tour="btn-auto-generate"]',
            title: 'Penjadwalan Otomatis AI',
            content: 'Ini adalah fitur kecerdasan buatan lokal untuk membuat jadwal sekolah bebas konflik. Algoritma CSP AI kami akan otomatis memetakan mata pelajaran, guru, kelas, dan ketersediaan ruangan dalam hitungan detik.',
            pathname: '/admin/jadwal',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-absensi"]',
            title: 'Menu Presensi',
            content: 'Mari kita lihat modul pencatatan kehadiran (presensi) siswa dan guru. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/jadwal',
            placement: 'right',
        },

        // 10. PRESENSI
        {
            target: '[data-tour="tabs-absensi"]',
            title: 'Pencatatan & Monitoring Presensi',
            content: 'Pantau kehadiran harian kelas secara real-time, cetak rekapitulasi bulanan, dan kelola jurnal mengajar harian di sini.',
            pathname: '/admin/absensi',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-rapor-input"]',
            title: 'Menu Input Nilai',
            content: 'Mari kita lihat bagaimana mengelola penilaian akademik siswa. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/absensi',
            placement: 'right',
        },

        // 11. INPUT NILAI
        {
            target: '[data-tour="btn-config-rapor"]',
            title: 'Filter & Input Nilai Rapor',
            content: 'Gunakan panel filter ini untuk memilih kelas, mata pelajaran, dan semester. Anda juga dapat menggunakan AI untuk membuat deskripsi rapor otomatis.',
            pathname: '/admin/rapor/input',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-rapor-view"]',
            title: 'Menu Cetak Rapor',
            content: 'Selanjutnya, mari beralih ke pratinjau dan pencetakan lembar rapor resmi. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/rapor/input',
            placement: 'right',
        },

        // 12. RAPORT (VIEW)
        {
            target: '[data-tour="btn-cetak-rapor"]',
            title: 'Cetak & Unduh Rapor PDF',
            content: 'Di sini Anda dapat mencetak lembar rapor berstandar resmi A4 secara langsung atau mengunduhnya sebagai dokumen PDF.',
            pathname: '/admin/rapor/view',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-perpustakaan"]',
            title: 'Menu Perpustakaan',
            content: 'Mari kunjungi modul perpustakaan digital sekolah. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/rapor/view',
            placement: 'right',
        },

        // 13. PERPUSTAKAAN
        {
            target: '[data-tour="btn-add-buku"]',
            title: 'Perpustakaan Digital',
            content: 'Kelola koleksi e-book sekolah, pantau transaksi peminjaman buku aktif, serta baca buku langsung secara interaktif.',
            pathname: '/admin/perpustakaan',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-keuangan"]',
            title: 'Menu Keuangan & SPP',
            content: 'Selanjutnya, mari beralih ke modul administrasi tagihan keuangan sekolah. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/perpustakaan',
            placement: 'right',
        },

        // 14. KEUANGAN & SPP
        {
            target: '[data-tour="btn-buat-tagihan"]',
            title: 'Administrasi Keuangan Sekolah',
            content: 'Kelola tagihan SPP bulanan, uang gedung, atau tagihan sekali bayar. Kirim notifikasi tunggakan langsung ke orangtua siswa.',
            pathname: '/admin/keuangan',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-setting"]',
            title: 'Menu Pengaturan',
            content: 'Terakhir, mari kita lihat halaman konfigurasi sistem aplikasi. Klik Selanjutnya untuk melanjutkan.',
            pathname: '/admin/keuangan',
            placement: 'right',
        },

        // 15. PENGATURAN
        {
            target: '[data-tour="btn-save-settings"]',
            title: 'Pengaturan Aplikasi Sekolah',
            content: 'Konfigurasikan nama sekolah, logo, kop surat resmi, tahun ajaran aktif, dan pengaturan umum aplikasi lainnya di halaman ini.',
            pathname: '/admin/setting',
            placement: 'bottom',
        },
        {
            target: '[data-tour="sidebar"]',
            title: 'Tur Admin Selesai!',
            content: 'Luar biasa! Anda telah menjelajahi seluruh menu navigasi sistem dari Dashboard hingga Pengaturan. Sekarang Anda siap menggunakan aplikasi secara maksimal!',
            pathname: '/admin/setting',
            placement: 'right',
        },
    ],
    teacher: [
        {
            target: '[data-tour="sidebar"]',
            title: 'Selamat Datang, Guru!',
            content: 'Ini adalah panel navigasi guru untuk mengelola kegiatan akademik, jadwal mengajar, dan nilai siswa.',
            pathname: '/guru/dashboard',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '[data-tour="nav-dashboard"]',
            title: 'Dashboard Guru',
            content: 'Halaman utama yang menampilkan ringkasan aktivitas harian, jadwal mengajar hari ini, dan statistik penting lainnya.',
            pathname: '/guru/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-kelas"]',
            title: 'Kelas Perwalian',
            content: 'Kelola data siswa, profil, dan pantau perkembangan akademik siswa yang berada di bawah perwalian Anda.',
            pathname: '/guru/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-jadwal"]',
            title: 'Jadwal Mengajar',
            content: 'Lihat jadwal mengajar mingguan lengkap beserta jam pelajaran dan ruang kelas masing-masing.',
            pathname: '/guru/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-absensi"]',
            title: 'Input Presensi Siswa',
            content: 'Menu untuk mengisi daftar kehadiran harian siswa di kelas ajar Anda secara cepat dan real-time.',
            pathname: '/guru/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-rapor-input"]',
            title: 'Menu Input Nilai',
            content: 'Mari mulai menginput nilai siswa. Klik Selanjutnya untuk diarahkan ke halaman pengisian nilai.',
            pathname: '/guru/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="btn-config-rapor"]',
            title: 'Filter Kelas & Mapel',
            content: 'Panel filter untuk memilih kelas ajar, mata pelajaran, semester, dan jenis ujian (tengah/akhir semester).',
            pathname: '/guru/rapor/input',
            placement: 'bottom',
        },
        {
            target: '[data-tour="btn-auto-desc"]',
            title: 'AI Generator Deskripsi',
            content: 'Fitur cerdas untuk menghasilkan deskripsi capaian kompetensi siswa secara otomatis berdasarkan nilai angka yang dimasukkan. Sangat praktis!',
            pathname: '/guru/rapor/input',
            placement: 'bottom',
        },
        {
            target: '[data-tour="btn-simpan-rapor"]',
            title: 'Simpan Penilaian',
            content: 'Tekan tombol ini untuk menyimpan semua perubahan nilai dan deskripsi secara aman ke server.',
            pathname: '/guru/rapor/input',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-rapor-view"]',
            title: 'Menu Cetak Rapor',
            content: 'Setelah nilai diinput, Anda bisa melakukan pratinjau lembar rapor di sini. Klik Selanjutnya untuk ke halaman pratinjau.',
            pathname: '/guru/rapor/input',
            placement: 'right',
        },
        {
            target: '[data-tour="btn-cetak-rapor"]',
            title: 'Cetak Lembar Rapor',
            content: 'Cetak dokumen rapor fisik siswa kelas perwalian Anda secara langsung menggunakan printer dengan tata letak rapi.',
            pathname: '/guru/rapor/view',
            placement: 'bottom',
        },
        {
            target: '[data-tour="btn-unduh-rapor-pdf"]',
            title: 'Ekspor ke PDF',
            content: 'Unduh file PDF rapor resmi untuk dibagikan secara elektronik atau disimpan dalam bentuk arsip digital sekolah.',
            pathname: '/guru/rapor/view',
            placement: 'bottom',
        },
        {
            target: '[data-tour="sidebar"]',
            title: 'Tur Guru Selesai!',
            content: 'Hebat! Anda telah menguasai alur pengisian nilai, pembuatan deskripsi otomatis AI, dan pencetakan rapor siswa.',
            pathname: '/guru/rapor/view',
            placement: 'right',
        },
    ],
    student: [
        {
            target: '[data-tour="sidebar"]',
            title: 'Selamat Datang di Portal Siswa!',
            content: 'Di sini Anda dapat melihat jadwal, mengakses perpustakaan, dan memantau perkembangan nilai rapor Anda.',
            pathname: '/siswa/dashboard',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '[data-tour="nav-dashboard"]',
            title: 'Dashboard Siswa',
            content: 'Ringkasan aktivitas hari ini, tugas yang berjalan, dan pengumuman terbaru dari sekolah.',
            pathname: '/siswa/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-rapor"]',
            title: 'Rapor Akademik',
            content: 'Mari kita lihat halaman rapor hasil belajar Anda. Klik Selanjutnya untuk membuka halaman rapor.',
            pathname: '/siswa/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="btn-cetak-rapor"]',
            title: 'Cetak Lembar Rapor',
            content: 'Anda dapat mencetak pratinjau lembar hasil belajar Anda langsung dari browser.',
            pathname: '/siswa/rapor',
            placement: 'bottom',
        },
        {
            target: '[data-tour="btn-unduh-rapor-pdf"]',
            title: 'Unduh Dokumen PDF',
            content: 'Gunakan tombol ini untuk mengunduh salinan resmi berkas rapor digital Anda dalam bentuk file PDF.',
            pathname: '/siswa/rapor',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-perpustakaan"]',
            title: 'Perpustakaan Digital',
            content: 'Akses ribuan buku digital, baca online, dan lakukan peminjaman buku perpustakaan sekolah secara mandiri.',
            pathname: '/siswa/rapor',
            placement: 'right',
        },
        {
            target: '[data-tour="sidebar"]',
            title: 'Tur Siswa Selesai!',
            content: 'Selamat belajar! Manfaatkan seluruh fitur di portal ini untuk mendukung kelancaran studi Anda.',
            pathname: '/siswa/rapor',
            placement: 'right',
        },
    ],
    parent: [
        {
            target: '[data-tour="sidebar"]',
            title: 'Selamat Datang Wali Murid!',
            content: 'Ini adalah portal monitoring orang tua untuk memantau kemajuan belajar, kehadiran, dan administrasi anak Anda.',
            pathname: '/orangtua/dashboard',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '[data-tour="nav-dashboard"]',
            title: 'Dashboard Orang Tua',
            content: 'Menampilkan data singkat profil anak, informasi kelas, jadwal sekolah, dan rangkuman kehadiran.',
            pathname: '/orangtua/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-pengumuman"]',
            title: 'Berita & Pengumuman',
            content: 'Dapatkan berita penting, surat edaran resmi, dan pengumuman kegiatan sekolah langsung di sini.',
            pathname: '/orangtua/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-kehadiran"]',
            title: 'Monitoring Kehadiran',
            content: 'Pantau persentase dan detail kehadiran harian anak Anda (sakit, izin, tanpa keterangan) secara berkala.',
            pathname: '/orangtua/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="nav-rapor"]',
            title: 'Rapor Perkembangan',
            content: 'Mari kita lihat halaman rapor hasil belajar anak Anda. Klik Selanjutnya untuk masuk ke halaman rapor.',
            pathname: '/orangtua/dashboard',
            placement: 'right',
        },
        {
            target: '[data-tour="btn-cetak-rapor"]',
            title: 'Pratinjau & Cetak Rapor',
            content: 'Lihat pratinjau lembar rapor lengkap dengan tanda tangan wali kelas dan kepala sekolah. Anda bisa mencetaknya langsung.',
            pathname: '/orangtua/rapor',
            placement: 'bottom',
        },
        {
            target: '[data-tour="btn-unduh-rapor-pdf"]',
            title: 'Unduh Berkas PDF',
            content: 'Unduh file PDF resmi lembar rapor hasil belajar anak untuk arsip keluarga atau keperluan eksternal.',
            pathname: '/orangtua/rapor',
            placement: 'bottom',
        },
        {
            target: '[data-tour="nav-keuangan"]',
            title: 'Menu Keuangan Anak',
            content: 'Sekarang, mari pantau administrasi pembayaran sekolah anak Anda. Klik Selanjutnya untuk masuk ke halaman Keuangan.',
            pathname: '/orangtua/rapor',
            placement: 'right',
        },
        {
            target: '[data-tour="card-tunggakan-spp"]',
            title: 'Pantau Sisa Tunggakan',
            content: 'Di sini Anda dapat melihat jumlah nominal SPP atau iuran wajib sekolah anak Anda yang belum diselesaikan.',
            pathname: '/orangtua/keuangan',
            placement: 'bottom',
        },
        {
            target: '[data-tour="card-pembayaran-spp"]',
            title: 'Total Pembayaran Sukses',
            content: 'Menampilkan akumulasi dana pendidikan anak yang telah disetorkan dan sukses divalidasi oleh petugas tata usaha.',
            pathname: '/orangtua/keuangan',
            placement: 'bottom',
        },
        {
            target: '[data-tour="card-riwayat-transaksi"]',
            title: 'Log Transaksi Real-time',
            content: 'Setiap pembayaran SPP yang diinput oleh sekolah akan tercatat secara detail di kartu ini untuk menjamin transparansi keuangan.',
            pathname: '/orangtua/keuangan',
            placement: 'bottom',
        },
        {
            target: '[data-tour="sidebar"]',
            title: 'Tur Selesai!',
            content: 'Terima kasih telah mengikuti panduan. Portal ini dirancang untuk memudahkan sinergi antara sekolah dan orang tua.',
            pathname: '/orangtua/keuangan',
            placement: 'right',
        },
    ],
};

function getJoyrideSteps(role: string): Step[] {
    const steps = tourStepsByRole[role] || tourStepsByRole.admin;
    return steps.map((step) => ({
        target: step.target,
        title: step.title,
        content: step.content,
        placement: step.placement as Step['placement'],
        disableBeacon: step.disableBeacon,
    })) as Step[];
}

export default function TourProvider({ children, role = 'admin' }: { children: React.ReactNode; role?: string }) {
    const [tourRunning, setTourRunning] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState<Step[]>([]);
    const [tourKey, setTourKey] = useState(0);

    const storageKey = `${TOUR_STORAGE_KEY_PREFIX}${role}`;
    const sessionActiveIndexKey = `tour-active-index-${role}`;
    const sessionRunningKey = `tour-running-${role}`;

    const handleJoyrideEvent = useCallback((data: any) => {
        const { action, index, status, type } = data;
        const roleSteps = tourStepsByRole[role] || tourStepsByRole.admin;

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            const isNext = action === 'next' || type === EVENTS.TARGET_NOT_FOUND;
            const nextIndex = index + (isNext ? 1 : -1);

            if (nextIndex >= 0 && nextIndex < roleSteps.length) {
                const nextStepDef = roleSteps[nextIndex];
                const currentStepDef = roleSteps[index];

                if (nextStepDef && currentStepDef && nextStepDef.pathname !== currentStepDef.pathname) {
                    setTourRunning(false);
                    sessionStorage.setItem(sessionActiveIndexKey, String(nextIndex));
                    sessionStorage.setItem(sessionRunningKey, 'true');
                    
                    router.get(nextStepDef.pathname, {}, {
                        onFinish: () => {
                            // Handled by mount useEffect
                        }
                    });
                } else {
                    setStepIndex(nextIndex);
                    sessionStorage.setItem(sessionActiveIndexKey, String(nextIndex));
                }
            } else if (nextIndex >= roleSteps.length) {
                setTourRunning(false);
                localStorage.setItem(storageKey, 'true');
                sessionStorage.removeItem(sessionActiveIndexKey);
                sessionStorage.removeItem(sessionRunningKey);
            }
        } else if (status === STATUS.SKIPPED || status === STATUS.FINISHED) {
            setTourRunning(false);
            localStorage.setItem(storageKey, 'true');
            sessionStorage.removeItem(sessionActiveIndexKey);
            sessionStorage.removeItem(sessionRunningKey);
        }
    }, [role, storageKey, sessionActiveIndexKey, sessionRunningKey]);

    const startTour = useCallback(() => {
        const roleSteps = tourStepsByRole[role] || tourStepsByRole.admin;
        const startPathname = roleSteps[0]?.pathname || '/admin/dashboard';
        
        localStorage.removeItem(storageKey);
        sessionStorage.setItem(sessionRunningKey, 'true');
        sessionStorage.setItem(sessionActiveIndexKey, '0');
        
        if (window.location.pathname !== startPathname) {
            setTourRunning(false);
            router.get(startPathname);
        } else {
            setSteps(getJoyrideSteps(role));
            setStepIndex(0);
            setTourKey((k) => k + 1);
            setTourRunning(true);
        }
    }, [role, storageKey, sessionRunningKey, sessionActiveIndexKey]);

    // Resume tour on mount / location change
    useEffect(() => {
        const isRunning = sessionStorage.getItem(sessionRunningKey) === 'true';
        const savedIndexStr = sessionStorage.getItem(sessionActiveIndexKey);
        
        if (isRunning && savedIndexStr !== null) {
            const savedIndex = parseInt(savedIndexStr, 10);
            const roleSteps = tourStepsByRole[role] || tourStepsByRole.admin;
            const stepDef = roleSteps[savedIndex];
            
            if (stepDef && window.location.pathname === stepDef.pathname) {
                setSteps(getJoyrideSteps(role));
                setStepIndex(savedIndex);
                const timer = setTimeout(() => {
                    setTourRunning(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [role, sessionActiveIndexKey, sessionRunningKey]);

    // Auto-start for first-time visitors
    useEffect(() => {
        const completed = localStorage.getItem(storageKey);
        const isRunning = sessionStorage.getItem(sessionRunningKey) === 'true';
        if (!completed && !isRunning) {
            const timer = setTimeout(() => {
                startTour();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [startTour, storageKey, sessionRunningKey]);

    useEffect(() => {
        (window as any).startAppTour = () => {
            localStorage.removeItem(storageKey);
            startTour();
        };
    }, [startTour, storageKey]);

    return (
        <TourContext.Provider value={{ startTour }}>
            <Joyride
                key={tourKey}
                steps={steps}
                stepIndex={stepIndex}
                onEvent={handleJoyrideEvent}
                continuous
                run={tourRunning}
                options={{
                    showProgress: true,
                    buttons: ['back', 'close', 'primary', 'skip'],
                    primaryColor: '#2563eb',
                    textColor: '#1e293b',
                    backgroundColor: '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.4)',
                    spotlightPadding: 6,
                    zIndex: 9999,
                    overlayClickAction: 'next',
                }}
                styles={{
                    tooltip: {
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        maxWidth: '400px',
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                    },
                    tooltipTitle: {
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#0f172a',
                        marginBottom: '8px',
                    },
                    tooltipContent: {
                        fontSize: '14px',
                        color: '#475569',
                        lineHeight: 1.6,
                    },
                    buttonPrimary: {
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '8px 16px',
                    },
                    buttonBack: {
                        fontSize: '13px',
                        fontWeight: 600,
                        marginRight: '12px',
                        color: '#64748b',
                    },
                    buttonSkip: {
                        fontSize: '13px',
                        color: '#94a3b8',
                    }
                }}
                locale={{
                    back: 'Kembali',
                    close: 'Tutup',
                    last: 'Selesai',
                    next: 'Selanjutnya',
                    skip: 'Lewati',
                }}
            />
            {children}
        </TourContext.Provider>
    );
}
