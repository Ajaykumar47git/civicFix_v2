/**
 * User Repository Interface & In-Memory Storage
 */
import { UserEntity, UserRole } from '../entities/User.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null>;
  listAll(): Promise<UserEntity[]>;
}

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Demo accounts
    const defaultUsers: UserEntity[] = [
      {
        id: 'usr-cit-01',
        email: 'elena@gmail.com',
        fullName: 'Elena Rostova',
        passwordHash: 'c74f51e12739343714dfb07b3fa1d8ae0a56f62a4d3ad8fcf61f4356c3822180', // pbkdf2 hash of Password123!
        salt: 'demo_salt_elena_123',
        phone: '+1 (555) 234-5678',
        wardId: 4,
        role: UserRole.CITIZEN,
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'usr-dsp-01',
        email: 'marcus@civic.gov',
        fullName: 'Marcus Vance',
        passwordHash: 'c74f51e12739343714dfb07b3fa1d8ae0a56f62a4d3ad8fcf61f4356c3822180',
        salt: 'demo_salt_elena_123',
        phone: '+1 (555) 345-6789',
        wardId: 4,
        role: UserRole.DISPATCHER,
        badgeNumber: 'DSP-8841',
        departmentId: 1,
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 'usr-fld-01',
        email: 'carlos@civic.gov',
        fullName: 'Carlos Mendoza',
        passwordHash: 'c74f51e12739343714dfb07b3fa1d8ae0a56f62a4d3ad8fcf61f4356c3822180',
        salt: 'demo_salt_elena_123',
        phone: '+1 (555) 456-7890',
        wardId: 4,
        role: UserRole.FIELD_WORKER,
        badgeNumber: 'TECH-409',
        departmentId: 1,
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 'usr-adm-01',
        email: 'admin@civic.gov',
        fullName: 'Director Sarah Jenkins',
        passwordHash: 'c74f51e12739343714dfb07b3fa1d8ae0a56f62a4d3ad8fcf61f4356c3822180',
        salt: 'demo_salt_elena_123',
        phone: '+1 (555) 123-4567',
        wardId: 1,
        role: UserRole.ADMIN,
        badgeNumber: 'ADM-001',
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 90 * 86400000).toISOString()
      }
    ];

    defaultUsers.forEach(u => this.users.set(u.id, u));
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase().trim() === normalized) {
        return user;
      }
    }
    return null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    this.users.set(user.id, { ...user });
    return user;
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated: UserEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.users.set(id, updated);
    return updated;
  }

  async listAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values());
  }
}
