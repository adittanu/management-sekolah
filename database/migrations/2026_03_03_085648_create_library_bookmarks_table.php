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
        if (Schema::hasTable('library_bookmarks')) {
            return;
        }

        Schema::create('library_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_book_id')->constrained('library_books')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('page_number');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['library_book_id', 'user_id', 'page_number'], 'library_bookmarks_unique_page');
            $table->index(['user_id', 'library_book_id'], 'library_bookmarks_user_book_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_bookmarks');
    }
};
