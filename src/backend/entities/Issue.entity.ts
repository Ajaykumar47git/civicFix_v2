/**
 * Issue Entity & Domain Enums for CivicFix Issue Reporting Module
 */

export enum IssueStatus {
  REPORTED = 'REPORTED',
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export interface IssueCategoryEntity {
  id: number;
  code: string;
  name: string;
  defaultPriority: IssuePriority;
  defaultSlaHours: number;
  departmentId: number;
}

export interface PhotoReference {
  id: string;
  url: string;
  caption?: string;
  sha256Hash: string;
  uploadedAt: string;
}

export interface IssueEntity {
  id: string;
  issueCode: string; // e.g. CVX-2026-08142
  title: string;
  description: string;
  categoryId: number;
  priority: IssuePriority;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  wardId: number;
  reportedById: string;
  photoReferences: PhotoReference[];
  slaDeadline: string;
  isSlaBreached: boolean;
  upvotesCount: number;
  assignedWorkerId?: string;
  createdAt: string;
  updatedAt: string;
}
