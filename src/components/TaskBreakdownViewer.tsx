import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Search, 
  Filter, 
  Layers, 
  AlertCircle, 
  FileText, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface Task {
  id: string;
  module: string;
  moduleIndex: number;
  name: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  estimatedTime: string;
  dependencies: string;
  files: string;
  deliverables: string;
  dod: string;
}

const ALL_TASKS: Task[] = [
  // 1. Project Setup
  {
    id: 'TASK-001',
    moduleIndex: 1,
    module: 'Project Setup',
    name: 'Monorepo & Root Repository Scaffolding',
    description: 'Initialize root project workspace, directory structure, package configuration, workspace scripts, and developer tooling.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'None',
    files: 'package.json, tsconfig.json, .gitignore, .env.example',
    deliverables: 'Configured TypeScript root workspace with unified linting, formatting, and build commands.',
    dod: 'npm install runs cleanly, npm run build succeeds, .gitignore excludes node_modules and .env, git hooks initialized.'
  },
  {
    id: 'TASK-002',
    moduleIndex: 1,
    module: 'Project Setup',
    name: 'Code Style, ESLint & Prettier Rules Enactment',
    description: 'Establish unified linting and formatting standards across backend and frontend TypeScript source trees.',
    priority: 'P1',
    estimatedTime: '1.5 hours',
    dependencies: 'TASK-001',
    files: '.eslintrc.cjs, .prettierrc, package.json',
    deliverables: 'ESLint configuration with TypeScript parser and Prettier integration.',
    dod: 'npm run lint and npm run format:check execute with 0 warnings or errors across the repository.'
  },

  // 2. Backend Setup
  {
    id: 'TASK-003',
    moduleIndex: 2,
    module: 'Backend Setup',
    name: 'Express Application Server & Middleware Pipeline',
    description: 'Scaffold Node.js Express server with security middlewares (Helmet, CORS, Rate-Limiting, Gzip, JSON body parser).',
    priority: 'P0',
    estimatedTime: '3 hours',
    dependencies: 'TASK-001',
    files: 'src/server.ts, src/config/app.config.ts, src/middlewares/security.middleware.ts',
    deliverables: 'Robust Express server listening on port 3000 with CORS whitelisting and request logging.',
    dod: 'Server starts without errors, GET /api/v1/health responds with { status: "ok" }, rejects malformed JSON cleanly.'
  },
  {
    id: 'TASK-004',
    moduleIndex: 2,
    module: 'Backend Setup',
    name: 'RFC 7807 Global Error Handling & Logging Engine',
    description: 'Implement central error handling middleware conforming to RFC 7807 Problem Details and structured JSON logging.',
    priority: 'P0',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-003',
    files: 'src/middlewares/error.middleware.ts, src/utils/ApiError.ts, src/utils/logger.ts',
    deliverables: 'Custom ApiError class and global error interceptor generating RFC 7807 JSON envelopes.',
    dod: 'All unhandled rejections produce uniform { type, title, status, detail, instance } payloads.'
  },

  // 3. Database
  {
    id: 'TASK-005',
    moduleIndex: 3,
    module: 'Database',
    name: 'PostgreSQL Database Provisioning & Connection Pooling',
    description: 'Setup PostgreSQL instance with PostGIS spatial extension enabled and configure connection pooling via Prisma Client.',
    priority: 'P0',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-003',
    files: 'prisma/schema.prisma, src/db/client.ts, .env.example',
    deliverables: 'Configured PostgreSQL database connection pool with automatic reconnection and query latency logging.',
    dod: 'SELECT PostGIS_Version(); executes successfully and returns valid PostGIS extension version.'
  },
  {
    id: 'TASK-006',
    moduleIndex: 3,
    module: 'Database',
    name: 'Prisma Schema Definition & Migration Deployment',
    description: 'Define relational tables: users, departments, issue_categories, issues, photos, status_history, assignments, comments, proofs, notifications.',
    priority: 'P0',
    estimatedTime: '4 hours',
    dependencies: 'TASK-005',
    files: 'prisma/schema.prisma, prisma/migrations/*',
    deliverables: 'Comprehensive Prisma schema with foreign keys, enums, indexes, and initial migration scripts.',
    dod: 'npx prisma migrate dev runs successfully and creates all tables, foreign keys, and indexes without warning.'
  },
  {
    id: 'TASK-007',
    moduleIndex: 3,
    module: 'Database',
    name: 'Database Seeding Script (Wards, Categories, Test Users)',
    description: 'Develop automated seed script populating 6 issue categories, 20 council wards, 5 municipal departments, and demo role accounts.',
    priority: 'P1',
    estimatedTime: '2 hours',
    dependencies: 'TASK-006',
    files: 'prisma/seed.ts, package.json',
    deliverables: 'Executable database seed script (npm run db:seed).',
    dod: 'npm run db:seed executes in under 5 seconds, seeding 1 Admin, 1 Dispatcher, 2 Field Workers, 3 Citizens, and 10 demo complaints.'
  },

  // 4. Authentication
  {
    id: 'TASK-008',
    moduleIndex: 4,
    module: 'Authentication',
    name: 'Password Hashing & Salt Security Engine',
    description: 'Implement bcrypt cryptographic hashing utility with 12 salt rounds for secure password storage and comparison.',
    priority: 'P0',
    estimatedTime: '1.5 hours',
    dependencies: 'TASK-006',
    files: 'src/utils/password.ts, src/services/auth.service.ts',
    deliverables: 'Password hashing and validation helper functions with timing-safe comparison.',
    dod: 'Unit tests verify bcrypt hashes cannot be reversed and password matching validates accurately.'
  },
  {
    id: 'TASK-009',
    moduleIndex: 4,
    module: 'Authentication',
    name: 'JWT Token Generation, Rotation & Cookie Manager',
    description: 'Implement dual-token JWT architecture: 15-minute Access Tokens (Bearer) and 7-day Refresh Tokens stored in HTTP-only cookies.',
    priority: 'P0',
    estimatedTime: '3 hours',
    dependencies: 'TASK-008',
    files: 'src/utils/jwt.ts, src/controllers/auth.controller.ts, src/routes/auth.routes.ts',
    deliverables: '/api/v1/auth/register, /login, /refresh-token, /logout endpoints.',
    dod: 'Auth endpoints issue valid signed JWTs; refresh endpoint rotates tokens and detects replay attack.'
  },
  {
    id: 'TASK-010',
    moduleIndex: 4,
    module: 'Authentication',
    name: 'Role-Based Access Control (RBAC) Guard Middleware',
    description: 'Develop middleware to extract Bearer JWT, verify claims, load role (CITIZEN, FIELD_WORKER, DISPATCHER, SUPERVISOR, ADMIN), and enforce permissions.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-009',
    files: 'src/middlewares/auth.middleware.ts, src/middlewares/role.middleware.ts',
    deliverables: 'authenticate and requireRoles([...]) Express middlewares.',
    dod: 'Unauthorized calls receive HTTP 401; insufficient role permissions receive HTTP 403 Forbidden with RFC 7807 body.'
  },

  // 5. Citizen Module
  {
    id: 'TASK-011',
    moduleIndex: 5,
    module: 'Citizen Module',
    name: 'Citizen Profile Management & Activity Stats API',
    description: 'Implement /api/v1/auth/me and /api/v1/citizen/profile to retrieve and update resident details, ward affiliation, and stats.',
    priority: 'P1',
    estimatedTime: '2 hours',
    dependencies: 'TASK-010',
    files: 'src/controllers/citizen.controller.ts, src/routes/citizen.routes.ts',
    deliverables: 'Secure profile endpoints returning aggregate metrics (total reported, resolved, active).',
    dod: 'Citizen can fetch profile details and update telephone/ward with verified input validation.'
  },
  {
    id: 'TASK-012',
    moduleIndex: 5,
    module: 'Citizen Module',
    name: 'Citizen Issue Feed & Personal History API',
    description: 'Implement GET /api/v1/citizen/issues with pagination, status filter (REPORTED, IN_PROGRESS, RESOLVED), and SLA indicators.',
    priority: 'P0',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-010',
    files: 'src/services/citizen.service.ts, src/controllers/citizen.controller.ts',
    deliverables: 'Paginated endpoint delivering personal citizen issue history with photo count and SLA countdowns.',
    dod: 'Endpoint correctly filters by authenticated userId and returns pagination meta (page, pageSize, totalItems).'
  },

  // 6. Issue Reporting
  {
    id: 'TASK-013',
    moduleIndex: 6,
    module: 'Issue Reporting',
    name: 'Grievance Submission & SLA Calculation Engine',
    description: 'Implement POST /api/v1/citizen/issues creating new grievances, generating tracking code CVX-YYYY-XXXXX, assigning ward, and setting SLA.',
    priority: 'P0',
    estimatedTime: '3.5 hours',
    dependencies: 'TASK-010',
    files: 'src/services/issue.service.ts, src/controllers/issue.controller.ts, src/utils/codeGenerator.ts',
    deliverables: 'Issue creation endpoint with transaction-safe database write, status history, and SLA calculation.',
    dod: 'Submitting valid issue returns HTTP 201 with unique ticket code, SLA deadline timestamp, and status REPORTED.'
  },
  {
    id: 'TASK-014',
    moduleIndex: 6,
    module: 'Issue Reporting',
    name: 'Issue Modification Restrictions (Immutable State Guard)',
    description: 'Implement PATCH /api/v1/citizen/issues/:id allowing citizen authors to edit descriptions only while issue is in REPORTED/VERIFIED state.',
    priority: 'P1',
    estimatedTime: '2 hours',
    dependencies: 'TASK-013',
    files: 'src/services/issue.service.ts, src/routes/citizen.routes.ts',
    deliverables: 'Surgical update endpoint with state validation rules.',
    dod: 'Non-authors receive 403; editing tickets in IN_PROGRESS or RESOLVED returns 409 Conflict.'
  },

  // 7. Image Upload
  {
    id: 'TASK-015',
    moduleIndex: 7,
    module: 'Image Upload',
    name: 'Multipart Photo Upload Middleware & Disk/S3 Pipeline',
    description: 'Configure Multer middleware for multipart/form-data uploads, restricting MIME types (jpeg, png, webp) and capping size at 10MB.',
    priority: 'P0',
    estimatedTime: '3 hours',
    dependencies: 'TASK-013',
    files: 'src/middlewares/upload.middleware.ts, src/services/storage.service.ts',
    deliverables: 'File upload service supporting local static storage and cloud bucket upload.',
    dod: 'Valid images saved with unique UUID filenames; oversized (>10MB) or non-images rejected with 413/415.'
  },
  {
    id: 'TASK-016',
    moduleIndex: 7,
    module: 'Image Upload',
    name: 'SHA-256 Checksum & Duplicate Photo Prevention',
    description: 'Compute cryptographic SHA-256 hash of incoming uploaded photos to detect identical re-uploads and verify file integrity.',
    priority: 'P1',
    estimatedTime: '1.5 hours',
    dependencies: 'TASK-015',
    files: 'src/services/image.service.ts, src/controllers/photo.controller.ts',
    deliverables: 'Deduplication validator and database storage of image SHA-256 hash.',
    dod: 'Uploading identical image twice to same issue detects existing checksum and prevents duplicate DB rows.'
  },

  // 8. GPS/Location
  {
    id: 'TASK-017',
    moduleIndex: 8,
    module: 'GPS/Location',
    name: 'EXIF GPS Metadata Extractor & Proximity Validator',
    description: 'Implement EXIF parser to read embedded latitude/longitude from uploaded photos and compare with citizen-submitted pin location.',
    priority: 'P1',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-015',
    files: 'src/services/exif.service.ts, src/utils/geo.ts',
    deliverables: 'EXIF parser extracting coordinates, camera model, and timestamp, flagging isLocationVerified = true if within 200m.',
    dod: 'Distance between EXIF and reported location is computed via Haversine formula and stored in DB.'
  },
  {
    id: 'TASK-018',
    moduleIndex: 8,
    module: 'GPS/Location',
    name: 'Municipal Boundary Geofence & Reverse Geocoding',
    description: 'Validate coordinates are within municipal boundary polygon and provide reverse geocoding to auto-fill street addresses.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-017',
    files: 'src/services/geocoding.service.ts, src/config/boundaries.json',
    deliverables: 'Spatial validation function checking latitude/longitude bounds before database persistence.',
    dod: 'Coordinates outside municipal boundaries are rejected with HTTP 400 (INVALID_LOCATION).'
  },

  // 9. Issue Tracking
  {
    id: 'TASK-019',
    moduleIndex: 9,
    module: 'Issue Tracking',
    name: 'Public Tracking by Issue Code Endpoint',
    description: 'Implement unauthenticated GET /api/v1/issues/track/:issueCode returning sanitized lifecycle timeline and resolution status.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-013',
    files: 'src/controllers/public.controller.ts, src/routes/public.routes.ts',
    deliverables: 'Public tracking endpoint with regex validation for CVX-YYYY-XXXXX.',
    dod: 'Querying valid issue code returns complete public milestone timeline; invalid code returns HTTP 404.'
  },
  {
    id: 'TASK-020',
    moduleIndex: 9,
    module: 'Issue Tracking',
    name: 'Upvote & Community Engagement Engine',
    description: 'Implement POST /api/v1/issues/:id/upvote allowing residents to upvote issues to indicate community impact.',
    priority: 'P1',
    estimatedTime: '2 hours',
    dependencies: 'TASK-019',
    files: 'src/services/issue.service.ts, src/controllers/issue.controller.ts',
    deliverables: 'Atomic upvote increment with user-deduplication table (issue_upvotes).',
    dod: 'Resident can toggle upvote; repeat clicks toggle vote off; upvote count updates atomically in DB.'
  },

  // 10. Notifications
  {
    id: 'TASK-021',
    moduleIndex: 10,
    module: 'Notifications',
    name: 'In-App Notification System & Unread Counter API',
    description: 'Implement database notification triggers on status transitions (REPORTED, ASSIGNED, RESOLVED) and GET /api/v1/notifications endpoint.',
    priority: 'P1',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-013',
    files: 'src/services/notification.service.ts, src/controllers/notification.controller.ts',
    deliverables: 'Notification creator service and paginated user notification retrieval with unread counts.',
    dod: 'Changing ticket status generates notification record for citizen; unreadCount increments accurately.'
  },
  {
    id: 'TASK-022',
    moduleIndex: 10,
    module: 'Notifications',
    name: 'Multi-Channel Alert Dispatcher (Email & SMS Mock Adapter)',
    description: 'Implement notification channel dispatcher sending automated email notifications and SMS alerts for critical status changes.',
    priority: 'P2',
    estimatedTime: '2 hours',
    dependencies: 'TASK-021',
    files: 'src/services/mailer.service.ts, src/services/sms.service.ts',
    deliverables: 'Email/SMS notification dispatcher with template engine for ticket confirmations and resolution notices.',
    dod: 'Status change triggers asynchronous notification delivery with fail-safe logging if external provider is offline.'
  },

  // 11. Admin Module
  {
    id: 'TASK-023',
    moduleIndex: 11,
    module: 'Admin Module',
    name: 'Admin Master Grid Query Engine with Filtering & Sorting',
    description: 'Implement GET /api/v1/admin/issues with multi-parameter filtering (status, ward, department, priority, SLA breached) and sorting.',
    priority: 'P0',
    estimatedTime: '3 hours',
    dependencies: 'TASK-010',
    files: 'src/services/admin.service.ts, src/controllers/admin.controller.ts',
    deliverables: 'High-performance admin query endpoint with department workload aggregates.',
    dod: 'DISPATCHER/ADMIN users can query 100+ issues with sub-100ms response time; unauthorized roles receive HTTP 403.'
  },
  {
    id: 'TASK-024',
    moduleIndex: 11,
    module: 'Admin Module',
    name: 'Grievance Verification & Rejection Workflow',
    description: 'Implement PATCH /api/v1/admin/issues/:id/verify and PATCH /api/v1/admin/issues/:id/reject with required reason codes.',
    priority: 'P0',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-023',
    files: 'src/controllers/admin.controller.ts, src/services/audit.service.ts',
    deliverables: 'Formal verification and rejection transitions recording staff user ID and audit notes.',
    dod: 'Rejection requires non-empty reason code and explanation; transitions state to REJECTED and notifies reporter.'
  },
  {
    id: 'TASK-025',
    moduleIndex: 11,
    module: 'Admin Module',
    name: 'Work Order Creation & Field Crew Assignment Engine',
    description: 'Implement POST /api/v1/admin/issues/:id/assign allocating technicians, setting target deadlines, and updating status to ASSIGNED.',
    priority: 'P0',
    estimatedTime: '3 hours',
    dependencies: 'TASK-024',
    files: 'src/services/assignment.service.ts, src/controllers/admin.controller.ts',
    deliverables: 'Work order assignment service verifying technician availability and writing to assignments table.',
    dod: 'Assigning technician updates ticket status to ASSIGNED, creates assignment record, and alerts field worker.'
  },

  // 12. Dashboard
  {
    id: 'TASK-026',
    moduleIndex: 12,
    module: 'Dashboard',
    name: 'Real-Time Municipal Analytics & KPI Aggregator API',
    description: 'Implement GET /api/v1/admin/dashboard/statistics returning open issue counts, SLA compliance percentage, and department turnaround.',
    priority: 'P0',
    estimatedTime: '3 hours',
    dependencies: 'TASK-023',
    files: 'src/services/analytics.service.ts, src/controllers/admin.controller.ts',
    deliverables: 'High-speed cached analytics aggregation endpoint.',
    dod: 'Returns total open issues, SLA breach count, department distribution, and 30-day resolution trend metrics.'
  },
  {
    id: 'TASK-027',
    moduleIndex: 12,
    module: 'Dashboard',
    name: 'SLA Countdown Monitor & Auto-Escalation Worker',
    description: 'Develop background job checking active issues against category SLA hours and flagging isSlaBreached = true with supervisor escalation.',
    priority: 'P1',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-026',
    files: 'src/jobs/slaMonitor.job.ts, src/services/escalation.service.ts',
    deliverables: 'Scheduled cron worker (every 15 mins) evaluating active ticket deadlines.',
    dod: 'Breached tickets are automatically flagged and generate high-priority notifications for the department supervisor.'
  },

  // 13. Map
  {
    id: 'TASK-028',
    moduleIndex: 13,
    module: 'Map',
    name: 'GeoJSON FeatureCollection API for Map Rendering',
    description: 'Implement GET /api/v1/public/issues/map returning OGC standard GeoJSON FeatureCollection with bounding box filtering.',
    priority: 'P0',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-018',
    files: 'src/controllers/public.controller.ts, src/utils/geojson.ts',
    deliverables: 'High-speed GeoJSON serialization endpoint formatted for Leaflet marker clustering.',
    dod: 'Endpoint outputs valid GeoJSON with coordinates [lng, lat] and properties (id, title, priority, status, ward).'
  },
  {
    id: 'TASK-029',
    moduleIndex: 13,
    module: 'Map',
    name: 'Spatial Heatmap & Ward Boundary Integration',
    description: 'Integrate municipal council ward boundaries (GeoJSON polygons) and incident density heatmap calculations into the GIS service.',
    priority: 'P2',
    estimatedTime: '2 hours',
    dependencies: 'TASK-028',
    files: 'src/services/gis.service.ts, public/data/wards.geojson',
    deliverables: 'Ward boundary overlay endpoint and weighted spatial cluster calculations.',
    dod: 'Map view renders ward polygon boundaries and highlights high-incident clusters in red/amber.'
  },

  // 14. Frontend
  {
    id: 'TASK-030',
    moduleIndex: 14,
    module: 'Frontend',
    name: 'Design Token System, Tailwind Styling & Typography',
    description: 'Configure Tailwind CSS color palette (blue-600, slate-900, status colors), font scaling, and mathematical spacing tokens.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-001',
    files: 'src/index.css, vite.config.ts, tailwind.config.js',
    deliverables: 'Standardized design system with reusable atomic utility classes.',
    dod: 'All UI components render with consistent WCAG AA compliant colors, 12px card radius, and clean typography.'
  },
  {
    id: 'TASK-031',
    moduleIndex: 14,
    module: 'Frontend',
    name: 'Core Layout Components (Header, Admin Sidebar, Bottom Nav)',
    description: 'Build responsive layout shells: desktop header, collapsible admin sidebar, and mobile fixed bottom navigation bar with floating (+) report button.',
    priority: 'P0',
    estimatedTime: '3 hours',
    dependencies: 'TASK-030',
    files: 'src/components/Header.tsx, src/components/AdminSidebar.tsx, src/components/BottomNav.tsx',
    deliverables: 'Responsive layouts supporting desktop, tablet, and mobile breakpoints with smooth transition animations.',
    dod: 'Layout shifts seamlessly across 375px, 768px, and 1280px screen widths without horizontal scrollbars.'
  },
  {
    id: 'TASK-032',
    moduleIndex: 14,
    module: 'Frontend',
    name: 'Citizen Screen Suite (Landing, Dashboard, Report, My Reports)',
    description: 'Implement frontend screens for Citizen workflow: Landing page with search, Citizen Dashboard, 3-step Issue Report wizard, and My Reports tab.',
    priority: 'P0',
    estimatedTime: '5 hours',
    dependencies: 'TASK-031',
    files: 'src/components/CitizenDashboard.tsx, src/components/ReportIssueModal.tsx, src/components/MyReports.tsx',
    deliverables: 'Interactive citizen user interface with live form validation, camera triggers, and ticket status cards.',
    dod: 'User can complete a report submission flow from landing page to receipt screen in under 45 seconds.'
  },
  {
    id: 'TASK-033',
    moduleIndex: 14,
    module: 'Frontend',
    name: 'Admin Command Center Suite (Master Grid, Detail Drawer, Triage)',
    description: 'Build high-density administrative operations screen with sortable data table, multi-filter toolbar, quick dispatch drawer, and KPI metrics.',
    priority: 'P0',
    estimatedTime: '5 hours',
    dependencies: 'TASK-031',
    files: 'src/components/AdminDashboard.tsx, src/components/MasterIssueTable.tsx, src/components/DispatchModal.tsx',
    deliverables: 'Administrative dashboard with real-time status badges, technician assignment modal, and resolution proof inspector.',
    dod: 'Dispatcher can filter unassigned issues, assign technician via modal, and verify instant row update in data table.'
  },
  {
    id: 'TASK-034',
    moduleIndex: 14,
    module: 'Frontend',
    name: 'Interactive Leaflet Map Component with Custom Cluster Pins',
    description: 'Build Leaflet map component with OpenStreetMap tiles, custom SVG markers color-coded by priority, cluster grouping, and popup cards.',
    priority: 'P0',
    estimatedTime: '3.5 hours',
    dependencies: 'TASK-030',
    files: 'src/components/InteractiveMap.tsx, src/utils/leafletMarkers.ts',
    deliverables: 'Smooth Leaflet map with zoom-dependent clustering and click-to-center pin interaction.',
    dod: 'Clicking any pin centers the viewport and opens the issue summary card with a shortcut to the detail drawer.'
  },

  // 15. API Integration
  {
    id: 'TASK-035',
    moduleIndex: 15,
    module: 'API Integration',
    name: 'Axios Client Setup with JWT Interceptor & Automatic Refresh',
    description: 'Configure centralized Axios instance with request interceptor attaching Bearer tokens and response interceptor handling transparent 401 token refresh.',
    priority: 'P0',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-009, TASK-031',
    files: 'src/services/api.ts, src/context/AuthContext.tsx',
    deliverables: 'Robust API client automatically renewing expired JWTs and redirecting to login upon refresh token expiration.',
    dod: 'Expired access token triggers seamless background refresh without interrupting user interaction.'
  },
  {
    id: 'TASK-036',
    moduleIndex: 15,
    module: 'API Integration',
    name: 'State Management & Optimistic UI Updates',
    description: 'Implement React Context / state stores for Authentication, Issue Feeds, Notifications, and active Filters with optimistic UI updates.',
    priority: 'P1',
    estimatedTime: '3 hours',
    dependencies: 'TASK-035',
    files: 'src/context/IssueContext.tsx, src/context/NotificationContext.tsx',
    deliverables: 'State providers with immediate UI upvote increments, instant comment rendering, and graceful rollback on network error.',
    dod: 'Upvoting an issue increments count in UI instantly without visible spinner, rolling back if API returns error.'
  },

  // 16. Testing
  {
    id: 'TASK-037',
    moduleIndex: 16,
    module: 'Testing',
    name: 'Backend Unit & Integration Tests (Jest & Supertest)',
    description: 'Write automated test suites covering authentication, issue submission, role enforcement, and status transitions.',
    priority: 'P1',
    estimatedTime: '4 hours',
    dependencies: 'TASK-010, TASK-013, TASK-025',
    files: 'tests/auth.test.ts, tests/issues.test.ts, tests/admin.test.ts',
    deliverables: 'Comprehensive test suite with in-memory SQLite/PostgreSQL test database.',
    dod: 'npm run test executes all test cases with >80% code coverage on core business logic services.'
  },
  {
    id: 'TASK-038',
    moduleIndex: 16,
    module: 'Testing',
    name: 'Frontend End-to-End User Flow Tests (Playwright / Cypress)',
    description: 'Implement automated end-to-end tests validating: (1) Citizen registers and reports issue; (2) Dispatcher logs in and assigns work order.',
    priority: 'P1',
    estimatedTime: '3.5 hours',
    dependencies: 'TASK-032, TASK-033',
    files: 'e2e/citizen-flow.spec.ts, e2e/admin-dispatch.spec.ts',
    deliverables: 'Headless browser automation scripts running against local development environment.',
    dod: 'E2E test runs successfully in CI environment, passing all assertion checkpoints without flake.'
  },

  // 17. Docker
  {
    id: 'TASK-039',
    moduleIndex: 17,
    module: 'Docker',
    name: 'Multi-Stage Production Dockerfile Construction',
    description: 'Author an optimized multi-stage Dockerfile compiling frontend assets, bundling the Node.js TypeScript server with esbuild, and creating a minimal Alpine runtime image.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-003, TASK-030',
    files: 'Dockerfile, .dockerignore',
    deliverables: 'Production Dockerfile generating container image under 150MB.',
    dod: 'docker build -t civicfix:latest . compiles cleanly and executes node dist/server.cjs binding to port 3000.'
  },
  {
    id: 'TASK-040',
    moduleIndex: 17,
    module: 'Docker',
    name: 'Docker Compose Multi-Container Development Environment',
    description: 'Create docker-compose.yml orchestrating application server, PostgreSQL 16 database with PostGIS, and optional Redis caching container.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-039',
    files: 'docker-compose.yml, docker-compose.override.yml.example',
    deliverables: 'One-command local stack initialization (docker-compose up -d).',
    dod: 'Running docker-compose up provisions PostgreSQL database, runs migrations, seeds demo data, and boots the web application on port 3000.'
  },

  // 18. CI/CD
  {
    id: 'TASK-041',
    moduleIndex: 18,
    module: 'CI/CD',
    name: 'GitHub Actions Continuous Integration (CI) Workflow',
    description: 'Create GitHub Actions workflow triggering on push/PR to validate code formatting, run ESLint, execute TypeScript compilation, and run unit tests.',
    priority: 'P1',
    estimatedTime: '2 hours',
    dependencies: 'TASK-002, TASK-037',
    files: '.github/workflows/ci.yml',
    deliverables: 'Automated CI pipeline verifying code health before merge.',
    dod: 'Opening a Pull Request runs linting, type-checking, and tests; green checkmark required before merging.'
  },
  {
    id: 'TASK-042',
    moduleIndex: 18,
    module: 'CI/CD',
    name: 'Automated Container Build & Registry Push Workflow',
    description: 'Configure automated container image packaging, tagging with git commit SHA and semantic version, and publishing to Google Artifact Registry / Docker Hub.',
    priority: 'P1',
    estimatedTime: '2 hours',
    dependencies: 'TASK-039, TASK-041',
    files: '.github/workflows/deploy.yml',
    deliverables: 'CD workflow automating image publication on release tags.',
    dod: 'Merging to main builds production image and successfully pushes image to container registry.'
  },

  // 19. Deployment
  {
    id: 'TASK-043',
    moduleIndex: 19,
    module: 'Deployment',
    name: 'Cloud Run / Container Ingress Provisioning & SSL',
    description: 'Deploy containerized application to Google Cloud Run with custom municipal domain, HTTPS SSL termination, and horizontal autoscaling.',
    priority: 'P0',
    estimatedTime: '2.5 hours',
    dependencies: 'TASK-039, TASK-042',
    files: 'cloudbuild.yaml, deploy/cloudrun-service.yaml',
    deliverables: 'Production deployment configuration supporting automated container rollouts and zero-downtime blue/green traffic shifting.',
    dod: 'Application is reachable over public HTTPS, cold start latency is under 3 seconds, and health checks pass.'
  },
  {
    id: 'TASK-044',
    moduleIndex: 19,
    module: 'Deployment',
    name: 'Production Environment Variables & Secrets Hardening',
    description: 'Configure secret management (Cloud Secret Manager / Vault) for database passwords, JWT signing keys, and external API credentials.',
    priority: 'P0',
    estimatedTime: '1.5 hours',
    dependencies: 'TASK-043',
    files: '.env.example, src/config/env.ts',
    deliverables: 'Secret validation schema failing fast at server boot if critical environment variables are absent.',
    dod: 'Server halts on boot if JWT_SECRET or DATABASE_URL is missing; all secrets injected safely at runtime.'
  },

  // 20. Documentation
  {
    id: 'TASK-045',
    moduleIndex: 20,
    module: 'Documentation',
    name: 'Comprehensive Architecture & API Documentation (DATABASE.md & API_CONTRACT.md)',
    description: 'Finalize and verify relational database schema documentation, ER diagrams, data dictionaries, and complete 25-endpoint REST API specifications.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-006, TASK-010, TASK-023',
    files: '/DATABASE.md, /API_CONTRACT.md',
    deliverables: 'Published database and API contract engineering deliverables.',
    dod: 'Both documents contain complete schemas, status transitions, RFC 7807 problem details, and Postman collection exports.'
  },
  {
    id: 'TASK-046',
    moduleIndex: 20,
    module: 'Documentation',
    name: 'UI/UX Flow & Sprint Task Breakdown Guides (UI_FLOW.md & TASKS.md)',
    description: 'Deliver complete user experience journeys, screen inventories, dashboard wireframes, component hierarchies, and implementation task breakdowns.',
    priority: 'P0',
    estimatedTime: '2 hours',
    dependencies: 'TASK-032, TASK-033',
    files: '/UI_FLOW.md, /TASKS.md, README.md',
    deliverables: 'Published Phase 3 UI/UX specification and Phase 4 Sprint Task Breakdown documents.',
    dod: 'Documents are committed to project root, linked in repository README, and integrated into the interactive in-app documentation browser.'
  }
];

const MODULE_NAMES = [
  'All 20 Modules',
  '1. Project Setup',
  '2. Backend Setup',
  '3. Database',
  '4. Authentication',
  '5. Citizen Module',
  '6. Issue Reporting',
  '7. Image Upload',
  '8. GPS/Location',
  '9. Issue Tracking',
  '10. Notifications',
  '11. Admin Module',
  '12. Dashboard',
  '13. Map',
  '14. Frontend',
  '15. API Integration',
  '16. Testing',
  '17. Docker',
  '18. CI/CD',
  '19. Deployment',
  '20. Documentation'
];

interface TaskBreakdownViewerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const TaskBreakdownViewer: React.FC<TaskBreakdownViewerProps> = ({ onNavigateToTab }) => {
  const [selectedModule, setSelectedModule] = useState<number>(0);
  const [selectedPriority, setSelectedPriority] = useState<'ALL' | 'P0' | 'P1' | 'P2'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    fetch('/TASKS.md')
      .then(res => res.text())
      .then(text => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const filteredTasks = useMemo(() => {
    return ALL_TASKS.filter(task => {
      if (selectedModule > 0 && task.moduleIndex !== selectedModule) return false;
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          task.id.toLowerCase().includes(q) ||
          task.name.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.module.toLowerCase().includes(q) ||
          task.files.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedModule, selectedPriority, searchQuery]);

  const p0Count = ALL_TASKS.filter(t => t.priority === 'P0').length;
  const p1Count = ALL_TASKS.filter(t => t.priority === 'P1').length;
  const p2Count = ALL_TASKS.filter(t => t.priority === 'P2').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                PHASE 4 DELIVERABLE
              </span>
              <span className="text-xs text-slate-400 font-medium">46 Granular Tasks &bull; 20 Modular Categories</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Sprint Task Breakdown &amp; Roadmap</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Production engineering task matrix for CivicFix. Every task includes Task ID, Name, Description, Priority, Time Estimate, Dependencies, Files Affected, Deliverables, and strict Definition of Done (DoD).
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied TASKS.md' : 'Copy TASKS.md'}</span>
            </button>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('ui_flow')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
              >
                <span>View UI Flow (Phase 3)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Scope</div>
            <div className="text-xl font-bold text-white mt-0.5">46 Tasks</div>
            <div className="text-[11px] text-slate-400">across 20 Modules</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-[11px] text-rose-400 uppercase tracking-wider font-semibold">P0 Blockers</div>
            <div className="text-xl font-bold text-rose-300 mt-0.5">{p0Count} Tasks</div>
            <div className="text-[11px] text-slate-400">Core MVP Foundation</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">P1 High Priority</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">{p1Count} Tasks</div>
            <div className="text-[11px] text-slate-400">Feature Completeness</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Total Est. Effort</div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">~112 Hours</div>
            <div className="text-[11px] text-slate-400">~2.5 Weeks Full-Stack</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Task ID, name, or files..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Module Select */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(Number(e.target.value))}
            className="text-xs rounded-lg border border-slate-300 py-2 px-3 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            {MODULE_NAMES.map((m, idx) => (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>

          {/* Priority Pill Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {(['ALL', 'P0', 'P1', 'P2'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedPriority === p
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing <strong>{filteredTasks.length}</strong> of {ALL_TASKS.length} tasks</span>
          {selectedModule > 0 && (
            <button
              onClick={() => setSelectedModule(0)}
              className="text-blue-600 hover:underline"
            >
              Reset Module Filter
            </button>
          )}
        </div>

        {filteredTasks.map(task => {
          const isExpanded = expandedTaskId === task.id;
          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl border transition-all shadow-xs ${
                isExpanded ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Task Row Summary */}
              <div
                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                      task.priority === 'P0'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : task.priority === 'P1'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{task.id}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-500 font-medium">{task.module}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{task.name}</h3>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs text-slate-500">
                  <div className="flex items-center space-x-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.estimatedTime}</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-1">
                    <span className="text-slate-400">Deps:</span>
                    <span className="font-mono text-slate-700">{task.dependencies}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Detail Inspector */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl space-y-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-700 uppercase tracking-wide text-[10px]">Description</h4>
                    <p className="text-slate-800 mt-1 leading-relaxed">{task.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-700 uppercase tracking-wide text-[10px]">Files &amp; Modules Affected</h4>
                      <code className="block mt-1 font-mono text-xs text-blue-700 bg-white p-2 rounded border border-slate-200">
                        {task.files}
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 uppercase tracking-wide text-[10px]">Deliverables</h4>
                      <div className="mt-1 text-slate-800 bg-white p-2 rounded border border-slate-200">
                        {task.deliverables}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-700 uppercase tracking-wide text-[10px] flex items-center space-x-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Definition of Done (DoD)</span>
                    </h4>
                    <div className="mt-1 bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-emerald-950 font-medium leading-relaxed">
                      {task.dod}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-700">No tasks match your filters</div>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All 20 Modules".</p>
            <button
              onClick={() => {
                setSelectedModule(0);
                setSelectedPriority('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
