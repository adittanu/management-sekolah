<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('billings')) {
            Schema::create('billings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('financial_category_id')->constrained('financial_categories')->cascadeOnDelete();
                $table->string('description');
                $table->decimal('amount', 15, 2);
                $table->decimal('discount', 15, 2)->default(0);
                $table->decimal('total_paid', 15, 2)->default(0);
                $table->date('due_date');
                $table->string('status')->default('unpaid')->comment('unpaid, partial, paid');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
