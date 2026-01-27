<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    protected $fillable = [
        'schedule_id',
        'teacher_id',
        'date',
        'title',
        'description',
        'proof_file',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
