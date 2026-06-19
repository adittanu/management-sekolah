/**
 * Shared raport print helper — generates a clean print-ready window
 * using only inline styles (no Tailwind dependency).
 * Format: Rapor SD sesuai standar Kurikulum Merdeka.
 */

interface SubjectGrade {
    subject: string;
    daily: number | null;
    mid: number | null;
    final: number | null;
    average: number | null;
    daily_desc: string | null;
    mid_desc: string | null;
    final_desc: string | null;
}

interface StudentInfo {
    name: string;
    email?: string;
    identity_number?: string;
    address?: string;
}

interface ClassroomInfo {
    name: string;
    fase?: string;
}

interface SchoolSettings {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    headmaster_name?: string;
    headmaster_id?: string;
}

interface PrintData {
    student: StudentInfo;
    classroom: ClassroomInfo;
    subjects: SubjectGrade[];
    average: number;
    academic_year: string;
    semester: number;
    attendance?: {
        hadir: number;
        sakit: number;
        izin: number;
        alpha: number;
        total: number;
    };
    cocurricular?: string;
    extracurricular?: Array<{ name: string; description: string }>;
    teacher_notes?: string;
    parent_notes?: string;
    schoolSettings?: SchoolSettings;
    report_type?: string;
}

function getSemesterLabel(semester: number): string {
    return semester === 1 ? 'Ganjil (I)' : 'Genap (II)';
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#039;');
}

function buildDescription(subj: SubjectGrade): string {
    const parts: string[] = [];
    if (subj.daily_desc) parts.push(subj.daily_desc);
    if (subj.mid_desc) parts.push(subj.mid_desc);
    if (subj.final_desc) parts.push(subj.final_desc);
    return parts.join('. ');
}

export function printRaport(data: PrintData, toast?: (msg: string) => void, schoolSettings?: SchoolSettings): void {
    const { student, classroom, subjects, average, academic_year, semester, attendance } = data;
    const school = schoolSettings || data.schoolSettings || {};
    const schoolName = school.name || 'Nama Sekolah';
    const schoolAddress = school.address || '';
    const schoolPhone = school.phone || '';
    const schoolEmail = school.email || '';
    const schoolLogo = school.logo || '';
    const headmasterName = school.headmaster_name || '';
    const headmasterId = school.headmaster_id || '';

    const studentNis = student.identity_number || '-';
    const studentAddress = student.address || '-';
    const classroomFase = classroom.fase || '-';
    const cocurricular = data.cocurricular || '-';
    const extracurricular = data.extracurricular || [];
    const teacherNotes = data.teacher_notes || '';
    const parentNotes = data.parent_notes || '';

    // Build grade rows
    const gradeRows = subjects.map((s, i) => {
        const desc = buildDescription(s);
        return `<tr>
            <td style="border:1px solid #cbd5e1;padding:7px 8px;text-align:center;font-size:11px;">${i + 1}</td>
            <td style="border:1px solid #cbd5e1;padding:7px 8px;text-align:left;font-size:11px;">${escapeHtml(s.subject)}</td>
            <td style="border:1px solid #cbd5e1;padding:7px 8px;text-align:center;font-size:11px;font-weight:bold;">${s.average ?? '-'}</td>
            <td style="border:1px solid #cbd5e1;padding:7px 8px;text-align:left;font-size:10px;line-height:1.4;">${escapeHtml(desc) || '-'}</td>
        </tr>`;
    }).join('');

    // Build extracurricular rows
    const extraRows = extracurricular.length > 0
        ? extracurricular.map((e, i) => `<tr>
            <td style="border:1px solid #cbd5e1;padding:7px 8px;text-align:center;font-size:11px;">${i + 1}</td>
            <td style="border:1px solid #cbd5e1;padding:7px 8px;text-align:left;font-size:11px;">${escapeHtml(e.name)}</td>
            <td style="border:1px solid #cbd5e1;padding:7px 8px;text-align:left;font-size:11px;">${escapeHtml(e.description)}</td>
        </tr>`).join('')
        : `<tr><td colspan="3" style="border:1px solid #cbd5e1;padding:7px 8px;text-align:center;font-size:11px;color:#94a3b8;">-</td></tr>`;

    // Attendance
    const sakit = attendance?.sakit ?? 0;
    const izin = attendance?.izin ?? 0;
    const alpha = attendance?.alpha ?? 0;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Raport - ${escapeHtml(student.name)}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm 15mm 20mm 15mm;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            color: #1e293b;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .no-break { page-break-inside: avoid; }
        @media print {
            body { padding: 0; }
            .no-break { page-break-inside: avoid; }
        }
    </style>
</head>
<body style="padding:10px 15px;">
    <!-- Student Info - 2 Column Layout -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:11px;">
        <tr>
            <td style="border:none;padding:3px 0;width:50%;vertical-align:top;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;width:120px;">Nama Murid</td>
                        <td style="border:none;padding:2px 0;width:15px;">:</td>
                        <td style="border:none;padding:2px 0;">${escapeHtml(student.name)}</td>
                    </tr>
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;">NIS</td>
                        <td style="border:none;padding:2px 0;">:</td>
                        <td style="border:none;padding:2px 0;">${escapeHtml(studentNis)}</td>
                    </tr>
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;">Sekolah</td>
                        <td style="border:none;padding:2px 0;">:</td>
                        <td style="border:none;padding:2px 0;">${escapeHtml(schoolName)}</td>
                    </tr>
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;">Alamat</td>
                        <td style="border:none;padding:2px 0;">:</td>
                        <td style="border:none;padding:2px 0;">${escapeHtml(studentAddress)}</td>
                    </tr>
                </table>
            </td>
            <td style="border:none;padding:3px 0;width:50%;vertical-align:top;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;width:120px;">Kelas</td>
                        <td style="border:none;padding:2px 0;width:15px;">:</td>
                        <td style="border:none;padding:2px 0;">${escapeHtml(classroom.name)}</td>
                    </tr>
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;">Fase</td>
                        <td style="border:none;padding:2px 0;">:</td>
                        <td style="border:none;padding:2px 0;">${data.report_type === 'mid' ? 'Ujian Tengah Semester' : 'Ujian Akhir Semester'}</td>
                    </tr>
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;">Semester</td>
                        <td style="border:none;padding:2px 0;">:</td>
                        <td style="border:none;padding:2px 0;">${getSemesterLabel(semester)}</td>
                    </tr>
                    <tr>
                        <td style="border:none;padding:2px 0;font-weight:600;">Tahun Ajaran</td>
                        <td style="border:none;padding:2px 0;">:</td>
                        <td style="border:none;padding:2px 0;">${escapeHtml(academic_year)}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Grades Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px;" class="no-break">
        <thead>
            <tr style="background-color:#f1f5f9;">
                <th style="border:1px solid #cbd5e1;padding:6px 8px;text-align:center;font-size:11px;font-weight:600;width:35px;">No</th>
                <th style="border:1px solid #cbd5e1;padding:6px 8px;text-align:left;font-size:11px;font-weight:600;">Mata Pelajaran</th>
                <th style="border:1px solid #cbd5e1;padding:6px 8px;text-align:center;font-size:11px;font-weight:600;width:80px;">Nilai Akhir</th>
                <th style="border:1px solid #cbd5e1;padding:6px 8px;text-align:left;font-size:11px;font-weight:600;">Capaian Kompetensi</th>
            </tr>
        </thead>
        <tbody>${gradeRows}</tbody>
    </table>

    <!-- Kokurikuler -->
    <div style="margin-bottom:18px;" class="no-break">
        <table style="width:100%;border-collapse:collapse;">
            <tr style="background-color:#f1f5f9;">
                <td style="border:1px solid #cbd5e1;padding:7px 8px;font-size:11px;font-weight:700;text-align:left;">Kokurikuler</td>
            </tr>
            <tr>
                <td style="border:1px solid #cbd5e1;padding:7px 8px;font-size:11px;">${escapeHtml(cocurricular)}</td>
            </tr>
        </table>
    </div>

    <!-- Ekstrakurikuler -->
    <div style="margin-bottom:18px;" class="no-break">
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background-color:#f1f5f9;">
                    <th style="border:1px solid #cbd5e1;padding:6px 8px;text-align:center;font-size:11px;font-weight:600;width:35px;">No</th>
                    <th style="border:1px solid #cbd5e1;padding:6px 8px;text-align:left;font-size:11px;font-weight:600;">Ekstrakurikuler</th>
                    <th style="border:1px solid #cbd5e1;padding:6px 8px;text-align:left;font-size:11px;font-weight:600;">Keterangan</th>
                </tr>
            </thead>
            <tbody>${extraRows}</tbody>
        </table>
    </div>

    <!-- Attendance & Teacher Notes side by side -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px;" class="no-break">
        <tr>
            <!-- Ketidakhadiran -->
            <td style="width:48%;vertical-align:top;padding-right:2%;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background-color:#f1f5f9;">
                        <td colspan="2" style="border:1px solid #cbd5e1;padding:7px 8px;font-size:11px;font-weight:700;">Ketidakhadiran</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #cbd5e1;padding:5px 8px;font-size:11px;">Sakit</td>
                        <td style="border:1px solid #cbd5e1;padding:5px 8px;font-size:11px;text-align:right;">${sakit} hari</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #cbd5e1;padding:5px 8px;font-size:11px;">Izin</td>
                        <td style="border:1px solid #cbd5e1;padding:5px 8px;font-size:11px;text-align:right;">${izin} hari</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #cbd5e1;padding:5px 8px;font-size:11px;">Tanpa Keterangan</td>
                        <td style="border:1px solid #cbd5e1;padding:5px 8px;font-size:11px;text-align:right;">${alpha} hari</td>
                    </tr>
                </table>
            </td>
            <!-- Catatan Wali Kelas -->
            <td style="width:52%;vertical-align:top;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr style="background-color:#f1f5f9;">
                        <td style="border:1px solid #cbd5e1;padding:7px 8px;font-size:11px;font-weight:700;">Catatan Wali Kelas</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #cbd5e1;padding:7px 8px;font-size:11px;height:60px;vertical-align:top;">${escapeHtml(teacherNotes) || '&nbsp;'}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Tanggapan Orang Tua/Wali Murid -->
    <div style="margin-bottom:18px;" class="no-break">
        <table style="width:100%;border-collapse:collapse;">
            <tr style="background-color:#f1f5f9;">
                <td style="border:1px solid #cbd5e1;padding:7px 8px;font-size:11px;font-weight:700;">Tanggapan Orang Tua/ Wali Murid</td>
            </tr>
            <tr>
                <td style="border:1px solid #cbd5e1;padding:7px 8px;font-size:11px;height:60px;vertical-align:top;">${escapeHtml(parentNotes) || '&nbsp;'}</td>
            </tr>
        </table>
    </div>

    <!-- Signatures -->
    <div style="margin-top:20px;font-size:11px;page-break-inside:avoid;">
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
            <colgroup>
                <col style="width:33%;">
                <col style="width:34%;">
                <col style="width:33%;">
            </colgroup>
            <tr>
                <td style="text-align:center;vertical-align:top;border:none;padding:0;">
                    <div style="height:100px;"></div>
                    <div style="width:80%;margin:0 auto;border-top:1px solid #1e293b;padding-top:6px;">
                        <strong style="font-size:11px;">Orang Tua Murid</strong>
                    </div>
                </td>
                <td style="text-align:center;vertical-align:top;border:none;padding:0;">
                    <p style="text-align:center;margin:0 0 4px 0;color:#64748b;font-size:10px;">Mengetahui,</p>
                    <div style="height:81px;"></div>
                    <div style="width:80%;margin:0 auto;border-top:1px solid #1e293b;padding-top:6px;">
                        <strong style="font-size:11px;">Kepala Sekolah</strong>
                        ${headmasterName ? `<p style="margin:3px 0 0 0;font-weight:700;font-size:11px;">${escapeHtml(headmasterName)}</p>` : ''}
                        ${headmasterId ? `<p style="margin:1px 0 0 0;font-size:10px;color:#64748b;">NIP. ${escapeHtml(headmasterId)}</p>` : ''}
                    </div>
                </td>
                <td style="text-align:center;vertical-align:top;border:none;padding:0;">
                    <p style="text-align:right;margin:0 0 4px 0;color:#64748b;font-size:10px;">Tempat, Tanggal Rapor</p>
                    <div style="height:81px;"></div>
                    <div style="width:80%;margin:0 auto;border-top:1px solid #1e293b;padding-top:6px;">
                        <strong style="font-size:11px;">Wali Kelas</strong>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;

    // Use a hidden iframe to avoid popup blockers
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
        document.body.removeChild(iframe);
        if (toast) toast('Gagal mencetak raport');
        return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
        try {
            iframe.contentWindow?.print();
        } catch {
            if (toast) toast('Gagal mencetak raport');
        } finally {
            setTimeout(() => {
                if (iframe.parentNode) {
                    document.body.removeChild(iframe);
                }
            }, 1000);
        }
    }, 500);
}
