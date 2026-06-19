<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaportData extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'classroom_id',
        'academic_year',
        'semester',
        'report_type',
        'cocurricular',
        'extracurricular',
        'teacher_notes',
        'parent_notes',
        'raport_place',
        'raport_date',
    ];

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'report_type' => 'string',
            'extracurricular' => 'array',
            'raport_date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }
}
