import React, { useState } from 'react';
import { 
  Layout, 
  Smartphone, 
  Monitor, 
  Compass, 
  Users, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  Palette, 
  AlertTriangle, 
  FileText,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

interface UiFlowViewerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const UiFlowViewer: React.FC<UiFlowViewerProps> = ({ onNavigateToTab }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'citizen' | 'admin' | 'journeys' | 'components' | 'design'>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    fetch('/UI_FLOW.md')
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

  const citizenScreens = [
    { id: 'C1', name: 'Landing Page', route: '/', purpose: 'Public portal, hero search, live ticker, map preview', actions: 'Report Issue, Track Ticket, View Map, Sign In' },
    { id: 'C2', name: 'Login', route: '/login', purpose: 'Secure resident sign-in via email/password', actions: 'Submit credentials, Remember me, Forgot password' },
    { id: 'C3', name: 'Register', route: '/register', purpose: 'Resident registration with Ward & SMS verification', actions: 'Enter details, select Ward, submit' },
    { id: 'C4', name: 'Citizen Dashboard', route: '/citizen/dashboard', purpose: 'Home feed: active grievances, quick actions, local alerts', actions: 'One-tap report, view progress, read alerts' },
    { id: 'C5', name: 'Report Issue', route: '/citizen/report', purpose: 'Smart report wizard with category & description', actions: 'Pick category, input title/notes, trigger camera' },
    { id: 'C6', name: 'Camera/Photo Upload', route: '/citizen/report/photo', purpose: 'Dropzone & native camera with EXIF GPS extractor', actions: 'Take photo, browse files, inspect GPS tag' },
    { id: 'C7', name: 'Location Selection', route: '/citizen/report/location', purpose: 'Interactive map with draggable pin & GPS auto-locate', actions: 'Drag pin, search address, verify ward polygon' },
    { id: 'C8', name: 'Issue Details (Citizen)', route: '/citizen/issues/:id', purpose: 'Chronological timeline, before/after photos, upvote', actions: 'Add comment, upvote, share, view SLA timer' },
    { id: 'C9', name: 'My Reports', route: '/citizen/my-reports', purpose: 'Tabbed personal history (All, Active, Resolved)', actions: 'Filter status, search personal reports' },
    { id: 'C10', name: 'Issue Tracking', route: '/track/:issueCode', purpose: 'Fast unauthenticated public lookup (CVX-YYYY-XXXXX)', actions: 'Search code, view public milestone status' },
    { id: 'C11', name: 'Notifications', route: '/citizen/notifications', purpose: 'Push & SMS alert log for dispatch/repairs', actions: 'Mark read, click to navigate to issue' },
    { id: 'C12', name: 'Profile', route: '/citizen/profile', purpose: 'Resident details, ward affiliation, notification settings', actions: 'Update phone/ward, toggle SMS alerts' },
  ];

  const adminScreens = [
    { id: 'A1', name: 'Admin Login', route: '/admin/login', purpose: 'Hardened municipal staff sign-in with Badge ID and MFA', actions: 'Staff sign-in, MFA token verification' },
    { id: 'A2', name: 'Admin Dashboard', route: '/admin/dashboard', purpose: 'Operations overview: SLA gauges, urgent triage, worker stats', actions: 'Monitor KPIs, click urgent tickets, view load' },
    { id: 'A3', name: 'Issue Management (Grid)', route: '/admin/issues', purpose: 'High-density data table with multi-sort & bulk actions', actions: 'Multi-select, batch assign, export CSV, inline triage' },
    { id: 'A4', name: 'Issue Details (Staff)', route: '/admin/issues/:id', purpose: '360° inspector: grievance, assigned crew, audit log', actions: 'Verify issue, reject, assign crew, internal notes' },
    { id: 'A5', name: 'Map View (GIS Ops)', route: '/admin/map', purpose: 'Full-screen Leaflet GIS with cluster pins & heatmaps', actions: 'Filter wards, click pin for dispatch drawer' },
    { id: 'A6', name: 'Assignment & Dispatch', route: '/admin/issues/:id/assign', purpose: 'Technician dispatch modal with active crew workloads', actions: 'Select technician, set SLA hours, issue order' },
    { id: 'A7', name: 'Status & Proof', route: '/admin/issues/:id/status', purpose: 'Lifecycle transition; requires repair photo & invoice', actions: 'Advance status, upload after-photo, log cost' },
    { id: 'A8', name: 'Analytics & Reports', route: '/admin/analytics', purpose: 'Department metrics, SLA breach trends, ward budgets', actions: 'Date filters, charts (Recharts), export PDF' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-lg border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                PHASE 3 DELIVERABLE
              </span>
              <span className="text-xs text-indigo-300 font-medium">WCAG 2.1 AA &bull; Mobile-First</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">UI/UX Flow &amp; Design Architecture</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Complete dual-persona interaction design for <strong>Citizen</strong> (one-handed mobile reporting in &lt;45s) and <strong>Municipal Authority</strong> (high-density triage, GIS dispatch, and SLA management).
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied UI_FLOW.md' : 'Copy UI_FLOW.md'}</span>
            </button>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('app')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
              >
                <span>Launch Live App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
          {[
            { id: 'overview', label: 'Navigation & Roles', icon: Compass },
            { id: 'citizen', label: 'Citizen Screens (12)', icon: Smartphone },
            { id: 'admin', label: 'Admin Screens (8)', icon: Monitor },
            { id: 'journeys', label: 'User Journeys & States', icon: Users },
            { id: 'components', label: 'Component Hierarchy', icon: Layers },
            { id: 'design', label: 'Design Tokens & Badges', icon: Palette },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: OVERVIEW & NAVIGATION */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Citizen Persona Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Persona 1: Citizen (Resident)</h2>
                  <p className="text-xs text-slate-500">Mobile-first, consumer simplicity, zero-friction reporting</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>One-handed mobile reporting:</strong> Under 45 seconds with camera &amp; EXIF GPS autofill.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Fixed bottom navigation:</strong> 5 touch targets (Home, My Reports, Floating (+) Report, Map, Alerts).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Radical transparency:</strong> Live SLA countdown timer and certified before/after resolution photos.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Public tracking code:</strong> Instant unauthenticated lookups (<code>CVX-2026-08142</code>).</span>
                </li>
              </ul>
            </div>

            {/* Admin Persona Card */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Persona 2: Municipal Authority</h2>
                  <p className="text-xs text-slate-500">Dispatcher, Supervisor, and Field Work Crew</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>High-density triage command:</strong> Sortable master grid with multi-ward filters and SLA timers.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Spatial GIS clustering:</strong> Leaflet canvas with cluster pins, ward polygon overlays, and heatmaps.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Fast dispatch modal:</strong> Assign field technicians based on real-time availability and active workload.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Immutable audit trails:</strong> State transitions logged with user ID, timestamp, and resolution proof.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Flow Diagram */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Full Navigation Architecture &amp; Role Boundary</span>
            </h3>
            <pre className="font-mono text-xs text-blue-300 leading-relaxed overflow-x-auto p-4 bg-slate-950 rounded-lg border border-slate-800">
{`                    ┌────────────────────────────────────────┐
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
└─────────────────────────┘                               └─────────────────────────┘`}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 2: CITIZEN SCREENS */}
      {activeSection === 'citizen' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Citizen Screen Inventory (12 Screens)</h2>
            <span className="text-xs text-slate-500 font-mono">Role Guard: CITIZEN / Public</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {citizenScreens.map(s => (
              <div key={s.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 font-mono font-bold text-xs flex items-center justify-center border border-blue-200">
                    {s.id}
                  </span>
                  <code className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {s.route}
                  </code>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{s.purpose}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Actions:</span> {s.actions}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: ADMIN SCREENS */}
      {activeSection === 'admin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Municipal Authority Screens (8 Screens)</h2>
            <span className="text-xs text-slate-500 font-mono">Role Guard: DISPATCHER / SUPERVISOR / ADMIN</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminScreens.map(s => (
              <div key={s.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center border border-indigo-200">
                    {s.id}
                  </span>
                  <code className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {s.route}
                  </code>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{s.purpose}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Actions:</span> {s.actions}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: USER JOURNEYS & STATES */}
      {activeSection === 'journeys' && (
        <div className="space-y-6">
          {/* Citizen Journey */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <span>Citizen Journey: "Reporting a Pothole on Main St."</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">Step-by-step resident flow from defect discovery to resolution verification rating.</p>

            <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6">
              {[
                { step: '1. Initiation', title: 'Resident Taps Report Issue', desc: 'Clicks floating action button (+) on mobile or web header. Auth token checked.' },
                { step: '2. Photo Capture', title: 'Camera Opens & Extracts GPS', desc: 'Camera snaps photo. Client extracts EXIF metadata, auto-tagging coordinates (37.7749° N, 122.4194° W).' },
                { step: '3. Auto-Categorize', title: 'AI Category & Geocoded Address', desc: 'Category defaults to "Roads & Pavements". Address auto-fills "742 Evergreen Terrace". Resident inputs note.' },
                { step: '4. Ticket Created', title: 'Optimistic Receipt CVX-2026-08142', desc: 'Instant submission receipt with SLA countdown (triage: 4h, repair: 48h).' },
                { step: '5. Dispatch Alerts', title: 'Real-time SMS & In-app Updates', desc: 'Notified when Dispatcher verifies issue, Carlos Mendoza is en route, and repair is certified with proof.' },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                  <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wide">{item.step}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Journey */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-indigo-600" />
              <span>Municipal Journey: "Triage, Work Order & Closure"</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">Staff operational flow from urgent alert to field verification and audit archiving.</p>

            <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-6">
              {[
                { step: '1. High-Priority Alert', title: 'Dispatcher Monitors Triage Queue', desc: 'New grievance flashes in triage queue with SLA timer: "23h 45m remaining".' },
                { step: '2. Verification Check', title: 'Jurisdiction & Duplicate Check', desc: 'Dispatcher verifies location on GIS map, checks 50m radius for duplicates, clicks "Verify".' },
                { step: '3. Crew Dispatch', title: 'Issue Work Order to Technician', desc: 'Dispatcher opens Dispatch Modal. Selects Carlos Mendoza (1 active job, 1.2 mi away), sets target SLA.' },
                { step: '4. Field Repair', title: 'Technician Executes & Takes Proof', desc: 'Carlos marks status IN_PROGRESS, repairs defect, and uploads resolution photo + invoice cost.' },
                { step: '5. Closure Audit', title: 'Supervisor Final Sign-off', desc: 'Supervisor reviews proof photo, marks ticket RESOLVED, archiving immutable record.' },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                  <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wide">{item.step}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: COMPONENT HIERARCHY */}
      {activeSection === 'components' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Atomic Component Hierarchy</h2>
            <p className="text-xs text-slate-500">Modular design system separating Atoms, Molecules, Organisms, and Page Templates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-wide">1. Atoms</div>
              <ul className="space-y-1.5 text-xs text-slate-600 font-mono">
                <li>• Badge.tsx</li>
                <li>• Button.tsx</li>
                <li>• Input.tsx</li>
                <li>• Select.tsx</li>
                <li>• SlaCountdown.tsx</li>
                <li>• Spinner.tsx</li>
                <li>• StatusDot.tsx</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-wide">2. Molecules</div>
              <ul className="space-y-1.5 text-xs text-slate-600 font-mono">
                <li>• FilterToolbar.tsx</li>
                <li>• IssueCard.tsx</li>
                <li>• PhotoUploader.tsx</li>
                <li>• LocationPicker.tsx</li>
                <li>• StatusStepper.tsx</li>
                <li>• CommentItem.tsx</li>
                <li>• UserChip.tsx</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-wide">3. Organisms</div>
              <ul className="space-y-1.5 text-xs text-slate-600 font-mono">
                <li>• Header.tsx</li>
                <li>• BottomNav.tsx</li>
                <li>• AdminSidebar.tsx</li>
                <li>• MasterIssueTable.tsx</li>
                <li>• InteractiveMap.tsx</li>
                <li>• DispatchModal.tsx</li>
                <li>• ProofModal.tsx</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="font-bold text-xs text-slate-900 mb-2 uppercase tracking-wide">4. Templates</div>
              <ul className="space-y-1.5 text-xs text-slate-600 font-mono">
                <li>• CitizenLayout.tsx</li>
                <li>• AdminLayout.tsx</li>
                <li>• AuthLayout.tsx</li>
                <li>• DetailDrawer.tsx</li>
                <li>• MobileSheet.tsx</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: DESIGN TOKENS & BADGES */}
      {activeSection === 'design' && (
        <div className="space-y-6">
          {/* Status Badges Matrix */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Official Status Badges &amp; Semantics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { status: 'REPORTED', bg: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Newly logged by citizen' },
                { status: 'VERIFIED', bg: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Approved by Dispatcher' },
                { status: 'ASSIGNED', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', desc: 'Work order issued to crew' },
                { status: 'IN_PROGRESS', bg: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Field technician on site' },
                { status: 'RESOLVED', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Certified with proof photo' },
                { status: 'REJECTED', bg: 'bg-rose-50 text-rose-700 border-rose-200', desc: 'Out of municipal scope' },
              ].map(b => (
                <div key={b.status} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold border ${b.bg} text-center`}>
                    {b.status}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-2">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Color Tokens */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Visual Design Tokens</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <div className="h-12 rounded-lg bg-blue-600 shadow-xs" />
                <div className="text-xs font-bold text-slate-900">Primary Brand</div>
                <div className="text-[11px] font-mono text-slate-500">#2563EB &bull; blue-600</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-12 rounded-lg bg-slate-900 shadow-xs" />
                <div className="text-xs font-bold text-slate-900">Dark Canvas</div>
                <div className="text-[11px] font-mono text-slate-500">#0F172A &bull; slate-900</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-12 rounded-lg bg-emerald-600 shadow-xs" />
                <div className="text-xs font-bold text-slate-900">Success / Resolved</div>
                <div className="text-[11px] font-mono text-slate-500">#059669 &bull; emerald-600</div>
              </div>
              <div className="space-y-1.5">
                <div className="h-12 rounded-lg bg-rose-600 shadow-xs" />
                <div className="text-xs font-bold text-slate-900">Critical / Breach</div>
                <div className="text-[11px] font-mono text-slate-500">#E11D48 &bull; rose-600</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
