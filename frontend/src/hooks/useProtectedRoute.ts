import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { Role } from '@/types';
import { ROUTES } from '@/constants';

interface UseProtectedRouteOptions {
  requiredRoles?: Role[];
  redirectTo?: string;
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const { requiredRoles, redirectTo = ROUTES.LOGIN } = options;
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = user && requiredRoles.includes(user.role);
      
      if (!hasRequiredRole) {
        // Redirect to dashboard if user doesn't have required role
        router.push(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, redirectTo, router]);

  return {
    isLoading,
    isAuthenticated,
    user,
  };
};
