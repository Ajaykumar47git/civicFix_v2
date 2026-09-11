/**
 * Authentication Service Layer
 */
import { IUserRepository } from '../repositories/user.repository';
import { UserEntity, UserRole, SafeUser } from '../entities/User.entity';
import { RegisterRequestDto, RegisterResponseDto, LoginRequestDto, LoginResponseDto, TokenPayloadDto } from '../dtos/auth.dto';
import { ApiError } from '../utils/ApiError';
import { hashPassword, generateSalt, verifyPassword, signJwt, verifyJwt } from '../utils/crypto';

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    // 1. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dto.email || !emailRegex.test(dto.email)) {
      throw ApiError.badRequest('A valid email address is required.', 'INVALID_EMAIL');
    }

    // 2. Validate Password strength (Min 8 chars, 1 uppercase, 1 digit)
    if (!dto.password || dto.password.length < 8 || !/[A-Z]/.test(dto.password) || !/[0-9]/.test(dto.password)) {
      throw ApiError.badRequest(
        'Password must be at least 8 characters and include at least one uppercase letter and one number.',
        'WEAK_PASSWORD'
      );
    }

    // 3. Validate Full Name
    if (!dto.fullName || dto.fullName.trim().length < 2) {
      throw ApiError.badRequest('Full legal name must be at least 2 characters.', 'INVALID_NAME');
    }

    // 4. Validate Ward ID (1 to 20)
    if (!dto.wardId || dto.wardId < 1 || dto.wardId > 20) {
      throw ApiError.badRequest('Valid council ward number between 1 and 20 is required.', 'INVALID_WARD');
    }

    // 5. Check if email already exists
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.', 'EMAIL_EXISTS');
    }

    // 6. Salt and Hash Password
    const salt = generateSalt(16);
    const passwordHash = hashPassword(dto.password, salt);

    const newUser: UserEntity = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      salt,
      fullName: dto.fullName.trim(),
      phone: dto.phone?.trim(),
      wardId: dto.wardId,
      role: dto.role || UserRole.CITIZEN,
      badgeNumber: dto.badgeNumber,
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await this.userRepo.create(newUser);
    return {
      message: 'Citizen account registered successfully.',
      user: this.toSafeUser(saved)
    };
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    if (!dto.email || !dto.password) {
      throw ApiError.badRequest('Email and password are required.', 'MISSING_CREDENTIALS');
    }

    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const isValidPassword = verifyPassword(dto.password, user.salt, user.passwordHash);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const tokenPayload: TokenPayloadDto = {
      userId: user.id,
      email: user.email,
      role: user.role,
      wardId: user.wardId,
      fullName: user.fullName
    };

    const accessToken = signJwt(tokenPayload, 900); // 15 mins
    const refreshToken = signJwt({ userId: user.id, type: 'refresh' }, 604800); // 7 days

    await this.userRepo.update(user.id, { refreshTokenHash: refreshToken });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: this.toSafeUser(user)
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token required', 'MISSING_REFRESH_TOKEN');
    }

    try {
      const decoded = verifyJwt<{ userId: string; type: string }>(refreshToken);
      if (decoded.type !== 'refresh') {
        throw ApiError.unauthorized('Invalid token type', 'INVALID_TOKEN_TYPE');
      }

      const user = await this.userRepo.findById(decoded.userId);
      if (!user || !user.isActive || user.refreshTokenHash !== refreshToken) {
        throw ApiError.unauthorized('Refresh token is invalid or has been revoked', 'TOKEN_REVOKED');
      }

      const payload: TokenPayloadDto = {
        userId: user.id,
        email: user.email,
        role: user.role,
        wardId: user.wardId,
        fullName: user.fullName
      };

      const accessToken = signJwt(payload, 900);
      return { accessToken, expiresIn: 900 };
    } catch {
      throw ApiError.unauthorized('Refresh token expired or tampered', 'EXPIRED_REFRESH_TOKEN');
    }
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found', 'USER_NOT_FOUND');
    }
    return this.toSafeUser(user);
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: undefined });
  }

  toSafeUser(user: UserEntity): SafeUser {
    const { passwordHash, salt, refreshTokenHash, ...safe } = user;
    return safe;
  }
}
