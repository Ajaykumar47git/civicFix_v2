/**
 * User Entity & Domain Enums for CivicFix Authentication Module
 */

export enum UserRole {
  CITIZEN = 'CITIZEN',
  FIELD_WORKER = 'FIELD_WORKER',
  DISPATCHER = 'DISPATCHER',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN'
}

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  fullName: string;
  phone?: string;
  wardId: number;
  role: UserRole;
  badgeNumber?: string;
  departmentId?: number;
  isVerified: boolean;
  isActive: boolean;
  refreshTokenHash?: string;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<UserEntity, 'passwordHash' | 'salt' | 'refreshTokenHash'>;
