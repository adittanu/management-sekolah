<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\AbsenSiswaTool;
use App\Mcp\Tools\CatatAbsensiTool;
use App\Mcp\Tools\GetGuruTool;
use App\Mcp\Tools\GetKelasTool;
use App\Mcp\Tools\GetSiswaKelasTool;
use App\Mcp\Tools\LihatAbsensiTool;
use App\Mcp\Tools\LihatJadwalHariIniTool;
use App\Mcp\Tools\LihatJadwalTool;
use App\Mcp\Tools\LihatJadwalUmumTool;
use App\Mcp\Tools\ProsesAbsensiTextTool;
use Laravel\Mcp\Server;

class GuruServer extends Server
{
    /**
     * The MCP server's name.
     */
    protected string $name = 'Guru Server';

    /**
     * The MCP server's version.
     */
    protected string $version = '1.0.0';

    /**
     * The MCP server's instructions for the LLM.
     */
    protected string $instructions = <<<'MARKDOWN'
        Server untuk guru mengelola jadwal mengajar dan absensi siswa.

        Tools yang tersedia:
        - get-guru: Melihat daftar semua guru
        - get-kelas: Melihat daftar semua kelas
        - get-siswa-kelas: Melihat daftar siswa dalam kelas tertentu
        - catat-absensi: TOOL UTAMA untuk mencatat absensi dengan format fleksibel
        - lihat-jadwal: Melihat semua jadwal mengajar (perlu email_guru)
        - lihat-jadwal-hari-ini: Melihat jadwal hari ini dengan status absensi (perlu email_guru)
        - lihat-absensi: Melihat data absensi untuk jadwal tertentu (perlu email_guru, jadwal_id)
        - proses-absensi-text: MENGOLAH TEXT ABSENSI NATURAL LANGUAGE (legacy)

        WORKFLOW ABSENSI UNTUK AI AGENT:
        1. Jika user tidak menyebutkan kelas, gunakan `get-kelas` untuk melihat daftar kelas
        2. Gunakan `get-siswa-kelas` untuk melihat daftar siswa dalam kelas tersebut
        3. Gunakan `catat-absensi` untuk mencatat absensi

        CARA MENGGUNAKAN catat-absensi:
        - Parameter wajib: email_guru, kelas, tanggal
        - Parameter opsional: siswa_hadir, siswa_sakit, siswa_izin, siswa_alpha, siswa_tidak_masuk, catatan
        - Jika user bilang "tidak masuk" tanpa status jelas, gunakan siswa_tidak_masuk
        - AI akan menanyakan kembali status yang belum jelas

        CONTOH INPUT DARI USER:
        User: "akmal dan rizal tidak masuk"
        → AI response: "Oke, akmal dan rizal tidak masuk. Apakah mereka sakit, izin, atau alpha?"
        → Setelah user jawab, gunakan catat-absensi dengan parameter yang sesuai

        CONTOH catat-absensi:
        {
            "email_guru": "guru@sekolah.com",
            "kelas": "XI-AFM2",
            "tanggal": "2025-02-04",
            "siswa_sakit": "Akmal",
            "siswa_alpha": "Rizal",
            "catatan": "Kelas berjalan kondusif"
        }
    MARKDOWN;

    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        GetGuruTool::class,
        GetKelasTool::class,
        GetSiswaKelasTool::class,
        CatatAbsensiTool::class,
        LihatJadwalTool::class,
        LihatJadwalUmumTool::class,
        LihatJadwalHariIniTool::class,
        LihatAbsensiTool::class,
        ProsesAbsensiTextTool::class,
        AbsenSiswaTool::class,
    ];

    /**
     * The resources registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        //
    ];

    /**
     * The prompts registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        //
    ];
}
