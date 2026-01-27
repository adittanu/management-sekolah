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
        Schema::table('classrooms', function (Blueprint $table) {
            $table->string('level')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classrooms', function (Blueprint $table) {
            // We can't easily revert to enum with data, so we might need raw SQL
            // But for now let's just revert to string but restricted logically in app
            // Or try to revert to enum if possible
             $table->enum('level', ['10', '11', '12'])->change();
        });
    }
};
