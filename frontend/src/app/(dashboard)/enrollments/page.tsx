'use client';

import { useQuery } from '@tanstack/react-query';
import { enrollmentsApi } from '@/lib/api/enrollments.api';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { Table } from '@/components/ui/Table';
import { ErrorState } from '@/components/shared/ErrorState';
import Link from 'next/link';

export default function EnrollmentsPage() {
  const { user } = useAuth();
  
  const isStudent = user?.role === Role.STUDENT;
  const isInstructor = user?.role === Role.INSTRUCTOR;
  const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['enrollments', user?.id, user?.role],
    queryFn: () => enrollmentsApi.getAll({
      studentId: isStudent ? user?.id : undefined,
      limit: 50,
    }),
    enabled: !!user?.id,
  });

  if (error) return <ErrorState message="Failed to load enrollments" onRetry={() => refetch()} />;

  const enrollments = data?.data || [];

  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-600 mt-1">Track your course progress and continue learning</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="text-2xl font-bold text-green-600">
              {enrollments.filter((e: any) => e.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="text-2xl font-bold text-orange-600">
              {enrollments.filter((e: any) => e.status === 'ACTIVE').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-600">
              {enrollments.length > 0 ? Math.round(enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Progress</div>
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="divide-y">
              {enrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {enrollment.course?.thumbnail ? (
                            <img 
                              src={enrollment.course.thumbnail} 
                              alt={enrollment.course.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-2xl">📚</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {enrollment.course?.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Instructor: {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                          </p>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all" 
                                  style={{ width: `${enrollment.progress || 0}%` }} 
                                />
                              </div>
                              <span className="text-sm text-gray-600">{enrollment.progress || 0}%</span>
                            </div>
                            
                            <span className={`px-2 py-1 text-xs rounded ${
                              enrollment.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                              enrollment.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' :
                              enrollment.status === 'DROPPED' ? 'bg-red-50 text-red-700' :
                              'bg-gray-50 text-gray-700'
                            }`}>
                              {enrollment.status === 'COMPLETED' ? '✓ Completed' : 
                               enrollment.status === 'ACTIVE' ? 'In Progress' : 
                               enrollment.status === 'DROPPED' ? 'Dropped' :
                               enrollment.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                            {enrollment.lastAccessedAt && (
                              <span>Last accessed: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</span>
                            )}
                            {enrollment.completedAt && (
                              <span className="text-green-600">Completed: {new Date(enrollment.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {enrollment.status === 'ACTIVE' && (
                        <Link 
                          href={`/learn/${enrollment.course?.slug}`}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                        >
                          Continue Learning
                        </Link>
                      )}
                      
                      {enrollment.status === 'COMPLETED' && (
                        <div className="flex gap-2">
                          <Link 
                            href={`/learn/${enrollment.course?.slug}`}
                            className="px-4 py-2 border text-gray-700 text-sm rounded hover:bg-gray-50 transition"
                          >
                            Review Course
                          </Link>
                          <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition">
                            Download Certificate
                          </button>
                        </div>
                      )}
                      
                      {enrollment.status === 'DROPPED' && (
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition">
                          Re-enroll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="mb-4">Start your learning journey by enrolling in a course.</p>
                <Link 
                  href="/courses"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin/Instructor view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enrollments</h1>
        <p className="text-gray-600 mt-1">
          {isInstructor ? 'Students enrolled in your courses' : 'All course enrollments'}
        </p>
      </div>

      <Table
        columns={[
          {
            key: 'student',
            label: 'Student',
            render: (item: any) => item.student ? `${item.student.firstName} ${item.student.lastName}` : '-',
          },
          {
            key: 'course',
            label: 'Course',
            render: (item: any) => item.course?.title || '-',
          },
          {
            key: 'status',
            label: 'Status',
            render: (item: any) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                item.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                item.status === 'DROPPED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.status}
              </span>
            ),
          },
          {
            key: 'progress',
            label: 'Progress',
            render: (item: any) => `${item.progress || 0}%`,
          },
          {
            key: 'enrolledAt',
            label: 'Enrolled',
            render: (item: any) => new Date(item.enrolledAt).toLocaleDateString(),
          },
          {
            key: 'lastAccessedAt',
            label: 'Last Access',
            render: (item: any) => item.lastAccessedAt ? new Date(item.lastAccessedAt).toLocaleDateString() : 'Never',
          },
        ]}
        data={enrollments}
        loading={isLoading}
        emptyMessage="No enrollments found"
      />
    </div>
  );
}
