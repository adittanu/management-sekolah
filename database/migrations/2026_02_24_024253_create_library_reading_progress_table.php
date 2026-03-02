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
        if (Schema::hasTable('library_reading_progress')) {
            return;
        }

        Schema::create('library_reading_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_book_id')->constrained('library_books')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('current_page')->default(1);
            $table->string('session_id')->nullable();
            $table->string('last_event', 30)->nullable();
            $table->timestamp('page_updated_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['library_book_id', 'user_id']);
            $table->index(['library_book_id', 'current_page', 'last_seen_at'], 'lrp_book_page_seen_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_reading_progress');
    }
};
