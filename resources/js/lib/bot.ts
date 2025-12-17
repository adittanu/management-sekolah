
export type BotResponse = {
    text: string;
    isTool?: boolean;
    toolName?: string;
    delay?: number;
};

export const getBotResponse = async (message: string): Promise<BotResponse[]> => {
    const lowerMsg = message.toLowerCase();

    // Simulator "Thinking" delay
    const initialDelay = 1000;

    if (lowerMsg.includes('cuaca') || lowerMsg.includes('suhu')) {
        return [
            { text: 'Memeriksa data cuaca...', isTool: true, toolName: 'WeatherAPI', delay: initialDelay },
            { text: 'Hari ini cerah berawan, suhu sekitar 30°C di wilayah sekolah.', delay: 2000 }
        ];
    }

    if (lowerMsg.includes('hitung') || lowerMsg.includes('kalkulator') || lowerMsg.match(/[\d]+\s*[\+\-\*\/]\s*[\d]+/)) {
        return [
             { text: 'Menghitung ekspresi matematika...', isTool: true, toolName: 'Calculator', delay: initialDelay },
             { text: `Hasilnya adalah: ${eval(message.replace(/[^\d\+\-\*\/().]/g, ''))}`, delay: 1500 }
        ];
    }

    // Match 'course' AND ('buat' OR 'bikin' OR 'tambah' OR 'create' OR 'new')
    if (lowerMsg.includes('course') && (lowerMsg.match(/(buat|bikin|tambah|create|new)/))) {
        return [
            { text: 'Memulai proses pembuatan course baru...', isTool: true, toolName: 'CourseBuilder', delay: initialDelay },
            { text: 'Langkah 1: Menentukan Topik Utama. Topik "Pengenalan ReactJS" telah dipilih berdasarkan konteks.', delay: 2000 },
            { text: 'Langkah 2: Composing Modul... (3 Modul dibuat)', delay: 4000 },
            { text: 'Langkah 3: Finalisasi Course...', delay: 6000 },
            { text: 'Selesai! Draft Course "Pengenalan ReactJS" telah berhasil dibuat dan disimpan di LMS.', delay: 7000 }
        ];
    }

    // Default Chat
    return [
        { text: 'Halo! Saya adalah asisten AI Sekolah. Saya bisa membantu mengecek cuaca, menghitung, atau membantu administrasi seperti membuat course.', delay: initialDelay }
    ];
};
