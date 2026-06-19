<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'classroom_id',
        'teacher_id',
        'academic_year',
        'semester',
        'period',
        'score',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'semester' => 'integer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get letter grade based on score.
     */
    public function getLetterGradeAttribute(): string
    {
        if ($this->score === null) {
            return '-';
        }

        return match (true) {
            $this->score >= 90 => 'A',
            $this->score >= 80 => 'B',
            $this->score >= 70 => 'C',
            $this->score >= 60 => 'D',
            default => 'E',
        };
    }

    /**
     * Get predicate description based on score.
     */
    public function getPredicateAttribute(): string
    {
        if ($this->score === null) {
            return '-';
        }

        return match (true) {
            $this->score >= 90 => 'Sangat Baik',
            $this->score >= 80 => 'Baik',
            $this->score >= 70 => 'Cukup',
            $this->score >= 60 => 'Kurang',
            default => 'Sangat Kurang',
        };
    }
}
