import React, { useState } from 'react';
import { 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Layers, 
  FileCode, 
  FileCheck, 
  Lock, 
  Zap, 
  RefreshCw,
  Copy,
  Check,
  Code2
} from 'lucide-react';
import { runAllBackendUnitTests, TestSuiteSummary } from '../backend/tests/testRunner';
import { civicFixSwaggerSpec } from '../backend/swagger/swaggerSpec';

export const BackendViewer: React.FC = () => {
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'tests' | 'swagger'>('tests');
  const [copied, setCopied] = useState(false);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      // Simulate minor network/compute latency for authentic feel
      await new Promise(r => setTimeout(r, 200));
      const summary = await runAllBackendUnitTests();
      setTestSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const copySwagger = () => {
    navigator.clipboard.writeText(JSON.stringify(civicFixSwaggerSpec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Phase 5 Backend Implementation
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Clean Architecture Layered Monolith
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2">CivicFix Backend Services &amp; Test Suite</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Strictly implementing the <strong>Authentication Module</strong> and <strong>Civic Issue Reporting Module</strong> featuring Entity, DTO, Repository, Service, Controller, Middleware, RFC 7807 Exception Handling, Swagger OpenAPI 3.1, and Unit Tests.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md hover:shadow-emerald-600/30 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Executing Test Runners...' : 'Run All Backend Unit Tests'}</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-2 mt-6 border-t border-slate-800 pt-4">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'tests' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unit Test Runner &amp; Assertions</span>
            {testSummary && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400/20 text-emerald-300 font-mono">
                {testSummary.passed}/{testSummary.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'architecture' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Clean Architecture Layers</span>
          </button>

          <button
            onClick={() => setActiveTab('swagger')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'swagger' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Swagger OpenAPI 3.1 Spec</span>
          </button>
        </div>
      </div>

      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {!testSummary ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Backend Unit Test Suite Ready</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Execute the 12 comprehensive unit test assertions validating PBKDF2 password hashing, salt generation, JWT claims, RFC 7807 409 conflict detection, municipal boundary checks, and issue SLA calculations.
              </p>
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Execute Unit Tests Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Total Assertions</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{testSummary.total}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-xs">
                  <span className="text-xs text-emerald-700 font-medium">Tests Passed</span>
                  <div className="text-2xl font-bold text-emerald-800 mt-1 flex items-center space-x-2">
                    <span>{testSummary.passed}</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Tests Failed</span>
                  <div className={`text-2xl font-bold mt-1 ${testSummary.failed > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {testSummary.failed}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Execution Benchmark</span>
                  <div className="text-2xl font-bold text-blue-600 mt-1 font-mono">{testSummary.durationMs} ms</div>
                </div>
              </div>

              {/* Individual Test Results List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Unit Test Execution Log ({testSummary.results.length} Scenarios)
                  </h3>
                  <button
                    onClick={handleRunTests}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-run Suite</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {testSummary.results.map((t, idx) => (
                    <div key={idx} className="p-4 flex items-start justify-between hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start space-x-3">
                        {t.passed ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {t.suite}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">{t.name}</span>
                          </div>
                          {t.error && (
                            <p className="text-xs text-red-600 font-mono mt-1 bg-red-50 p-2 rounded border border-red-100">
                              {t.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-4">
                        {t.durationMs} ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Architecture Layers Tab */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Authentication Service Module</h3>
                <p className="text-xs text-slate-500">PBKDF2 Hashing, JWT Bearer Token, Role-Based Access Control</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Entity Layer:</span>
                <span className="font-mono text-slate-600">src/backend/entities/User.entity.ts</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">DTO Layer:</span>
                <span className="font-mono text-slate-600">RegisterRequestDto, LoginRequestDto, TokenPayloadDto</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Repository Layer:</span>
                <span className="font-mono text-slate-600">IUserRepository / InMemoryUserRepository</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Service Layer:</span>
                <span className="font-mono text-slate-600">AuthService (Hash, Salt, JWT, Validation)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Controller Layer:</span>
                <span className="font-mono text-slate-600">AuthController (/register, /login, /me)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Security Middleware:</span>
                <span className="font-mono text-slate-600">authenticate(), requireRoles([CITIZEN, ADMIN])</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Civic Issue Reporting Module</h3>
                <p className="text-xs text-slate-500">CVX Code Generation, Municipal Boundary Check, Category SLA</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Entity Layer:</span>
                <span className="font-mono text-slate-600">src/backend/entities/Issue.entity.ts</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">DTO Layer:</span>
                <span className="font-mono text-slate-600">CreateIssueDto, PaginatedIssuesResponseDto</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Repository Layer:</span>
                <span className="font-mono text-slate-600">IIssueRepository / InMemoryIssueRepository</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Service Layer:</span>
                <span className="font-mono text-slate-600">IssueService (Geofence, SLA computation)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Controller Layer:</span>
                <span className="font-mono text-slate-600">IssueController (/citizen/issues, /public/issues)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">Exception Handling:</span>
                <span className="font-mono text-slate-600">RFC 7807 Problem Details Handler</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swagger Spec Tab */}
      {activeTab === 'swagger' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800">OpenAPI 3.1.0 Swagger Specification</span>
              <p className="text-[11px] text-slate-500">Live JSON schema served at <code className="font-mono text-blue-600">/api/v1/swagger.json</code></p>
            </div>
            <button
              onClick={copySwagger}
              className="px-3 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center space-x-1 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px]">
            <pre>{JSON.stringify(civicFixSwaggerSpec, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
