import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Layers, 
  Database, 
  FileCheck, 
  Compass, 
  Scale, 
  AlertTriangle 
} from 'lucide-react';
import { MYSQL_VS_MONGO_FACTORS } from '../data/schemaDefinitions';

export const DbComparison: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Executive Decision Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-6 border border-blue-800/40 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Architectural Decision: MySQL 8.0+ (InnoDB) Selected</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Relational RDBMS vs. Document Store for CivicFix
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Civic issue management is fundamentally an <strong>accountability, audit, and legal transaction system</strong>. Multi-table state transitions (dispatching crews, recording immutable status histories, updating resolution proofs, and notifying citizens) require native ACID guarantees and strict foreign key constraints that document databases cannot provide at the engine layer.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-center shrink-0 min-w-[200px]">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Recommendation</div>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">MySQL 8.0+</div>
            <div className="text-xs text-emerald-400 font-medium mt-0.5">Score: 9.8 / 10</div>
            <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-700/60 pt-2">
              MongoDB Score: 6.3 / 10
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MYSQL_VS_MONGO_FACTORS.map((factor, index) => (
          <div 
            key={index}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm">{factor.criterion}</h3>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  {factor.winner}
                </span>
              </div>

              {/* Progress Comparison Bars */}
              <div className="space-y-1.5 my-3">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-0.5">
                    <span>MySQL 8.0 (InnoDB)</span>
                    <span className="font-bold text-blue-600">{factor.mysqlScore} / 10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${factor.mysqlScore * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-0.5">
                    <span>MongoDB 7.0</span>
                    <span className="font-bold text-slate-600">{factor.mongoScore} / 10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-slate-400 h-2 rounded-full" 
                      style={{ width: `${factor.mongoScore * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                {factor.explanation}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-800 bg-amber-50/60 p-2 rounded border border-amber-100 font-medium">
              {factor.civicFixImpact}
            </div>
          </div>
        ))}
      </div>

      {/* Polyglot Persistence Discussion */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
          <Scale className="w-4 h-4 text-slate-700" />
          <span>When would MongoDB be used in CivicFix? (Hybrid Architecture)</span>
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          While MySQL 8.0 is strictly required for the core transactional data (users, issues, assignments, status history, resolution proofs), MongoDB or a time-series document store would only be complementary in Phase 2 for:
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-600 list-disc list-inside">
          <li><strong>IoT Smart Sensor Streams</strong>: Unstructured telemetry from municipal stormwater depth sensors or street air quality monitors.</li>
          <li><strong>Application Session Logs & Telemetry</strong>: High-write, low-durability user telemetry and clickstream heatmaps.</li>
          <li><strong>Temporary Geolocation Breadcrumbs</strong>: Tracking field truck GPS breadcrumbs every 3 seconds before aggregating the final travel distance into MySQL.</li>
        </ul>
      </div>
    </div>
  );
};
