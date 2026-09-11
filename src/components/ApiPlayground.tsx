import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Server, 
  Send, 
  Layers, 
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { Issue } from '../types/database';

interface ApiPlaygroundProps {
  issues: Issue[];
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ issues }) => {
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/issues',
      title: 'List Civic Issues with Spatial & Ward Filters',
      description: 'Queries open issues with pagination, ward boundary filtering, and status matching via Spring Data JPA Specification.',
      queryParams: '?ward=Ward 5&status=IN_PROGRESS&page=0&size=10',
      javaController: `@GetMapping
public ResponseEntity<Page<IssueSummaryResponse>> getIssues(
    @RequestParam(required = false) String ward,
    @RequestParam(required = false) IssueStatus status,
    @RequestParam(required = false) Double lat,
    @RequestParam(required = false) Double lng,
    @RequestParam(required = false) Double radiusMeters,
    Pageable pageable) {

    Page<Issue> page = issueService.findIssues(ward, status, lat, lng, radiusMeters, pageable);
    return ResponseEntity.ok(page.map(issueMapper::toSummaryResponse));
}`,
      mockResponse: {
        content: issues.slice(0, 3).map(i => ({
          id: i.id,
          issueCode: i.issueCode,
          title: i.title,
          status: i.status,
          priority: i.priority,
          ward: i.location.ward,
          categoryName: i.category.name,
          upvotes: i.upvoteCount,
          createdAt: i.createdAt
        })),
        pageable: { pageNumber: 0, pageSize: 10 },
        totalElements: issues.length,
        totalPages: 1
      }
    },
    {
      method: 'GET',
      path: '/api/v1/issues/{id}',
      title: 'Get Complete Relational Issue Graph',
      description: 'Fetches issue with all child entities (photos, assignments, status history, comments, resolution proof).',
      queryParams: '',
      javaController: `@GetMapping("/{id}")
public ResponseEntity<IssueDetailResponse> getIssueById(@PathVariable Long id) {
    Issue issue = issueRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Issue not found with id: " + id));
    return ResponseEntity.ok(issueMapper.toDetailResponse(issue));
}`,
      mockResponse: issues[0]
    },
    {
      method: 'POST',
      path: '/api/v1/issues',
      title: 'Report New Issue (Transactional)',
      description: 'Creates Location, Issue, Photos, and initial Status History record atomically inside a @Transactional boundary.',
      requestBody: {
        title: "Deep 2-foot pothole in left bike lane",
        description: "Crater has exposed rebar and is causing cyclists to swerve into fast traffic.",
        categoryId: 1,
        priority: "HIGH",
        location: {
          latitude: 40.748817,
          longitude: -73.985130,
          formattedAddress: "350 5th Ave, New York, NY 10118",
          ward: "Ward 5",
          city: "Metropolis",
          state: "NY",
          postalCode: "10118"
        },
        photoUrls: ["https://storage.civicfix.org/photos/2026/09/pothole_crater_full.jpg"]
      },
      javaController: `@PostMapping
@Transactional
public ResponseEntity<IssueDetailResponse> reportIssue(
    @AuthenticationPrincipal User citizen,
    @Valid @RequestBody CreateIssueRequest request) {

    Issue issue = issueService.createReport(citizen, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(issueMapper.toDetailResponse(issue));
}`,
      mockResponse: {
        id: 6,
        issueCode: "CVX-2026-08499",
        status: "REPORTED",
        message: "Issue reported successfully. Geocoded and routed to Department of Transportation."
      }
    },
    {
      method: 'POST',
      path: '/api/v1/issues/{id}/assignments',
      title: 'Dispatch Field Worker Crew',
      description: 'Creates Assignment, changes issue status to ASSIGNED, appends to IssueStatusHistory, and fires SMS notification.',
      requestBody: {
        assignedToUserId: 2,
        departmentName: "Public Works - Asphalt Division",
        instructions: "Hot-mix asphalt patch required. Apply cold-joint sealant.",
        deadlineHours: 48
      },
      javaController: `@PostMapping("/{id}/assignments")
@Transactional
@PreAuthorize("hasAnyRole('DISPATCHER', 'SUPERVISOR', 'ADMIN')")
public ResponseEntity<AssignmentResponse> dispatchCrew(
    @PathVariable Long id,
    @AuthenticationPrincipal User dispatcher,
    @Valid @RequestBody DispatchCrewRequest request) {

    Assignment assignment = dispatchService.assignCrew(id, dispatcher, request);
    return ResponseEntity.ok(assignmentMapper.toResponse(assignment));
}`,
      mockResponse: {
        assignmentId: 5,
        issueId: 1,
        assignedTo: "Marcus Vance",
        badge: "PW-7741",
        status: "ASSIGNED",
        notificationSent: true
      }
    },
    {
      method: 'POST',
      path: '/api/v1/issues/{id}/resolution-proof',
      title: 'Submit Resolution Proof with After-Photo',
      description: 'Records after-photo proof, work narrative, labor hours, and transitions issue to RESOLVED awaiting sign-off.',
      requestBody: {
        workDescription: "Excavated loose roadbed, poured hot asphalt, roller compacted flush with road.",
        afterPhotoUrl: "https://storage.civicfix.org/photos/2026/09/repaired_after.jpg",
        laborHours: 3.5,
        materialsCost: 485.50
      },
      javaController: `@PostMapping("/{id}/resolution-proof")
@Transactional
@PreAuthorize("hasAnyRole('FIELD_WORKER', 'SUPERVISOR')")
public ResponseEntity<ResolutionProofResponse> submitProof(
    @PathVariable Long id,
    @AuthenticationPrincipal User worker,
    @Valid @RequestBody SubmitResolutionProofRequest request) {

    ResolutionProof proof = resolutionService.recordProof(id, worker, request);
    return ResponseEntity.ok(resolutionMapper.toResponse(proof));
}`,
      mockResponse: {
        proofId: 3,
        issueId: 1,
        verificationStatus: "PENDING_REVIEW",
        newIssueStatus: "RESOLVED"
      }
    }
  ];

  const currentEndpoint = endpoints[selectedEndpointIndex];

  const executeRequest = () => {
    setIsExecuting(true);
    setResponseOutput(null);
    setTimeout(() => {
      setResponseOutput(currentEndpoint.mockResponse);
      setIsExecuting(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Java Spring Boot 3.x REST API Architecture</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              Spring Data JPA / Hibernate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade RESTful API endpoints matching the CivicFix database schema with DTOs, controllers, and transaction management.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            OpenAPI 3.0 Ready
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            @Transactional ACID
          </span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1 mb-2">
            REST API Endpoints
          </div>
          <div className="space-y-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            {endpoints.map((ep, idx) => {
              const isSelected = selectedEndpointIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedEndpointIndex(idx);
                    setResponseOutput(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all ${
                    isSelected 
                      ? 'bg-indigo-50 border border-indigo-200 shadow-sm' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-900 font-medium truncate">{ep.path}</span>
                  </div>
                  <div className="text-slate-600 font-medium text-[11px] truncate">{ep.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Endpoint Inspector & Runner */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
                  currentEndpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentEndpoint.method}
                </span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {currentEndpoint.path}{currentEndpoint.queryParams}
                </span>
              </div>

              <button
                onClick={executeRequest}
                disabled={isExecuting}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Calling...' : 'Simulate API Call'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">{currentEndpoint.description}</p>

            {/* Request Body if POST */}
            {currentEndpoint.requestBody && (
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                  <span>Sample JSON Request Body (DTO)</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(currentEndpoint.requestBody, null, 2), 'body')}
                    className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center space-x-1"
                  >
                    {copiedText === 'body' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'body' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(currentEndpoint.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Java Spring Boot Controller Code */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span className="flex items-center space-x-1">
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Java Spring Boot Controller Handler</span>
                </span>
                <button
                  onClick={() => handleCopy(currentEndpoint.javaController, 'controller')}
                  className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center space-x-1"
                >
                  {copiedText === 'controller' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText === 'controller' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-indigo-300 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed max-h-56">
                {currentEndpoint.javaController}
              </pre>
            </div>

            {/* Execution Response Output */}
            {responseOutput && (
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>HTTP 200 OK — JSON Response Body</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Time: 42ms | Content-Type: application/json</span>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto max-h-64">
                  {JSON.stringify(responseOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
