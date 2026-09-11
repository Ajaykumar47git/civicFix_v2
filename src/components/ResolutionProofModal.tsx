import React, { useState } from 'react';
import { X, CheckCircle, Camera, DollarSign, Clock } from 'lucide-react';
import { Issue, User } from '../types/database';

interface ResolutionProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  worker: User;
  onSubmitProof: (data: {
    issueId: number;
    workerId: number;
    workDescription: string;
    afterPhotoUrl: string;
    laborHours: number;
    materialsCost: number;
  }) => void;
}

export const ResolutionProofModal: React.FC<ResolutionProofModalProps> = ({
  isOpen,
  onClose,
  issue,
  worker,
  onSubmitProof
}) => {
  const [workDescription, setWorkDescription] = useState('Pavement repair successfully concluded. Excavated deteriorated substrate, laid down high-tensile binder course, applied hot mastic asphalt, and compacted to road grade with vibratory roller.');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80');
  const [laborHours, setLaborHours] = useState<number>(3.5);
  const [materialsCost, setMaterialsCost] = useState<number>(420.00);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !issue) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workDescription.trim().length < 20) {
      setError('Work description must be at least 20 characters (DB Constraint check).');
      return;
    }
    if (!afterPhotoUrl.trim()) {
      setError('After-repair photo evidence URL is required.');
      return;
    }

    setError(null);
    onSubmitProof({
      issueId: issue.id,
      workerId: worker.id,
      workDescription: workDescription.trim(),
      afterPhotoUrl: afterPhotoUrl.trim(),
      laborHours: Number(laborHours),
      materialsCost: Number(materialsCost)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm">Submit Work Completion & Resolution Proof</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Creates 1:1 record in <code className="text-emerald-300">resolution_proof</code> & sets status to <code className="text-emerald-300">RESOLVED</code>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="font-semibold text-slate-900">{issue.issueCode}: {issue.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Location: {issue.location.formattedAddress} ({issue.location.ward})
            </div>
          </div>

          {/* Work Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Technical Description of Completed Repair (TEXT, Min 20 chars) *
            </label>
            <textarea
              rows={3}
              required
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* After Photo Evidence */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              After-Repair Photographic Proof URL *
            </label>
            <div className="flex items-center space-x-3">
              <img
                src={afterPhotoUrl}
                alt="After Repair"
                className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
              />
              <input
                type="url"
                required
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Labor Hours & Materials Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Labor Hours Expended (DECIMAL 5,2)
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Materials Cost ($ USD, DECIMAL 10,2)
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={materialsCost}
                  onChange={(e) => setMaterialsCost(parseFloat(e.target.value))}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit Proof & Mark Resolved</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
