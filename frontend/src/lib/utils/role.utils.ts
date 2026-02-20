import { Role } from '@/types';

export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  INSTRUCTOR: 2,
  STUDENT: 1,
} as const;

export const hasRole = (userRole: Role, requiredRole: Role): boolean => {
  return userRole === requiredRole;
};

export const hasAnyRole = (userRole: Role, requiredRoles: Role[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const hasMinimumRole = (userRole: Role, minimumRole: Role): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
};

export const isAdmin = (userRole: Role): boolean => {
  return userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
};

export const isInstructor = (userRole: Role): boolean => {
  return userRole === Role.INSTRUCTOR;
};

export const isStudent = (userRole: Role): boolean => {
  return userRole === Role.STUDENT;
};

export const canManageUsers = (userRole: Role): boolean => {
  return isAdmin(userRole);
};

export const canManageCourses = (userRole: Role): boolean => {
  return isAdmin(userRole) || isInstructor(userRole);
};

export const canAccessAnalytics = (userRole: Role): boolean => {
  return isAdmin(userRole);
};

export const canEnroll = (userRole: Role): boolean => {
  return userRole === Role.STUDENT;
};
