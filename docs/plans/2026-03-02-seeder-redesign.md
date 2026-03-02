# Seeder Redesign — Full Data

**Date:** 2026-03-02
**Status:** Approved

---

## Goal

Replace the partial `DatabaseSeeder` with a complete, modular set of seeders covering all tables with realistic demo data including schedules and attendance for the current month (March 2026) plus February 2026 as historical baseline.

---

## Structure: Multiple Seeder Classes (Approach B)

`DatabaseSeeder` orchestrates the following classes in order:

1. `SchoolSeeder`
2. `UserSeeder`
3. `SubjectSeeder`
4. `ClassroomSeeder`
5. `TimeSlotSeeder` (existing, reused)
6. `ScheduleSeeder`
7. `AttendanceJournalSeeder`
8. `AnnouncementSeeder`
9. `LibrarySeeder`

---

## Data Volumes

| Seeder | Table(s) | Volume |
|---|---|---|
| SchoolSeeder | `schools` | 1 record |
| UserSeeder | `users` | 1 admin + 15 teachers + 360 students = 376 |
| SubjectSeeder | `subjects`, `subject_user` | 15 subjects, 22 subject_user |
| ClassroomSeeder | `classrooms`, `classroom_user` | 10 classrooms, 360 pivot records |
| TimeSlotSeeder | `time_slots` | 15 slots |
| ScheduleSeeder | `schedules` | ~400 records (10 kelas × 5 hari × 8 JP) |
| AttendanceJournalSeeder | `attendances`, `journals` | ~50k+ attendance, ~3k journals |
| AnnouncementSeeder | `announcements` | 6 records |
| LibrarySeeder | `library_books`, `library_loans`, `library_reading_progress` | 25 + 40 + 20 |

---

## School

Single record:
- Name: SMAN 1 Nusantara
- App name: Sekolah Kita
- NPSN, address, phone, email, website, accreditation (A), headmaster

---

## Users

**Admin:** 1 (admin@sekolah.id)

**15 Teachers** with NIP:
| # | Nama | Mapel |
|---|---|---|
| 1 | Budi Santoso, S.Pd | Matematika Wajib |
| 2 | Siti Aminah, S.Pd | Bahasa Indonesia |
| 3 | Bambang Susilo, S.Pd | Bahasa Inggris |
| 4 | Ratna Dewi, S.Pd | Fisika |
| 5 | Ahmad Fauzi, S.Pd | Kimia |
| 6 | Dewi Lestari, S.Pd | Biologi |
| 7 | Wahyu Santoso, S.Pd | Sejarah Indonesia |
| 8 | Rina Susanti, S.Pd | Pendidikan Pancasila |
| 9 | Agus Setiawan, S.Pd | Pendidikan Agama |
| 10 | Yanti Kurniawati, S.Pd | Penjas |
| 11 | Hendra Kusuma, S.Pd | Seni Budaya |
| 12 | Lina Marlina, S.Pd | Matematika Peminatan |
| 13 | Muhamad Akbar, S.Pd | Ekonomi |
| 14 | Nita Sari, S.Pd | Sosiologi |
| 15 | Odi Supriadi, S.Pd | Geografi |

**360 Students:** 36 per class × 10 classes. NIS starts at 20240001.

---

## Subjects (15)

Wajib: Matematika Wajib, Bahasa Indonesia, Bahasa Inggris, Sejarah Indonesia, Pendidikan Pancasila, Pendidikan Agama, Penjas, Seni Budaya
Peminatan: Matematika Peminatan, Fisika, Kimia, Biologi
IPS: Ekonomi, Sosiologi, Geografi

---

## Classrooms (10)

- X IPA 1, X IPA 2, X IPS 1, X IPS 2
- XI IPA 1, XI IPA 2, XI IPS 1
- XII IPA 1, XII IPA 2, XII IPS 1

Academic year: 2024/2025. Each classroom assigned a homeroom teacher (wali kelas).
Students distributed evenly: 36 per class.

---

## Schedules

- 10 classrooms × 5 days (Senin–Jumat) × 8 time slots = 400 schedules
- Time slots: 07:00–14:00 with breaks (istirahat 09:15–09:30, ishoma 11:45–12:30)
- Subject rotation: each subject appears 2–3× per week per classroom
- Rooms: IPA classes get Lab Fisika/Kimia/Biologi, IPS get regular rooms (R.101–R.203)
- Teacher assigned per subject (from subject_user mapping)

---

## Attendance & Journals

**Date range:**
- February 2026 — all 20 school days (Senin–Jumat) as historical baseline
- March 2026 — school days up to `now()` (dynamic)

**Attendance distribution:**
- 85% hadir, 7% sakit, 5% izin, 3% alpha
- 3–5 "trouble students" per class with elevated alpha rate for realistic dashboard data

**Journals:**
- 75% of schedule occurrences on past school days get a journal entry
- Titles vary by subject (e.g., "Pertemuan — Sistem Persamaan Linear" for Matematika)

---

## Announcements (6)

Mix of topics: ujian, libur, kegiatan ekstrakurikuler, rapat orang tua.
Dates spread across Feb–Mar 2026. 5 active, 1 inactive.

---

## Library

**25 Books** — categories: Matematika, Fisika, Kimia, Biologi, Bahasa, Sejarah, Novel, Umum.
`pdf_path` uses dummy strings (`books/[slug].pdf`). `uploaded_by` = admin.

**40 Loans** — ~25 active, ~15 returned. Some active loans past due date (overdue scenario).
Borrowers: random students. `loaned_by` = admin.

**20 Reading Progress** — random students, varying `current_page`.

---

## Truncation Order (for re-seeding)

```
SET FOREIGN_KEY_CHECKS=0
library_reading_progress → library_loans → library_books
announcements → journals → attendances → schedules
classroom_user → subject_user → classrooms → subjects
time_slots → users → schools
SET FOREIGN_KEY_CHECKS=1
```
