/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { CivicApp } from './components/CivicApp';
import { SchemaExplorer } from './components/SchemaExplorer';
import { MermaidViewer } from './components/MermaidViewer';
import { DbComparison } from './components/DbComparison';
import { ApiPlayground } from './components/ApiPlayground';
import { ApiContractViewer } from './components/ApiContractViewer';
import { UiFlowViewer } from './components/UiFlowViewer';
import { TaskBreakdownViewer } from './components/TaskBreakdownViewer';
import { DatabaseDocViewer } from './components/DatabaseDocViewer';
import { ReportIssueModal } from './components/ReportIssueModal';
import { DispatchModal } from './components/DispatchModal';
import { ResolutionProofModal } from './components/ResolutionProofModal';
import { NotificationsModal } from './components/NotificationsModal';
import { BackendViewer } from './components/BackendViewer';
import { TestingViewer } from './components/TestingViewer';
import { ContainerViewer } from './components/ContainerViewer';
import { AuthModal } from './components/AuthModal';
import { backend } from './backend';
import { 
  INITIAL_USERS, 
  INITIAL_CATEGORIES, 
  INITIAL_ISSUES, 
  INITIAL_NOTIFICATIONS 
} from './data/mockDatabase';
import { 
  Issue, 
  User, 
  NotificationRecord, 
  IssuePriority, 
  Comment,
  Assignment,
  ResolutionProof
} from './types/database';

export default function App() {
  const [activeTab, setActiveTab] = useState<'app' | 'backend' | 'ui_flow' | 'tasks' | 'api' | 'schema' | 'comparison' | 'docs' | 'testing' | 'container'>('app');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Elena Rostova (Citizen)
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(INITIAL_NOTIFICATIONS);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dispatchTargetIssue, setDispatchTargetIssue] = useState<Issue | null>(null);
  const [resolutionTargetIssue, setResolutionTargetIssue] = useState<Issue | null>(null);

  // Deep link entity for Schema Explorer
  const [selectedSchemaEntity, setSelectedSchemaEntity] = useState<string>('issues');

  // Handle Upvote
  const handleUpvote = (issueId: number) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          upvoteCount: issue.upvoteCount + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return issue;
    }));
  };

  // Handle Add Comment
  const handleAddComment = (issueId: number, content: string, isInternal: boolean) => {
    const newComment: Comment = {
      id: Date.now(),
      issueId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      content,
      isInternalNote: isInternal,
      isFlagged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          comments: [...issue.comments, newComment],
          commentCount: issue.commentCount + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return issue;
    }));
  };

  // Handle Create Issue Report (Full Multi-Entity Relational Creation)
  const handleCreateIssue = (data: {
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
  }) => {
    const selectedCategory = INITIAL_CATEGORIES.find(c => c.id === data.categoryId) || INITIAL_CATEGORIES[0];
    const newIssueId = Date.now();
    const issueCode = `CVX-2026-0${Math.floor(8000 + Math.random() * 1999)}`;
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + selectedCategory.defaultSlaHours * 60 * 60 * 1000).toISOString();

    const newIssue: Issue = {
      id: newIssueId,
      issueCode,
      reporterId: currentUser.id,
      reporterName: currentUser.fullName,
      categoryId: selectedCategory.id,
      category: selectedCategory,
      locationId: Date.now(),
      location: {
        id: Date.now(),
        latitude: data.latitude,
        longitude: data.longitude,
        formattedAddress: data.address,
        ward: data.ward,
        city: 'Metropolis',
        state: 'NY',
        postalCode: '10017',
        createdAt: now.toISOString()
      },
      title: data.title,
      description: data.description,
      status: 'REPORTED',
      priority: data.priority,
      visibility: 'PUBLIC',
      upvoteCount: 1,
      commentCount: 0,
      slaDeadline,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      photos: [
        {
          id: Date.now(),
          issueId: newIssueId,
          photoUrl: data.photoUrl,
          thumbnailUrl: data.photoUrl,
          fileSizeBytes: 2450000,
          mimeType: 'image/jpeg',
          sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          gpsLat: data.latitude,
          gpsLng: data.longitude,
          caption: data.caption || 'Citizen report visual evidence',
          displayOrder: 1,
          uploadedAt: now.toISOString()
        }
      ],
      statusHistory: [
        {
          id: Date.now(),
          issueId: newIssueId,
          previousStatus: null,
          newStatus: 'REPORTED',
          changedByUserId: currentUser.id,
          changedByUserName: currentUser.fullName,
          changedByUserRole: currentUser.role,
          reasonOrNotes: 'Initial grievance report submitted via CivicFix portal.',
          changeTrigger: 'CITIZEN_REPORT',
          createdAt: now.toISOString()
        }
      ],
      assignments: [],
      comments: [],
      resolutionProof: undefined
    };

    setIssues(prev => [newIssue, ...prev]);

    // Send notification
    const newNotification: NotificationRecord = {
      id: Date.now(),
      userId: currentUser.id,
      issueId: newIssueId,
      title: `Grievance Logged: ${issueCode}`,
      message: `Your report has been assigned code ${issueCode} and routed to ${selectedCategory.targetDepartment}.`,
      notificationType: 'STATUS_UPDATE',
      deliveryChannel: 'IN_APP',
      isRead: false,
      createdAt: now.toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Handle Dispatch Crew
  const handleDispatch = (data: {
    issueId: number;
    workerId: number;
    departmentName: string;
    instructions: string;
    deadlineHours: number;
  }) => {
    const worker = INITIAL_USERS.find(u => u.id === data.workerId) || INITIAL_USERS[1];
    const now = new Date();
    const deadline = new Date(now.getTime() + data.deadlineHours * 60 * 60 * 1000).toISOString();

    const newAssignment: Assignment = {
      id: Date.now(),
      issueId: data.issueId,
      assignedToUserId: worker.id,
      assignedToName: worker.fullName,
      assignedToBadge: worker.employeeBadgeNo || 'PW-0000',
      assignedByUserId: currentUser.id,
      assignedByName: currentUser.fullName,
      departmentName: data.departmentName,
      instructions: data.instructions,
      deadline,
      assignmentStatus: 'ASSIGNED',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setIssues(prev => prev.map(issue => {
      if (issue.id === data.issueId) {
        return {
          ...issue,
          status: 'ASSIGNED',
          assignments: [newAssignment, ...issue.assignments],
          statusHistory: [
            ...issue.statusHistory,
            {
              id: Date.now(),
              issueId: issue.id,
              previousStatus: issue.status,
              newStatus: 'ASSIGNED',
              changedByUserId: currentUser.id,
              changedByUserName: currentUser.fullName,
              changedByUserRole: currentUser.role,
              reasonOrNotes: `Field crew dispatched: ${worker.fullName} (${worker.employeeBadgeNo})`,
              changeTrigger: 'DISPATCHER_OVERRIDE',
              createdAt: now.toISOString()
            }
          ],
          updatedAt: now.toISOString()
        };
      }
      return issue;
    }));

    // Notification for worker
    setNotifications(prev => [
      {
        id: Date.now(),
        userId: worker.id,
        issueId: data.issueId,
        title: 'New Municipal Work Order Assigned',
        message: `You have been dispatched to issue at ${data.departmentName}. Deadline: ${new Date(deadline).toLocaleString()}`,
        notificationType: 'WORKER_ASSIGNED',
        deliveryChannel: 'SMS',
        isRead: false,
        createdAt: now.toISOString()
      },
      ...prev
    ]);
  };

  // Handle Submit Resolution Proof
  const handleSubmitResolutionProof = (data: {
    issueId: number;
    workerId: number;
    workDescription: string;
    afterPhotoUrl: string;
    laborHours: number;
    materialsCost: number;
  }) => {
    const now = new Date();

    const proof: ResolutionProof = {
      id: Date.now(),
      issueId: data.issueId,
      workerId: data.workerId,
      workerName: currentUser.fullName,
      workDescription: data.workDescription,
      beforePhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      afterPhotoUrl: data.afterPhotoUrl,
      laborHours: data.laborHours,
      materialsCost: data.materialsCost,
      verificationStatus: 'PENDING_REVIEW',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setIssues(prev => prev.map(issue => {
      if (issue.id === data.issueId) {
        return {
          ...issue,
          status: 'RESOLVED',
          resolutionProof: proof,
          statusHistory: [
            ...issue.statusHistory,
            {
              id: Date.now(),
              issueId: issue.id,
              previousStatus: issue.status,
              newStatus: 'RESOLVED',
              changedByUserId: currentUser.id,
              changedByUserName: currentUser.fullName,
              changedByUserRole: currentUser.role,
              reasonOrNotes: `Resolution proof recorded with after-photo. Labor: ${data.laborHours}h, Cost: $${data.materialsCost}.`,
              changeTrigger: 'FIELD_RESOLUTION',
              createdAt: now.toISOString()
            }
          ],
          updatedAt: now.toISOString()
        };
      }
      return issue;
    }));
  };

  // Handle Verify Issue
  const handleVerifyIssue = (issueId: number) => {
    const now = new Date();

    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const updatedProof = issue.resolutionProof ? {
          ...issue.resolutionProof,
          verificationStatus: 'APPROVED' as const,
          verifiedByUserId: currentUser.id,
          verifiedByName: currentUser.fullName,
          verifiedAt: now.toISOString(),
          citizenSignOff: true
        } : null;

        return {
          ...issue,
          status: 'VERIFIED',
          resolutionProof: updatedProof,
          statusHistory: [
            ...issue.statusHistory,
            {
              id: Date.now(),
              issueId: issue.id,
              previousStatus: 'RESOLVED',
              newStatus: 'VERIFIED',
              changedByUserId: currentUser.id,
              changedByUserName: currentUser.fullName,
              changedByUserRole: currentUser.role,
              reasonOrNotes: 'Repairs inspected, approved, and verified on-site.',
              changeTrigger: 'SUPERVISOR_VERIFY',
              createdAt: now.toISOString()
            }
          ],
          updatedAt: now.toISOString()
        };
      }
      return issue;
    }));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNavigateToSchemaEntity = (tableName: string) => {
    setSelectedSchemaEntity(tableName);
    setActiveTab('schema');
  };

  const fieldWorkers = INITIAL_USERS.filter(u => u.role === 'FIELD_WORKER' || u.role === 'SUPERVISOR');
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        users={INITIAL_USERS}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onReportClick={() => setIsReportModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'app' && (
          <CivicApp
            issues={issues}
            currentUser={currentUser}
            categories={INITIAL_CATEGORIES}
            onUpvote={handleUpvote}
            onAddComment={handleAddComment}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenDispatchModal={(issue) => setDispatchTargetIssue(issue)}
            onOpenResolutionModal={(issue) => setResolutionTargetIssue(issue)}
            onVerifyIssue={handleVerifyIssue}
            onViewSchemaEntity={handleNavigateToSchemaEntity}
          />
        )}

        {activeTab === 'backend' && (
          <BackendViewer />
        )}

        {activeTab === 'ui_flow' && (
          <UiFlowViewer onNavigateToTab={(tab) => setActiveTab(tab as any)} />
        )}

        {activeTab === 'tasks' && (
          <TaskBreakdownViewer onNavigateToTab={(tab) => setActiveTab(tab as any)} />
        )}

        {activeTab === 'api' && (
          <ApiContractViewer onNavigateToTab={(tab) => setActiveTab(tab as any)} />
        )}

        {activeTab === 'schema' && (
          <div className="space-y-8">
            <MermaidViewer onSelectTable={handleNavigateToSchemaEntity} />
            <SchemaExplorer onSelectEntityInER={handleNavigateToSchemaEntity} />
          </div>
        )}

        {activeTab === 'comparison' && (
          <DbComparison />
        )}

        {activeTab === 'testing' && (
          <TestingViewer />
        )}

        {activeTab === 'container' && (
          <ContainerViewer />
        )}

        {activeTab === 'docs' && (
          <DatabaseDocViewer onSelectTab={(tab) => setActiveTab(tab)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-700">CivicFix</span>
            <span>&bull;</span>
            <span>Municipal Infrastructure Tracking &amp; Field Dispatch</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>DB: PostgreSQL 16 (PostGIS)</span>
            <span>Backend: Node.js + Express (25 APIs)</span>
            <span>UX: 20 Screens &bull; 46 Sprinted Tasks</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentUser={currentUser}
        categories={INITIAL_CATEGORIES}
        onSubmit={handleCreateIssue}
      />

      <DispatchModal
        isOpen={!!dispatchTargetIssue}
        onClose={() => setDispatchTargetIssue(null)}
        issue={dispatchTargetIssue}
        workers={fieldWorkers}
        currentDispatcher={currentUser}
        onDispatch={handleDispatch}
      />

      <ResolutionProofModal
        isOpen={!!resolutionTargetIssue}
        onClose={() => setResolutionTargetIssue(null)}
        issue={resolutionTargetIssue}
        worker={currentUser}
        onSubmitProof={handleSubmitResolutionProof}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(authenticatedUser) => {
          setCurrentUser(authenticatedUser);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
