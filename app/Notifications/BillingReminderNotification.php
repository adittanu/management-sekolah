<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BillingReminderNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance using constructor property promotion.
     */
    public function __construct(
        public int $billingId,
        public string $description,
        public float $amount,
        public Carbon $dueDate,
        public string $interval
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
            'title' => $this->getTitle(),
            'message' => $this->getMessage(),
            'billing_id' => $this->billingId,
            'amount' => $this->amount,
            'due_date' => $this->dueDate->format('Y-m-d'),
            'interval' => $this->interval,
            'type' => 'billing_reminder',
        ];
    }

    /**
     * Get the notification title based on the interval.
     */
    protected function getTitle(): string
    {
        return match ($this->interval) {
            'overdue' => 'Tagihan Terlambat: '.$this->description,
            'h-0' => 'Tagihan Jatuh Tempo Hari Ini: '.$this->description,
            default => 'Pengingat Tagihan: '.$this->description,
        };
    }

    /**
     * Get the notification message based on the interval.
     */
    protected function getMessage(): string
    {
        $formattedAmount = 'Rp '.number_format($this->amount, 0, ',', '.');
        $formattedDate = $this->dueDate->translatedFormat('d F Y');

        return match ($this->interval) {
            'h-7' => "Tagihan {$this->description} sebesar {$formattedAmount} akan jatuh tempo dalam 7 hari ({$formattedDate}). Silakan lakukan pembayaran.",
            'h-3' => "Tagihan {$this->description} sebesar {$formattedAmount} akan jatuh tempo dalam 3 hari ({$formattedDate}). Silakan lakukan pembayaran.",
            'h-2' => "Tagihan {$this->description} sebesar {$formattedAmount} akan jatuh tempo dalam 2 hari ({$formattedDate}). Silakan lakukan pembayaran.",
            'h-1' => "Tagihan {$this->description} sebesar {$formattedAmount} akan jatuh tempo besok ({$formattedDate}). Silakan lakukan pembayaran.",
            'h-0' => "Tagihan {$this->description} sebesar {$formattedAmount} jatuh tempo HARI INI ({$formattedDate}). Mohon segera lakukan pembayaran.",
            'overdue' => "Tagihan {$this->description} sebesar {$formattedAmount} telah melewati batas jatuh tempo sejak {$formattedDate}. Mohon segera lakukan pembayaran.",
            default => "Tagihan {$this->description} sebesar {$formattedAmount} akan jatuh tempo pada {$formattedDate}.",
        };
    }
}
