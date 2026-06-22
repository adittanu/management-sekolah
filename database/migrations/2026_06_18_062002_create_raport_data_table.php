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
        if (! Schema::hasTable('raport_data')) {
            Schema::create('raport_data', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
                $table->string('academic_year');
                $table->smallInteger('semester');
                $table->string('report_type', 20)->default('final');
                $table->string('cocurricular')->nullable();
                $table->json('extracurricular')->nullable();
                $table->text('teacher_notes')->nullable();
                $table->text('parent_notes')->nullable();
                $table->string('raport_place')->nullable();
                $table->date('raport_date')->nullable();
                $table->timestamps();

                $table->unique(['student_id', 'classroom_id', 'academic_year', 'semester', 'report_type']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raport_data');
    }
};
