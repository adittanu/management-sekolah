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
        if (Schema::hasColumn('raport_data', 'report_type')) {
            return;
        }
        Schema::table('raport_data', function (Blueprint $table) {
            $table->dropUnique('raport_data_student_id_classroom_id_academic_year_semester_unique');
            $table->string('report_type', 20)->default('final')->after('semester');
            $table->unique(['student_id', 'classroom_id', 'academic_year', 'semester', 'report_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('raport_data', 'report_type')) {
            return;
        }
        Schema::table('raport_data', function (Blueprint $table) {
            $table->dropUnique('raport_data_student_id_classroom_id_academic_year_semester_report_type_unique');
            $table->dropColumn('report_type');
            $table->unique(['student_id', 'classroom_id', 'academic_year', 'semester']);
        });
    }
};
