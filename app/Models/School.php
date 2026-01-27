<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'app_name',
        'address',
        'phone',
        'email',
        'website',
        'npsn',
        'accreditation',
        'headmaster_name',
        'headmaster_id',
        'logo',
    ];
}
