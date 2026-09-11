/**
 * Authentication Data Transfer Objects (DTOs)
 */
import { UserRole, SafeUser } from '../entities/User.entity';

export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  wardId: number;
  role?: UserRole; // Default CITIZEN
  badgeNumber?: string;
}

export interface RegisterResponseDto {
  message: string;
  user: SafeUser;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface TokenPayloadDto {
  userId: string;
  email: string;
  role: UserRole;
  wardId: number;
  fullName: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // 900 seconds (15 mins)
  user: SafeUser;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}
