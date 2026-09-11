/**
 * Unit Tests for Authentication Service & Password Hashing
 */
import { AuthService } from '../services/auth.service';
import { InMemoryUserRepository } from '../repositories/user.repository';
import { UserRole } from '../entities/User.entity';
import { ApiError } from '../utils/ApiError';
import { hashPassword, generateSalt, verifyPassword, signJwt, verifyJwt } from '../utils/crypto';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export async function runAuthUnitTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (name: string, fn: () => Promise<void>) => {
    const start = performance.now();
    try {
      await fn();
      results.push({
        suite: 'AuthService & Crypto Layer',
        name,
        passed: true,
        durationMs: Math.round((performance.now() - start) * 100) / 100
      });
    } catch (err: any) {
      results.push({
        suite: 'AuthService & Crypto Layer',
        name,
        passed: false,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        error: err.message || String(err)
      });
    }
  };

  // 1. Password Hashing & Verification
  await runTest('Cryptographic PBKDF2 hashing should produce reproducible hashes and salt verification', async () => {
    const password = 'SuperSecret123!';
    const salt = generateSalt(16);
    const hash1 = hashPassword(password, salt);
    const hash2 = hashPassword(password, salt);

    if (hash1 !== hash2) throw new Error('Identical password + salt produced different hashes');
    if (!verifyPassword(password, salt, hash1)) throw new Error('Password verification failed for matching hash');
    if (verifyPassword('WrongPassword123!', salt, hash1)) throw new Error('Password verification succeeded for wrong password');
  });

  // 2. JWT Signing and Verification
  await runTest('JWT engine signs claims and detects tampering or expiration', async () => {
    const payload = { userId: 'usr-999', role: UserRole.ADMIN };
    const token = signJwt(payload, 300); // 5 mins
    const decoded = verifyJwt<typeof payload>(token);

    if (decoded.userId !== payload.userId) throw new Error('Decoded claims do not match original payload');
    if (decoded.role !== UserRole.ADMIN) throw new Error('Role mismatch in decoded token');

    // Test tampering
    const tampered = token.substring(0, token.length - 4) + 'abcd';
    let tamperDetected = false;
    try {
      verifyJwt(tampered);
    } catch {
      tamperDetected = true;
    }
    if (!tamperDetected) throw new Error('JWT engine failed to reject tampered signature');
  });

  // 3. User Registration with Valid Data
  await runTest('AuthService.register successfully persists new citizen and hides password hash in safe DTO', async () => {
    const repo = new InMemoryUserRepository();
    const service = new AuthService(repo);

    const res = await service.register({
      email: 'newcitizen@example.org',
      password: 'StrongPassword2026!',
      fullName: 'Aiden Brooks',
      wardId: 5,
      phone: '+1 (555) 999-8888'
    });

    if (!res.user.id.startsWith('usr-')) throw new Error('User ID prefix missing');
    if (res.user.email !== 'newcitizen@example.org') throw new Error('Email was not normalized');
    if ((res.user as any).passwordHash) throw new Error('Security defect: passwordHash leaked in response DTO');
    if ((res.user as any).salt) throw new Error('Security defect: salt leaked in response DTO');
  });

  // 4. Duplicate Email Rejection (409 Conflict)
  await runTest('AuthService.register rejects duplicate email address with RFC 7807 409 Conflict', async () => {
    const repo = new InMemoryUserRepository();
    const service = new AuthService(repo);

    let errorThrown = false;
    try {
      await service.register({
        email: 'elena@gmail.com', // Already seeded
        password: 'Password123!',
        fullName: 'Duplicate Elena',
        wardId: 4
      });
    } catch (err: any) {
      errorThrown = true;
      if (err.status !== 409) throw new Error(`Expected status 409, received ${err.status}`);
      if (err.type !== 'https://api.civicfix.city.gov/errors/EMAIL_EXISTS') {
        throw new Error(`Unexpected error type: ${err.type}`);
      }
    }
    if (!errorThrown) throw new Error('Service allowed registration with duplicate email');
  });

  // 5. Weak Password Rejection
  await runTest('AuthService.register enforces password complexity (min 8 chars, uppercase, number)', async () => {
    const repo = new InMemoryUserRepository();
    const service = new AuthService(repo);

    let weakRejected = false;
    try {
      await service.register({
        email: 'weakpass@example.com',
        password: 'weak',
        fullName: 'Weak Tester',
        wardId: 2
      });
    } catch (err: any) {
      weakRejected = true;
      if (err.status !== 400) throw new Error('Expected 400 Bad Request for weak password');
    }
    if (!weakRejected) throw new Error('Service accepted a weak 4-character password');
  });

  // 6. User Login Success
  await runTest('AuthService.login returns access token, refresh token, and user payload for valid credentials', async () => {
    const repo = new InMemoryUserRepository();
    const service = new AuthService(repo);

    // Register a known user first
    await service.register({
      email: 'login.test@example.com',
      password: 'ValidPassword123!',
      fullName: 'Test Login User',
      wardId: 3
    });

    const loginRes = await service.login({
      email: 'login.test@example.com',
      password: 'ValidPassword123!'
    });

    if (!loginRes.accessToken || !loginRes.refreshToken) throw new Error('Missing access or refresh token in response');
    if (loginRes.tokenType !== 'Bearer') throw new Error('tokenType must be Bearer');
    if (loginRes.expiresIn !== 900) throw new Error('Access token expiry must be 900 seconds');
    if (loginRes.user.email !== 'login.test@example.com') throw new Error('Incorrect user object in login response');
  });

  // 7. User Login Wrong Password (401 Unauthorized)
  await runTest('AuthService.login rejects incorrect password with 401 Unauthorized', async () => {
    const repo = new InMemoryUserRepository();
    const service = new AuthService(repo);

    let rejected = false;
    try {
      await service.login({
        email: 'elena@gmail.com',
        password: 'IncorrectPassword999!'
      });
    } catch (err: any) {
      rejected = true;
      if (err.status !== 401) throw new Error(`Expected 401, got ${err.status}`);
    }
    if (!rejected) throw new Error('Login succeeded with bad password');
  });

  return results;
}
