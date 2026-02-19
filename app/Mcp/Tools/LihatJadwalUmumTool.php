<?php

namespace App\Mcp\Tools;

use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class LihatJadwalUmumTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Melihat jadwal pelajaran umum lintas guru (read-only). Bisa filter hari, kelas, guru, dan mapel.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'email_pengguna' => ['required', 'email', 'exists:users,email'],
            'hari' => ['nullable', 'string', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'tanggal' => ['nullable', 'date'],
            'kelas' => ['nullable', 'string'],
            'nama_guru' => ['nullable', 'string'],
            'mapel' => ['nullable', 'string'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ], [
            'email_pengguna.exists' => 'Pengguna dengan email tersebut tidak ditemukan.',
        ]);

        $pengguna = User::where('email', $validated['email_pengguna'])->first();

        if (! in_array($pengguna->role, ['admin', 'teacher'], true)) {
            return Response::error('Anda tidak memiliki akses untuk melihat jadwal umum.');
        }

        $hari = $validated['hari'] ?? null;

        if (! $hari && ! empty($validated['tanggal'])) {
            $hari = Carbon::parse($validated['tanggal'])->locale('id')->isoFormat('dddd');
        }

        $limit = $validated['limit'] ?? 50;

        $query = Schedule::query()
            ->with(['subject', 'classroom', 'teacher']);

        if (! empty($hari)) {
            $query->where('day', $hari);
        }

        if (! empty($validated['kelas'])) {
            $kelas = $validated['kelas'];
            $query->whereHas('classroom', function ($q) use ($kelas) {
                $q->where('name', 'LIKE', "%{$kelas}%");
            });
        }

        if (! empty($validated['nama_guru'])) {
            $namaGuru = $validated['nama_guru'];
            $query->whereHas('teacher', function ($q) use ($namaGuru) {
                $q->where('name', 'LIKE', "%{$namaGuru}%");
            });
        }

        if (! empty($validated['mapel'])) {
            $mapel = $validated['mapel'];
            $query->whereHas('subject', function ($q) use ($mapel) {
                $q->where('name', 'LIKE', "%{$mapel}%");
            });
        }

        $schedules = $query
            ->orderBy('day')
            ->orderBy('start_time')
            ->limit($limit)
            ->get();

        if ($schedules->isEmpty()) {
            return Response::text('Tidak ada jadwal yang cocok dengan filter yang diberikan.');
        }

        $output = "Jadwal Pelajaran Umum:\n\n";

        foreach ($schedules as $schedule) {
            $output .= sprintf(
                "ID: %d\nMapel: %s\nHari: %s\nJam: %s - %s\nKelas: %s\nGuru: %s\nRuang: %s\n\n",
                $schedule->id,
                $schedule->subject->name,
                $schedule->day,
                $schedule->start_time,
                $schedule->end_time,
                $schedule->classroom->name,
                $schedule->teacher->name ?? '-',
                $schedule->room ?? '-'
            );
        }

        return Response::text($output);
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\Contracts\JsonSchema\JsonSchema>
     */
    public function schema($schema): array
    {
        return [
            'email_pengguna' => $schema->string()
                ->description('Email pengguna yang meminta data (untuk kontrol akses)')
                ->required(),
            'hari' => $schema->string()
                ->description('Filter hari (Senin, Selasa, Rabu, Kamis, Jumat, Sabtu)')
                ->enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']),
            'tanggal' => $schema->string()
                ->description('Tanggal (YYYY-MM-DD). Jika hari kosong, hari akan diturunkan dari tanggal'),
            'kelas' => $schema->string()
                ->description('Filter nama kelas, contoh: XI-AFM2'),
            'nama_guru' => $schema->string()
                ->description('Filter nama guru'),
            'mapel' => $schema->string()
                ->description('Filter nama mata pelajaran'),
            'limit' => $schema->integer()
                ->description('Batas jumlah data (1-100), default 50'),
        ];
    }
}
