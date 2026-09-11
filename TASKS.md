# CivicFix — Project Task Breakdown & Implementation Roadmap (Phase 4)

**Document Version:** 1.0.0  
**Status:** Approved for Sprint Planning  
**Architecture Baseline:** Node.js 20+ Express, TypeScript, PostgreSQL + Prisma ORM, React 19, Tailwind CSS, Leaflet GIS, Docker, GitHub Actions CI/CD.  
**Total Sections:** 20 Modules  
**Format:** Task ID &bull; Name &bull; Description &bull; Priority &bull; Estimated Time &bull; Dependencies &bull; Files Affected &bull; Deliverables &bull; Definition of Done (DoD).

---

## Module 1: Project Setup

### TASK-001: Monorepo & Root Repository Scaffolding
- **Description:** Initialize the root project workspace, repository structure, package management configuration, workspace scripts, and developer tooling.
- **Priority:** P0 (Blocker)
- **Estimated Time:** 2 hours
- **Dependencies:** None
- **Files/Modules Affected:** `package.json`, `tsconfig.json`, `.gitignore`, `.editorconfig`, `.env.example`
- **Deliverables:** Configured TypeScript root workspace with unified linting, formatting, and build commands.
- **Definition of Done:** `npm install` runs cleanly, `npm run build` succeeds, `.gitignore` excludes `node_modules` and `.env`, and git hooks are initialized.

### TASK-002: Code Style, ESLint & Prettier Rules Enactment
- **Description:** Establish unified linting and formatting standards across backend and frontend TypeScript source trees.
- **Priority:** P1
- **Estimated Time:** 1.5 hours
- **Dependencies:** TASK-001
- **Files/Modules Affected:** `.eslintrc.cjs`, `.prettierrc`, `package.json`
- **Deliverables:** ESLint configuration with TypeScript parser and Prettier integration.
- **Definition of Done:** `npm run lint` and `npm run format:check` execute with 0 warnings or errors across the repository.

---

## Module 2: Backend Setup

### TASK-003: Express Application Server & Middleware Pipeline
- **Description:** Scaffold the Node.js Express application server with security middlewares (Helmet, CORS, Rate-Limiting, Gzip compression, JSON body parser).
- **Priority:** P0
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-001
- **Files/Modules Affected:** `src/server.ts`, `src/config/app.config.ts`, `src/middlewares/security.middleware.ts`
- **Deliverables:** Robust Express server listening on port 3000 with CORS whitelisting and request logging (Morgan/Winston).
- **Definition of Done:** Server starts without runtime errors, responds to `GET /api/v1/health` with `{ status: "ok" }`, and rejects malformed JSON with standard error envelopes.

### TASK-004: RFC 7807 Global Error Handling & Logging Engine
- **Description:** Implement central error handling middleware conforming to RFC 7807 (Problem Details for HTTP APIs) and structured JSON logging.
- **Priority:** P0
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-003
- **Files/Modules Affected:** `src/middlewares/error.middleware.ts`, `src/utils/ApiError.ts`, `src/utils/logger.ts`
- **Deliverables:** Custom `ApiError` class and global error interceptor generating RFC 7807 JSON envelopes.
- **Definition of Done:** All unhandled rejections and thrown errors produce `{ type, title, status, detail, instance }` payloads with accurate HTTP status codes (400, 401, 403, 404, 409, 500).

---

## Module 3: Database

### TASK-005: PostgreSQL Database Provisioning & Connection Pooling
- **Description:** Setup PostgreSQL instance with PostGIS spatial extension enabled and configure connection pooling via Prisma Client.
- **Priority:** P0
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-003
- **Files/Modules Affected:** `prisma/schema.prisma`, `src/db/client.ts`, `.env.example`
- **Deliverables:** Configured PostgreSQL database connection pool with automatic reconnection and query latency logging.
- **Definition of Done:** Database health check verifies active connection with PostGIS extensions installed (`SELECT PostGIS_Version();`).

### TASK-006: Prisma Schema Definition & Migration Deployment
- **Description:** Define relational tables: `users`, `departments`, `issue_categories`, `issues`, `issue_photos`, `issue_status_history`, `assignments`, `comments`, `resolution_proofs`, `notifications`.
- **Priority:** P0
- **Estimated Time:** 4 hours
- **Dependencies:** TASK-005
- **Files/Modules Affected:** `prisma/schema.prisma`, `prisma/migrations/*`
- **Deliverables:** Comprehensive Prisma schema with foreign keys, enums, indexes, and initial migration scripts.
- **Definition of Done:** `npx prisma migrate dev` runs successfully and creates all tables, foreign keys, and indexes without warning.

### TASK-007: Database Seeding Script (Wards, Categories, Test Users)
- **Description:** Develop automated seed script populating 6 issue categories, 20 council wards, 5 municipal departments, and demo accounts for each role.
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-006
- **Files/Modules Affected:** `prisma/seed.ts`, `package.json`
- **Deliverables:** Executable database seed script (`npm run db:seed`).
- **Definition of Done:** `npm run db:seed` executes in under 5 seconds, seeding 1 Admin, 1 Dispatcher, 2 Field Workers, 3 Citizens, and 10 demo civic complaints.

---

## Module 4: Authentication

### TASK-008: Password Hashing & Salt Security Engine
- **Description:** Implement bcrypt cryptographic hashing utility with 12 salt rounds for secure password storage and comparison.
- **Priority:** P0
- **Estimated Time:** 1.5 hours
- **Dependencies:** TASK-006
- **Files/Modules Affected:** `src/utils/password.ts`, `src/services/auth.service.ts`
- **Deliverables:** Password hashing and validation helper functions with timing-safe comparison.
- **Definition of Done:** Unit tests verify plaintext passwords cannot be recovered and bcrypt hash verification behaves correctly for valid/invalid strings.

### TASK-009: JWT Token Generation, Rotation & Cookie Manager
- **Description:** Implement dual-token JWT architecture: 15-minute Access Tokens (Bearer) and 7-day cryptographically secure Refresh Tokens stored in HTTP-only cookies.
- **Priority:** P0
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-008
- **Files/Modules Affected:** `src/utils/jwt.ts`, `src/controllers/auth.controller.ts`, `src/routes/auth.routes.ts`
- **Deliverables:** `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh-token`, `/api/v1/auth/logout` endpoints.
- **Definition of Done:** Authentication suite issues valid signed JWTs; refresh endpoint rotates tokens and revokes compromised tokens upon reuse detection.

### TASK-010: Role-Based Access Control (RBAC) Guard Middleware
- **Description:** Develop middleware to extract Bearer JWT, verify claims, load user role (`CITIZEN`, `FIELD_WORKER`, `DISPATCHER`, `SUPERVISOR`, `ADMIN`), and enforce route permissions.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-009
- **Files/Modules Affected:** `src/middlewares/auth.middleware.ts`, `src/middlewares/role.middleware.ts`
- **Deliverables:** `authenticate` and `requireRoles([...])` express middlewares.
- **Definition of Done:** Unauthorized calls receive HTTP 401; users with insufficient permissions receive HTTP 403 Forbidden with RFC 7807 explanation.

---

## Module 5: Citizen Module

### TASK-011: Citizen Profile Management & Activity Stats API
- **Description:** Implement `/api/v1/auth/me` and `/api/v1/citizen/profile` to retrieve and update resident details, ward affiliation, and reporting metrics.
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-010
- **Files/Modules Affected:** `src/controllers/citizen.controller.ts`, `src/routes/citizen.routes.ts`
- **Deliverables:** Secure profile endpoints returning aggregate metrics (total reported, resolved, active).
- **Definition of Done:** Authenticated citizen can fetch profile details and update telephone/ward with verified input validation.

### TASK-012: Citizen Issue Feed & Personal History API
- **Description:** Implement `GET /api/v1/citizen/issues` with pagination, status filter (`REPORTED`, `IN_PROGRESS`, `RESOLVED`), and SLA indicators.
- **Priority:** P0
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-010
- **Files/Modules Affected:** `src/services/citizen.service.ts`, `src/controllers/citizen.controller.ts`
- **Deliverables:** Paginated endpoint delivering personal citizen issue history with photo count and SLA countdowns.
- **Definition of Done:** Endpoint correctly filters by authenticated `userId` and returns pagination meta (`page`, `pageSize`, `totalItems`).

---

## Module 6: Issue Reporting

### TASK-013: Grievance Submission & SLA Calculation Engine
- **Description:** Implement `POST /api/v1/citizen/issues` creating new grievances, generating tracking code `CVX-YYYY-XXXXX`, assigning council ward, and calculating SLA deadline from category rules.
- **Priority:** P0
- **Estimated Time:** 3.5 hours
- **Dependencies:** TASK-010
- **Files/Modules Affected:** `src/services/issue.service.ts`, `src/controllers/issue.controller.ts`, `src/utils/codeGenerator.ts`
- **Deliverables:** Issue creation endpoint with transaction-safe database write, initial status history entry, and SLA calculation.
- **Definition of Done:** Submitting valid issue returns HTTP 201 with unique ticket code, SLA deadline timestamp, and status `REPORTED`.

### TASK-014: Issue Modification Restrictions (Immutable State Guard)
- **Description:** Implement `PATCH /api/v1/citizen/issues/:id` allowing citizen authors to edit descriptions only while issue is in `REPORTED` or `VERIFIED` state.
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-013
- **Files/Modules Affected:** `src/services/issue.service.ts`, `src/routes/citizen.routes.ts`
- **Deliverables:** Surgical update endpoint with state validation rules.
- **Definition of Done:** Non-authors receive 403; editing tickets in `IN_PROGRESS` or `RESOLVED` returns 409 Conflict.

---

## Module 7: Image Upload

### TASK-015: Multipart Photo Upload Middleware & Disk/S3 Pipeline
- **Description:** Configure Multer middleware for `multipart/form-data` uploads, restricting MIME types (`image/jpeg`, `image/png`, `image/webp`) and capping size at 10MB.
- **Priority:** P0
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-013
- **Files/Modules Affected:** `src/middlewares/upload.middleware.ts`, `src/services/storage.service.ts`
- **Deliverables:** File upload service supporting local static storage and AWS S3 / Google Cloud Storage bucket upload.
- **Definition of Done:** Valid images are saved with unique UUID filenames; oversized (>10MB) or non-image files are rejected with HTTP 413 or 415.

### TASK-016: SHA-256 Checksum & Duplicate Photo Prevention
- **Description:** Compute cryptographic SHA-256 hash of incoming uploaded photos to detect identical re-uploads and verify file integrity.
- **Priority:** P1
- **Estimated Time:** 1.5 hours
- **Dependencies:** TASK-015
- **Files/Modules Affected:** `src/services/image.service.ts`, `src/controllers/photo.controller.ts`
- **Deliverables:** Deduplication validator and database storage of image SHA-256 hash.
- **Definition of Done:** Uploading identical image twice to same issue detects existing checksum and prevents duplicate database entries.

---

## Module 8: GPS/Location

### TASK-017: EXIF GPS Metadata Extractor & Proximity Validator
- **Description:** Implement EXIF parser to read embedded latitude/longitude from uploaded photos and compare with citizen-submitted pin location.
- **Priority:** P1
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-015
- **Files/Modules Affected:** `src/services/exif.service.ts`, `src/utils/geo.ts`
- **Deliverables:** EXIF parser extracting coordinates, camera model, and timestamp, flagging `isLocationVerified = true` if within 200m.
- **Definition of Done:** Photos with EXIF metadata are parsed; distance between EXIF and reported location is computed via Haversine formula.

### TASK-018: Municipal Boundary Geofence & Reverse Geocoding
- **Description:** Validate coordinates are within municipal boundary polygon and provide reverse geocoding to auto-fill street addresses.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-017
- **Files/Modules Affected:** `src/services/geocoding.service.ts`, `src/config/boundaries.json`
- **Deliverables:** Spatial validation function checking latitude/longitude bounds before database persistence.
- **Definition of Done:** Coordinates outside municipal boundaries are rejected with HTTP 400 (`INVALID_LOCATION`).

---

## Module 9: Issue Tracking

### TASK-019: Public Tracking by Issue Code Endpoint
- **Description:** Implement unauthenticated `GET /api/v1/issues/track/:issueCode` returning sanitized lifecycle timeline, SLA countdown, and resolution status.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-013
- **Files/Modules Affected:** `src/controllers/public.controller.ts`, `src/routes/public.routes.ts`
- **Deliverables:** Public tracking endpoint with regex validation for `CVX-YYYY-XXXXX`.
- **Definition of Done:** Querying valid issue code returns complete public milestone timeline; non-existent code returns HTTP 404 with RFC 7807 body.

### TASK-020: Upvote & Community Engagement Engine
- **Description:** Implement `POST /api/v1/issues/:id/upvote` allowing residents to upvote existing issues to indicate community impact and prioritize dispatch.
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-019
- **Files/Modules Affected:** `src/services/issue.service.ts`, `src/controllers/issue.controller.ts`
- **Deliverables:** Atomic upvote increment with user-deduplication table (`issue_upvotes`).
- **Definition of Done:** Resident can toggle upvote; repeat clicks toggle vote off; upvote count updates atomically.

---

## Module 10: Notifications

### TASK-021: In-App Notification System & Unread Counter API
- **Description:** Implement database notification triggers on status transitions (`REPORTED`, `ASSIGNED`, `RESOLVED`) and `GET /api/v1/notifications` endpoint.
- **Priority:** P1
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-013
- **Files/Modules Affected:** `src/services/notification.service.ts`, `src/controllers/notification.controller.ts`
- **Deliverables:** Notification creator service and paginated user notification retrieval with unread counts.
- **Definition of Done:** Changing ticket status generates notification record for the reporting citizen; `unreadCount` increments accurately.

### TASK-022: Multi-Channel Alert Dispatcher (Email & SMS Mock Adapter)
- **Description:** Implement notification channel dispatcher sending automated email notifications and SMS alerts for critical status changes.
- **Priority:** P2
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-021
- **Files/Modules Affected:** `src/services/mailer.service.ts`, `src/services/sms.service.ts`
- **Deliverables:** Email/SMS notification dispatcher with template engine for ticket confirmations and resolution notices.
- **Definition of Done:** Action triggers asynchronous notification delivery with fail-safe logging if external provider is offline.

---

## Module 11: Admin Module

### TASK-023: Admin Master Grid Query Engine with Filtering & Sorting
- **Description:** Implement `GET /api/v1/admin/issues` with multi-parameter filtering (status, ward, department, priority, SLA breached) and sorting.
- **Priority:** P0
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-010
- **Files/Modules Affected:** `src/services/admin.service.ts`, `src/controllers/admin.controller.ts`
- **Deliverables:** High-performance admin query endpoint with department workload aggregates.
- **Definition of Done:** DISPATCHER/ADMIN users can query 100+ issues with sub-100ms response time; unauthorized roles receive HTTP 403.

### TASK-024: Grievance Verification & Rejection Workflow
- **Description:** Implement `PATCH /api/v1/admin/issues/:id/verify` and `PATCH /api/v1/admin/issues/:id/reject` with required administrative reason codes.
- **Priority:** P0
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-023
- **Files/Modules Affected:** `src/controllers/admin.controller.ts`, `src/services/audit.service.ts`
- **Deliverables:** Formal verification and rejection transitions recording staff user ID and audit notes.
- **Definition of Done:** Rejection requires non-empty reason code and explanation; transitions state to `REJECTED` and notifies reporter.

### TASK-025: Work Order Creation & Field Crew Assignment Engine
- **Description:** Implement `POST /api/v1/admin/issues/:id/assign` allocating specific field technicians, setting target deadlines, and updating status to `ASSIGNED`.
- **Priority:** P0
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-024
- **Files/Modules Affected:** `src/services/assignment.service.ts`, `src/controllers/admin.controller.ts`
- **Deliverables:** Work order assignment service verifying technician availability and writing to `assignments` table.
- **Definition of Done:** Assigning technician updates ticket status to `ASSIGNED`, creates assignment record, and notifies the assigned field worker.

---

## Module 12: Dashboard

### TASK-026: Real-Time Municipal Analytics & KPI Aggregator API
- **Description:** Implement `GET /api/v1/admin/dashboard/statistics` returning open issue counts, SLA compliance percentage, department throughput, and average turnaround time.
- **Priority:** P0
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-023
- **Files/Modules Affected:** `src/services/analytics.service.ts`, `src/controllers/admin.controller.ts`
- **Deliverables:** High-speed cached analytics aggregation endpoint.
- **Definition of Done:** Returns total open issues, SLA breach count, department distribution, and 30-day resolution trend metrics.

### TASK-027: SLA Countdown Monitor & Auto-Escalation Worker
- **Description:** Develop background job checking active issues against category SLA hours and flagging `isSlaBreached = true` with supervisor escalation.
- **Priority:** P1
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-026
- **Files/Modules Affected:** `src/jobs/slaMonitor.job.ts`, `src/services/escalation.service.ts`
- **Deliverables:** Scheduled cron worker (every 15 mins) evaluating active ticket deadlines.
- **Definition of Done:** Breached tickets are automatically flagged and generate high-priority notifications for the department supervisor.

---

## Module 13: Map

### TASK-028: GeoJSON FeatureCollection API for Map Rendering
- **Description:** Implement `GET /api/v1/public/issues/map` returning OGC standard GeoJSON `FeatureCollection` with bounding box filtering (`minLat`, `maxLat`, `minLng`, `maxLng`).
- **Priority:** P0
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-018
- **Files/Modules Affected:** `src/controllers/public.controller.ts`, `src/utils/geojson.ts`
- **Deliverables:** High-speed GeoJSON serialization endpoint formatted for Leaflet marker clustering.
- **Definition of Done:** Endpoint outputs valid GeoJSON with coordinates `[lng, lat]` and properties (`id`, `title`, `priority`, `status`, `ward`).

### TASK-029: Spatial Heatmap & Ward Boundary Integration
- **Description:** Integrate municipal council ward boundaries (GeoJSON polygons) and incident density heatmap calculations into the GIS service.
- **Priority:** P2
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-028
- **Files/Modules Affected:** `src/services/gis.service.ts`, `public/data/wards.geojson`
- **Deliverables:** Ward boundary overlay endpoint and weighted spatial cluster calculations.
- **Definition of Done:** Map view renders ward polygon boundaries and highlights high-incident clusters in red/amber.

---

## Module 14: Frontend

### TASK-030: Design Token System, Tailwind Styling & Typography
- **Description:** Configure Tailwind CSS color palette (`blue-600`, `slate-900`, status colors), font scaling, and mathematical spacing tokens.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-001
- **Files/Modules Affected:** `src/index.css`, `vite.config.ts`, `tailwind.config.js`
- **Deliverables:** Standardized design system with reusable atomic utility classes.
- **Definition of Done:** All UI components render with consistent WCAG AA compliant colors, 12px card radius, and clean typography.

### TASK-031: Core Layout Components (Header, Admin Sidebar, Mobile Bottom Nav)
- **Description:** Build responsive layout shells: desktop header, collapsible admin sidebar, and mobile fixed bottom navigation bar with floating (+) report button.
- **Priority:** P0
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-030
- **Files/Modules Affected:** `src/components/Header.tsx`, `src/components/AdminSidebar.tsx`, `src/components/BottomNav.tsx`
- **Deliverables:** Responsive layouts supporting desktop, tablet, and mobile breakpoints with smooth transition animations.
- **Definition of Done:** Layout shifts seamlessly across 375px, 768px, and 1280px screen widths without horizontal scrollbars.

### TASK-032: Citizen Screen Suite (Landing, Dashboard, Report, My Reports)
- **Description:** Implement frontend screens for Citizen workflow: Landing page with search, Citizen Dashboard, 3-step Issue Report wizard, and My Reports tab.
- **Priority:** P0
- **Estimated Time:** 5 hours
- **Dependencies:** TASK-031
- **Files/Modules Affected:** `src/components/CitizenDashboard.tsx`, `src/components/ReportIssueModal.tsx`, `src/components/MyReports.tsx`
- **Deliverables:** Interactive citizen user interface with live form validation, camera triggers, and ticket status cards.
- **Definition of Done:** User can complete a report submission flow from landing page to receipt screen in under 45 seconds.

### TASK-033: Admin Command Center Suite (Master Grid, Detail Drawer, Triage)
- **Description:** Build high-density administrative operations screen with sortable data table, multi-filter toolbar, quick dispatch drawer, and KPI metrics.
- **Priority:** P0
- **Estimated Time:** 5 hours
- **Dependencies:** TASK-031
- **Files/Modules Affected:** `src/components/AdminDashboard.tsx`, `src/components/MasterIssueTable.tsx`, `src/components/DispatchModal.tsx`
- **Deliverables:** Administrative dashboard with real-time status badges, technician assignment modal, and resolution proof inspector.
- **Definition of Done:** Dispatcher can filter unassigned issues, assign technician via modal, and verify instant row update in data table.

### TASK-034: Interactive Leaflet Map Component with Custom Cluster Pins
- **Description:** Build Leaflet map component with OpenStreetMap tiles, custom SVG markers color-coded by priority, cluster grouping, and popup preview cards.
- **Priority:** P0
- **Estimated Time:** 3.5 hours
- **Dependencies:** TASK-030
- **Files/Modules Affected:** `src/components/InteractiveMap.tsx`, `src/utils/leafletMarkers.ts`
- **Deliverables:** Smooth Leaflet map with zoom-dependent clustering and click-to-center pin interaction.
- **Definition of Done:** Clicking any pin centers the viewport and opens the issue summary card with a shortcut to the detail drawer.

---

## Module 15: API Integration

### TASK-035: Axios Client Setup with JWT Interceptor & Automatic Refresh
- **Description:** Configure centralized Axios instance with request interceptor attaching Bearer tokens and response interceptor handling transparent 401 token refresh.
- **Priority:** P0
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-009, TASK-031
- **Files/Modules Affected:** `src/services/api.ts`, `src/context/AuthContext.tsx`
- **Deliverables:** Robust API client automatically renewing expired JWTs and redirecting to login upon refresh token expiration.
- **Definition of Done:** Expired access token triggers seamless background refresh without interrupting user interaction.

### TASK-036: State Management & Optimistic UI Updates
- **Description:** Implement React Context / state stores for Authentication, Issue Feeds, Notifications, and active Filters with optimistic UI updates.
- **Priority:** P1
- **Estimated Time:** 3 hours
- **Dependencies:** TASK-035
- **Files/Modules Affected:** `src/context/IssueContext.tsx`, `src/context/NotificationContext.tsx`
- **Deliverables:** State providers with immediate UI upvote increments, instant comment rendering, and graceful rollback on network error.
- **Definition of Done:** Upvoting an issue increments count in UI instantly without visible spinner, rolling back if API returns error.

---

## Module 16: Testing

### TASK-037: Backend Unit & Integration Tests (Jest & Supertest)
- **Description:** Write automated test suites covering authentication, issue submission, role enforcement, and status transitions.
- **Priority:** P1
- **Estimated Time:** 4 hours
- **Dependencies:** TASK-010, TASK-013, TASK-025
- **Files/Modules Affected:** `tests/auth.test.ts`, `tests/issues.test.ts`, `tests/admin.test.ts`
- **Deliverables:** Comprehensive test suite with in-memory SQLite/PostgreSQL test database.
- **Definition of Done:** `npm run test` executes all test cases with >80% code coverage on core business logic services.

### TASK-038: Frontend End-to-End User Flow Tests (Playwright / Cypress)
- **Description:** Implement automated end-to-end tests validating: (1) Citizen registers and reports issue; (2) Dispatcher logs in and assigns work order.
- **Priority:** P1
- **Estimated Time:** 3.5 hours
- **Dependencies:** TASK-032, TASK-033
- **Files/Modules Affected:** `e2e/citizen-flow.spec.ts`, `e2e/admin-dispatch.spec.ts`
- **Deliverables:** Headless browser automation scripts running against local development environment.
- **Definition of Done:** E2E test runs successfully in CI environment, passing all assertion checkpoints without flake.

---

## Module 17: Docker

### TASK-039: Multi-Stage Production Dockerfile Construction
- **Description:** Author an optimized multi-stage Dockerfile compiling frontend assets, bundling the Node.js TypeScript server with esbuild, and creating a minimal Alpine runtime image.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-003, TASK-030
- **Files/Modules Affected:** `Dockerfile`, `.dockerignore`
- **Deliverables:** Production Dockerfile generating container image under 150MB.
- **Definition of Done:** `docker build -t civicfix:latest .` compiles cleanly and executes `node dist/server.cjs` binding to port 3000.

### TASK-040: Docker Compose Multi-Container Development Environment
- **Description:** Create `docker-compose.yml` orchestrating application server, PostgreSQL 16 database with PostGIS, and optional Redis caching container.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-039
- **Files/Modules Affected:** `docker-compose.yml`, `docker-compose.override.yml.example`
- **Deliverables:** One-command local stack initialization (`docker-compose up -d`).
- **Definition of Done:** Running `docker-compose up` provisions PostgreSQL database, runs migrations, seeds demo data, and boots the web application on port 3000.

---

## Module 18: CI/CD

### TASK-041: GitHub Actions Continuous Integration (CI) Workflow
- **Description:** Create GitHub Actions workflow triggering on push/PR to validate code formatting, run ESLint, execute TypeScript compilation, and run unit tests.
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-002, TASK-037
- **Files/Modules Affected:** `.github/workflows/ci.yml`
- **Deliverables:** Automated CI pipeline verifying code health before merge.
- **Definition of Done:** Opening a Pull Request runs linting, type-checking, and tests; green checkmark required before merging.

### TASK-042: Automated Container Build & Registry Push Workflow
- **Description:** Configure automated container image packaging, tagging with git commit SHA and semantic version, and publishing to Google Artifact Registry / Docker Hub.
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-039, TASK-041
- **Files/Modules Affected:** `.github/workflows/deploy.yml`
- **Deliverables:** CD workflow automating image publication on release tags.
- **Definition of Done:** Merging to `main` builds production image and successfully pushes image to container registry.

---

## Module 19: Deployment

### TASK-043: Cloud Run / Container Ingress Provisioning & SSL
- **Description:** Deploy containerized application to Google Cloud Run with custom municipal domain, HTTPS SSL termination, and horizontal autoscaling.
- **Priority:** P0
- **Estimated Time:** 2.5 hours
- **Dependencies:** TASK-039, TASK-042
- **Files/Modules Affected:** `cloudbuild.yaml`, `deploy/cloudrun-service.yaml`
- **Deliverables:** Production deployment configuration supporting automated container rollouts and zero-downtime blue/green traffic shifting.
- **Definition of Done:** Application is reachable over public HTTPS, cold start latency is under 3 seconds, and health checks pass.

### TASK-044: Production Environment Variables & Secrets Hardening
- **Description:** Configure secret management (Cloud Secret Manager / Vault) for database passwords, JWT signing keys, and external API credentials.
- **Priority:** P0
- **Estimated Time:** 1.5 hours
- **Dependencies:** TASK-043
- **Files/Modules Affected:** `.env.example`, `src/config/env.ts`
- **Deliverables:** Secret validation schema failing fast at server boot if critical environment variables are absent.
- **Definition of Done:** Server halts on boot if `JWT_SECRET` or `DATABASE_URL` is missing; all secrets injected safely at runtime without hardcoded values.

---

## Module 20: Documentation

### TASK-045: Comprehensive Architecture & API Documentation (DATABASE.md & API_CONTRACT.md)
- **Description:** Finalize and verify relational database schema documentation, ER diagrams, data dictionaries, and complete 25-endpoint REST API specifications.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-006, TASK-010, TASK-023
- **Files/Modules Affected:** `/DATABASE.md`, `/API_CONTRACT.md`
- **Deliverables:** Published database and API contract engineering deliverables.
- **Definition of Done:** Both documents contain complete schemas, status transitions, RFC 7807 problem details, and Postman collection exports.

### TASK-046: UI/UX Flow & Sprint Task Breakdown Guides (UI_FLOW.md & TASKS.md)
- **Description:** Deliver complete user experience journeys, screen inventories, dashboard wireframes, component hierarchies, and implementation task breakdowns.
- **Priority:** P0
- **Estimated Time:** 2 hours
- **Dependencies:** TASK-032, TASK-033
- **Files/Modules Affected:** `/UI_FLOW.md`, `/TASKS.md`, `README.md`
- **Deliverables:** Published Phase 3 UI/UX specification and Phase 4 Sprint Task Breakdown documents.
- **Definition of Done:** Documents are committed to project root, linked in repository README, and integrated into the interactive in-app documentation browser.
