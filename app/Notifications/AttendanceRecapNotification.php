<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AttendanceRecapNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance using constructor property promotion.
     */
    public function __construct(
        public string $studentName,
        public int $hadir,
        public int $sakit,
        public int $izin,
        public int $alpha
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Rekap Absensi '.$this->studentName,
            'message' => "Rekap absensi {$this->studentName}: Hadir: {$this->hadir} hari, Sakit: {$this->sakit} hari, Izin: {$this->izin} hari, Alpa: {$this->alpha} hari.",
            'student_name' => $this->studentName,
            'hadir' => $this->hadir,
            'sakit' => $this->sakit,
            'izin' => $this->izin,
            'alpha' => $this->alpha,
            'type' => 'attendance_recap',
        ];
    }
}
