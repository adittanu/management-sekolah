<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryBook extends Model
{
    /** @use HasFactory<\Database\Factories\LibraryBookFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'author',
        'category',
        'description',
        'total_pages',
        'pdf_path',
        'uploaded_by',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'total_pages' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(LibraryLoan::class);
    }

    public function readingProgresses(): HasMany
    {
        return $this->hasMany(LibraryReadingProgress::class);
    }
}
