import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiry,
} from '../utils/jwt.util';
import {
  RegisterDTO,
  LoginDTO,
  AuthResponse,
  TokenPair,
  JWTPayload,
} from '../types/auth.types';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: RegisterDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || Role.STUDENT,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokenPair(user, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar || undefined,
      },
      tokens,
    };
  }

  async login(data: LoginDTO, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokenPair(user, ipAddress, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar || undefined,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<TokenPair> {
    // Verify refresh token
    let payload: JWTPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked) {
      throw new Error('Refresh token revoked or not found');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Check if user is still active
    if (!storedToken.user.isActive || storedToken.user.deletedAt) {
      throw new Error('User account is not active');
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new token pair
    return this.generateTokenPair(storedToken.user, ipAddress, userAgent);
  }

  async logout(refreshToken: string): Promise<void> {
    // Revoke refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    // Revoke all refresh tokens for user
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  private async generateTokenPair(
    user: { id: string; email: string; role: Role; isActive: boolean },
    ipAddress?: string,
    userAgent?: string
  ): Promise<TokenPair> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getTokenExpiry(refreshToken),
        ipAddress,
        userAgent,
      },
    });

    return { accessToken, refreshToken };
  }

  async cleanupExpiredTokens(): Promise<void> {
    // Delete expired tokens (run as cron job)
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true, updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // 30 days old
        ],
      },
    });
  }
}
