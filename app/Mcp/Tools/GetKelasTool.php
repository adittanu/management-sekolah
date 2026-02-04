<?php

namespace App\Mcp\Tools;

use App\Models\Classroom;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class GetKelasTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Mendapatkan daftar semua kelas yang tersedia di sekolah. Bisa filter berdasarkan level atau jurusan.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'level' => ['nullable', 'string'],
            'jurusan' => ['nullable', 'string'],
        ]);

        $query = Classroom::query();

        if (! empty($validated['level'])) {
            $query->where('level', $validated['level']);
        }

        if (! empty($validated['jurusan'])) {
            $query->where('major', 'LIKE', "%{$validated['jurusan']}%");
        }

        $classes = $query->orderBy('name')->get();

        if ($classes->isEmpty()) {
            return Response::text('Tidak ada kelas yang ditemukan.');
        }

        $output = "📚 Daftar Kelas\n";
        $output .= "═══════════════════\n\n";

        foreach ($classes as $class) {
            $output .= sprintf(
                "🏫 %s\n   📊 Level: %s\n   🎓 Jurusan: %s\n   👨‍🏫 Wali Kelas: %s\n\n",
                $class->name,
                $class->level,
                $class->major ?? '-',
                $class->teacher->name ?? 'Belum ditentukan'
            );
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
            'level' => $schema->string()
                ->description('Filter berdasarkan level (contoh: 10, 11, 12)'),
            'jurusan' => $schema->string()
                ->description('Filter berdasarkan jurusan (contoh: RPL, TKJ, AK)'),
        ];
    }
}
