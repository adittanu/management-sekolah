<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ResetNonAdminUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-users {--force : Force the operation to run without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all users except those with admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (! $this->option('force') && ! $this->confirm('This will delete ALL non-admin users (teachers, students) and their related data. Are you sure?')) {
            $this->info('Operation cancelled.');
            return;
        }

        $this->info('Deleting non-admin users...');

        $count = \App\Models\User::where('role', '!=', 'admin')->delete();

        $this->info("Successfully deleted {$count} users.");
        $this->info('Only Admin users remain.');
    }
}
