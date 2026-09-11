/**
 * CivicFix Backend Application Container
 * Assembles Repositories, Services, and Controllers (Clean Dependency Injection)
 */
import { InMemoryUserRepository } from './repositories/user.repository';
import { InMemoryIssueRepository } from './repositories/issue.repository';
import { AuthService } from './services/auth.service';
import { IssueService } from './services/issue.service';
import { AuthController } from './controllers/auth.controller';
import { IssueController } from './controllers/issue.controller';
import { civicFixSwaggerSpec } from './swagger/swaggerSpec';

export class CivicFixBackend {
  public userRepo: InMemoryUserRepository;
  public issueRepo: InMemoryIssueRepository;
  public authService: AuthService;
  public issueService: IssueService;
  public authController: AuthController;
  public issueController: IssueController;
  public swaggerSpec = civicFixSwaggerSpec;

  constructor() {
    this.userRepo = new InMemoryUserRepository();
    this.issueRepo = new InMemoryIssueRepository();
    this.authService = new AuthService(this.userRepo);
    this.issueService = new IssueService(this.issueRepo);
    this.authController = new AuthController(this.authService);
    this.issueController = new IssueController(this.issueService);
  }
}

// Global Singleton for in-app client & test dispatch
export const backend = new CivicFixBackend();
