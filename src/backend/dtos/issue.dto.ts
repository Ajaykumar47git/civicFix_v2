/**
 * Issue Reporting Data Transfer Objects (DTOs)
 */
import { IssuePriority, IssueStatus, IssueEntity, PhotoReference } from '../entities/Issue.entity';

export interface CreateIssueDto {
  categoryId: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  wardId?: number;
  priority?: IssuePriority;
  photoUrls?: string[];
}

export interface CreateIssueResponseDto {
  message: string;
  issue: IssueEntity;
}

export interface GetIssuesQueryDto {
  status?: IssueStatus;
  categoryId?: number;
  wardId?: number;
  priority?: IssuePriority;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PaginatedIssuesResponseDto {
  items: IssueEntity[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
