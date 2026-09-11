/**
 * Authentication & Authorization Middlewares
 */
import { UserRole } from '../entities/User.entity';
import { TokenPayloadDto } from '../dtos/auth.dto';
import { verifyJwt } from '../utils/crypto';
import { ApiError } from '../utils/ApiError';

export interface AuthenticatedRequest {
  headers: {
    authorization?: string;
    [key: string]: any;
  };
  user?: TokenPayloadDto;
  [key: string]: any;
}

export function authenticate(req: AuthenticatedRequest): TokenPayloadDto {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authorization header missing or invalid Bearer scheme.');
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = verifyJwt<TokenPayloadDto>(token);
    req.user = payload;
    return payload;
  } catch (err: any) {
    throw ApiError.unauthorized(`Invalid or expired token: ${err.message || 'Signature mismatch'}`);
  }
}

export function requireRoles(user: TokenPayloadDto | undefined, allowedRoles: UserRole[]) {
  if (!user) {
    throw ApiError.unauthorized('Authentication required.');
  }

  if (!allowedRoles.includes(user.role)) {
    throw ApiError.forbidden(
      `Access denied. Required municipal roles: [${allowedRoles.join(', ')}]. Active role: ${user.role}.`
    );
  }
}
