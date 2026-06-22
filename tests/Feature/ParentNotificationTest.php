<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Billing;
use App\Models\FinancialCategory;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ParentNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $parent;

    private User $student;

    private FinancialCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->parent = User::factory()->create(['role' => 'parent']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->parent->children()->attach($this->student->id);

        $this->category = FinancialCategory::create([
            'name' => 'Uang Komite',
            'type' => 'income',
            'description' => 'Iuran Komite',
            'default_amount' => 100000,
        ]);
    }

    public function test_billing_reminders_and_attendance_recap_are_sent_to_parent(): void
    {
        // 1. Create a schedule and an attendance for the student
        $schedule = Schedule::factory()->create();
        Attendance::create([
            'schedule_id' => $schedule->id,
            'student_id' => $this->student->id,
            'date' => now()->toDateString(),
            'status' => 'hadir',
        ]);

        // 2. Create a billing due in 7 days (H-7)
        $billingH7 = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'Tagihan SPP Juli',
            'amount' => 100000,
            'due_date' => now()->addDays(7)->toDateString(),
            'status' => 'unpaid',
        ]);

        // 3. Create an overdue billing (H-10, overdue)
        $billingOverdue = Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'Tagihan SPP Juni',
            'amount' => 150000,
            'due_date' => now()->subDays(10)->toDateString(),
            'status' => 'unpaid',
        ]);

        // 4. Run the command
        Artisan::call('app:send-notification-reminders');

        // 5. Assert notifications exist in database for the parent (1 attendance recap + 2 billings)
        $this->assertEquals(3, $this->parent->notifications()->count());

        // Assert attendance recap notification details
        $recapNotif = $this->parent->notifications()->where('data->type', 'attendance_recap')->first();
        $this->assertNotNull($recapNotif);
        $this->assertEquals('Rekap Absensi '.$this->student->name, $recapNotif->data['title']);
        $this->assertEquals(1, $recapNotif->data['hadir']);

        // Assert billing H-7 notification details
        $h7Notif = $this->parent->notifications()
            ->where('data->type', 'billing_reminder')
            ->where('data->billing_id', $billingH7->id)
            ->first();
        $this->assertNotNull($h7Notif);
        $this->assertEquals('h-7', $h7Notif->data['interval']);

        // Assert billing overdue notification details
        $overdueNotif = $this->parent->notifications()
            ->where('data->type', 'billing_reminder')
            ->where('data->billing_id', $billingOverdue->id)
            ->first();
        $this->assertNotNull($overdueNotif);
        $this->assertEquals('overdue', $overdueNotif->data['interval']);

        // 6. Run command again - duplicates should NOT be created
        Artisan::call('app:send-notification-reminders');
        $this->assertEquals(3, $this->parent->notifications()->count());
    }

    public function test_parent_can_mark_notification_as_read(): void
    {
        $schedule = Schedule::factory()->create();
        Attendance::create([
            'schedule_id' => $schedule->id,
            'student_id' => $this->student->id,
            'date' => now()->toDateString(),
            'status' => 'hadir',
        ]);

        Artisan::call('app:send-notification-reminders');

        $notification = $this->parent->unreadNotifications()->first();
        $this->assertNotNull($notification);

        // Mark as read via route
        $response = $this->actingAs($this->parent)->post(route('orangtua.notifications.read', $notification->id));
        $response->assertRedirect();

        $this->assertEquals(0, $this->parent->unreadNotifications()->count());
    }

    public function test_parent_can_mark_all_notifications_as_read(): void
    {
        $schedule = Schedule::factory()->create();
        Attendance::create([
            'schedule_id' => $schedule->id,
            'student_id' => $this->student->id,
            'date' => now()->toDateString(),
            'status' => 'hadir',
        ]);

        Billing::create([
            'student_id' => $this->student->id,
            'financial_category_id' => $this->category->id,
            'description' => 'SPP Juli',
            'amount' => 100000,
            'due_date' => now()->addDays(7)->toDateString(),
            'status' => 'unpaid',
        ]);

        Artisan::call('app:send-notification-reminders');

        $this->assertEquals(2, $this->parent->unreadNotifications()->count());

        // Mark all as read via route
        $response = $this->actingAs($this->parent)->post(route('orangtua.notifications.read-all'));
        $response->assertRedirect();

        $this->assertEquals(0, $this->parent->unreadNotifications()->count());
    }
}
