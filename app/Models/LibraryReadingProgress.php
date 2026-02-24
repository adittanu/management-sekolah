<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryReadingProgress extends Model
{
    /** @use HasFactory<\Database\Factories\LibraryReadingProgressFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'library_book_id',
        'user_id',
        'current_page',
        'session_id',
        'last_event',
        'page_updated_at',
        'last_seen_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_page' => 'integer',
            'page_updated_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(LibraryBook::class, 'library_book_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
