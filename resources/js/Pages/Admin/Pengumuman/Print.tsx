import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { School as SchoolIcon } from 'lucide-react';

interface School {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    headmaster_name?: string;
    headmaster_id?: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    is_active: boolean;
    published_at: string;
    created_at: string;
    posted_by?: {
        id: number;
        name: string;
    };
}

interface Props {
    announcement: Announcement;
    school: School;
}

export default function PrintAnnouncement({ announcement, school }: Props) {
    useEffect(() => {
        // Auto-trigger print dialog after a short delay for rendering
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const logoUrl = school?.logo ? `/storage/${school.logo}` : null;

    return (
        <>
            <Head title={`Cetak - ${announcement.title}`} />

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 20mm 15mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }

                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Times New Roman', Times, serif;
                    color: #1a1a1a;
                    background: #f0f0f0;
                }

                .print-container {
                    max-width: 210mm;
                    margin: 20px auto;
                    background: #ffffff;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
                    padding: 30mm 20mm;
                    min-height: 297mm;
                    position: relative;
                }

                @media print {
                    .print-container {
                        max-width: none;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        min-height: auto;
                    }
                }

                .kop-surat {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #1a1a1a;
                    margin-bottom: 24px;
                }

                .kop-logo-container {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background-color: #1e3a8a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    overflow: hidden;
                }

                .kop-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .kop-text {
                    text-align: center;
                    flex: 1;
                }

                .kop-text h1 {
                    font-size: 20px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin: 0 0 4px 0;
                }

                .kop-text p {
                    font-size: 12px;
                    margin: 2px 0;
                    color: #333;
                }

                .surat-title {
                    text-align: center;
                    margin: 32px 0 24px 0;
                }

                .surat-title h2 {
                    font-size: 16px;
                    font-weight: bold;
                    text-transform: uppercase;
                    text-decoration: underline;
                    letter-spacing: 1px;
                    margin: 0 0 4px 0;
                }

                .surat-title p {
                    font-size: 12px;
                    color: #555;
                    margin: 0;
                }

                .surat-body {
                    font-size: 14px;
                    line-height: 1.8;
                    text-align: justify;
                    margin-bottom: 48px;
                    white-space: pre-wrap;
                }

                .surat-footer {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 48px;
                }

                .surat-footer-block {
                    text-align: center;
                    min-width: 200px;
                }

                .surat-footer-block .date-location {
                    font-size: 13px;
                    margin-bottom: 4px;
                }

                .surat-footer-block .title-label {
                    font-size: 13px;
                    margin-bottom: 60px;
                }

                .surat-footer-block .signature-name {
                    font-size: 14px;
                    font-weight: bold;
                    text-decoration: underline;
                }

                .surat-footer-block .signature-id {
                    font-size: 12px;
                    color: #555;
                    margin-top: 2px;
                }

                .toolbar {
                    position: fixed;
                    top: 16px;
                    right: 16px;
                    display: flex;
                    gap: 8px;
                    z-index: 100;
                }

                .toolbar button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .btn-print {
                    background: #2563eb;
                    color: #fff;
                }

                .btn-print:hover {
                    background: #1d4ed8;
                }

                .btn-back {
                    background: #e2e8f0;
                    color: #475569;
                }

                .btn-back:hover {
                    background: #cbd5e1;
                }
            `}</style>

            <div className="no-print toolbar">
                <button className="btn-back" onClick={() => window.history.back()}>
                    ← Kembali
                </button>
                <button className="btn-print" onClick={() => window.print()}>
                    🖨️ Cetak
                </button>
            </div>

            <div className="print-container">
                {/* KOP Surat */}
                <div className="kop-surat">
                    <div className="kop-logo-container">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo Sekolah" className="kop-logo" />
                        ) : (
                            <SchoolIcon size={32} color="white" />
                        )}
                    </div>
                    <div className="kop-text">
                        <h1>{school?.name || 'NAMA SEKOLAH'}</h1>
                        <p>{school?.address || 'Alamat Sekolah'}</p>
                        <p>
                            {school?.phone && `Telp: ${school.phone}`}
                            {school?.phone && school?.email && ' | '}
                            {school?.email && `Email: ${school.email}`}
                        </p>
                    </div>
                </div>

                {/* Title */}
                <div className="surat-title">
                    <h2>PENGUMUMAN</h2>
                    <p>{announcement.title}</p>
                </div>

                {/* Body */}
                <div className="surat-body">
                    {announcement.content}
                </div>

                {/* Footer / Signature */}
                <div className="surat-footer">
                    <div className="surat-footer-block">
                        <p className="date-location">
                            {formatDate(announcement.published_at || announcement.created_at)}
                        </p>
                        <p className="title-label">Kepala Sekolah,</p>
                        <p className="signature-name">
                            {school?.headmaster_name || 'Nama Kepala Sekolah'}
                        </p>
                        {school?.headmaster_id && (
                            <p className="signature-id">NIP. {school.headmaster_id}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
