'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics.api';
import { StatCard } from '@/components/ui/StatCard';
import { Table } from '@/components/ui/Table';
import { ErrorState } from '@/components/shared/ErrorState';

export const SuperAdminDashboard = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: () => analyticsApi.getDashboard(10),
  });

  if (error) {
    return <ErrorState message="Failed to load dashboard" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System-wide analytics and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={data?.overview.totalUsers || 0}
          loading={isLoading}
        />
        <StatCard
          title="Total Courses"
          value={data?.overview.totalCourses || 0}
          loading={isLoading}
        />
        <StatCard
          title="Total Enrollments"
          value={data?.overview.totalEnrollments || 0}
          loading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`$${data?.overview.totalRevenue.toFixed(2) || 0}`}
          loading={isLoading}
        />
      </div>

      {/* Enrollment Growth Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Growth (Last 10 Days)</h2>
        {isLoading ? (
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <div className="space-y-2">
            {data?.enrollmentGrowth.map((item) => (
              <div key={item.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.date}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="bg-blue-500 h-6 rounded"
                    style={{ width: `${item.count * 2}px` }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Courses */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Popular Courses</h2>
        <Table
          columns={[
            { key: 'courseTitle', label: 'Course' },
            { key: 'instructorName', label: 'Instructor' },
            { key: 'enrollmentCount', label: 'Enrollments' },
          ]}
          data={data?.topCourses || []}
          loading={isLoading}
          emptyMessage="No courses available"
        />
      </div>

      {/* Revenue by Course */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Course</h2>
        <Table
          columns={[
            { key: 'courseTitle', label: 'Course' },
            {
              key: 'totalRevenue',
              label: 'Revenue',
              render: (item: any) => `$${item.totalRevenue.toFixed(2)}`,
            },
            { key: 'totalPayments', label: 'Payments' },
            {
              key: 'averagePrice',
              label: 'Avg Price',
              render: (item: any) => `$${item.averagePrice.toFixed(2)}`,
            },
          ]}
          data={data?.revenuePerCourse || []}
          loading={isLoading}
          emptyMessage="No revenue data"
        />
      </div>
    </div>
  );
};
