# CivicFix — UI/UX Flow & Design Specification (Phase 3)

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Standard:** WCAG 2.1 AA Compliant &bull; Mobile-First Responsive Grid  
**Target Roles:** Citizen (Resident) &bull; Municipal Authority/Admin (Dispatcher, Supervisor, Field Worker)  
**Primary Deliverable:** Complete UX Architecture, Wireframes, Screen Inventory, User Journeys, and Visual Design Token System.

---

## 1. Executive Summary & Design Principles

CivicFix is a modern, high-trust civic engagement and municipal field dispatch platform. The UI/UX architecture balances two contrasting design imperatives:
1. **For Citizens (Residents):** An effortless, frictionless consumer experience enabling one-handed mobile reporting of public infrastructure defects in under 45 seconds, with real-time transparency and instant public tracking.
2. **For Municipal Authorities (Staff, Dispatchers, Supervisors):** A high-density, low-latency command center prioritizing triage speed, spatial GIS cluster visualization, quick bulk work-order dispatching, and SLA compliance monitoring.

### Core Design Pillars
- **Radical Clarity:** High-contrast, scannable layouts with zero ambiguous iconography.
- **Zero-Friction Reporting:** Camera and GPS geolocation auto-fill 80% of report parameters automatically.
- **Real-Time Assurance:** Definite visual feedback for every state transition (optimistic updates, SLA timers, real-time push banners).
- **Accessible by Default:** Full keyboard navigation, 44px+ touch targets on mobile, screen-reader semantics (ARIA), and strict WCAG AA contrast (≥ 4.5:1 for body text).

---

## 2. Global Navigation Flow & Information Architecture

### 2.1 Role-Based Routing Architecture

```
                    ┌────────────────────────────────────────┐
                    │          Public Entry Point            │
                    │         / (Public Landing Page)        │
                    └───────────────────┬────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌─────────────────────────┐                               ┌─────────────────────────┐
│   Citizen Auth Flow     │                               │    Staff Auth Flow      │
│   /login & /register    │                               │      /admin/login       │
└────────────┬────────────┘                               └────────────┬────────────┘
             ▼                                                         ▼
┌─────────────────────────┐                               ┌─────────────────────────┐
│   Citizen Application   │                               │ Municipal Command Center│
│   (Role: CITIZEN)       │                               │(DISPATCHER, SUPERVISOR) │
├─────────────────────────┤                               ├─────────────────────────┤
│ • /citizen/dashboard    │                               │ • /admin/dashboard      │
│ • /citizen/report       │                               │ • /admin/issues (Grid)  │
│ • /citizen/my-reports   │                               │ • /admin/map (GIS Ops)  │
│ • /citizen/track/:code  │                               │ • /admin/dispatch/:id   │
│ • /citizen/details/:id  │                               │ • /admin/details/:id    │
│ • /citizen/notifications│                               │ • /admin/analytics      │
│ • /citizen/profile      │                               │ • /admin/workers        │
└─────────────────────────┘                               └─────────────────────────┘
```

### 2.2 Navigation Components by Role

#### A. Citizen Interface Navigation
- **Mobile (< 768px):** Fixed Bottom Navigation Bar (5 slots: Home, My Reports, Floating (+) Report CTA in center, Public Map/Track, Notifications with badge counter).
- **Desktop (≥ 768px):** Sticky Top Header with City Crest Logo, Global Search, Track Code Input, Quick Report Button, and User Avatar dropdown.

#### B. Municipal Authority/Admin Navigation
- **Desktop (≥ 1024px):** Fixed Left Dark Sidebar (240px width) with collapsible section trees:
  - *Dispatch & Operations:* Live Queue, Master Grid, Spatial Map.
  - *Management:* Field Teams, Ward Assignments, SLA Overdue Escalations.
  - *Insights:* Analytics, Ward Budgets, Audit Trail.
  - *Bottom:* Quick Status Switcher (Active/On-Duty), Staff Profile & Sign Out.
- **Mobile/Tablet:** Responsive Slide-out Drawer triggered via hamburger menu with emergency banner sticky at top.

---

## 3. Complete Screen Inventory

### 3.1 Citizen Screens (12 Screens)

| # | Screen Name | Route | Core Functional Purpose | Key Actions |
|---|---|---|---|---|
| **C1** | **Landing Page** | `/` | Public civic portal, hero search, live municipal activity ticker, public map preview. | "Report an Issue", "Track Ticket", "View Live Map", "Sign In". |
| **C2** | **Login** | `/login` | Secure resident sign-in via email/password, biometric autofill support. | Submit credentials, "Remember me", "Forgot password", link to Register. |
| **C3** | **Register** | `/register` | New citizen registration with Ward selection and SMS/Email verification. | Enter name, email, phone, ward selection, submit form. |
| **C4** | **Citizen Dashboard** | `/citizen/dashboard` | Home feed: Active ticket status cards, quick report shortcuts, nearby resolved alerts. | One-tap report button, view report progress, read notifications. |
| **C5** | **Report Issue** | `/citizen/report` | 3-step wizard or single-scroll smart report form (Category & Title). | Select category icon, enter title/description, trigger camera/location. |
| **C6** | **Camera / Photo Upload**| `/citizen/report/photo` | Multi-image dropzone & native camera trigger with preview, EXIF GPS extractor. | Take photo, browse gallery, delete thumbnail, view GPS coordinate verification tag. |
| **C7** | **Location Selection** | `/citizen/report/location`| Interactive Leaflet map with draggable crosshair pin & "Use Current GPS" button. | Drag map pin, search street address, confirm municipal boundary polygon. |
| **C8** | **Issue Details (Citizen)**| `/citizen/issues/:id` | Full chronological status timeline, photo before/after slider, upvote & comment. | Add comment, upvote issue, share ticket, view SLA countdown timer. |
| **C9** | **My Reports** | `/citizen/my-reports` | Filterable tabbed list (All, In Progress, Resolved, Drafts) with status badges. | Search personal reports, filter by status/date, click to view details. |
| **C10**| **Issue Tracking (Public)**| `/track/:issueCode` | Instant unauthenticated lookup by tracking code (e.g. `CVX-2026-08142`). | Search tracking code, view municipal status badge, download PDF receipt. |
| **C11**| **Notifications Center** | `/citizen/notifications`| Chronological feed of push & SMS status changes, worker dispatch alerts. | Mark as read, click to navigate to issue, toggle notification preferences. |
| **C12**| **Citizen Profile** | `/citizen/profile` | Resident details, council ward, contact methods, notification toggles, dark mode. | Update phone, change password, switch ward, toggle SMS alerts. |

---

### 3.2 Municipal Authority / Admin Screens (8 Screens)

| # | Screen Name | Route | Core Functional Purpose | Key Actions |
|---|---|---|---|---|
| **A1** | **Admin Login** | `/admin/login` | Hardened municipal staff authentication with badge ID / email and MFA token. | Staff sign-in, MFA verification, department switcher. |
| **A2** | **Admin Dashboard** | `/admin/dashboard` | High-level operations overview: SLA compliance gauges, urgent triage feed, worker count. | View real-time KPIs, click urgent tickets, monitor department throughput. |
| **A3** | **Issue Management (Master Grid)**| `/admin/issues` | High-density data grid with multi-sort, batch bulk-actions, ward & SLA filters. | Multi-select issues, batch assign, export CSV, change priority, inline triage. |
| **A4** | **Issue Details (Staff)** | `/admin/issues/:id` | Relational 360° inspector: citizen report, worker assignment, internal audit log. | Verify grievance, reject ticket, assign crew, post internal notes. |
| **A5** | **Map View (GIS Operations)**| `/admin/map` | Full-screen interactive Leaflet GIS with cluster pins, ward boundaries, heatmap. | Filter by department/status, click pin to open quick dispatch drawer, toggle heat layers. |
| **A6** | **Assignment & Dispatch** | `/admin/issues/:id/assign`| Technician dispatch modal with worker availability, active workload, route ETA. | Select technician from list, set target SLA hours, attach work order instructions. |
| **A7** | **Status & Resolution Proof**| `/admin/issues/:id/status` | Lifecycle transition modal; requires resolution photo & invoice for closure. | Advance status to IN_PROGRESS or RESOLVED, upload proof photo, record repair cost. |
| **A8** | **Analytics & Reports** | `/admin/analytics` | Department performance charts, SLA breach trends, ward budget expenditure reports. | Filter by date range/ward, view charts (Recharts), export municipal executive PDF. |

---

## 4. User Journeys

### 4.1 Citizen User Journey: "Reporting a Dangerous Pothole"

```
[Trigger]
Citizen spots deep pothole on Main St. causing tire blowouts
   │
   ▼
[Step 1: Initiation]
Citizen taps "Report Issue" (Floating CTA on mobile app or web portal)
- Option to sign in or proceed with saved session
   │
   ▼
[Step 2: Photographic Evidence]
Camera opens automatically. Resident snaps photo of pothole.
- System reads EXIF GPS metadata.
- Green badge appears: "Location Auto-Detected from Photo (37.7749° N, 122.4194° W)".
   │
   ▼
[Step 3: Smart Categorization & Location]
- AI auto-selects "Roads & Pavements".
- Address auto-geocoded: "742 Evergreen Terrace, Sector 4".
- Resident adds brief note: "Pavement collapse, exposed rebar".
   │
   ▼
[Step 4: Submission & Receipt]
Resident clicks "Submit Grievance".
- Instant optimistic feedback with confetti micro-interaction.
- Ticket generated: CVX-2026-08142.
- SLA estimated resolution: "Guaranteed triage within 4 hrs &bull; Repair within 48 hrs".
   │
   ▼
[Step 5: Ongoing Tracking & Notifications]
- T+15m: SMS/Push: "Report verified by DPW Dispatcher Marcus".
- T+2h: SMS/Push: "Technician Carlos Mendoza dispatched to site".
- T+24h: SMS/Push: "Repair completed! View Before/After resolution photo".
- Resident rates municipal response: 5 Stars.
```

---

### 4.2 Municipal Authority Journey: "Triage, Dispatch & Closure"

```
[Trigger]
Dispatcher receives high-priority notification: "Water Main Rupture / Ward 4"
   │
   ▼
[Step 1: Triage in Master Grid]
Dispatcher opens Admin Dashboard -> Master Grid (/admin/issues).
- High priority badge flashes red with SLA countdown: "23h 45m remaining".
- Dispatcher clicks ticket CVX-2026-08142 to open 360° inspector drawer.
   │
   ▼
[Step 2: Verification & Jurisdiction Check]
Dispatcher verifies citizen photo and address on GIS map.
- Checks for duplicate reports within 50m radius (None found).
- Clicks "Verify Issue" button -> System transitions status to VERIFIED.
   │
   ▼
[Step 3: Crew Assignment]
Dispatcher clicks "Dispatch Technician".
- Modal shows available DPW plumbers in Ward 4.
- Carlos Mendoza has 1 active job and is 1.2 miles away.
- Dispatcher selects Carlos, inputs work order instructions: "Isolate valve #SV-12".
- Clicks "Issue Work Order" -> Status transitions to ASSIGNED.
   │
   ▼
[Step 4: Field Execution (Mobile Tech View)]
Carlos Mendoza receives push notification on mobile tablet:
- Taps "Accept & En Route" -> Status advances to IN_PROGRESS.
- Carlos arrives, replaces pipe section, cleans asphalt.
   │
   ▼
[Step 5: Resolution Proof & Audit]
Carlos takes after-repair photo, inputs 2.5 labor hours, $180 materials cost.
- Submits resolution proof -> System moves issue to RESOLVED.
- Supervisor audits proof photo, clicks "Approve & Close Ticket".
- Citizen is automatically notified with resolution photos.
```

---

## 5. Dashboard Layouts

### 5.1 Citizen Dashboard Layout (`/citizen/dashboard`)

```
+-------------------------------------------------------------------------+
| [City Crest] CivicFix           [Track # Code]   [🔔 2]   [Maya Lin ▼]  |
+-------------------------------------------------------------------------+
|                                                                         |
|  👋 Welcome back, Maya!                                                 |
|  You have 1 active report in progress. Council Ward: 4 (Central)        |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 🚀 ACTION BANNER                                                  |  |
|  | Spot a civic problem in your neighborhood?                        |  |
|  | [ + Report a New Issue (Camera Ready) ]                           |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  CURRENT ACTIVE GRIEVANCES                      COMMUNITY NEARBY FEED   |
|  +-------------------------------------------+  +--------------------+  |
|  | CVX-2026-08142          [IN PROGRESS]     |  | 📍 150m away       |  |
|  | Water Main Rupture      SLA: 21h left     |  | Pothole on 5th Ave |  |
|  | 742 Evergreen Terrace                     |  | [RESOLVED] Yesterday| |
|  | Assigned: Carlos Mendoza (DPW)            |  +--------------------+  |
|  | [ View Live Timeline & Dispatch Notes ]   |  | 📍 400m away       |  |
|  +-------------------------------------------+  | Broken Streetlight |  |
|                                                 | [ASSIGNED] 2h ago  |  |
|  RECENT RESOLVED TICKETS (Ward 4)               +--------------------+  |
|  [Pothole fixed] [Trash cleared] [Graffiti gone]| [ View Full Map ]  |  |
+-------------------------------------------------------------------------+
| [Mobile Bottom Bar:  (Home)  (My Reports)  (+)  (Map)  (Notifications) ]|
+-------------------------------------------------------------------------+
```

---

### 5.2 Admin Operations Dashboard (`/admin/dashboard`)

```
+----+--------------------------------------------------------------------+
| C  | [Search Ticket / Worker / Ward]          [Active: Ward 4]  [Staff] |
| I  +--------------------------------------------------------------------+
| V  |  OPERATIONAL COMMAND CENTER — REAL-TIME MUNICIPAL DISPATCH         |
| I  |                                                                    |
| C  |  [ Open Reports ]   [ Urgent / High ]   [ SLA Breached ] [ Staff ] |
| F  |        47                 12                   3            18/22  |
| I  |   (+4 today)         (Requires Action)   (Immediate Esc)  (On-Duty)|
| X  +--------------------------------------------------------------------+
|    | LIVE TRIAGE QUEUE (Unassigned)           MAP TELEMETRY (Ward 4)    |
| ■  | +-------------------------------------+  +-----------------------+ |
| D  | | CVX-8142 | Water Rupture | 🚨 HIGH  |  | [ Leaflet GIS Canvas] | |
| a  | | Ward 4 | Rep: 12m ago | [Dispatch]  |  |  🔴 3 High Priority  | |
| s  | +-------------------------------------+  |  🟡 8 In Progress     | |
| h  | | CVX-8140 | Pothole Crater| ⚠️ MED   |  |  🟢 14 Resolved Today | |
|    | | Ward 2 | Rep: 34m ago | [Dispatch]  |  |                       | |
| ■  | +-------------------------------------+  | [Expand Full GIS Map] | |
| I  |                                          +-----------------------+ |
| s  | DEPARTMENT WORKLOAD DISTRIBUTION         SLA COMPLIANCE (7 DAYS)   |
| s  | • DPW Roads:        ████████░░ 78%       • Water & Sewage: 96.2%   |
| u  | • Water & Sewage:   ██████████ 94% (Full)• Roads & Paving: 91.5%   |
| e  | • Sanitation:       ████░░░░░░ 42%       • Street Lighting:98.0%   |
| s  | • Street Lighting:  ██████░░░░ 58%       • Parks & Trees:  94.1%   |
+----+--------------------------------------------------------------------+
```

---

## 6. Component Hierarchy (Atomic Design System)

```
src/
├── components/
│   ├── atoms/
│   │   ├── Badge.tsx              (Status, Priority, Ward indicators)
│   │   ├── Button.tsx             (Primary, Secondary, Danger, Ghost, IconOnly)
│   │   ├── Input.tsx              (Text, Search, Textarea, Password with eye toggle)
│   │   ├── Select.tsx             (Custom dropdown with accessible ARIA listbox)
│   │   ├── SlaCountdown.tsx       (Color-coded timer: Green > 12h, Amber 4-12h, Red < 4h)
│   │   └── Spinner.tsx            (Lightweight SVG circular loader)
│   │
│   ├── molecules/
│   │   ├── FilterToolbar.tsx      (Multi-select category, ward, status, priority pills)
│   │   ├── IssueCard.tsx          (Card preview for feeds with upvote, tag, SLA countdown)
│   │   ├── PhotoUploader.tsx      (Dropzone, multi-preview, delete, EXIF badge)
│   │   ├── LocationPicker.tsx     (Map crosshair, auto-geolocation trigger, manual search)
│   │   ├── StatusStepper.tsx      (Linear horizontal progress bar: Reported->Resolved)
│   │   └── CommentItem.tsx        (Citizen vs Official badge, timestamp, text)
│   │
│   ├── organisms/
│   │   ├── Header.tsx             (Global brand, navigation tabs, user switcher)
│   │   ├── BottomNav.tsx          (Mobile 5-item touch navigation with floating CTA)
│   │   ├── AdminSidebar.tsx       (Collapsible dark sidebar with active link highlights)
│   │   ├── IssueDetailModal.tsx   (360° inspector drawer for triage & assignment)
│   │   ├── DispatchModal.tsx      (Technician assignment selector with workload stats)
│   │   ├── ResolutionProofModal.tsx(Photo upload, labor hours, material cost entry)
│   │   ├── InteractiveMap.tsx     (Leaflet container with clustered markers & heatmaps)
│   │   └── MasterIssueTable.tsx   (Sortable data grid with row selection & batch actions)
│   │
│   └── templates/
│       ├── CitizenLayout.tsx      (Mobile-optimized single-column with bottom nav)
│       ├── AdminLayout.tsx        (Split sidebar + main scrollable command canvas)
│       └── AuthLayout.tsx         (Centered high-trust card with municipal branding)
```

---

## 7. Mobile-First Responsive Behavior & Breakpoints

| Breakpoint | Target Devices | Layout Adjustments & Navigation Behavior |
|---|---|---|
| **Mobile (`< 640px`)** | iPhone, Android Phones | • Single column stack.<br>• Fixed Bottom Navigation bar with elevated circular (+) CTA.<br>• Modals convert to bottom action sheets with pull indicators.<br>• Minimum touch target: 44px &times; 44px.<br>• Camera and GPS natively prioritized. |
| **Tablet (`640px – 1023px`)** | iPads, Field Tablets | • 2-column grid for issue lists & dashboard.<br>• Admin sidebar collapses to a 64px icon rail.<br>• Interactive map renders side-by-side with issue list (50/50 split). |
| **Desktop (`≥ 1024px`)** | Laptops, Municipal Desks| • Multi-column high-density layout.<br>• Full expanded left sidebar (240px).<br>• Master grid displays 12 data columns with sticky headers.<br>• Map view occupies full height viewport with sliding details drawer. |

---

## 8. UX Edge Cases & States

### 8.1 Loading States
- **Skeleton Shimmers:** Issue cards, master grid rows, and statistics chips display pulsing slate skeletons (`animate-pulse bg-slate-200`) maintaining exact layout dimensions to eliminate Cumulative Layout Shift (CLS = 0).
- **Inline Button Spinners:** On form submit ("Submitting Grievance..."), the button label is replaced with a 14px spinner, keeping the button dimensions fixed and preventing double-clicks.
- **Optimistic UI:** When a citizen upvotes an issue or posts a comment, the UI increments the counter immediately. A background API failure triggers a smooth rollback with an error toast.

### 8.2 Error States
- **RFC 7807 Toast Alerts:** Non-blocking error notifications appear in the bottom-right on desktop (top banner on mobile) with error code, human-readable reason, and a "Retry" button.
- **Form Input Errors:** Invalid fields trigger an immediate red border (`border-rose-500`), an inline warning icon, and descriptive text underneath (e.g., *"Password must include 1 special character"*).
- **Network Offline Banner:** A top sticky warning appears when `navigator.onLine === false`: *"Offline Mode — Reports will queue and auto-sync when connection is restored."*

### 8.3 Empty States
- **My Reports (Zero Reports):** Friendly graphic showing clean streets with copy: *"You haven't reported any civic issues yet. Spot a pothole, broken streetlight, or leak? Your voice helps our city thrive."* + Primary CTA button: *"Report Your First Issue"*.
- **Notifications (All Read):** Checkmark illustration with text: *"You're all caught up! No unread municipal alerts."*
- **Search (No Results):** Magnifying glass icon with copy: *"No tickets found matching 'xyz'. Check your spelling or search by Ward number."* + Button: *"Clear Filters"*.

### 8.4 Form Validation Matrix

| Field | Validation Trigger | Validation Rules | Error Message |
|---|---|---|---|
| **Full Name** | On Blur & Submit | Required, 2–100 chars, alphabetic + spaces only. | "Please enter your full legal name." |
| **Email** | On Blur & Submit | RFC 5322 regex match. | "Please enter a valid email address." |
| **Password** | Real-time typing | Min 8 chars, 1 uppercase, 1 digit, 1 special symbol. | Interactive 4-step checklist updates as user types. |
| **Issue Category**| On Submit | Must select valid category ID > 0. | "Please select the infrastructure category." |
| **Issue Title** | On Blur & Submit | 10–150 characters. | "Title must be between 10 and 150 characters." |
| **Description** | On Blur & Submit | 20–2000 characters. | "Please provide at least 20 characters of detail." |
| **Coordinates** | Automated | Within municipal boundary polygon boundaries. | "Location selected is outside city jurisdiction." |
| **Evidence Photo**| On File Select | Image JPEG/PNG/WebP, max 10MB, max 5 images. | "File too large (Max 10MB) or unsupported format." |

---

## 9. Visual Design System Specification

### 9.1 Color Direction
The palette conveys civic reliability, municipal authority, and clean accessibility:

| Role | Token Name | Hex Value | Semantic Usage |
|---|---|---|---|
| **Primary Brand** | `blue-600` | `#2563EB` | Primary buttons, active tabs, main municipal branding. |
| **Primary Hover** | `blue-700` | `#1D4ED8` | Button hover and pressed states. |
| **Dark Canvas** | `slate-900` | `#0F172A` | Admin header, sidebar background, terminal code displays. |
| **Light Canvas** | `slate-50` | `#F8FAFC` | Main application background, card fill contrast. |
| **Neutral Border**| `slate-200` | `#E2E8F0` | Structural card borders, dividers, subtle separators. |
| **Success / Resolved**| `emerald-600`| `#059669` | Resolved status badges, positive SLA, verified tags. |
| **Warning / In Progress**| `amber-500`| `#D97706` | In progress, medium priority, expiring SLA warnings. |
| **Critical / Breach** | `rose-600` | `#E11D48` | Overdue SLAs, emergency priorities, rejection badges. |
| **Information / Assigned**| `indigo-600`| `#4F46E5` | Dispatched technicians, assigned tickets, ward markers. |

### 9.2 Typography
- **Primary Body Font:** Plus Jakarta Sans / Inter (`system-ui, -apple-system, sans-serif`).
- **Monospace Code / Data Font:** JetBrains Mono / SF Mono (for Ticket IDs `CVX-2026-08142`, GPS coordinates, timestamps).
- **Scale:**
  - `H1` (Page Headers): `24px` (Mobile) / `30px` (Desktop), Bold, line-height 1.25.
  - `H2` (Section Titles): `18px` (Mobile) / `20px` (Desktop), Semibold, line-height 1.3.
  - `H3` (Card Titles): `15px` / `16px`, Semibold.
  - `Body`: `14px`, Regular, line-height 1.55.
  - `Caption / Meta`: `12px`, Medium, line-height 1.4.
  - `Badges / Chips`: `11px`, Bold, uppercase tracking 0.05em.

### 9.3 UI Component Styling Tokens
- **Cards:** White background (`#FFFFFF`), 1px solid `slate-200` border, `rounded-xl` (12px radius), subtle shadow `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`).
- **Buttons:**
  - *Primary:* `bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2.5 shadow-xs transition-colors`.
  - *Secondary:* `bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-lg px-4 py-2.5`.
  - *Danger:* `bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg px-4 py-2.5`.
- **Status Badges:**
  - `REPORTED`: `bg-slate-100 text-slate-700 border border-slate-200`
  - `VERIFIED`: `bg-blue-50 text-blue-700 border border-blue-200`
  - `ASSIGNED`: `bg-indigo-50 text-indigo-700 border border-indigo-200`
  - `IN_PROGRESS`: `bg-amber-50 text-amber-700 border border-amber-200`
  - `RESOLVED`: `bg-emerald-50 text-emerald-700 border border-emerald-200`
  - `REJECTED`: `bg-rose-50 text-rose-700 border border-rose-200`
- **Map UI:** Full-bleed container, custom SVG map pins color-coded by priority, circular marker clusters with numeric count badges, floating layer toggle in top-right, and persistent bottom drawer on pin selection.
