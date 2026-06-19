<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'type',
        'capacity',
        'building',
        'floor',
        'is_active',
        'notes',
    ];

    /**
     * Get the casts.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the schedules for this room.
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'room');
    }
}
