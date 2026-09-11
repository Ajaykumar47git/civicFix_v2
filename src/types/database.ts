export type UserRole = 'CITIZEN' | 'FIELD_WORKER' | 'DISPATCHER' | 'SUPERVISOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: number;
  email: string;
  passwordHash?: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  department?: string | null;
  employeeBadgeNo?: string | null;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 
  | 'REPORTED' 
  | 'UNDER_REVIEW' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'REOPENED';
export type IssueVisibility = 'PUBLIC' | 'CONFIDENTIAL';

export interface IssueCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  targetDepartment: string;
  defaultPriority: IssuePriority;
  defaultSlaHours: number;
  iconName: string;
  colorHex: string;
  isActive: boolean;
  createdAt: string;
}

export interface LocationRecord {
  id: number;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  streetNumber?: string;
  route?: string;
  neighborhood?: string;
  ward: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  createdAt: string;
}

export interface IssuePhoto {
  id: number;
  issueId: number;
  photoUrl: string;
  thumbnailUrl: string;
  caption?: string;
  gpsLat?: number;
  gpsLng?: number;
  displayOrder: number;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  capturedAt?: string;
  uploadedAt: string;
}

export interface IssueStatusHistory {
  id: number;
  issueId: number;
  previousStatus: IssueStatus | null;
  newStatus: IssueStatus;
  changedByUserId: number;
  changedByUserName: string;
  changedByUserRole: UserRole;
  reasonOrNotes?: string;
  changeTrigger: string;
  createdAt: string;
}

export type AssignmentStatus = 
  | 'ASSIGNED' 
  | 'ACCEPTED' 
  | 'EN_ROUTE' 
  | 'ON_SITE' 
  | 'COMPLETED' 
  | 'REASSIGNED' 
  | 'CANCELLED';

export interface Assignment {
  id: number;
  issueId: number;
  assignedToUserId: number;
  assignedToName: string;
  assignedToBadge?: string;
  assignedByUserId: number;
  assignedByName: string;
  departmentName: string;
  assignmentStatus: AssignmentStatus;
  instructions?: string;
  scheduledFor?: string;
  deadline: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'STATUS_UPDATE' 
  | 'WORKER_ASSIGNED' 
  | 'COMMENT_ADDED' 
  | 'RESOLUTION_VERIFIED' 
  | 'SLA_BREACH_ALERT';

export type DeliveryChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'PUSH';

export interface NotificationRecord {
  id: number;
  userId: number;
  issueId?: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  deliveryChannel: DeliveryChannel;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CommentRecord {
  id: number;
  issueId: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  content: string;
  isInternalNote: boolean;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Comment = CommentRecord;

export type VerificationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CITIZEN_DISPUTED';

export interface ResolutionProof {
  id: number;
  issueId: number;
  workerId: number;
  workerName: string;
  verifiedByUserId?: number | null;
  verifiedByName?: string | null;
  workDescription: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  laborHours?: number;
  materialsCost?: number;
  verificationStatus: VerificationStatus;
  citizenFeedback?: string;
  citizenRating?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: number;
  issueCode: string;
  reporterId: number;
  reporterName: string;
  reporterAvatar?: string;
  categoryId: number;
  category: IssueCategory;
  locationId: number;
  location: LocationRecord;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  visibility: IssueVisibility;
  upvoteCount: number;
  commentCount: number;
  slaDeadline: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  photos: IssuePhoto[];
  assignments: Assignment[];
  statusHistory: IssueStatusHistory[];
  comments: CommentRecord[];
  resolutionProof?: ResolutionProof;
}

export interface TableColumnMetadata {
  name: string;
  mysqlType: string;
  javaType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  fkTarget?: string;
  isNullable: boolean;
  defaultValue?: string;
  constraints: string[];
  description: string;
}

export interface TableIndexMetadata {
  name: string;
  type: 'PRIMARY' | 'UNIQUE' | 'BTREE' | 'SPATIAL' | 'FULLTEXT';
  columns: string[];
  purpose: string;
}

export interface TableSchemaMetadata {
  tableName: string;
  displayName: string;
  description: string;
  primaryKey: string;
  columns: TableColumnMetadata[];
  indexes: TableIndexMetadata[];
  foreignKeys: {
    column: string;
    targetTable: string;
    targetColumn: string;
    onDelete: string;
    onUpdate: string;
  }[];
  normalizationNotes: string;
  javaEntityName: string;
}
