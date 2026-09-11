import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Search, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  Calendar, 
  Send, 
  Lock, 
  Eye, 
  Plus, 
  Layers, 
  FileCheck,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  HardHat,
  Droplets,
  Lightbulb,
  Trash2,
  Trees
} from 'lucide-react';
import { 
  Issue, 
  User as UserType, 
  IssueCategory, 
  IssueStatus, 
  IssuePriority 
} from '../types/database';

interface CivicAppProps {
  issues: Issue[];
  currentUser: UserType;
  categories: IssueCategory[];
  onUpvote: (issueId: number) => void;
  onAddComment: (issueId: number, content: string, isInternal: boolean) => void;
  onOpenReportModal: () => void;
  onOpenDispatchModal: (issue: Issue) => void;
  onOpenResolutionModal: (issue: Issue) => void;
  onVerifyIssue: (issueId: number) => void;
  onViewSchemaEntity: (tableName: string) => void;
}

export const CivicApp: React.FC<CivicAppProps> = ({
  issues,
  currentUser,
  categories,
  onUpvote,
  onAddComment,
  onOpenReportModal,
  onOpenDispatchModal,
  onOpenResolutionModal,
  onVerifyIssue,
  onViewSchemaEntity
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(issues[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  const selectedIssue = issues.find(i => i.id === selectedIssueId) || null;

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issueCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.formattedAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || issue.category.code === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || issue.status === selectedStatus;
    const matchesWard = selectedWard === 'ALL' || issue.location.ward === selectedWard;

    return matchesSearch && matchesCategory && matchesStatus && matchesWard;
  });

  // Calculate high-level stats
  const totalIssues = issues.length;
  const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED' || i.status === 'VERIFIED').length;
  const criticalCount = issues.filter(i => i.priority === 'CRITICAL').length;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !newCommentText.trim()) return;
    onAddComment(selectedIssue.id, newCommentText.trim(), isInternalComment);
    setNewCommentText('');
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
      case 'Road':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4" />;
      case 'Lightbulb':
        return <Lightbulb className="w-4 h-4" />;
      case 'Trash2':
        return <Trash2 className="w-4 h-4" />;
      case 'Trees':
        return <Trees className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getStatusBadgeClass = (status: IssueStatus) => {
    switch (status) {
      case 'REPORTED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'UNDER_REVIEW':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_PROGRESS':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'VERIFIED':
        return 'bg-green-100 text-green-900 border-green-400 font-bold';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'REOPENED':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityBadgeClass = (priority: IssuePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500 text-white font-bold';
      case 'HIGH':
        return 'bg-orange-500 text-white font-semibold';
      case 'MEDIUM':
        return 'bg-amber-500 text-white';
      case 'LOW':
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalIssues}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 4 Municipal Wards</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Active Field Crews</div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned or In Progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved &amp; Verified</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">With Photo &amp; Sign-off</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical Emergencies</div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">&lt; 24h SLA Requirement</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Full-Text Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code (CVX-...), title, description, or street address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="VERIFIED">Verified</option>
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Council Wards</option>
            <option value="Ward 1">Ward 1 (Civic Center)</option>
            <option value="Ward 2">Ward 2 (Greenwich Village)</option>
            <option value="Ward 5">Ward 5 (Midtown)</option>
            <option value="Ward 7">Ward 7 (Upper West)</option>
          </select>
        </div>
      </div>

      {/* Main Operational Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Issue Feed Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredIssues.length} Civic Grievance Reports</span>
            <span>Sorted by Recent Activity</span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssue?.id === issue.id;
              const photo = issue.photos[0];

              return (
                <div
                  key={issue.id}
                  id={`issue-card-${issue.id}`}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md ring-1 ring-blue-400/40'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{issue.issueCode}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${getPriorityBadgeClass(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${getStatusBadgeClass(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    {issue.title}
                  </h3>

                  <p className="text-slate-600 line-clamp-2 mb-3">
                    {issue.description}
                  </p>

                  {/* Thumbnail and Location Meta */}
                  <div className="flex items-center space-x-3 mb-3">
                    {photo && (
                      <img
                        src={photo.thumbnailUrl}
                        alt="Evidence"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center text-slate-700 truncate font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1 shrink-0" />
                        <span className="truncate">{issue.location.formattedAddress}</span>
                      </div>
                      <div className="flex items-center text-slate-500 text-[11px] mt-0.5">
                        <span className="font-mono px-1.5 py-0.2 bg-slate-100 rounded mr-2">{issue.location.ward}</span>
                        <span>{issue.category.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats & Actions */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpvote(issue.id);
                        }}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        title="Endorse this civic issue"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-bold">{issue.upvoteCount}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{issue.commentCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>SLA: {new Date(issue.slaDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Relational Issue Inspector & Details */}
        <div className="lg:col-span-7">
          {selectedIssue ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Header Details */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-lg text-slate-900">{selectedIssue.issueCode}</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${getStatusBadgeClass(selectedIssue.status)}`}>
                      {selectedIssue.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${getPriorityBadgeClass(selectedIssue.priority)}`}>
                      {selectedIssue.priority}
                    </span>
                  </div>

                  {/* Contextual Workflow Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Dispatch Button for Dispatcher/Supervisor/Admin */}
                    {['DISPATCHER', 'SUPERVISOR', 'ADMIN'].includes(currentUser.role) && (
                      <button
                        onClick={() => onOpenDispatchModal(selectedIssue)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
                      >
                        <HardHat className="w-3.5 h-3.5" />
                        <span>Dispatch Crew</span>
                      </button>
                    )}

                    {/* Resolution Proof Button for Field Worker */}
                    {['FIELD_WORKER', 'SUPERVISOR', 'ADMIN'].includes(currentUser.role) && selectedIssue.status !== 'RESOLVED' && selectedIssue.status !== 'VERIFIED' && (
                      <button
                        onClick={() => onOpenResolutionModal(selectedIssue)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Submit Resolution Proof</span>
                      </button>
                    )}

                    {/* Verify Button for Supervisor/Admin */}
                    {['SUPERVISOR', 'ADMIN', 'CITIZEN'].includes(currentUser.role) && selectedIssue.status === 'RESOLVED' && (
                      <button
                        onClick={() => onVerifyIssue(selectedIssue.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify &amp; Close</span>
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mt-3">
                  {selectedIssue.title}
                </h2>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Relational Entity Breakdown Cards (Linked Entities) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Reporter (users table) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Reporter (users Table)</span>
                    </span>
                    <button 
                      onClick={() => onViewSchemaEntity('users')}
                      className="text-[10px] text-blue-600 hover:underline font-mono"
                    >
                      users(id)
                    </button>
                  </div>
                  <div className="font-medium text-slate-800">{selectedIssue.reporterName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">Role: CITIZEN | User ID #{selectedIssue.reporterId}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Reported at: {new Date(selectedIssue.createdAt).toLocaleString()}</div>
                </div>

                {/* 2. Location (locations table) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>Location (locations Table)</span>
                    </span>
                    <button 
                      onClick={() => onViewSchemaEntity('locations')}
                      className="text-[10px] text-blue-600 hover:underline font-mono"
                    >
                      locations(id)
                    </button>
                  </div>
                  <div className="font-medium text-slate-800">{selectedIssue.location.formattedAddress}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {selectedIssue.location.ward} | {selectedIssue.location.city}, {selectedIssue.location.state}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    GPS: {selectedIssue.location.latitude}, {selectedIssue.location.longitude} (SRID 4326)
                  </div>
                </div>
              </div>

              {/* 3. Photo Evidence (issue_photos table) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Pre-Repair Photographic Evidence (issue_photos Table)
                  </span>
                  <button 
                    onClick={() => onViewSchemaEntity('issue_photos')}
                    className="text-[10px] text-blue-600 hover:underline font-mono"
                  >
                    issue_photos(issue_id)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedIssue.photos.map((photo) => (
                    <div key={photo.id} className="relative rounded-lg overflow-hidden border border-slate-300 group">
                      <img
                        src={photo.photoUrl}
                        alt="Evidence"
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-2 bg-white text-[11px]">
                        <div className="font-medium text-slate-800">{photo.caption}</div>
                        <div className="text-[10px] font-mono text-slate-500 flex justify-between mt-1">
                          <span>{(photo.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                          <span title={photo.sha256Hash} className="truncate max-w-[120px]">
                            SHA: {photo.sha256Hash.substring(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Active Field Assignment (assignments table) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <HardHat className="w-4 h-4 text-blue-600" />
                    <span>Field Dispatch &amp; Work Order (assignments Table)</span>
                  </span>
                  <button 
                    onClick={() => onViewSchemaEntity('assignments')}
                    className="text-[10px] text-blue-600 hover:underline font-mono"
                  >
                    assignments(issue_id)
                  </button>
                </div>

                {selectedIssue.assignments.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2 italic">
                    No active crew dispatched yet. Status is pending departmental review.
                  </div>
                ) : (
                  selectedIssue.assignments.map((assign) => (
                    <div key={assign.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900">{assign.assignedToName} ({assign.assignedToBadge})</div>
                        <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-blue-100 text-blue-800">
                          {assign.assignmentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Department:</strong> {assign.departmentName} | Dispatched by {assign.assignedByName}
                      </div>
                      {assign.instructions && (
                        <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                          "{assign.instructions}"
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-slate-500 pt-1 flex justify-between">
                        <span>Deadline: {new Date(assign.deadline).toLocaleString()}</span>
                        {assign.completedAt && <span className="text-emerald-600 font-bold">Completed at: {new Date(assign.completedAt).toLocaleTimeString()}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 5. Resolution Proof (resolution_proof table) */}
              {selectedIssue.resolutionProof && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Resolution Proof Dossier (resolution_proof Table)</span>
                    </span>
                    <button 
                      onClick={() => onViewSchemaEntity('resolution_proof')}
                      className="text-[10px] text-emerald-700 hover:underline font-mono font-bold"
                    >
                      resolution_proof (1:1)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Before Repair</div>
                      <img
                        src={selectedIssue.resolutionProof.beforePhotoUrl}
                        alt="Before"
                        className="w-full h-36 object-cover rounded border border-slate-300"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-700 uppercase mb-1">After Repair Verified</div>
                      <img
                        src={selectedIssue.resolutionProof.afterPhotoUrl}
                        alt="After"
                        className="w-full h-36 object-cover rounded border border-emerald-400 ring-2 ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border border-emerald-100 text-xs space-y-1">
                    <div className="font-semibold text-slate-800">Work Execution Narrative:</div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {selectedIssue.resolutionProof.workDescription}
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-mono text-[11px] text-slate-500">
                      <span>Labor Hours: {selectedIssue.resolutionProof.laborHours} hrs</span>
                      <span>Materials Cost: ${selectedIssue.resolutionProof.materialsCost?.toFixed(2)}</span>
                      <span className="font-bold text-emerald-700">Status: {selectedIssue.resolutionProof.verificationStatus}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Immutable Status History Audit Trail (issue_status_history table) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Immutable Status Transition Audit Ledger (issue_status_history Table)</span>
                  </span>
                  <button 
                    onClick={() => onViewSchemaEntity('issue_status_history')}
                    className="text-[10px] text-purple-700 hover:underline font-mono"
                  >
                    issue_status_history (Append-Only)
                  </button>
                </div>

                <div className="space-y-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedIssue.statusHistory.map((hist, idx) => (
                    <div key={hist.id} className="relative pl-7 text-xs">
                      <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{hist.newStatus}</span>
                        {hist.previousStatus && (
                          <span className="text-[11px] text-slate-400">
                            (was {hist.previousStatus})
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          by {hist.changedByUserName} ({hist.changedByUserRole})
                        </span>
                      </div>
                      {hist.reasonOrNotes && (
                        <p className="text-[11px] text-slate-600 mt-0.5">{hist.reasonOrNotes}</p>
                      )}
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Trigger: {hist.changeTrigger} | {new Date(hist.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Threaded Discussion & Internal Notes (comments table) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Discussion &amp; Department Notes (comments Table)</span>
                  </span>
                  <button 
                    onClick={() => onViewSchemaEntity('comments')}
                    className="text-[10px] text-blue-600 hover:underline font-mono"
                  >
                    comments(issue_id)
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedIssue.comments.length === 0 ? (
                    <div className="text-xs text-slate-400 py-2 italic">
                      No comments logged yet. Citizens and municipal staff can discuss below.
                    </div>
                  ) : (
                    selectedIssue.comments.map((c) => (
                      <div 
                        key={c.id} 
                        className={`p-2.5 rounded-lg text-xs space-y-1 ${
                          c.isInternalNote 
                            ? 'bg-amber-50/80 border border-amber-200 text-amber-950' 
                            : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <span>{c.userName}</span>
                            <span className="text-[10px] font-mono font-normal text-slate-500">
                              ({c.userRole})
                            </span>
                            {c.isInternalNote && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-mono font-bold flex items-center space-x-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>INTERNAL NOTE</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={`Post comment as ${currentUser.fullName}...`}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1 disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </div>

                  {/* Internal note toggle for staff */}
                  {['FIELD_WORKER', 'DISPATCHER', 'SUPERVISOR', 'ADMIN'].includes(currentUser.role) && (
                    <label className="flex items-center space-x-1.5 text-[11px] text-amber-800 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-0"
                      />
                      <span>Mark as Department Internal Note (Hidden from Citizen)</span>
                    </label>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              Select an issue from the list to inspect its relational graph and entities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
