<?php

namespace App\Mcp\Tools;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class GetSiswaKelasTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Mendapatkan daftar siswa dalam kelas tertentu. Berguna untuk melihat siapa saja siswa yang harus diabsen.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'nama_kelas' => ['required', 'string'],
        ], [
            'nama_kelas.required' => 'Nama kelas wajib diisi.',
        ]);

        $namaKelas = $validated['nama_kelas'];

        // Cari kelas
        $classroom = Classroom::where('name', 'LIKE', "%{$namaKelas}%")
            ->with('teacher')
            ->first();

        if (! $classroom) {
            return Response::error("Kelas '{$namaKelas}' tidak ditemukan. Gunakan tool get-kelas untuk melihat daftar kelas.");
        }

        // Get siswa dalam kelas ini
        $students = User::query()
            ->where('role', 'student')
            ->whereHas('classrooms', function ($query) use ($classroom) {
                $query->where('classrooms.id', $classroom->id);
            })
            ->orderBy('name')
            ->get();

        if ($students->isEmpty()) {
            return Response::text("Kelas {$classroom->name} belum memiliki siswa.");
        }

        $output = "👥 Daftar Siswa\n";
        $output .= "═══════════════════\n";
        $output .= "🏫 {$classroom->name}\n";
        $output .= "👨‍🏫 Wali Kelas: {$classroom->teacher?->name}\n";
        $output .= "📊 Total: {$students->count()} siswa\n\n";

        $output .= "📋 Nama Siswa:\n";
        $no = 1;
        foreach ($students as $student) {
            $output .= sprintf("   %2d. %s\n", $no++, $student->name);
        }

        return Response::text($output);
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\Contracts\JsonSchema\JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'nama_kelas' => $schema->string()
                ->description('Nama kelas (contoh: XI-AFM2, X-RPL1)')
                ->required(),
        ];
    }
}
