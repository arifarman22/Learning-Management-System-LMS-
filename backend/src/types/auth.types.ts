import { Role as PrismaRole } from '@prisma/client';

export type Role = PrismaRole;
export const Role = PrismaRole;

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: TokenPair;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
}
