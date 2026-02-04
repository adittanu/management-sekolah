<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Illuminate\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
class GetGuruTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = 'Mendapatkan daftar guru yang terdaftar di sekolah. Bisa filter berdasarkan nama atau email.';

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'nama' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
        ]);

        $query = User::query()
            ->where('role', 'teacher')
            ->orWhere('role', 'admin');

        if (! empty($validated['nama'])) {
            $query->where('name', 'LIKE', "%{$validated['nama']}%");
        }

        if (! empty($validated['email'])) {
            $query->where('email', 'LIKE', "%{$validated['email']}%");
        }

        $teachers = $query->orderBy('name')->get();

        if ($teachers->isEmpty()) {
            return Response::text('Tidak ada guru yang ditemukan.');
        }

        $output = "👨‍🏫 Daftar Guru\n";
        $output .= "═══════════════════\n\n";

        foreach ($teachers as $teacher) {
            $output .= sprintf(
                "📧 %s\n   📧 Email: %s\n   🎓 Role: %s\n\n",
                $teacher->name,
                $teacher->email,
                $teacher->role
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
            'nama' => $schema->string()
                ->description('Filter berdasarkan nama guru'),
            'email' => $schema->string()
                ->description('Filter berdasarkan email guru'),
        ];
    }
}
