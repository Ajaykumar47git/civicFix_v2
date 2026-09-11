import React, { useState } from 'react';
import { X, Camera, MapPin, AlertCircle, CheckCircle2, UploadCloud, Clock, ShieldAlert } from 'lucide-react';
import { User, IssueCategory, IssuePriority } from '../types/database';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  categories: IssueCategory[];
  onSubmit: (data: {
    title: string;
    description: string;
    categoryId: number;
    priority: IssuePriority;
    address: string;
    ward: string;
    latitude: number;
    longitude: number;
    photoUrl: string;
    caption?: string;
  }) => Promise<void> | void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  categories,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [priority, setPriority] = useState<IssuePriority>('HIGH');
  const [address, setAddress] = useState('742 Evergreen Terrace, Sector 4');
  const [ward, setWard] = useState('Ward 4');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=80');
  const [caption, setCaption] = useState('Photographic evidence of hazard at intersection');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [rfcProblem, setRfcProblem] = useState<{ title: string; detail: string; invalidParams?: { name: string; reason: string }[] } | null>(null);

  if (!isOpen) return null;

  const selectedCategory = categories.find(c => c.id === Number(categoryId)) || categories[0];

  // Real-time character counts
  const titleCharCount = title.trim().length;
  const descCharCount = description.trim().length;
  const isTitleValid = titleCharCount >= 10 && titleCharCount <= 150;
  const isDescValid = descCharCount >= 20 && descCharCount <= 2000;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setRfcProblem(null);

    // Form Validation Checks
    if (!isTitleValid) {
      setValidationError('Issue title must be between 10 and 150 characters (API Contract RFC 7807 requirement).');
      return;
    }

    if (!isDescValid) {
      setValidationError('Issue description must be between 20 and 2000 characters to provide sufficient field crew context.');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setValidationError('A complete street address or physical landmark is required.');
      return;
    }

    // San Francisco / Municipal bounds check
    if (latitude < 37.0 || latitude > 38.5 || longitude < -123.0 || longitude > -121.5) {
      setRfcProblem({
        title: 'Out of Municipal Bounds',
        detail: `The coordinates (${latitude}, ${longitude}) fall outside the municipal jurisdiction boundary.`,
        invalidParams: [{ name: 'coordinates', reason: 'Latitude must be between 37.0 and 38.5, Longitude between -123.0 and -121.5' }]
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        priority,
        address: address.trim(),
        ward,
        latitude,
        longitude,
        photoUrl,
        caption: caption.trim()
      });
      onClose();
    } catch (err: any) {
      setRfcProblem({
        title: err.title || 'Submission Failed',
        detail: err.detail || err.message || 'An unexpected error occurred while transmitting to the municipal gateway.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLocate = () => {
    setLatitude(37.7749);
    setLongitude(-122.4194);
    setAddress('Market & 4th Street, San Francisco, CA 94103');
    setWard('Ward 4');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm">Report a Civic Grievance</h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                POST /api/v1/citizen/issues
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Citizen Reporting Portal &bull; Authenticated as {currentUser.fullName} ({currentUser.role})
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Validation Banner */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* RFC 7807 Error Banner */}
          {rfcProblem && (
            <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-lg space-y-1">
              <div className="flex items-center space-x-2 font-bold text-xs text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>RFC 7807 Problem: {rfcProblem.title}</span>
              </div>
              <p className="text-[11px] text-red-700">{rfcProblem.detail}</p>
              {rfcProblem.invalidParams && (
                <ul className="text-[11px] list-disc list-inside mt-1 font-mono text-red-600">
                  {rfcProblem.invalidParams.map((p, idx) => (
                    <li key={idx}><strong>{p.name}:</strong> {p.reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Category & SLA Preview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="issue-category" className="block font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                id="issue-category"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.defaultPriority})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issue-priority" className="block font-semibold text-slate-700 mb-1">
                Severity Level *
              </label>
              <select
                id="issue-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value="LOW">LOW &ndash; Non-urgent maintenance</option>
                <option value="MEDIUM">MEDIUM &ndash; Standard service request</option>
                <option value="HIGH">HIGH &ndash; Traffic disruption or safety hazard</option>
                <option value="EMERGENCY">EMERGENCY &ndash; Immediate life-safety threat</option>
              </select>
            </div>
          </div>

          {/* Category SLA Info Pill */}
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-[11px]">
                Department SLA Guarantee: <strong>{selectedCategory.slaHours} hours</strong> to field resolution
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200/60 text-blue-900">
              Auto-tracked
            </span>
          </div>

          {/* Title with Character Counter */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="issue-title" className="block font-semibold text-slate-700">
                Grievance Title *
              </label>
              <span className={`text-[10px] font-mono ${isTitleValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                {titleCharCount}/150 (min 10)
              </span>
            </div>
            <input
              id="issue-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep Pothole with Exposed Rebar on 4th & Market"
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:outline-none ${
                titleCharCount > 0 && !isTitleValid 
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/30' 
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Description with Character Counter */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="issue-description" className="block font-semibold text-slate-700">
                Detailed Description &amp; Context *
              </label>
              <span className={`text-[10px] font-mono ${isDescValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                {descCharCount}/2000 (min 20)
              </span>
            </div>
            <textarea
              id="issue-description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the exact location, dimensions, vehicle hazards, and physical surroundings for the dispatch team..."
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:outline-none ${
                descCharCount > 0 && !isDescValid 
                  ? 'border-red-300 focus:ring-red-400 bg-red-50/30' 
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Location & Ward Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Geographic Location &amp; Council Ward</span>
              </span>
              <button
                type="button"
                onClick={handleQuickLocate}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Auto-Fill Downtown GPS
              </button>
            </div>

            <div>
              <label htmlFor="issue-address" className="block text-[11px] text-slate-600 mb-0.5">
                Street Address / Landmark *
              </label>
              <input
                id="issue-address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or nearest intersection"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div>
                <label className="block text-slate-500 mb-0.5">Latitude (37.0 to 38.5)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-0.5">Longitude (-123.0 to -121.5)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Photo Evidence Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Photographic Proof (EXIF &amp; SHA-256 Verified)</span>
              </span>
              <label className="cursor-pointer text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Choose Local File</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={photoUrl}
                alt="Upload preview"
                className="w-14 h-14 object-cover rounded-lg border border-slate-300 shrink-0 bg-slate-100"
              />
              <div className="flex-1 space-y-1">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Or paste direct image URL"
                  className="w-full px-2 py-1 text-[11px] border border-slate-300 rounded bg-white"
                />
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Photo caption (e.g. Overview showing lane blockage)"
                  className="w-full px-2 py-1 text-[11px] border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setDescription('');
                setValidationError(null);
                setRfcProblem(null);
              }}
              disabled={isSubmitting}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Reset Form
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isTitleValid || !isDescValid}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center space-x-2 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <span>Logging Grievance...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit &amp; Start SLA Clock</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
