/**
 * Civic Issue Reporting Service Layer
 */
import { IIssueRepository } from '../repositories/issue.repository';
import { IssueEntity, IssueStatus, IssuePriority, PhotoReference } from '../entities/Issue.entity';
import { CreateIssueDto, CreateIssueResponseDto, GetIssuesQueryDto, PaginatedIssuesResponseDto } from '../dtos/issue.dto';
import { ApiError } from '../utils/ApiError';

export class IssueService {
  constructor(private issueRepo: IIssueRepository) {}

  async createIssue(reporterId: string, reporterWard: number, dto: CreateIssueDto): Promise<CreateIssueResponseDto> {
    // 1. Validate Category
    if (!dto.categoryId) {
      throw ApiError.badRequest('Category selection is mandatory.', 'MISSING_CATEGORY');
    }
    const category = await this.issueRepo.getCategoryById(Number(dto.categoryId));
    if (!category) {
      throw ApiError.badRequest(`Category ID ${dto.categoryId} does not exist in municipal registry.`, 'INVALID_CATEGORY');
    }

    // 2. Validate Title (10 to 150 characters)
    if (!dto.title || dto.title.trim().length < 10 || dto.title.trim().length > 150) {
      throw ApiError.badRequest('Issue title must be between 10 and 150 characters.', 'INVALID_TITLE');
    }

    // 3. Validate Description (20 to 2000 characters)
    if (!dto.description || dto.description.trim().length < 20 || dto.description.trim().length > 2000) {
      throw ApiError.badRequest('Issue description must provide at least 20 characters of detail (max 2000).', 'INVALID_DESCRIPTION');
    }

    // 4. Validate Coordinates (Municipal Boundary Check)
    if (typeof dto.latitude !== 'number' || typeof dto.longitude !== 'number') {
      throw ApiError.badRequest('Valid GPS coordinates (latitude and longitude numbers) are required.', 'INVALID_COORDINATES');
    }
    // San Francisco / Municipal bounds check: Lat ~37.6 to 37.9, Lng ~-122.6 to -122.3
    if (dto.latitude < 37.0 || dto.latitude > 38.5 || dto.longitude < -123.0 || dto.longitude > -121.5) {
      throw ApiError.badRequest(
        `Selected coordinates (${dto.latitude}, ${dto.longitude}) fall outside municipal jurisdiction boundaries.`,
        'OUT_OF_BOUNDS'
      );
    }

    // 5. Validate Street Address
    if (!dto.address || dto.address.trim().length < 5) {
      throw ApiError.badRequest('Valid street address or physical landmark is required.', 'INVALID_ADDRESS');
    }

    // 6. Generate Issue Code: CVX-YYYY-XXXXX (e.g. CVX-2026-08142)
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const issueCode = `CVX-${currentYear}-${randomSuffix}`;

    // 7. Calculate SLA Deadline from Category
    const slaHours = category.defaultSlaHours;
    const slaDeadline = new Date(Date.now() + slaHours * 3600000).toISOString();

    // 8. Prepare Photo References
    const photoReferences: PhotoReference[] = (dto.photoUrls || []).map((url, idx) => ({
      id: `pht-${Date.now().toString(36)}-${idx}`,
      url,
      sha256Hash: `hash_${Date.now()}_${idx}`,
      uploadedAt: new Date().toISOString()
    }));

    const newIssue: IssueEntity = {
      id: `iss-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      issueCode,
      title: dto.title.trim(),
      description: dto.description.trim(),
      categoryId: category.id,
      priority: dto.priority || category.defaultPriority,
      status: IssueStatus.REPORTED,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address.trim(),
      landmark: dto.landmark?.trim(),
      wardId: dto.wardId || reporterWard || 1,
      reportedById: reporterId,
      photoReferences,
      slaDeadline,
      isSlaBreached: false,
      upvotesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await this.issueRepo.create(newIssue);

    return {
      message: 'Civic grievance logged successfully. Municipal SLA clock started.',
      issue: saved
    };
  }

  async getMyIssues(reporterId: string, query?: GetIssuesQueryDto): Promise<PaginatedIssuesResponseDto> {
    return this.issueRepo.listByReporter(reporterId, query);
  }

  async getIssueById(id: string): Promise<IssueEntity> {
    const issue = await this.issueRepo.findById(id);
    if (!issue) {
      throw ApiError.notFound(`Issue ticket '${id}' not found.`, 'ISSUE_NOT_FOUND');
    }
    return issue;
  }

  async getIssueByCode(issueCode: string): Promise<IssueEntity> {
    const issue = await this.issueRepo.findByCode(issueCode);
    if (!issue) {
      throw ApiError.notFound(`No civic record found with tracking code '${issueCode}'.`, 'TICKET_NOT_FOUND');
    }
    return issue;
  }

  async listPublicIssues(query?: GetIssuesQueryDto): Promise<PaginatedIssuesResponseDto> {
    return this.issueRepo.listAll(query);
  }

  async getCategories() {
    return this.issueRepo.listCategories();
  }
}
