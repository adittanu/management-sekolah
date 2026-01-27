---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - _bmad-output/analysis/brainstorming-session-2026-01-27.md
  - docs/development-guide.md
  - docs/source-tree-analysis.md
workflowType: 'prd'
classification:
  projectType: web_app
  domain: edtech
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - Management Sekolah

**Author:** Adiet  
**Date:** 2026-01-27  
**Project:** Absensi Guru Hybrid (Web App)

---

## Executive Summary

The **Management Sekolah Attendance Module** is a pragmatic, mobile-first solution designed to modernize teacher attendance tracking. By implementing a **Hybrid Tracking System**, it distinguishes between physical presence (daily attendance) and teaching performance (schedule-based attendance). 

The system leverages **QR Code scanning** with a unique **"Trust-First" validation logic** that prioritizes data entry speed and ease over rigid blocking mechanisms. This approach ensures high adoption rates among teachers with varying tech proficiency while providing administrators with efficient, bulk-verification tools to streamline monthly payroll processing.

---

## Success Criteria

### User Success
- **Speed & Ease:** Teachers can complete attendance (daily or per schedule) in under **5 seconds** per session.
- **Fairness Assurance:** The "Trust Level" system (Green/Yellow status) ensures technical glitches do not automatically result in pay deductions, reducing anxiety.

### Business & Admin Success
- **Operational Efficiency:** Reduce monthly payroll reconciliation time from days to **< 1 hour** via bulk approval tools.
- **Stakeholder Satisfaction:** Achieve **Zero Valid Complaints** regarding erroneous pay deductions due to system errors.
- **Data Integrity:** Accurate separation of physical presence data (allowance) and teaching hours (performance).

### Technical Success
- **Reliability:** QR Code scanning works instantly with **>99.5% success rate** in valid conditions.
- **Integration:** Seamless data flow into the existing `management-sekolah` user/employee tables.
- **Graceful Degradation:** The system handles poor connectivity and GPS drift without blocking users, maintaining data integrity via "Soft Validation".

### Measurable Outcomes
- **Adoption:** 100% of teachers migrate to QR scanning within Month 1.
- **Accuracy:** 90% reduction in manual payroll corrections.
- **Performance:** Average check-in process time < 3 seconds.

---

## Product Scope

### MVP - Minimum Viable Product (Phase 1)
*Focus: Core functionality, user trust, and ease of adoption.*

1.  **Hybrid Tracking System:** Database schema supporting distinct Daily Presence vs. Teaching Schedule records.
2.  **QR Code Scanning:** Mobile web interface for scanning classroom-specific static QR codes.
3.  **Auto-Check-In Logic:** Automatic "Daily Arrival" recording upon the first teaching scan of the day.
4.  **Trust Level Validation:** Soft validation logic (Green/Yellow/Red) based on location and time, non-blocking.
5.  **Admin Bulk Approval:** Dashboard allowing mass verification of "Yellow" status records.
6.  **Basic Offline Mode:** Local storage of scan data with manual retry prompts.

### Growth Features (Phase 2)
*Focus: Automation and enhanced reliability.*

1.  **Background Offline Sync:** Automatic data transmission when connectivity is restored.
2.  **Fingerprint Integration:** Sync with legacy hardware machines if present.
3.  **Smart Notifications:** WhatsApp/Push reminders for missed scans.
4.  **Digital Teaching Journal:** Photo/text upload for teaching evidence.

### Vision (Phase 3)
*Focus: Intelligence and full automation.*

1.  **AI Analytics:** Insights on teacher discipline and correlation with student performance.
2.  **Automated Payroll:** Direct integration with financial modules for auto-calculation.
3.  **Device Binding:** Enhanced security via device UUID locking.

---

## User Journeys

### 1. Pak Budi & The Morning Rush (Primary User - Success Path)
**Persona:** Tech-savvy young teacher, often in a hurry.
**Scenario:** Arrives late, skips gate fingerprint, rushes to first class.

**The Narrative:**
Pak Budi parks his bike 2 minutes before the bell. Rushing past the lobby fingerprint machine, he heads straight to class X-A. Breathless, he opens the *Management Sekolah* app. A large "SCAN MASUK KELAS" button greets him. He taps it, camera opens instantly, and he scans the desk sticker.

*Bling!* A green checkmark appears in < 2 seconds.
> *"Absen Masuk: 06:58 (On Time) | Mulai Mengajar: X-A"*

Relieved, Pak Budi knows the system's **Auto-Check-In** has covered his daily attendance and started his teaching log. He begins class stress-free.

### 2. Bu Siti & The "Yellow" Anxiety (Primary User - Edge Case)
**Persona:** Senior teacher, meticulous, anxious about tech affecting salary.
**Scenario:** Teaching in the Computer Lab (poor signal, GPS drift).

**The Narrative:**
Bu Siti prepares to teach in the thick-walled Computer Lab. Her phone shows 1 bar of signal. Anxiously, she opens the app and scans the QR code. The app loads briefly, then displays a notification—but it's Yellow, not Green.

> *"Data Tersimpan (Menunggu Verifikasi). Lokasi kurang akurat, namun foto valid. Data akan diverifikasi Admin. Gaji aman."*

The human-friendly message calms her immediately. She understands the system acknowledges her presence despite the tech issue and won't unfairly penalize her.

### 3. Mba Rini & The One-Click Wonder (Admin - Efficiency)
**Persona:** School Admin, busy, overloaded with manual recaps.
**Scenario:** Monthly attendance reconciliation for payroll.

**The Narrative:**
It's payroll week. Instead of drowning in paper, Mba Rini opens the "Verifikasi Absensi" dashboard. She sees 45 "Yellow" records—mostly from the Computer Lab.

Filtering by "Location: Lab Komputer", she verifies the pattern. Instead of checking 45 records one-by-one, she selects all and clicks **"Bulk Approve"**. Done in seconds. The system updates everyone's status to Verified. What used to take 3 days now takes 15 minutes.

---

## Web App Specific Requirements

### Architecture & Tech Stack
- **Framework:** Laravel 12 + Inertia.js (React) for a seamless SPA-like feel within a monolithic structure.
- **Database:** MySQL (Production), SQLite (Dev).
- **State Management:** React Context/Zustand for handling offline queues and local state.

### Mobile-First Design
- **Target:** Modern mobile browsers (Chrome Android > v100, Safari iOS > v15).
- **Responsiveness:** UI prioritized for mobile touch interaction (large targets).
- **Performance:** Time to Interactive (TTI) < 3s on 4G networks.

### Offline Strategy (Hybrid)
- **Service Worker:** Caches static assets (UI shell) for offline access.
- **Store & Forward:** Scans are saved to `localStorage`/`IndexedDB` when offline. The UI clearly indicates "Offline Mode". A background process attempts sync when online, with manual retry fallbacks.

### Security
- **Session:** Long-lived sessions (30-day default) to minimize login friction.
- **Validation:** Server-side validation of time and location, trusting client timestamps only within reasonable thresholds.

---

## Functional Requirements (The Capability Contract)

### Authentication & Security
- **FR1:** Teachers can login using registered NIP or Email.
- **FR2:** System maintains long-lived sessions (Remember Me) for up to 30 days.
- **FR3:** Scan features are restricted to the "Teacher" role only.

### Attendance Management (Mobile App)
- **FR4:** Teachers can scan room-specific QR Codes to check-in.
- **FR5:** System captures GPS coordinates during scanning.
- **FR6:** System validates location/time against schedule tolerances.
- **FR7:** System provides immediate visual feedback (Green/Yellow status) post-scan.
- **FR8:** System saves scan data locally when offline (Offline Basic).
- **FR9:** System synchronizes local data to server upon connection restoration.
- **FR10:** System automatically records "Daily Arrival" if the scan is the first valid activity of the day (Auto-Check-In).

### Verification Dashboard (Admin Web)
- **FR11:** Admins can view a list of "Yellow" (Needs Verification) records.
- **FR12:** Admins can filter records by Location, Teacher, Date, or Status.
- **FR13:** Admins can approve multiple records simultaneously (Bulk Action).
- **FR14:** Admins can reject records with a mandatory reason.
- **FR15:** Admins can view evidence details (photo, map location, timestamp) for any record.

### Schedule & Reporting
- **FR16:** App displays the teacher's schedule for the current day on the home screen.
- **FR17:** Admins can export monthly attendance recaps to Excel format.

---

## Non-Functional Requirements

### Performance
- **Response Time:** QR Scan feedback must appear in **< 2 seconds** on 4G networks.
- **Cold Start:** PWA must load and become interactive in **< 3 seconds**.

### Reliability
- **Availability:** Admin Dashboard uptime **99.5%** during school operational hours (07:00 - 16:00).
- **Data Safety:** Offline sync mechanism guarantees **Zero Data Loss** once connectivity is restored.

### Usability & Accessibility
- **Touch Targets:** Primary action buttons (Scan, Check-In) must be at least **48x48px**.
- **Human-Centric Error Messages:** All user-facing errors must use calming, non-technical language (e.g., "Sinyal lemah, data tersimpan" instead of "Network Error 503").

### Security
- **Anti-Spoofing:** System detects standard Android Mock Location/Fake GPS applications.
- **Session Security:** All session tokens are encrypted and XSS-protected.

---

## Risk Mitigation Strategy

| Risk Category | Risk Scenario | Mitigation Strategy |
|---------------|---------------|---------------------|
| **Technical** | Offline sync fails to upload data. | Implemented local log that users can manually export/screenshot as proof of presence. |
| **Market** | Teachers resist using the app ("Too complicated"). | Socialization focuses on "Salary Safety" (Trust Level) and speed benefits. |
| **Resource** | Dev team constraints. | Removed complex graphical reporting from MVP; rely on Excel exports. |
