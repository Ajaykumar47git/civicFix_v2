# CivicFix — Project Context & Architectural Overview

**Project Name:** CivicFix — Municipal Civic Issue Reporting, Field Dispatch, and Resolution Platform  
**Architecture:** Modern Full-Stack Web Application (Microservices & Layered Monolith Compatible)  
**Standard:** OpenAPI 3.1.0 &bull; RFC 7807 Problem Details &bull; WCAG 2.1 AA &bull; PostgreSQL 16 / MySQL 8.0 ACID Compliant  

---

## 1. Project Background & Purpose

CivicFix is an enterprise-grade municipal grievance reporting and field workforce orchestration platform. It is engineered to bridge the gap between urban citizens experiencing public infrastructure failures (e.g., potholes, broken streetlights, water main leaks, uncollected waste, fallen trees) and municipal public works departments responsible for remediation.

The platform provides:
1. **Citizens (Residents):** A frictionless, mobile-first grievance submission portal with automated GPS geolocation, camera capture, duplicate detection, and real-time public SLA tracking.
2. **Municipal Dispatchers:** An intelligent triage command center featuring GIS heatmaps, SLA countdown timers, automated ward routing, and field technician dispatch capabilities.
3. **Field Technicians:** A mobile-optimized task queue allowing on-site status updates, GPS arrival verification, and photographic resolution proof submission.
4. **City Administrators & Leadership:** Multi-dimensional municipal analytics, Ward-level SLA compliance reports, worker efficiency indices, and public transparency audit logs.

---

## 2. Technical Stack Specification

| Tier | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Web** | React 19, TypeScript 5.8, Tailwind CSS v4, Motion, Lucide Icons | Responsive SPA, WCAG AA accessibility, interactive GIS maps, role-based dashboards |
| **Backend API** | Node.js 20+, Express 4.x, TypeScript (ESM/CJS), tsx | REST API Gateway, RFC 7807 error envelopes, PBKDF2/bcrypt hashing, stateless JWT |
| **Database** | PostgreSQL 16 with PostGIS / MySQL 8.0+ InnoDB | ACID transactional integrity, spatial R-Tree indexing, immutable audit tables |
| **Testing** | Vitest, Jest, Supertest, React Testing Library, Playwright | Multi-tier test pyramid: Unit, Integration, API, UI, E2E, and Security testing |
| **Containerization** | Docker, Docker Compose, Nginx Alpine, Multi-stage builds | Production container orchestration, isolated dev environments, zero-leak secrets |

---

## 3. Core Domain Entities & Relationships

- **User:** Municipal identity with role-based access (`CITIZEN`, `DISPATCHER`, `FIELD_WORKER`, `ADMINISTRATOR`, `SUPER_ADMIN`).
- **Issue Category:** Departmental taxonomy (Roads, Water, Sanitation, Electrical, Parks) defining SLA hours and escalation matrices.
- **Location:** Normalized spatial coordinate (`latitude`, `longitude`) bounded by municipal ward polygons.
- **Issue:** The central transactional record containing unique tracking code (`CF-XXXXXX`), category, priority, status, and SLA deadlines.
- **Issue Photo:** Pre-remediation evidence photos with metadata and file size constraints.
- **Issue Status History:** Tamper-proof append-only audit log capturing every state transition, actor, and timestamp.
- **Assignment:** Work-order dispatch connecting an issue to a field technician with target completion windows.
- **Resolution Proof:** Mandatory post-remediation evidence requiring completion photo, technician notes, and supervisor sign-off.
- **Comment:** Public citizen inquiries and role-restricted internal dispatcher notes.
- **Notification:** Real-time push, SMS, and in-app alerts notifying citizens and staff of status updates.

---

## 4. Lifecycle State Machine

```
[SUBMITTED] ──► [TRIAGED / VERIFIED] ──► [ASSIGNED] ──► [IN_PROGRESS] ──► [RESOLVED] ──► [CLOSED]
     │                      │
     ▼                      ▼
 [DUPLICATE]            [REJECTED]
```

- **SUBMITTED:** Citizen creates issue. SLA clock starts immediately.
- **TRIAGED / VERIFIED:** Dispatcher confirms legitimacy and validates municipal ward jurisdiction.
- **ASSIGNED:** Work order dispatched to certified field technician.
- **IN_PROGRESS:** Technician marks arrival at location.
- **RESOLVED:** Technician uploads mandatory resolution proof photo and notes.
- **CLOSED:** Citizen confirms satisfaction or auto-closed after 72 hours.
- **REJECTED / DUPLICATE:** Terminal states requiring justified explanation recorded in audit log.

---

## 5. Security & Compliance Guidelines

1. **Stateless JWT Authentication:** 15-minute access token lifespan, 7-day secure HTTP-only refresh tokens.
2. **Role-Based Access Control (RBAC):** Strict endpoint guards ensuring citizens cannot access administrative grids, and field workers can only resolve issues assigned to them.
3. **Data Protection & Privacy:** User passwords salted and hashed with PBKDF2 / bcrypt (12 rounds). Phone numbers and exact street addresses masked for public viewers.
4. **EXIF Stripping:** Uploaded photos have GPS EXIF metadata safely extracted for coordinate validation and stripped from public asset delivery to prevent stalking.
