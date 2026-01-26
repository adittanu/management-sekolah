# Source Tree Analysis - Management Sekolah

> **Generated:** 2026-01-26  
> **Scan Level:** Quick Scan  
> **Project Type:** Full-Stack Web Application (Laravel + React)

---

## Directory Structure Overview

```
management-sekolah/
├── app/                          # 🔧 Laravel Backend Application
│   ├── Http/
│   │   ├── Controllers/          # Request handlers
│   │   │   ├── Auth/             # Authentication controllers (Breeze)
│   │   │   ├── Controller.php    # Base controller
│   │   │   └── ProfileController.php  # User profile management
│   │   ├── Middleware/           # HTTP middleware
│   │   └── Requests/             # Form request validation
│   ├── Models/                   # Eloquent ORM models
│   │   └── User.php              # User model with authentication
│   └── Providers/                # Service providers
│
├── bootstrap/                    # 🚀 Application Bootstrap
│   ├── app.php                   # Application instance
│   └── cache/                    # Cached configurations
│
├── config/                       # ⚙️ Configuration Files
│   ├── app.php                   # Application settings
│   ├── auth.php                  # Authentication guards
│   ├── database.php              # Database connections
│   ├── session.php               # Session configuration
│   └── ...                       # Other Laravel configs
│
├── database/                     # 💾 Database Layer
│   ├── database.sqlite           # SQLite database file
│   ├── factories/                # Model factories for testing
│   ├── migrations/               # Database schema migrations
│   │   ├── create_users_table.php
│   │   ├── create_cache_table.php
│   │   └── create_jobs_table.php
│   └── seeders/                  # Database seeders
│
├── public/                       # 🌐 Public Web Root
│   ├── index.php                 # Application entry point
│   └── build/                    # Compiled frontend assets
│
├── resources/                    # 📦 Frontend Resources
│   ├── css/                      # Stylesheets
│   │   └── app.css               # Main CSS (TailwindCSS)
│   ├── js/                       # 🎨 React/TypeScript Frontend
│   │   ├── app.tsx               # ⭐ Frontend entry point
│   │   ├── ssr.tsx               # Server-side rendering entry
│   │   ├── bootstrap.ts          # Frontend bootstrap
│   │   │
│   │   ├── Components/           # 🧩 Reusable UI Components
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   └── tabs.tsx
│   │   │   │
│   │   │   ├── admin/            # Admin-specific components
│   │   │   │   ├── DataTable.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   │
│   │   │   ├── Jadwal/           # Schedule feature components
│   │   │   │   └── DragDropComponents.tsx
│   │   │   │
│   │   │   ├── ApplicationLogo.tsx
│   │   │   ├── ChatWidget.tsx    # Real-time chat component
│   │   │   ├── Checkbox.tsx
│   │   │   ├── DangerButton.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── InputError.tsx
│   │   │   ├── InputLabel.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── NavLink.tsx
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── ResponsiveNavLink.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   └── TextInput.tsx
│   │   │
│   │   ├── Layouts/              # 📐 Page Layouts
│   │   │   ├── AdminLayout.tsx   # Admin panel layout
│   │   │   ├── AuthenticatedLayout.tsx  # Logged-in user layout
│   │   │   └── GuestLayout.tsx   # Public/guest layout
│   │   │
│   │   ├── Pages/                # 📄 Inertia.js Pages
│   │   │   ├── Welcome.tsx       # Landing page
│   │   │   ├── Dashboard.tsx     # User dashboard
│   │   │   │
│   │   │   ├── Admin/            # 🏫 Admin Module Pages
│   │   │   │   ├── Dashboard.tsx # Admin dashboard with stats
│   │   │   │   ├── User/         # User management
│   │   │   │   ├── Kelas/        # Class management
│   │   │   │   ├── Jadwal/       # Schedule management
│   │   │   │   ├── Mapel/        # Subject management
│   │   │   │   ├── Laporan/      # Reports
│   │   │   │   ├── Setting/      # System settings
│   │   │   │   ├── Lisensi/      # License management
│   │   │   │   ├── Daring/       # Online learning
│   │   │   │   ├── Keuangan/     # Financial management
│   │   │   │   ├── Absensi/      # Attendance system
│   │   │   │   ├── Perpustakaan/ # Library management
│   │   │   │   ├── PPDB/         # Student enrollment
│   │   │   │   ├── LMS/          # Learning management
│   │   │   │   └── Chat/         # Communication system
│   │   │   │
│   │   │   ├── Auth/             # Authentication pages
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── Profile/          # User profile pages
│   │   │
│   │   ├── data/                 # Static/mock data
│   │   ├── lib/                  # Utility functions
│   │   │   └── utils.ts          # Helper utilities (cn, etc.)
│   │   └── types/                # TypeScript type definitions
│   │
│   └── views/                    # Blade templates
│       └── app.blade.php         # Main HTML template
│
├── routes/                       # 🛤️ Route Definitions
│   ├── web.php                   # ⭐ Main web routes
│   ├── auth.php                  # Authentication routes
│   └── console.php               # Artisan commands
│
├── storage/                      # 📁 File Storage
│   ├── app/                      # Application files
│   ├── framework/                # Framework cache
│   └── logs/                     # Application logs
│
├── tests/                        # 🧪 Test Suite
│   ├── Feature/                  # Feature/integration tests
│   │   ├── Auth/                 # Auth feature tests
│   │   ├── ProfileTest.php
│   │   └── ExampleTest.php
│   └── Unit/                     # Unit tests
│       └── ExampleTest.php
│
├── vendor/                       # 📚 Composer dependencies
├── node_modules/                 # 📚 NPM dependencies
│
├── _bmad/                        # 🤖 BMAD Workflow System
├── _bmad-output/                 # BMAD output artifacts
├── docs/                         # 📖 Generated documentation
│
├── .env                          # Environment configuration
├── .env.example                  # Environment template
├── artisan                       # ⭐ Laravel CLI entry point
├── composer.json                 # PHP dependencies
├── package.json                  # Node.js dependencies
├── vite.config.js                # Vite build configuration
├── tailwind.config.js            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
└── phpunit.xml                   # PHPUnit configuration
```

---

## Critical Folders Summary

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `app/Http/Controllers` | Request handling | ProfileController, Auth/* |
| `app/Models` | Data models | User.php |
| `resources/js/Pages` | React page components | Admin/*, Auth/*, Profile/* |
| `resources/js/Components` | Reusable UI | ui/*, admin/*, Jadwal/* |
| `resources/js/Layouts` | Page layouts | AdminLayout, AuthenticatedLayout |
| `routes` | URL routing | web.php, auth.php |
| `database/migrations` | Schema definitions | users, cache, jobs tables |
| `config` | Laravel configuration | app, auth, database, session |

---

## Entry Points

| Entry Point | Type | Location |
|-------------|------|----------|
| **Web** | HTTP | `public/index.php` |
| **CLI** | Artisan | `artisan` |
| **Frontend** | React | `resources/js/app.tsx` |
| **SSR** | Server Render | `resources/js/ssr.tsx` |

---

## Application Modules (Admin)

| Module | Route | Page Location | Description |
|--------|-------|---------------|-------------|
| Dashboard | `/admin/dashboard` | `Pages/Admin/Dashboard.tsx` | Admin overview with stats |
| User | `/admin/user` | `Pages/Admin/User/Index.tsx` | User management |
| Kelas | `/admin/kelas` | `Pages/Admin/Kelas/*` | Class management |
| Jadwal | `/admin/jadwal` | `Pages/Admin/Jadwal/Index.tsx` | Schedule management |
| Mapel | `/admin/mapel` | `Pages/Admin/Mapel/Index.tsx` | Subject management |
| Laporan | `/admin/laporan` | `Pages/Admin/Laporan/Index.tsx` | Reports & analytics |
| Setting | `/admin/setting` | `Pages/Admin/Setting/Index.tsx` | System settings |
| Lisensi | `/admin/lisensi` | `Pages/Admin/Lisensi/Index.tsx` | License management |
| Daring | `/admin/daring` | `Pages/Admin/Daring/Index.tsx` | Online learning |
| Keuangan | `/admin/keuangan` | `Pages/Admin/Keuangan/Index.tsx` | Financial management |
| Absensi | `/admin/absensi` | `Pages/Admin/Absensi/Index.tsx` | Attendance tracking |
| Perpustakaan | `/admin/perpustakaan` | `Pages/Admin/Perpustakaan/Index.tsx` | Library system |
| PPDB | `/admin/ppdb` | `Pages/Admin/PPDB/Index.tsx` | Student enrollment |
| LMS | `/admin/lms` | `Pages/Admin/LMS/Index.tsx` | Learning management |
| Chat | `/admin/chat` | `Pages/Admin/Chat/Index.tsx` | Communication |

---

## Role-Based Access

| Role | Route Prefix | Dashboard |
|------|--------------|-----------|
| Admin | `/admin` | `Pages/Admin/Dashboard.tsx` |
| Siswa (Student) | `/siswa` | Shared Dashboard (role: student) |
| Guru (Teacher) | `/guru` | Shared Dashboard (role: teacher) |
