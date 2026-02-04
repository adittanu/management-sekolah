# Testing Patterns

**Analysis Date:** 2026-02-04

## Test Framework

**Runner:**
- PHPUnit 11.5.3
- Config: `phpunit.xml`

**Assertion Library:**
- PHPUnit built-in assertions
- Laravel Testing utilities

**Run Commands:**
```bash
composer test              # Run all tests (via composer script)
php.bat artisan test       # Run all tests via Artisan
phpunit                    # Run all tests directly
```

## Test File Organization

**Location:**
- Feature tests: `tests/Feature/`
- Unit tests: `tests/Unit/`
- Auth tests: `tests/Feature/Auth/`

**Naming:**
- Feature tests: `*Test.php` (e.g., `AdminSchoolModuleTest.php`, `LoginFeatureTest.php`)
- Unit tests: `*Test.php` (e.g., `ExampleTest.php`)
- Test class names match filename: `class AdminSchoolModuleTest extends TestCase`

**Structure:**
```
tests/
├── TestCase.php              # Base test case class
├── Feature/
│   ├── ExampleTest.php
│   ├── AdminSchoolModuleTest.php
│   ├── LoginFeatureTest.php
│   ├── ProfileTest.php
│   └── Auth/
│       ├── AuthenticationTest.php
│       ├── EmailVerificationTest.php
│       ├── PasswordConfirmationTest.php
│       ├── PasswordResetTest.php
│       ├── PasswordUpdateTest.php
│       └── RegistrationTest.php
└── Unit/
    └── ExampleTest.php
```

## Test Structure

**Base Test Case:**
```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    //
}
```

**Feature Test Pattern:**
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_descriptive_test_name(): void
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        $response = $this->actingAs($user)->get('/route');
        
        // Assert
        $response->assertStatus(200);
    }
}
```

**Unit Test Pattern:**
```php
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_basic_assertion(): void
    {
        $this->assertTrue(true);
    }
}
```

**Patterns:**
- Use `RefreshDatabase` trait for database isolation
- Test methods use `test_` prefix and descriptive snake_case names
- Return type hint: `: void`
- Group related tests in the same class
- Use comments to group tests by acceptance criteria (e.g., `// AC 1: Data Integrity`)

## Mocking

**Framework:** Laravel built-in mocking + Mockery

**Patterns:**

**Notification Mocking:**
```php
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Notifications\ResetPassword;

public function test_reset_password_link_can_be_requested(): void
{
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
}
```

**What to Mock:**
- External notifications (email, SMS)
- Third-party API calls
- File system operations (when not testing file handling)

**What NOT to Mock:**
- Database operations (use RefreshDatabase instead)
- Internal service calls
- Eloquent model interactions

## Fixtures and Factories

**Test Data:**
- Laravel Model Factories for database fixtures
- Factory located at: `database/factories/UserFactory.php`

**Factory Pattern:**
```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
```

**Usage in Tests:**
```php
// Create user with default factory values
$user = User::factory()->create();

// Create user with specific attributes
$admin = User::factory()->create([
    'email' => 'admin@test.com',
    'role' => 'admin',
    'password' => bcrypt('password'),
]);

// Create multiple users
$users = User::factory()->count(5)->create();
```

**Location:**
- Factories: `database/factories/`
- Seeders: `database/seeders/`

## Coverage

**Requirements:** Not explicitly configured

**View Coverage:**
```bash
phpunit --coverage-html coverage/
```

**Current Coverage Areas:**
- Authentication (login, logout, password reset)
- Authorization (role-based access)
- Profile management
- Admin school module (schedules, classrooms, subjects)

## Test Types

### Unit Tests

**Scope:**
- Pure PHP logic without Laravel application bootstrapping
- Fast execution
- Located in `tests/Unit/`

**Example:**
```php
namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }
}
```

### Feature Tests

**Scope:**
- Full HTTP request/response cycle
- Database interactions
- Authentication and authorization
- Located in `tests/Feature/`

**Example:**
```php
public function test_users_can_authenticate_using_the_login_screen(): void
{
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
}
```

### E2E Tests

**Framework:** Not configured
- No Playwright, Cypress, or Laravel Dusk detected
- Frontend testing done manually or via browser automation not set up

## Common Patterns

### Authentication Testing

```php
public function test_login_screen_can_be_rendered(): void
{
    $response = $this->get('/login');
    $response->assertStatus(200);
}

public function test_users_can_logout(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
}
```

### Authorization Testing

```php
public function test_student_cannot_access_admin_routes(): void
{
    $student = User::factory()->create(['role' => 'student']);

    $response = $this->actingAs($student)->get(route('admin.dashboard'));

    $response->assertStatus(403);
}
```

### Database Assertion Testing

```php
public function test_student_appears_in_pivot_when_enrolled(): void
{
    $classroom = Classroom::create([/* ... */]);
    $student = User::factory()->create(['role' => 'student']);

    $classroom->students()->attach($student->id);

    $this->assertDatabaseHas('classroom_user', [
        'classroom_id' => $classroom->id,
        'user_id' => $student->id,
        'is_active' => 1,
    ]);
}
```

### Validation Testing

```php
public function test_schedule_conflict_classroom(): void
{
    $admin = User::factory()->create(['role' => 'admin']);
    // ... setup

    $response = $this->actingAs($admin)->post(route('admin.jadwal.store'), [
        // ... conflicting data
    ]);

    $response->assertSessionHasErrors(['classroom_id']);
}
```

### Exception Testing

```php
public function test_cannot_delete_subject_with_existing_schedule(): void
{
    // ... setup with existing schedule

    $this->expectException(\Illuminate\Database\QueryException::class);
    $subject->delete();
}
```

### JSON API Testing

```php
public function test_qr_login_with_valid_token(): void
{
    $user = User::factory()->create([
        'role' => 'student',
        'identity_number' => 'TOKEN123',
    ]);

    $response = $this->postJson(route('auth.qr-login'), [
        'token' => 'TOKEN123',
    ]);

    $response->assertStatus(200)
             ->assertJson(['message' => 'Login successful!']);
    
    $this->assertAuthenticatedAs($user);
}
```

## Test Environment Configuration

**phpunit.xml Settings:**
```xml
<php>
    <env name="APP_ENV" value="testing"/>
    <env name="APP_MAINTENANCE_DRIVER" value="file"/>
    <env name="BCRYPT_ROUNDS" value="4"/>
    <env name="BROADCAST_CONNECTION" value="null"/>
    <env name="CACHE_STORE" value="array"/>
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>
    <env name="MAIL_MAILER" value="array"/>
    <env name="QUEUE_CONNECTION" value="sync"/>
    <env name="SESSION_DRIVER" value="array"/>
</php>
```

**Key Settings:**
- Database: SQLite in-memory (`:memory:`)
- Cache: Array driver
- Mail: Array driver (captured, not sent)
- Queue: Synchronous execution
- Session: Array driver
- Bcrypt rounds reduced to 4 (faster hashing)

## Test Data Management

**RefreshDatabase Trait:**
- Used on all feature tests that touch database
- Migrates database before each test
- Rolls back after each test
- Provides clean state for every test

**Transaction Wrapping:**
- Tests run within database transactions
- Automatic rollback after test completion
- Ensures test isolation

## Writing New Tests

**Where to Add:**
- Feature tests: `tests/Feature/` or appropriate subdirectory
- Auth tests: `tests/Feature/Auth/`
- Unit tests: `tests/Unit/`

**Template:**
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_descriptive_scenario(): void
    {
        // Arrange
        $user = User::factory()->create(['role' => 'admin']);
        
        // Act
        $response = $this->actingAs($user)->get('/route');
        
        // Assert
        $response->assertStatus(200);
        $response->assertSee('Expected content');
    }
}
```

## Frontend Testing

**Current State:** No automated frontend testing configured

**What Exists:**
- TypeScript type checking via `tsc`
- No Jest, Vitest, or other JS test runner detected
- No React Testing Library
- No component tests

**Recommendation:** Consider adding Vitest + React Testing Library for component testing if needed.

---

*Testing analysis: 2026-02-04*
