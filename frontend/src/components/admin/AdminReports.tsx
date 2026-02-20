'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics.api';
import { enrollmentsApi } from '@/lib/api/enrollments.api';

export function AdminReports() {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsApi.getDashboard(),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => enrollmentsApi.getAll({ limit: 100 }),
  });

  const completionRate = enrollments?.data ? 
    Math.round((enrollments.data.filter((e: any) => e.status === 'COMPLETED').length / enrollments.data.length) * 100) : 0;

  const recentEnrollments = enrollments?.data?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <div className="text-2xl font-bold text-blue-600">{analytics?.overview?.totalUsers || 0}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <div className="text-2xl font-bold text-green-600">{analytics?.overview?.totalCourses || 0}</div>
          <div className="text-sm text-gray-600">Total Courses</div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <div className="text-2xl font-bold text-orange-600">{analytics?.overview?.totalEnrollments || 0}</div>
          <div className="text-sm text-gray-600">Total Enrollments</div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <div className="text-2xl font-bold text-purple-600">${analytics?.overview?.totalRevenue || 0}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Course Completion Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-lg font-semibold text-green-600">{completionRate}%</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {enrollments?.data?.filter((e: any) => e.status === 'COMPLETED').length || 0} of {enrollments?.data?.length || 0} enrollments completed
        </p>
      </div>

      {/* Top Courses */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Top Performing Courses</h2>
        <div className="space-y-3">
          {analytics?.topCourses?.slice(0, 5).map((course: any, index: number) => (
            <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{course.courseTitle}</div>
                  <div className="text-sm text-gray-500">by {course.instructorName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{course.enrollmentCount} enrollments</div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">No course data available</div>
          )}
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Enrollments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEnrollments.map((enrollment: any) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">
                      {enrollment.student?.firstName} {enrollment.student?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{enrollment.student?.email}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">{enrollment.course?.title}</div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      enrollment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      enrollment.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                      enrollment.status === 'DROPPED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{enrollment.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue by Course */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Revenue by Course</h2>
        <div className="space-y-3">
          {analytics?.revenuePerCourse?.slice(0, 5).map((course: any) => (
            <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-gray-900">{course.courseTitle}</div>
                <div className="text-sm text-gray-500">{course.totalPayments} payments</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">${course.totalRevenue}</div>
                <div className="text-sm text-gray-500">avg ${course.averagePrice}</div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">No revenue data available</div>
          )}
        </div>
      </div>
    </div>
  );
}