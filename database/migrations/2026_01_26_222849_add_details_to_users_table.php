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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'teacher', 'student', 'parent'])->default('student')->after('email');
            }
            if (! Schema::hasColumn('users', 'identity_number')) {
                $table->string('identity_number')->unique()->nullable()->after('role');
            }
            if (! Schema::hasColumn('users', 'gender')) {
                $table->enum('gender', ['L', 'P'])->nullable()->after('identity_number');
            }
            if (! Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('gender');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['identity_number']);
            $table->dropColumn(['role', 'identity_number', 'gender', 'avatar']);
        });
    }
};
