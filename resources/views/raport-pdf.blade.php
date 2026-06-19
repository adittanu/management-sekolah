<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Raport - {{ $student->name }}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm 15mm 20mm 15mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            color: #1e293b;
            padding: 10px 15px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        h1, h2, h3 { margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 7px 8px;
            font-size: 11px;
        }
        th {
            background-color: #f1f5f9;
            font-weight: 600;
            text-align: center;
        }
    </style>
</head>
<body>
    {{-- Kop Sekolah --}}
    @php
        $schoolName = $schoolSettings['name'] ?? 'Nama Sekolah';
        $schoolAddress = $schoolSettings['address'] ?? '';
        $schoolPhone = $schoolSettings['phone'] ?? '';
        $schoolEmail = $schoolSettings['email'] ?? '';
        $schoolLogo = $schoolSettings['logo'] ?? null;
        $headmasterName = $schoolSettings['headmaster_name'] ?? '';
        $headmasterId = $schoolSettings['headmaster_id'] ?? '';

        if (!function_exists('getGradeInfo')) {
            function getGradeInfo($score) {
                if ($score === null) {
                    return ['letter' => '-', 'class' => ''];
                }
                if ($score >= 90) {
                    return ['letter' => 'A', 'class' => 'grade-a'];
                }
                if ($score >= 80) {
                    return ['letter' => 'B', 'class' => 'grade-b'];
                }
                if ($score >= 70) {
                    return ['letter' => 'C', 'class' => 'grade-c'];
                }
                if ($score >= 60) {
                    return ['letter' => 'D', 'class' => 'grade-d'];
                }
                return ['letter' => 'E', 'class' => 'grade-e'];
            }
        }

        if (!function_exists('getSemesterLabel')) {
            function getSemesterLabel($semester) {
                return $semester == 1 ? 'Ganjil (I)' : 'Genap (II)';
            }
        }
    @endphp

    {{-- Student Info - 2 Column Layout --}}
    <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:11px;">
        <tr>
            <td style="border:none; padding:3px 0; width:50%; vertical-align:top;">
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600; width:120px;">Nama Murid</td>
                        <td style="border:none; padding:2px 0; width:15px;">:</td>
                        <td style="border:none; padding:2px 0;">{{ $student->name }}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600;">NIS</td>
                        <td style="border:none; padding:2px 0;">:</td>
                        <td style="border:none; padding:2px 0;">{{ $student->identity_number ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600;">Sekolah</td>
                        <td style="border:none; padding:2px 0;">:</td>
                        <td style="border:none; padding:2px 0;">{{ $schoolName }}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600;">Alamat</td>
                        <td style="border:none; padding:2px 0;">:</td>
                        <td style="border:none; padding:2px 0;">{{ $student->address ?? '-' }}</td>
                    </tr>
                </table>
            </td>
            <td style="border:none; padding:3px 0; width:50%; vertical-align:top;">
                <table style="width:100%; border-collapse:collapse;">
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600; width:120px;">Kelas</td>
                        <td style="border:none; padding:2px 0; width:15px;">:</td>
                        <td style="border:none; padding:2px 0;">{{ $classroom->name }}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600;">Fase</td>
                        <td style="border:none; padding:2px 0;">:</td>
                        <td style="border:none; padding:2px 0;">{{ ($reportType ?? 'final') === 'mid' ? 'Ujian Tengah Semester' : 'Ujian Akhir Semester' }}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600;">Semester</td>
                        <td style="border:none; padding:2px 0;">:</td>
                        <td style="border:none; padding:2px 0;">{{ getSemesterLabel($semester) }}</td>
                    </tr>
                    <tr>
                        <td style="border:none; padding:2px 0; font-weight:600;">Tahun Ajaran</td>
                        <td style="border:none; padding:2px 0;">:</td>
                        <td style="border:none; padding:2px 0;">{{ $academicYear }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Grades Table --}}
    @php
        if (!function_exists('buildDescription')) {
            function buildDescription($subj) {
                $parts = [];
                if (!empty($subj['daily_desc'])) { $parts[] = $subj['daily_desc']; }
                if (!empty($subj['mid_desc'])) { $parts[] = $subj['mid_desc']; }
                if (!empty($subj['final_desc'])) { $parts[] = $subj['final_desc']; }
                return implode('. ', $parts);
            }
        }
    @endphp

    <table>
        <thead>
            <tr style="background-color:#f1f5f9;">
                <th style="width:35px;">No</th>
                <th style="text-align:left;">Mata Pelajaran</th>
                <th style="width:80px;">Nilai Akhir</th>
                <th style="text-align:left;">Capaian Kompetensi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($subjects as $index => $subj)
                @php
                    $desc = buildDescription($subj);
                @endphp
                <tr>
                    <td style="text-align:center;">{{ $index + 1 }}</td>
                    <td style="text-align:left;">{{ $subj['subject'] }}</td>
                    <td style="text-align:center; font-weight:bold;">{{ $subj['average'] ?? '-' }}</td>
                    <td style="text-align:left; font-size:10px; line-height:1.4;">{{ $desc ?: '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Kokurikuler --}}
    <div style="margin-bottom:18px; page-break-inside:avoid;">
        <table>
            <tr style="background-color:#f1f5f9;">
                <td style="padding:7px 8px; font-weight:700; text-align:left;">Kokurikuler</td>
            </tr>
            <tr>
                <td style="padding:7px 8px;">{{ $cocurricular ?? '-' }}</td>
            </tr>
        </table>
    </div>

    {{-- Ekstrakurikuler --}}
    <div style="margin-bottom:18px; page-break-inside:avoid;">
        <table>
            <thead>
                <tr style="background-color:#f1f5f9;">
                    <th style="width:35px;">No</th>
                    <th style="text-align:left;">Ekstrakurikuler</th>
                    <th style="text-align:left;">Keterangan</th>
                </tr>
            </thead>
            <tbody>
                @if(!empty($extracurricular) && count($extracurricular) > 0)
                    @foreach($extracurricular as $index => $extra)
                        <tr>
                            <td style="text-align:center;">{{ $index + 1 }}</td>
                            <td style="text-align:left;">{{ $extra['name'] ?? '-' }}</td>
                            <td style="text-align:left;">{{ $extra['description'] ?? '-' }}</td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td colspan="3" style="text-align:center; color:#94a3b8;">-</td>
                    </tr>
                @endif
            </tbody>
        </table>
    </div>

    {{-- Attendance & Teacher Notes side by side --}}
    @php
        $sakit = $attendance['sakit'] ?? 0;
        $izin = $attendance['izin'] ?? 0;
        $alpha = $attendance['alpha'] ?? 0;
    @endphp

    <table style="margin-bottom:18px; page-break-inside:avoid;">
        <tr>
            <td style="width:48%; vertical-align:top; padding-right:2%; border:none;">
                <table>
                    <tr style="background-color:#f1f5f9;">
                        <td colspan="2" style="padding:7px 8px; font-weight:700;">Ketidakhadiran</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 8px;">Sakit</td>
                        <td style="padding:5px 8px; text-align:right;">{{ $sakit }} hari</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 8px;">Izin</td>
                        <td style="padding:5px 8px; text-align:right;">{{ $izin }} hari</td>
                    </tr>
                    <tr>
                        <td style="padding:5px 8px;">Tanpa Keterangan</td>
                        <td style="padding:5px 8px; text-align:right;">{{ $alpha }} hari</td>
                    </tr>
                </table>
            </td>
            <td style="width:52%; vertical-align:top; border:none;">
                <table>
                    <tr style="background-color:#f1f5f9;">
                        <td style="padding:7px 8px; font-weight:700;">Catatan Wali Kelas</td>
                    </tr>
                    <tr>
                        <td style="padding:7px 8px; height:60px; vertical-align:top;">{{ $teacherNotes ?? '' }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Tanggapan Orang Tua/Wali Murid --}}
    <div style="margin-bottom:18px; page-break-inside:avoid;">
        <table>
            <tr style="background-color:#f1f5f9;">
                <td style="padding:7px 8px; font-weight:700;">Tanggapan Orang Tua/ Wali Murid</td>
            </tr>
            <tr>
                <td style="padding:7px 8px; height:60px; vertical-align:top;">{{ $parentNotes ?? '' }}</td>
            </tr>
        </table>
    </div>

    {{-- Signatures --}}
    <div style="margin-top:20px; font-size:11px; page-break-inside:avoid;">
        <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
            <colgroup>
                <col style="width:33%;">
                <col style="width:34%;">
                <col style="width:33%;">
            </colgroup>
            <tr>
                <td style="text-align:center; vertical-align:top; border:none; padding:0;">
                    <div style="height:100px;"></div>
                    <div style="width:80%; margin:0 auto; border-top:1px solid #1e293b; padding-top:6px;">
                        <strong style="font-size:11px;">Orang Tua Murid</strong>
                    </div>
                </td>
                <td style="text-align:center; vertical-align:top; border:none; padding:0;">
                    <p style="text-align:center; margin:0 0 4px 0; color:#64748b; font-size:10px;">Mengetahui,</p>
                    <div style="height:81px;"></div>
                    <div style="width:80%; margin:0 auto; border-top:1px solid #1e293b; padding-top:6px;">
                        <strong style="font-size:11px;">Kepala Sekolah</strong>
                        @if($headmasterName)
                            <p style="margin:3px 0 0 0; font-weight:700; font-size:11px;">{{ $headmasterName }}</p>
                        @endif
                        @if($headmasterId)
                            <p style="margin:1px 0 0 0; font-size:10px; color:#64748b;">NIP. {{ $headmasterId }}</p>
                        @endif
                    </div>
                </td>
                <td style="text-align:center; vertical-align:top; border:none; padding:0;">
                    <p style="text-align:right; margin:0 0 4px 0; color:#64748b; font-size:10px;">Tempat, Tanggal Rapor</p>
                    <div style="height:81px;"></div>
                    <div style="width:80%; margin:0 auto; border-top:1px solid #1e293b; padding-top:6px;">
                        <strong style="font-size:11px;">Wali Kelas</strong>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
