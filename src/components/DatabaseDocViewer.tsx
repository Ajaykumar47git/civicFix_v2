import React, { useState } from 'react';
import { FileText, Copy, Check, Download, BookOpen, Layers } from 'lucide-react';

interface DatabaseDocViewerProps {
  onSelectTab: (tab: 'schema' | 'comparison' | 'api') => void;
}

export const DatabaseDocViewer: React.FC<DatabaseDocViewerProps> = ({ onSelectTab }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    // In a real environment we can copy the document content
    const el = document.getElementById('database-doc-content');
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">DATABASE.md — Specification Document</h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              Phase 1 Deliverable
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Official engineering document at <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">/DATABASE.md</code>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Full Document!' : 'Copy Document Text'}</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Links */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-2 text-xs">
        <span className="font-semibold text-slate-700 mr-2 py-1">Quick Links:</span>
        <button
          onClick={() => onSelectTab('comparison')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 font-medium text-blue-600"
        >
          1. MySQL vs MongoDB Decision
        </button>
        <button
          onClick={() => onSelectTab('schema')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 font-medium text-blue-600"
        >
          2. ER Diagram (Mermaid)
        </button>
        <button
          onClick={() => onSelectTab('schema')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 font-medium text-blue-600"
        >
          3. Entity Specifications (10 Entities)
        </button>
        <button
          onClick={() => onSelectTab('api')}
          className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 font-medium text-blue-600"
        >
          4. Java Spring Boot JPA & DDL
        </button>
      </div>

      {/* Document Content View */}
      <div id="database-doc-content" className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-none text-slate-800 space-y-6 text-sm leading-relaxed">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">CivicFix — Phase 1: Database Architecture & Design Specification</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Target RDBMS: MySQL 8.0+ (InnoDB) | Spatial: SRID 4326 GIS | Backend: Java 21 Spring Boot 3.x JPA | Frontend: React 19 / Tailwind CSS
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-1">1. Architectural Decision: MySQL vs. MongoDB</h2>
          <p>
            <strong>MySQL 8.0+ (InnoDB)</strong> is decisively selected over MongoDB for CivicFix. Civic issue reporting and municipal dispatch are fundamentally transactional workflows requiring strict multi-table ACID atomicity (e.g. updating issue status, appending immutable audit history, recording resolution proof, and triggering citizen alerts). 
          </p>
          <p>
            Furthermore, engine-level foreign keys prevent orphaned dispatches or invalid category assignments, and MySQL 8.0's native OGC-compliant spatial engine (R-Tree indexes, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">POINT</code> types, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ST_Distance_Sphere</code>) enables microsecond-fast neighborhood radius queries.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-1">2. Core Entities Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">1. users</strong>
              Citizens, field workers, dispatchers, supervisors, and admins with cryptographic password hashes.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">2. issue_categories</strong>
              Taxonomy mapping problem types to municipal departments, default urgency, and SLA resolution hours.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">3. locations</strong>
              Normalized coordinates, native POINT geometries, formatted postal addresses, and council wards.
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <strong className="block text-blue-900">4. issues (Core)</strong>
              Tracking code, status lifecycle, category/location FKs, reporter FK, cached upvotes and comment counts.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">5. issue_photos</strong>
              Visual evidence, display order, file byte sizes, SHA-256 deduplication hashes, and EXIF GPS checks.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">6. issue_status_history</strong>
              Immutable audit trail logging previous/new statuses, user author, rationale, and timestamps.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">7. assignments</strong>
              Field crew work orders, dispatcher directives, completion deadlines, and mobile check-in states.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">8. notifications</strong>
              Multichannel user alerts (In-App, SMS, Email) tracking unread status and delivery timestamps.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <strong className="block text-slate-900">9. comments</strong>
              Citizen discussion threads with boolean flag for private internal staff/dispatch notes.
            </div>
            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <strong className="block text-emerald-900">10. resolution_proof</strong>
              Strict 1:1 post-repair dossier: after photos, labor hours, material costs, and supervisor sign-off.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b pb-1">3. Normalization & Security Considerations</h2>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
            <li><strong>Normalization</strong>: Fully normalized to 3NF and BCNF. Controlled denormalizations (<code className="font-mono bg-slate-100 px-1">upvote_count</code>, <code className="font-mono bg-slate-100 px-1">comment_count</code>) eliminate expensive table aggregation joins on high-throughput list views.</li>
            <li><strong>PII & Passwords</strong>: Argon2id / BCrypt salt and hash; citizen phone and emails masked from public feeds.</li>
            <li><strong>EXIF Sanitization</strong>: Camera EXIF GPS extracted for server validation, then permanently stripped prior to CDN distribution.</li>
            <li><strong>Audit Protection</strong>: Status history table is append-only with database privilege revoking for UPDATE and DELETE.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
