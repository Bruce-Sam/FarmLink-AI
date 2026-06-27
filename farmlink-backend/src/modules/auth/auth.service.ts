import { type Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/api-error';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signAccessToken } from '../../utils/jwt';
import { normalizeEmail } from '../../utils/normalize';
import { safeUserSelect, type SafeUser } from '../users/user.select';
import { type LoginInput, type RegisterInput } from './auth.schema';

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: input.phoneNumber },
          ...(input.email ? [{ email: input.email }] : []),
        ],
      },
      select: { id: true },
    });

    if (existing) {
      throw ApiError.conflict('An account with this phone number or email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        email: input.email,
        passwordHash,
        role: input.role as Role,
      },
      select: safeUserSelect,
    });

    logger.info({ userId: user.id, role: user.role }, 'User registered');

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return { user, accessToken };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const isEmail = input.identifier.includes('@');
    const where = isEmail
      ? { email: normalizeEmail(input.identifier) }
      : { phoneNumber: input.identifier };

    const user = await prisma.user.findUnique({
      where,
      select: { ...safeUserSelect, passwordHash: true },
    });

    // Use a constant generic message to avoid leaking which factor was wrong.
    if (!user) {
      logger.warn({ identifier: isEmail ? 'email' : 'phone' }, 'Login failed: unknown account');
      throw ApiError.unauthorized('Invalid credentials');
    }

    const passwordOk = await verifyPassword(input.password, user.passwordHash);
    if (!passwordOk) {
      logger.warn({ userId: user.id }, 'Login failed: invalid password');
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw ApiError.forbidden('Your account is not active. Please contact support.');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    return { user: safeUser, accessToken };
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }
}

export const authService = new AuthService();
