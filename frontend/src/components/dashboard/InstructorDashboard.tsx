'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses.api';
import { analyticsApi } from '@/lib/api/analytics.api';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/ui/StatCard';
import { Table } from '@/components/ui/Table';
import { ErrorState } from '@/components/shared/ErrorState';

export const InstructorDashboard = () => {
  const { user } = useAuth();

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses', 'instructor', user?.id],
    queryFn: () => coursesApi.getAll({ instructorId: user?.id, limit: 10 }),
    enabled: !!user?.id,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['instructor-stats', user?.id],
    queryFn: () => coursesApi.getInstructorStats(user!.id),
    enabled: !!user?.id,
  });

  const { data: completion, isLoading: completionLoading } = useQuery({
    queryKey: ['instructor-completion', user?.id],
    queryFn: () => analyticsApi.getInstructorCompletion(user!.id),
    enabled: !!user?.id,
  });

  if (coursesError) return <ErrorState message="Failed to load dashboard" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your courses and track student progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Courses" value={stats?.total || 0} loading={statsLoading} />
        <StatCard title="Published" value={stats?.published || 0} loading={statsLoading} />
        <StatCard title="Draft" value={stats?.draft || 0} loading={statsLoading} />
        <StatCard title="Completion Rate" value={`${completion?.completionRate || 0}%`} loading={completionLoading} />
      </div>

      {completion?.courseBreakdown && completion.courseBreakdown.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h2>
          <Table
            columns={[
              { key: 'courseTitle', label: 'Course' },
              { key: 'enrollments', label: 'Students' },
              { key: 'completed', label: 'Completed' },
              { key: 'completionRate', label: 'Completion Rate', render: (item: any) => `${item.completionRate}%` },
            ]}
            data={completion.courseBreakdown}
            loading={completionLoading}
            emptyMessage="No course data available"
          />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>
        <Table
          columns={[
            { key: 'title', label: 'Title' },
            {
              key: 'status',
              label: 'Status',
              render: (item: any) => (
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  item.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              ),
            },
            { key: 'price', label: 'Price', render: (item: any) => `$${item.price}` },
            { key: 'level', label: 'Level' },
          ]}
          data={courses?.data || []}
          loading={coursesLoading}
          emptyMessage="No courses yet. Create your first course!"
        />
      </div>
    </div>
  );
};
