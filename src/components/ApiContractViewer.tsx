import React, { useState } from 'react';
import { 
  Code2, 
  Search, 
  Copy, 
  Check, 
  Send, 
  ShieldCheck, 
  Layers, 
  Download, 
  FileText, 
  ExternalLink,
  Lock,
  Globe,
  UserCheck,
  Building2,
  AlertCircle,
  Clock,
  Sparkles,
  Terminal,
  Database,
  CheckCircle2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { API_ENDPOINTS, ApiEndpoint } from '../data/apiEndpoints';

interface ApiContractViewerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const ApiContractViewer: React.FC<ApiContractViewerProps> = ({ onNavigateToTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'explorer' | 'markdown' | 'postman' | 'openapi'>('explorer');
  const [selectedGroup, setSelectedGroup] = useState<'All' | 'Authentication' | 'Citizen' | 'Public' | 'Admin'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(API_ENDPOINTS[0].id);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResponse, setSimulationResponse] = useState<any | null>(null);
  const [simulatedStatus, setSimulatedStatus] = useState<number | null>(null);
  const [simulatedTime, setSimulatedTime] = useState<number | null>(null);
  const [editablePayload, setEditablePayload] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<'response' | 'errors' | 'validation' | 'curl'>('response');

  const selectedEndpoint = API_ENDPOINTS.find(e => e.id === selectedEndpointId) || API_ENDPOINTS[0];

  // Sync payload when selected endpoint changes
  React.useEffect(() => {
    if (selectedEndpoint.requestBody) {
      setEditablePayload(JSON.stringify(selectedEndpoint.requestBody, null, 2));
    } else {
      setEditablePayload('');
    }
    setSimulationResponse(null);
    setSimulatedStatus(null);
  }, [selectedEndpointId]);

  const filteredEndpoints = API_ENDPOINTS.filter(ep => {
    const matchesGroup = selectedGroup === 'All' || ep.group === selectedGroup;
    const matchesSearch = 
      ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateCall = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedStatus(selectedEndpoint.successStatus);
      setSimulatedTime(Math.floor(Math.random() * 45) + 25);
      setSimulationResponse(selectedEndpoint.successResponse);
    }, 450);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'POST':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PATCH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'Authentication':
        return <Lock className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Citizen':
        return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
      case 'Public':
        return <Globe className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Admin':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  // Generate Postman Collection v2.1 JSON
  const generatePostmanCollection = () => {
    const collection = {
      info: {
        name: "CivicFix REST API Contract (Phase 2)",
        description: "Official Postman Collection for CivicFix municipal civic reporting and dispatch system.",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      variable: [
        { key: "base_url", value: "https://api.civicfix.city.gov", type: "string" },
        { key: "bearer_token", value: "eyJhbGciOiJIUzI1Ni...", type: "string" }
      ],
      item: ['Authentication', 'Citizen', 'Public', 'Admin'].map(groupName => ({
        name: groupName,
        item: API_ENDPOINTS.filter(e => e.group === groupName).map(endpoint => ({
          name: endpoint.name,
          request: {
            method: endpoint.method,
            header: [
              { key: "Content-Type", value: "application/json" },
              ...(endpoint.authentication.includes('Bearer') ? [{ key: "Authorization", value: "Bearer {{bearer_token}}" }] : [])
            ],
            url: {
              raw: `{{base_url}}${endpoint.endpoint}`,
              host: ["{{base_url}}"],
              path: endpoint.endpoint.replace('/api/v1/', '').split('/')
            },
            description: endpoint.description,
            ...(endpoint.requestBody ? {
              body: {
                mode: "raw",
                raw: JSON.stringify(endpoint.requestBody, null, 2)
              }
            } : {})
          }
        }))
      }))
    };
    return JSON.stringify(collection, null, 2);
  };

  // Generate OpenAPI 3.1.0 YAML
  const generateOpenApiSnippet = () => {
    return `openapi: 3.1.0
info:
  title: CivicFix Municipal Issue Tracking & Dispatch API
  version: 2.0.0
  description: Official Phase 2 REST API Contract. Node.js + Express backend, PostgreSQL + Prisma, JWT + bcrypt, Leaflet GIS.
servers:
  - url: https://api.civicfix.city.gov/api/v1
    description: Production Municipal Gateway
  - url: http://localhost:3000/api/v1
    description: Local Container Dev Environment

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:
  /auth/register:
    post:
      summary: Register User
      tags: [Authentication]
      responses:
        '201':
          description: User registered successfully
        '409':
          description: Email conflict
  /citizen/issues:
    post:
      summary: Create Issue
      tags: [Citizen]
      security:
        - bearerAuth: []
      responses:
        '201':
          description: Grievance logged with SLA deadline
  /public/issues/map:
    get:
      summary: View Issue Map (GeoJSON)
      tags: [Public]
      responses:
        '200':
          description: GeoJSON FeatureCollection for Leaflet
  /admin/issues/{id}/assign:
    post:
      summary: Assign Issue to Field Crew
      tags: [Admin]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        '201':
          description: Work order created and dispatched`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Architecture & Phase 2 Contract Sign-off */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Phase 2 — REST API Contract &amp; Specification
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Contract Approved
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Strict endpoint contract for CivicFix backend implementation. Every endpoint defines HTTP method, authentication, role access, parameters, schemas, validation rules, status codes, and RFC 7807 error envelopes.
            </p>
          </div>

          {/* Quick Stats Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono border border-slate-200">
              <strong className="text-slate-900">25</strong> Endpoints
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono border border-indigo-200">
              Node.js + Express
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
              PostgreSQL + Prisma
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono border border-purple-200">
              JWT + bcrypt
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab('explorer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeSubTab === 'explorer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive API Contract Explorer</span>
            </button>

            <button
              onClick={() => setActiveSubTab('markdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeSubTab === 'markdown'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>API_CONTRACT.md</span>
            </button>

            <button
              onClick={() => setActiveSubTab('postman')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeSubTab === 'postman'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Postman Collection</span>
            </button>

            <button
              onClick={() => setActiveSubTab('openapi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeSubTab === 'openapi'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>OpenAPI / Swagger YAML</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Standard: RFC 7807 &bull; OpenAPI 3.1.0
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE EXPLORER */}
      {activeSubTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Endpoints Navigation (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Filter by Category */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 25 endpoints, URLs, methods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Group Pill Filters */}
              <div className="flex flex-wrap gap-1">
                {(['All', 'Authentication', 'Citizen', 'Public', 'Admin'] as const).map(grp => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      selectedGroup === grp
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoints List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {filteredEndpoints.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No endpoints match your search filter.
                </div>
              ) : (
                filteredEndpoints.map(ep => {
                  const isSelected = ep.id === selectedEndpointId;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedEndpointId(ep.id)}
                      className={`w-full text-left p-3 transition-colors flex items-start space-x-2.5 ${
                        isSelected 
                          ? 'bg-blue-50/70 border-l-4 border-l-blue-600' 
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="mt-0.5">{getGroupIcon(ep.group)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getMethodBadgeClass(ep.method)}`}>
                            {ep.method}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {ep.name}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 truncate mt-0.5">
                          {ep.endpoint}
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            {ep.requiredRole}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Detail Pane: Complete 13 Specification Attributes (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Endpoint Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${getMethodBadgeClass(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {selectedEndpoint.endpoint}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedEndpoint.endpoint, 'endpoint-url')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                      title="Copy Endpoint"
                    >
                      {copiedKey === 'endpoint-url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedEndpoint.name} &bull; <span className="text-slate-500 font-normal">{selectedEndpoint.group} API</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedEndpoint.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                    Auth: <strong>{selectedEndpoint.authentication}</strong>
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                    Role: <strong>{selectedEndpoint.requiredRole}</strong>
                  </span>
                </div>
              </div>

              {/* Path & Query Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Path Variables */}
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Path Variables</span>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedEndpoint.pathVariables.length}</span>
                  </h4>
                  {selectedEndpoint.pathVariables.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">None</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEndpoint.pathVariables.map(p => (
                        <div key={p.name} className="text-xs">
                          <div className="flex items-center space-x-1.5 font-mono">
                            <span className="text-blue-600 font-semibold">{p.name}</span>
                            <span className="text-slate-400">({p.type})</span>
                            <span className="text-[10px] px-1 rounded bg-red-50 text-red-600 border border-red-200">Required</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Query Parameters */}
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Query Parameters</span>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedEndpoint.queryParams.length}</span>
                  </h4>
                  {selectedEndpoint.queryParams.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">None</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedEndpoint.queryParams.map(q => (
                        <div key={q.name} className="text-xs">
                          <div className="flex items-center space-x-1.5 font-mono">
                            <span className="text-purple-600 font-semibold">{q.name}</span>
                            <span className="text-slate-400">({q.type})</span>
                            {q.required ? (
                              <span className="text-[10px] px-1 rounded bg-red-50 text-red-600 border border-red-200">Required</span>
                            ) : (
                              <span className="text-[10px] px-1 rounded bg-slate-100 text-slate-500">Optional</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{q.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Rules */}
              <div className="bg-amber-50/60 rounded-lg p-3.5 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Validation &amp; Business Rules</span>
                </h4>
                <ul className="space-y-1 text-xs text-amber-950 list-disc list-inside">
                  {selectedEndpoint.validationRules.map((rule, idx) => (
                    <li key={idx} className="font-mono text-[11.5px] leading-relaxed">
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Request Body Editor & Simulator */}
              {selectedEndpoint.requestBody && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Request Body (JSON)
                    </h4>
                    <button
                      onClick={() => handleCopy(editablePayload, 'payload')}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      {copiedKey === 'payload' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'payload' ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={editablePayload}
                    onChange={(e) => setEditablePayload(e.target.value)}
                    className="w-full font-mono text-xs bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Simulation Action Bar */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-700">HTTP Status Codes:</span>
                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                    {selectedEndpoint.httpStatusCodes.map(code => (
                      <span
                        key={code}
                        className={`px-1.5 py-0.5 rounded border ${
                          code < 300 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSimulateCall}
                  disabled={isSimulating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center space-x-2"
                >
                  <Send className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Executing...' : 'Test Request in Simulator'}</span>
                </button>
              </div>

              {/* Simulation Live Output (if executed) */}
              {simulationResponse && (
                <div className="bg-slate-900 rounded-lg p-4 text-white font-mono text-xs space-y-2 border border-slate-700 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        {simulatedStatus} OK
                      </span>
                      <span className="text-slate-400">Time: {simulatedTime}ms</span>
                    </div>
                    <span className="text-slate-400">Content-Type: application/json; charset=utf-8</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-emerald-300 max-h-56">
                    {JSON.stringify(simulationResponse, null, 2)}
                  </pre>
                </div>
              )}

              {/* Tabbed Inspector: Success Response vs RFC 7807 Errors vs cURL */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <button
                    onClick={() => setExpandedSection('response')}
                    className={`text-xs font-bold pb-1 transition-colors ${
                      expandedSection === 'response'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Success Response ({selectedEndpoint.successStatus})
                  </button>

                  <button
                    onClick={() => setExpandedSection('errors')}
                    className={`text-xs font-bold pb-1 transition-colors ${
                      expandedSection === 'errors'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    RFC 7807 Error Responses ({selectedEndpoint.errorResponses.length})
                  </button>

                  <button
                    onClick={() => setExpandedSection('curl')}
                    className={`text-xs font-bold pb-1 transition-colors ${
                      expandedSection === 'curl'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sample cURL
                  </button>
                </div>

                {/* Sub-view: Success Response */}
                {expandedSection === 'response' && (
                  <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-100">
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedEndpoint.successResponse, null, 2), 'success-response')}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded bg-slate-800 border border-slate-700"
                    >
                      {copiedKey === 'success-response' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre className="overflow-x-auto text-[11.5px] max-h-64 text-emerald-300">
                      {JSON.stringify(selectedEndpoint.successResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Sub-view: Errors */}
                {expandedSection === 'errors' && (
                  <div className="space-y-3">
                    {selectedEndpoint.errorResponses.map(err => (
                      <div key={err.status} className="bg-slate-900 rounded-lg p-3 text-white font-mono text-xs space-y-1.5">
                        <div className="flex items-center space-x-2 text-rose-400 font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/50">
                            HTTP {err.status}
                          </span>
                          <span>{err.title}</span>
                          <span className="text-slate-400 text-[11px] font-normal">&bull; {err.description}</span>
                        </div>
                        <pre className="text-slate-300 text-[11px] overflow-x-auto pt-1">
                          {JSON.stringify(err.sample, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-view: cURL */}
                {expandedSection === 'curl' && (
                  <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-xs text-amber-200">
                    <button
                      onClick={() => handleCopy(selectedEndpoint.sampleCurl, 'curl-code')}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded bg-slate-800 border border-slate-700"
                    >
                      {copiedKey === 'curl-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-[11.5px]">
                      {selectedEndpoint.sampleCurl}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RAW / FORMATTED API_CONTRACT.MD */}
      {activeSubTab === 'markdown' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">API_CONTRACT.md — Full Engineering Deliverable</h3>
              <p className="text-xs text-slate-500">File location: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/API_CONTRACT.md</code></p>
            </div>
            <button
              onClick={() => handleCopy(document.getElementById('api-contract-md-container')?.innerText || '', 'full-md')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center space-x-1.5 transition-colors"
            >
              {copiedKey === 'full-md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'full-md' ? 'Copied All Markdown!' : 'Copy Full Document'}</span>
            </button>
          </div>

          <div id="api-contract-md-container" className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-800 space-y-4 max-h-[750px] overflow-y-auto p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono">
            <h1 className="text-base font-bold text-slate-900">CivicFix — RESTful API Contract &amp; Specification (Phase 2)</h1>
            <p><strong>Version:</strong> 2.0.0 &bull; <strong>Status:</strong> PROPOSED &amp; RATIFIED FOR IMPLEMENTATION</p>
            <p><strong>Standard:</strong> OpenAPI 3.1.0 / RFC 7807 (Problem Details for HTTP APIs)</p>
            <p><strong>Target Backend:</strong> Node.js 20+ with Express, PostgreSQL &amp; Prisma ORM</p>
            <p><strong>Security Model:</strong> Stateless JSON Web Token (JWT) Bearer Authentication + bcrypt password hashing (12 salt rounds) + HTTP-only Refresh Cookie</p>
            
            <hr />
            <h2 className="text-sm font-bold text-slate-900">All 25 Ratified Endpoints Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {API_ENDPOINTS.map((ep, idx) => (
                <div key={ep.id} className="p-2 bg-white rounded border border-slate-200">
                  <span className="font-bold text-slate-600">{idx + 1}. {ep.name}:</span> <code className="text-blue-600">{ep.method} {ep.endpoint}</code>
                </div>
              ))}
            </div>
            
            <p className="text-slate-500 pt-2 italic">
              See root file <code className="text-blue-600">/API_CONTRACT.md</code> for complete RFC schemas and responses.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: POSTMAN COLLECTION */}
      {activeSubTab === 'postman' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Postman Collection Export (v2.1 Format)</h3>
              <p className="text-xs text-slate-500">
                Ready to import into Postman. Preconfigured with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">&#123;&#123;base_url&#125;&#125;</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">&#123;&#123;bearer_token&#125;&#125;</code>.
              </p>
            </div>
            <button
              onClick={() => handleCopy(generatePostmanCollection(), 'postman-json')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              {copiedKey === 'postman-json' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'postman-json' ? 'Copied Collection JSON!' : 'Copy Postman JSON'}</span>
            </button>
          </div>

          <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 max-h-[600px] overflow-y-auto">
            <pre className="text-[11.5px] text-amber-300">
              {generatePostmanCollection()}
            </pre>
          </div>
        </div>
      )}

      {/* VIEW 4: OPENAPI 3.1.0 SWAGGER YAML */}
      {activeSubTab === 'openapi' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">OpenAPI 3.1.0 / Swagger Specification</h3>
              <p className="text-xs text-slate-500">
                Standard OpenAPI descriptor for Swagger UI, Redoc, and automated client SDK code generation.
              </p>
            </div>
            <button
              onClick={() => handleCopy(generateOpenApiSnippet(), 'openapi-yaml')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              {copiedKey === 'openapi-yaml' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'openapi-yaml' ? 'Copied Swagger YAML!' : 'Copy OpenAPI YAML'}</span>
            </button>
          </div>

          <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 max-h-[600px] overflow-y-auto">
            <pre className="text-[11.5px] text-emerald-300">
              {generateOpenApiSnippet()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
