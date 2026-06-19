<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'fase',
        'level',
        'major',
        'academic_year',
        'teacher_id',
        'is_mobile',
    ];

    /**
     * Get the casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_mobile' => 'boolean',
        ];
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'classroom_user')
            ->withPivot('is_active')
            ->withTimestamps();
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function activeStudents()
    {
        return $this->students()->wherePivot('is_active', true);
    }
}
