import React from 'react';
import { 
  Building2, 
  Database, 
  Layers, 
  Code2, 
  FileText, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck,
  Compass,
  CheckSquare,
  Server,
  LogIn,
  Box
} from 'lucide-react';
import { User } from '../types/database';

interface HeaderProps {
  activeTab: 'app' | 'backend' | 'ui_flow' | 'tasks' | 'api' | 'schema' | 'comparison' | 'docs' | 'testing' | 'container';
  setActiveTab: (tab: 'app' | 'backend' | 'ui_flow' | 'tasks' | 'api' | 'schema' | 'comparison' | 'docs' | 'testing' | 'container') => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  users: User[];
  unreadCount: number;
  onOpenNotifications: () => void;
  onReportClick: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  users,
  unreadCount,
  onOpenNotifications,
  onReportClick,
  onOpenAuth
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Municipal Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-400/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">CivicFix</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Phases 1–4 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Municipal Issue Tracking, Field Dispatch &amp; Audit Platform
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
            <button
              id="nav-tab-app"
              onClick={() => setActiveTab('app')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'app'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Operations &amp; Feed</span>
            </button>

            <button
              id="nav-tab-backend"
              onClick={() => setActiveTab('backend')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'backend'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Backend &amp; Tests (Phase 5)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                12 Tests
              </span>
            </button>

            <button
              id="nav-tab-ui-flow"
              onClick={() => setActiveTab('ui_flow')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'ui_flow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>UI Flow (Phase 3)</span>
            </button>

            <button
              id="nav-tab-tasks"
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks (Phase 4)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                46
              </span>
            </button>

            <button
              id="nav-tab-api"
              onClick={() => setActiveTab('api')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>API Contract (Phase 2)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                25
              </span>
            </button>

            <button
              id="nav-tab-schema"
              onClick={() => setActiveTab('schema')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'schema'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>ER Diagram</span>
            </button>

            <button
              id="nav-tab-comparison"
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'comparison'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>MySQL vs Mongo</span>
            </button>

            <button
              id="nav-tab-testing"
              onClick={() => setActiveTab('testing')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'testing'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Testing (P7)</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                57
              </span>
            </button>

            <button
              id="nav-tab-container"
              onClick={() => setActiveTab('container')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'container'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Docker (P8)</span>
            </button>

            <button
              id="nav-tab-docs"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>DATABASE.md</span>
            </button>
          </nav>

          {/* Right Controls: User Switcher, Notifications & Report CTA */}
          <div className="flex items-center space-x-3">
            {/* Database & API Status Chip */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Express API &amp; Test Runner</span>
            </div>

            {/* Sign In / Auth Button */}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
                title="Municipal Auth & JWT Login"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Auth Portal</span>
              </button>
            )}

            {/* Notifications Button */}
            <button
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="System & Issue Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Role Switcher */}
            <div className="flex items-center space-x-2 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <select
                id="select-user-role"
                aria-label="Active User Profile"
                value={currentUser.id}
                onChange={(e) => {
                  const targetUser = users.find(u => u.id === Number(e.target.value));
                  if (targetUser) onUserChange(targetUser);
                }}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-800 text-slate-200">
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Report Issue Button */}
            <button
              id="btn-header-report"
              onClick={onReportClick}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
            >
              <span>+ Report Issue</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('app')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'app' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            Operations
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'backend' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            Backend &amp; Tests (P5)
          </button>
          <button
            onClick={() => setActiveTab('ui_flow')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'ui_flow' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            UI Flow (P3)
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            Tasks (P4)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'api' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            API Contract (P2)
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'schema' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            ER Diagram (P1)
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'comparison' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            MySQL vs Mongo
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'testing' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            Testing (P7)
          </button>
          <button
            onClick={() => setActiveTab('container')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'container' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            Docker (P8)
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
          >
            DATABASE.md
          </button>
        </div>
      </div>
    </header>
  );
};
