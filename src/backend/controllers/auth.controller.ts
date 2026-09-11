/**
 * Authentication Controller Layer
 */
import { AuthService } from '../services/auth.service';
import { RegisterRequestDto, LoginRequestDto, RefreshTokenRequestDto } from '../dtos/auth.dto';
import { AuthenticatedRequest, authenticate } from '../middlewares/auth.middleware';
import { handleException } from '../middlewares/errorHandler.middleware';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(body: RegisterRequestDto) {
    try {
      const result = await this.authService.register(body);
      return { status: 201, data: result };
    } catch (err) {
      return handleException(err, '/api/v1/auth/register');
    }
  }

  async login(body: LoginRequestDto) {
    try {
      const result = await this.authService.login(body);
      return { status: 200, data: result };
    } catch (err) {
      return handleException(err, '/api/v1/auth/login');
    }
  }

  async getCurrentUser(req: AuthenticatedRequest) {
    try {
      const user = authenticate(req);
      const profile = await this.authService.getProfile(user.userId);
      return { status: 200, data: profile };
    } catch (err) {
      return handleException(err, '/api/v1/auth/me');
    }
  }

  async refreshToken(body: RefreshTokenRequestDto) {
    try {
      const result = await this.authService.refreshToken(body?.refreshToken);
      return { status: 200, data: result };
    } catch (err) {
      return handleException(err, '/api/v1/auth/refresh-token');
    }
  }

  async logout(req: AuthenticatedRequest) {
    try {
      const user = authenticate(req);
      await this.authService.logout(user.userId);
      return { status: 200, data: { message: 'Logged out successfully.' } };
    } catch (err) {
      return handleException(err, '/api/v1/auth/logout');
    }
  }
}
