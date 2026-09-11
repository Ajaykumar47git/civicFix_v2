# CivicFix — System Requirements Specification (SRS)

**Document Version:** 1.0.0  
**Status:** Approved Specification Baseline  
**Classification:** Municipal Public Platform Standard  

---

## 1. Functional Requirements (FR)

### FR-1: Authentication & Identity Management
- **FR-1.1 Registration:** Citizens must register with a valid email address, legal full name (2–100 chars), municipal Council Ward (1–12), and secure password (minimum 8 characters, at least 1 uppercase letter and 1 numeric digit).
- **FR-1.2 Login:** Users authenticate with email and password, receiving a signed JWT Access Token (15-min TTL) and Refresh Token (7-day TTL).
- **FR-1.3 Role-Based Access Control (RBAC):** Five distinct operational roles:
  - `CITIZEN`: Create, view personal reports, upvote, track by code, comment.
  - `FIELD_WORKER`: View assigned work-orders, update progress, upload resolution proof.
  - `DISPATCHER`: Verify issues, change priority, dispatch to field workers, add internal notes.
  - `ADMINISTRATOR`: Manage categories, user accounts, system configuration, view analytics.
  - `SUPER_ADMIN`: Municipal ombudsman with root access and audit log inspection.
- **FR-1.4 Session Invalidation:** Explicit logout invalidates active refresh tokens.

### FR-2: Grievance Creation & Submission
- **FR-2.1 Title & Description:** Title must be between 10 and 150 characters. Description must be between 20 and 2,000 characters.
- **FR-2.2 Geolocation:** Reports must provide valid geographic coordinates (Latitude: -90 to +90, Longitude: -180 to +180) bounded within municipal boundaries.
- **FR-2.3 Photographic Evidence:** Allows 1 to 5 photos per report. Maximum 10MB per file. Supported formats: JPEG, PNG, WebP.
- **FR-2.4 Tracking Identifier:** Every submitted issue generates a unique tracking code (Format: `CF-[A-Z0-9]{6}`, e.g., `CF-849201`).
- **FR-2.5 SLA Clock Initiation:** Submission timestamp initiates the category-specific Service Level Agreement (SLA) countdown.

### FR-3: Category SLAs & Priority Rules
- **FR-3.1 Potholes & Roadways:** Target SLA = 48 hours.
- **FR-3.2 Water Leakage & Main Breaks:** Target SLA = 24 hours.
- **FR-3.3 Streetlight Outages:** Target SLA = 72 hours.
- **FR-3.4 Sanitation & Waste Overflow:** Target SLA = 24 hours.
- **FR-3.5 Fallen Trees & Parks:** Target SLA = 36 hours.
- **FR-3.6 Priority Escalation:** Issues flagged as `URGENT` compress target SLA by 50%.

### FR-4: Administrative Triage & Dispatch
- **FR-4.1 Verification:** Dispatchers verify submitted issues or reject with an audited justification (minimum 15 characters).
- **FR-4.2 Work-Order Dispatch:** Dispatchers assign issues to field technicians based on department specialty and active queue depth.
- **FR-4.3 Real-Time Notification:** System generates notification records for the citizen upon triage, assignment, and resolution.

### FR-5: Field Technician Resolution
- **FR-5.1 Arrival Confirmation:** Technicians mark issues as `IN_PROGRESS` upon arriving at the physical coordinates.
- **FR-5.2 Resolution Proof Mandate:** Technicians cannot transition an issue to `RESOLVED` without uploading at least one post-remediation photograph and completion summary.

### FR-6: Public Transparency & Tracking
- **FR-6.1 Public Feed & Map:** Unauthenticated visitors can view resolved and active public issues, filter by ward/category, and inspect GeoJSON map clusters.
- **FR-6.2 Tracking by Code:** Citizens can look up any issue using its `CF-XXXXXX` tracking code without logging in.
- **FR-6.3 Privacy Masking:** Public feeds hide reporting citizen's phone number, email, and exact house numbers.

---

## 2. Non-Functional Requirements (NFR)

### NFR-1: Performance & Scalability
- **NFR-1.1 API Latency:** 95% of read requests must respond within < 150 ms under concurrent load of 500 requests/sec.
- **NFR-1.2 Write Latency:** Issue creation and status transitions must complete within < 300 ms.
- **NFR-1.3 Spatial Indexing:** GIS bounding box queries must return in < 50 ms using spatial R-Tree indexing.

### NFR-2: Reliability & Data Integrity
- **NFR-2.1 ACID Guarantees:** Multi-table status transitions (status update + audit history + notification) must execute in a single atomic transaction.
- **NFR-2.2 Audit Immutability:** `issue_status_history` and `assignments` tables are strictly append-only; `UPDATE` and `DELETE` queries are prohibited at the database engine level.

### NFR-3: Security & Privacy
- **NFR-3.1 RFC 7807 Error Envelopes:** All 4xx and 5xx API errors must return standard Problem Details JSON without leaking stack traces or database schema details.
- **NFR-3.2 Password Hashing:** Cryptographic password hashing using PBKDF2 with HMAC-SHA256 (10,000+ iterations) or bcrypt (cost factor 12).
- **NFR-3.3 Injection Defenses:** Prepared parameterized queries for all SQL operations. Input sanitization for stored XSS prevention in titles and descriptions.

### NFR-4: Usability & Accessibility
- **NFR-4.1 WCAG 2.1 AA Compliance:** Minimum 4.5:1 contrast ratio for regular text; full keyboard accessibility; visible focus indicators; ARIA live regions for dynamic alerts.
- **NFR-4.2 Mobile Responsiveness:** Minimum 44px touch targets; fluid layout from 320px mobile viewport to 4K ultra-wide monitors.
