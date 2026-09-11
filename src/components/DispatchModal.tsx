import React, { useState } from 'react';
import { X, Send, UserCheck, Clock, AlertTriangle } from 'lucide-react';
import { Issue, User } from '../types/database';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  workers: User[];
  currentDispatcher: User;
  onDispatch: (data: {
    issueId: number;
    workerId: number;
    departmentName: string;
    instructions: string;
    deadlineHours: number;
  }) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  issue,
  workers,
  currentDispatcher,
  onDispatch
}) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<number>(workers[0]?.id || 2);
  const [instructions, setInstructions] = useState('Inspect site immediately. Secure area with safety barricades and deploy repair crew.');
  const [deadlineHours, setDeadlineHours] = useState<number>(issue?.category.defaultSlaHours || 48);

  if (!isOpen || !issue) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatch({
      issueId: issue.id,
      workerId: Number(selectedWorkerId),
      departmentName: issue.category.targetDepartment,
      instructions,
      deadlineHours: Number(deadlineHours)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm">Dispatch Municipal Work Order</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Insert into <code className="text-blue-300">assignments</code> & update <code className="text-blue-300">issues.status -&gt; ASSIGNED</code>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
            <div className="font-semibold text-xs">{issue.issueCode}: {issue.title}</div>
            <div className="text-[11px] text-blue-700 mt-0.5">
              Category: {issue.category.name} | Target Dept: {issue.category.targetDepartment}
            </div>
          </div>

          {/* Assigned Worker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Field Worker / Crew Lead (assigned_to_user_id FK) *
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.fullName} — {w.employeeBadgeNo || 'Staff'} ({w.department || 'Field Ops'})
                </option>
              ))}
            </select>
          </div>

          {/* SLA Deadline */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resolution SLA Turnaround Window (Hours) *
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Default for category <code className="font-mono">{issue.category.code}</code> is {issue.category.defaultSlaHours} hours.
            </p>
          </div>

          {/* Dispatcher Instructions */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Technical Directives & Equipment Instructions (TEXT) *
            </label>
            <textarea
              rows={3}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Specify required tools, safety measures, traffic control permits..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Issue Work Order & Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
