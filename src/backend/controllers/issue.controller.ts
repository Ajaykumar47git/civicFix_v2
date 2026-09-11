/**
 * Civic Issue Reporting Controller Layer
 */
import { IssueService } from '../services/issue.service';
import { CreateIssueDto, GetIssuesQueryDto } from '../dtos/issue.dto';
import { AuthenticatedRequest, authenticate, requireRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User.entity';
import { handleException } from '../middlewares/errorHandler.middleware';

export class IssueController {
  constructor(private issueService: IssueService) {}

  async createIssue(req: AuthenticatedRequest, body: CreateIssueDto) {
    try {
      const user = authenticate(req);
      requireRoles(user, [UserRole.CITIZEN, UserRole.ADMIN]);
      const result = await this.issueService.createIssue(user.userId, user.wardId, body);
      return { status: 201, data: result };
    } catch (err) {
      return handleException(err, '/api/v1/citizen/issues');
    }
  }

  async getMyIssues(req: AuthenticatedRequest, query?: GetIssuesQueryDto) {
    try {
      const user = authenticate(req);
      const result = await this.issueService.getMyIssues(user.userId, query);
      return { status: 200, data: result };
    } catch (err) {
      return handleException(err, '/api/v1/citizen/issues');
    }
  }

  async getIssueById(req: AuthenticatedRequest, id: string) {
    try {
      authenticate(req);
      const result = await this.issueService.getIssueById(id);
      return { status: 200, data: result };
    } catch (err) {
      return handleException(err, `/api/v1/citizen/issues/${id}`);
    }
  }

  async trackPublicIssue(code: string) {
    try {
      const result = await this.issueService.getIssueByCode(code);
      return { status: 200, data: result };
    } catch (err) {
      return handleException(err, `/api/v1/public/issues/${code}`);
    }
  }

  async getCategories() {
    try {
      const result = await this.issueService.getCategories();
      return { status: 200, data: result };
    } catch (err) {
      return handleException(err, '/api/v1/public/categories');
    }
  }
}
