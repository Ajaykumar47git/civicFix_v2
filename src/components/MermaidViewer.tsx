import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  Layers, 
  Database, 
  ShieldCheck, 
  CheckCircle2,
  Maximize2,
  Key,
  Link2
} from 'lucide-react';
import { CIVICFIX_SCHEMAS } from '../data/schemaDefinitions';

interface MermaidViewerProps {
  onSelectTable: (tableName: string) => void;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ onSelectTable }) => {
  const [highlightedEntity, setHighlightedEntity] = useState<string | null>(null);

  const relationships = [
    { from: 'users', to: 'issues', label: '1 : N (reports)', desc: 'Citizen creates multiple grievance reports' },
    { from: 'issue_categories', to: 'issues', label: '1 : N (classifies)', desc: 'Category defines SLA & routing department' },
    { from: 'locations', to: 'issues', label: '1 : N (pinpoints)', desc: 'Geospatial coordinates & ward mapping' },
    { from: 'issues', to: 'issue_photos', label: '1 : N (contains)', desc: 'Before-repair visual evidence & EXIF data' },
    { from: 'issues', to: 'issue_status_history', label: '1 : N (tracks)', desc: 'Immutable audit log of all transitions' },
    { from: 'users', to: 'issue_status_history', label: '1 : N (changed_by)', desc: 'Identity of staff or citizen changing status' },
    { from: 'issues', to: 'assignments', label: '1 : N (dispatches)', desc: 'Work orders sent to field maintenance crews' },
    { from: 'users', to: 'assignments', label: '1 : N (assigned_to)', desc: 'Target field worker or crew lead' },
    { from: 'issues', to: 'comments', label: '1 : N (discusses)', desc: 'Citizen dialogue and internal staff notes' },
    { from: 'users', to: 'notifications', label: '1 : N (receives)', desc: 'Multichannel alerts (In-App, SMS, Email)' },
    { from: 'issues', to: 'resolution_proof', label: '1 : 1 (proves)', desc: 'Strict 1-to-1 evidentiary verification dossier' },
    { from: 'users', to: 'resolution_proof', label: '1 : N (verified_by)', desc: 'Supervisor sign-off on completed work' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">CivicFix Entity-Relationship Architecture</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
              InnoDB Relational Graph
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual topology of all 10 entities, relational cardinalities, clustered primary keys, and cascading foreign key paths.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            10 Entities
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            12 Foreign Keys
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            Zero Cyclic Deadlocks
          </span>
        </div>
      </div>

      {/* Visual Interactive ER Diagram Grid */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Relational Entity Schema Nodes (Click any entity to inspect columns & DDL)
          </span>
          <span className="text-xs text-slate-500">
            Hover to trace relationships
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CIVICFIX_SCHEMAS.map((schema) => {
            const isCore = schema.tableName === 'issues';
            const isHovered = highlightedEntity === schema.tableName;

            return (
              <div
                key={schema.tableName}
                onMouseEnter={() => setHighlightedEntity(schema.tableName)}
                onMouseLeave={() => setHighlightedEntity(null)}
                onClick={() => onSelectTable(schema.tableName)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCore
                    ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50'
                    : isHovered
                    ? 'bg-slate-800/90 border-slate-600 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Database className={`w-4 h-4 ${isCore ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="font-mono font-bold text-sm text-white">{schema.tableName}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    isCore ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isCore ? 'CORE ENTITY' : `${schema.columns.length} cols`}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {schema.description}
                </p>

                {/* Primary & Foreign Keys Summary */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                  <div className="flex items-center text-amber-400">
                    <Key className="w-3 h-3 mr-1.5 shrink-0" />
                    <span>PK: {schema.primaryKey}</span>
                  </div>

                  {schema.foreignKeys.length > 0 && (
                    <div className="flex items-start text-blue-300">
                      <Link2 className="w-3 h-3 mr-1.5 mt-0.5 shrink-0" />
                      <div className="truncate">
                        FK: {schema.foreignKeys.map(fk => `${fk.column} -> ${fk.targetTable}`).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/50">
                  <span>{schema.indexes.length} Indexes</span>
                  <span className="text-blue-400 hover:underline flex items-center">
                    Inspect schema <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relational Cardinality Summary Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Foreign Key Relationships & Integrity Cardinalities</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">From Table</th>
                <th className="py-2.5 px-3 font-semibold">To Table</th>
                <th className="py-2.5 px-3 font-semibold">Cardinality</th>
                <th className="py-2.5 px-3 font-semibold">Business Rule & Referential Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {relationships.map((rel, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                    {rel.from}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-blue-700">
                    {rel.to}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {rel.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {rel.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
