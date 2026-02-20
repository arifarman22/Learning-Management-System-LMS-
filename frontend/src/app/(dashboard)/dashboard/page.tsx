'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { SuperAdminDashboard } from '@/components/superadmin/SuperAdminDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { InstructorDashboard } from '@/components/dashboard/InstructorDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';

export default function DashboardPage() {
  const { isLoading } = useProtectedRoute();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case Role.SUPER_ADMIN:
        return <SuperAdminDashboard />;
      case Role.ADMIN:
        return <AdminDashboard />;
      case Role.INSTRUCTOR:
        return <InstructorDashboard />;
      case Role.STUDENT:
        return <StudentDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Invalid role</p>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {renderDashboard()}
      </div>
    </ErrorBoundary>
  );
}
