'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics.api';
import { StatCard } from '@/components/ui/StatCard';
import { Table } from '@/components/ui/Table';
import { ErrorState } from '@/components/shared/ErrorState';

export default function AnalyticsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboard(10),
  });

  if (error) return <ErrorState message="Failed to load analytics" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Platform-wide metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={data?.overview.totalUsers || 0} loading={isLoading} />
        <StatCard title="Total Courses" value={data?.overview.totalCourses || 0} loading={isLoading} />
        <StatCard title="Total Enrollments" value={data?.overview.totalEnrollments || 0} loading={isLoading} />
        <StatCard title="Total Revenue" value={`$${(data?.overview.totalRevenue || 0).toFixed(2)}`} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Growth (Last 10 Days)</h2>
          {isLoading ? (
            <div className="h-48 bg-gray-100 animate-pulse rounded" />
          ) : (
            <div className="space-y-2">
              {data?.enrollmentGrowth.map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-24">{item.date}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                    <div
                      className="bg-blue-500 h-4 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / Math.max(...(data?.enrollmentGrowth.map(d => d.count) || [1]))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              ))}
              {(!data?.enrollmentGrowth || data.enrollmentGrowth.length === 0) && (
                <p className="text-gray-500 text-sm">No enrollment data for this period</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h2>
          <Table
            columns={[
              { key: 'courseTitle', label: 'Course' },
              { key: 'instructorName', label: 'Instructor' },
              { key: 'enrollmentCount', label: 'Students' },
            ]}
            data={data?.topCourses || []}
            loading={isLoading}
            emptyMessage="No course data"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue per Course</h2>
        <Table
          columns={[
            { key: 'courseTitle', label: 'Course' },
            { key: 'totalPayments', label: 'Payments' },
            { key: 'totalRevenue', label: 'Revenue', render: (item: any) => `$${item.totalRevenue.toFixed(2)}` },
            { key: 'averagePrice', label: 'Avg Price', render: (item: any) => `$${item.averagePrice.toFixed(2)}` },
          ]}
          data={data?.revenuePerCourse || []}
          loading={isLoading}
          emptyMessage="No revenue data"
        />
      </div>
    </div>
  );
}
