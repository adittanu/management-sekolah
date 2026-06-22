<?php

namespace App\Console\Commands;

use App\Models\Billing;
use App\Models\User;
use App\Notifications\AttendanceRecapNotification;
use App\Notifications\BillingReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendNotificationReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-notification-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send attendance recaps and billing reminder notifications to parents';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('Starting notification reminder process...');

        $this->sendBillingReminders();
        $this->sendAttendanceRecaps();

        $this->info('Notification reminder process completed successfully.');
    }

    /**
     * Scan and send billing reminders based on due dates.
     */
    protected function sendBillingReminders(): void
    {
        $this->info('Scanning billings for reminders...');

        // Fetch unpaid or partially paid billings
        $billings = Billing::whereIn('status', ['unpaid', 'partial'])->get();
        $sentCount = 0;

        foreach ($billings as $billing) {
            $student = $billing->student;
            if (! $student) {
                continue;
            }

            $parents = $student->parents;
            if ($parents->isEmpty()) {
                continue;
            }

            $dueDate = Carbon::parse($billing->due_date);
            $diffInDays = now()->startOfDay()->diffInDays($dueDate->startOfDay(), false);

            $interval = null;

            if ($diffInDays == 7) {
                $interval = 'h-7';
            } elseif ($diffInDays == 3) {
                $interval = 'h-3';
            } elseif ($diffInDays == 2) {
                $interval = 'h-2';
            } elseif ($diffInDays == 1) {
                $interval = 'h-1';
            } elseif ($diffInDays == 0) {
                $interval = 'h-0';
            } elseif ($diffInDays < 0) {
                $interval = 'overdue';
            }

            if ($interval === null) {
                continue;
            }

            foreach ($parents as $parent) {
                // Check if notification has already been sent to this parent for this billing and interval
                $alreadySent = DB::table('notifications')
                    ->where('notifiable_type', User::class)
                    ->where('notifiable_id', $parent->id)
                    ->where('data->billing_id', $billing->id)
                    ->where('data->interval', $interval)
                    ->exists();

                if (! $alreadySent) {
                    $parent->notify(new BillingReminderNotification(
                        $billing->id,
                        $billing->description,
                        (float) $billing->remaining,
                        $dueDate,
                        $interval
                    ));
                    $sentCount++;
                }
            }
        }

        $this->info("Sent {$sentCount} billing reminder notifications.");
    }

    /**
     * Compile and send attendance recaps for each child to their parents.
     */
    protected function sendAttendanceRecaps(): void
    {
        $this->info('Compiling and sending attendance recaps...');

        // Fetch parents
        $parents = User::where('role', 'parent')->get();
        $sentCount = 0;

        foreach ($parents as $parent) {
            $children = $parent->children;
            if ($children->isEmpty()) {
                continue;
            }

            foreach ($children as $child) {
                // Aggregate attendance counts
                $hadir = $child->attendances()->where('status', 'hadir')->count();
                $sakit = $child->attendances()->where('status', 'sakit')->count();
                $izin = $child->attendances()->where('status', 'izin')->count();
                $alpha = $child->attendances()->where('status', 'alpha')->count();

                // If the child has no attendance records at all, skip
                if ($hadir === 0 && $sakit === 0 && $izin === 0 && $alpha === 0) {
                    continue;
                }

                // Check if the same recap was already sent
                $lastRecap = DB::table('notifications')
                    ->where('notifiable_type', User::class)
                    ->where('notifiable_id', $parent->id)
                    ->where('data->type', 'attendance_recap')
                    ->where('data->student_name', $child->name)
                    ->orderBy('created_at', 'desc')
                    ->first();

                $shouldSend = true;

                if ($lastRecap) {
                    $lastData = json_decode($lastRecap->data, true);
                    if (
                        ($lastData['hadir'] ?? 0) === $hadir &&
                        ($lastData['sakit'] ?? 0) === $sakit &&
                        ($lastData['izin'] ?? 0) === $izin &&
                        ($lastData['alpha'] ?? 0) === $alpha
                    ) {
                        $shouldSend = false;
                    }
                }

                if ($shouldSend) {
                    $parent->notify(new AttendanceRecapNotification(
                        $child->name,
                        $hadir,
                        $sakit,
                        $izin,
                        $alpha
                    ));
                    $sentCount++;
                }
            }
        }

        $this->info("Sent {$sentCount} attendance recap notifications.");
    }
}
