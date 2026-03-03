<?php

namespace Tests\Feature;

use App\Models\LibraryBook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LibraryManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_store_book_and_create_loan(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);

        $storeBookResponse = $this->actingAs($admin)->post(route('admin.perpustakaan.books.store'), [
            'title' => 'Algoritma Dasar',
            'author' => 'Tim Kurikulum',
            'category' => 'Teknologi',
            'total_pages' => 120,
            'pdf_file' => UploadedFile::fake()->create('algoritma.pdf', 1200, 'application/pdf'),
            'is_active' => true,
        ]);

        $storeBookResponse->assertRedirect();

        $this->assertDatabaseHas('library_books', [
            'title' => 'Algoritma Dasar',
            'author' => 'Tim Kurikulum',
            'total_pages' => 120,
            'is_active' => true,
        ]);

        $book = LibraryBook::query()->firstOrFail();

        $loanResponse = $this->actingAs($admin)->post(route('admin.perpustakaan.loans.store'), [
            'library_book_id' => $book->id,
            'user_id' => $student->id,
            'duration_days' => 7,
        ]);

        $loanResponse->assertRedirect();

        $this->assertDatabaseHas('library_loans', [
            'library_book_id' => $book->id,
            'user_id' => $student->id,
            'status' => 'active',
        ]);
    }

    public function test_reader_presence_shows_users_on_same_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $reader = User::factory()->create(['role' => 'admin']);

        $book = LibraryBook::factory()->create(['total_pages' => 60, 'is_active' => true]);

        $now = Carbon::now();

        $this->actingAs($admin)->post(route('admin.perpustakaan.loans.store'), [
            'library_book_id' => $book->id,
            'user_id' => $reader->id,
            'duration_days' => 3,
        ]);

        $syncResponse = $this->actingAs($reader)->post(route('admin.perpustakaan.reader.sync', $book), [
            'current_page' => 12,
            'session_id' => 'sess-001',
            'event' => 'page-change',
        ]);

        $syncResponse->assertOk();

        $presenceResponse = $this->actingAs($admin)->get(route('admin.perpustakaan.reader.presence', [
            'book' => $book->id,
            'page' => 12,
        ]));

        $presenceResponse->assertOk();
        $presenceResponse->assertJsonFragment([
            'name' => $reader->name,
        ]);

        $this->assertDatabaseHas('library_reading_progress', [
            'library_book_id' => $book->id,
            'user_id' => $reader->id,
            'current_page' => 12,
        ]);

        $this->travelTo($now->copy()->addSeconds(50));

        $staleResponse = $this->actingAs($admin)->get(route('admin.perpustakaan.reader.presence', [
            'book' => $book->id,
            'page' => 12,
        ]));

        $staleResponse->assertOk();
        $staleResponse->assertJsonMissing([
            'name' => $reader->name,
        ]);
    }

    public function test_reader_sync_requires_active_loan(): void
    {
        $reader = User::factory()->create(['role' => 'admin']);
        $book = LibraryBook::factory()->create(['total_pages' => 24, 'is_active' => true]);

        $response = $this->actingAs($reader)->post(route('admin.perpustakaan.reader.sync', $book), [
            'current_page' => 3,
            'session_id' => 'sess-without-loan',
            'event' => 'heartbeat',
        ]);

        $response->assertForbidden();
    }

    public function test_teacher_and_student_can_open_library_page_from_their_routes(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);

        $teacherResponse = $this->actingAs($teacher)->get(route('guru.perpustakaan'));
        $teacherResponse->assertOk();

        $studentResponse = $this->actingAs($student)->get(route('siswa.perpustakaan'));
        $studentResponse->assertOk();
    }

    public function test_student_can_borrow_and_sync_reader_with_student_library_routes(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $book = LibraryBook::factory()->create(['total_pages' => 100, 'is_active' => true]);

        $loanResponse = $this->actingAs($student)->post(route('siswa.perpustakaan.loans.store'), [
            'library_book_id' => $book->id,
            'user_id' => $student->id,
            'duration_days' => 5,
        ]);

        $loanResponse->assertRedirect();
        $this->assertDatabaseHas('library_loans', [
            'library_book_id' => $book->id,
            'user_id' => $student->id,
            'status' => 'active',
        ]);

        $syncResponse = $this->actingAs($student)->post(route('siswa.perpustakaan.reader.sync', $book), [
            'current_page' => 18,
            'session_id' => 'sess-student-route',
            'event' => 'page-change',
        ]);

        $syncResponse->assertOk();

        $presenceResponse = $this->actingAs($student)->get(route('siswa.perpustakaan.reader.presence', [
            'book' => $book->id,
            'page' => 18,
        ]));

        $presenceResponse->assertOk();
        $presenceResponse->assertJsonFragment([
            'name' => $student->name,
        ]);
    }
}
