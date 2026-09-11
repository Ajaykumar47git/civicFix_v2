/**
 * Issue Repository Interface & In-Memory Storage
 */
import { IssueEntity, IssueCategoryEntity, IssueStatus, IssuePriority } from '../entities/Issue.entity';
import { GetIssuesQueryDto, PaginatedIssuesResponseDto } from '../dtos/issue.dto';

export interface IIssueRepository {
  findById(id: string): Promise<IssueEntity | null>;
  findByCode(issueCode: string): Promise<IssueEntity | null>;
  create(issue: IssueEntity): Promise<IssueEntity>;
  update(id: string, updates: Partial<IssueEntity>): Promise<IssueEntity | null>;
  listByReporter(reporterId: string, query?: GetIssuesQueryDto): Promise<PaginatedIssuesResponseDto>;
  listAll(query?: GetIssuesQueryDto): Promise<PaginatedIssuesResponseDto>;
  getCategoryById(id: number): Promise<IssueCategoryEntity | null>;
  listCategories(): Promise<IssueCategoryEntity[]>;
}

export class InMemoryIssueRepository implements IIssueRepository {
  private issues: Map<string, IssueEntity> = new Map();
  private categories: Map<number, IssueCategoryEntity> = new Map();

  constructor() {
    this.seedCategories();
    this.seedDefaultIssues();
  }

  private seedCategories() {
    const defaultCategories: IssueCategoryEntity[] = [
      { id: 1, code: 'POTHOLE', name: 'Roads & Pavements', defaultPriority: IssuePriority.HIGH, defaultSlaHours: 48, departmentId: 1 },
      { id: 2, code: 'WATER_LEAK', name: 'Water & Sewage', defaultPriority: IssuePriority.EMERGENCY, defaultSlaHours: 24, departmentId: 2 },
      { id: 3, code: 'STREETLIGHT', name: 'Street Lighting', defaultPriority: IssuePriority.MEDIUM, defaultSlaHours: 72, departmentId: 1 },
      { id: 4, code: 'GARBAGE', name: 'Sanitation & Waste', defaultPriority: IssuePriority.MEDIUM, defaultSlaHours: 48, departmentId: 3 },
      { id: 5, code: 'PARKS', name: 'Parks & Trees', defaultPriority: IssuePriority.LOW, defaultSlaHours: 96, departmentId: 4 },
      { id: 6, code: 'GRAFFITI', name: 'Public Property & Blight', defaultPriority: IssuePriority.LOW, defaultSlaHours: 120, departmentId: 5 }
    ];
    defaultCategories.forEach(c => this.categories.set(c.id, c));
  }

  private seedDefaultIssues() {
    const seed: IssueEntity[] = [
      {
        id: 'iss-8941',
        issueCode: 'CVX-2026-08142',
        title: 'Water Main Rupture Flooding Intersection',
        description: 'Large volume of pressurized water erupting from subterranean main near storm drain. Roadway cracking.',
        categoryId: 2,
        priority: IssuePriority.EMERGENCY,
        status: IssueStatus.ASSIGNED,
        latitude: 37.7749,
        longitude: -122.4194,
        address: '742 Evergreen Terrace, Sector 4',
        landmark: 'Opposite Springfield Elementary',
        wardId: 4,
        reportedById: 'usr-cit-01',
        photoReferences: [
          {
            id: 'pht-1',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=60',
            sha256Hash: 'a7b3c2e1f40958673a98ef12bc430852',
            uploadedAt: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        slaDeadline: new Date(Date.now() + 82800000).toISOString(),
        isSlaBreached: false,
        upvotesCount: 14,
        assignedWorkerId: 'usr-fld-01',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'iss-8942',
        issueCode: 'CVX-2026-08140',
        title: 'Deep Pothole with Exposed Rebar',
        description: 'Pothole approximately 10 inches deep causing vehicle axle damage and tire blowouts in right-turn lane.',
        categoryId: 1,
        priority: IssuePriority.HIGH,
        status: IssueStatus.REPORTED,
        latitude: 37.7833,
        longitude: -122.4167,
        address: '1044 Market Street, Downtown Central',
        wardId: 4,
        reportedById: 'usr-cit-01',
        photoReferences: [
          {
            id: 'pht-2',
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60',
            sha256Hash: '98fa21e5cd840134bc218903aa54091a',
            uploadedAt: new Date(Date.now() - 7200000).toISOString()
          }
        ],
        slaDeadline: new Date(Date.now() + 165600000).toISOString(),
        isSlaBreached: false,
        upvotesCount: 8,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    seed.forEach(iss => this.issues.set(iss.id, iss));
  }

  async findById(id: string): Promise<IssueEntity | null> {
    return this.issues.get(id) || null;
  }

  async findByCode(issueCode: string): Promise<IssueEntity | null> {
    const target = issueCode.toUpperCase().trim();
    for (const issue of this.issues.values()) {
      if (issue.issueCode.toUpperCase().trim() === target) {
        return issue;
      }
    }
    return null;
  }

  async create(issue: IssueEntity): Promise<IssueEntity> {
    this.issues.set(issue.id, { ...issue });
    return issue;
  }

  async update(id: string, updates: Partial<IssueEntity>): Promise<IssueEntity | null> {
    const existing = this.issues.get(id);
    if (!existing) return null;
    const updated: IssueEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.issues.set(id, updated);
    return updated;
  }

  async listByReporter(reporterId: string, query?: GetIssuesQueryDto): Promise<PaginatedIssuesResponseDto> {
    let items = Array.from(this.issues.values()).filter(i => i.reportedById === reporterId);

    if (query?.status) items = items.filter(i => i.status === query.status);
    if (query?.categoryId) items = items.filter(i => i.categoryId === Number(query.categoryId));
    if (query?.search) {
      const q = query.search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.issueCode.toLowerCase().includes(q));
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = query?.page || 1;
    const pageSize = query?.pageSize || 10;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    return { items: paginatedItems, page, pageSize, totalItems, totalPages };
  }

  async listAll(query?: GetIssuesQueryDto): Promise<PaginatedIssuesResponseDto> {
    let items = Array.from(this.issues.values());

    if (query?.status) items = items.filter(i => i.status === query.status);
    if (query?.categoryId) items = items.filter(i => i.categoryId === Number(query.categoryId));
    if (query?.wardId) items = items.filter(i => i.wardId === Number(query.wardId));
    if (query?.priority) items = items.filter(i => i.priority === query.priority);
    if (query?.search) {
      const q = query.search.toLowerCase();
      items = items.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.issueCode.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = query?.page || 1;
    const pageSize = query?.pageSize || 20;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    return { items: paginatedItems, page, pageSize, totalItems, totalPages };
  }

  async getCategoryById(id: number): Promise<IssueCategoryEntity | null> {
    return this.categories.get(id) || null;
  }

  async listCategories(): Promise<IssueCategoryEntity[]> {
    return Array.from(this.categories.values());
  }
}
