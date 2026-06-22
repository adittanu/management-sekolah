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
        if (! Schema::hasTable('grades')) {
            Schema::create('grades', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
                $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
                $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
                $table->string('academic_year', 9); // e.g. 2025/2026
                $table->tinyInteger('semester'); // 1 or 2
                $table->enum('period', ['mid', 'final', 'daily'])->default('daily'); // UTS, UAS, Tugas Harian
                $table->decimal('score', 5, 2)->nullable();
                $table->text('description')->nullable();
                $table->timestamps();

                $table->unique(['student_id', 'subject_id', 'classroom_id', 'academic_year', 'semester', 'period']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
