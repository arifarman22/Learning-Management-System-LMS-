'use client';

import { Suspense, lazy } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Lazy load dashboard components (code splitting)
const SuperAdminDashboard = lazy(() => 
  import('@/components/dashboard/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard }))
);
const AdminDashboard = lazy(() => 
  import('@/components/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const InstructorDashboard = lazy(() => 
  import('@/components/dashboard/InstructorDashboard').then(m => ({ default: m.InstructorDashboard }))
);
const StudentDashboard = lazy(() => 
  import('@/components/dashboard/StudentDashboard').then(m => ({ default: m.StudentDashboard }))
);

// Loading fallback component
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  </div>
);

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
        <Suspense fallback={<DashboardSkeleton />}>
          {renderDashboard()}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
