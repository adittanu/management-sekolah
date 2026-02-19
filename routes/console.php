<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-fill attendance every 5 minutes for schedules that have ended without attendance
Schedule::command('app:auto-attendance')->everyFiveMinutes();
