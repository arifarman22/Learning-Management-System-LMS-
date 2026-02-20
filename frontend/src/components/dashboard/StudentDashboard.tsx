'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '@/lib/api/enrollments.api';
import { coursesApi } from '@/lib/api/courses.api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useState } from 'react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [wishlist, setWishlist] = useState<string[]>([]);

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', 'student', user?.id],
    queryFn: () => enrollmentsApi.getAll({ studentId: user?.id, limit: 10 }),
    enabled: !!user?.id,
  });

  const { data: availableCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'available'],
    queryFn: () => coursesApi.getAll({ status: 'PUBLISHED', limit: 6 }),
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollmentsApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setWishlist(prev => prev.filter(id => id !== enrollMutation.variables));
    },
  });

  const toggleWishlist = (courseId: string) => {
    setWishlist(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const getLastAccessedCourse = () => {
    if (!enrollments?.data) return null;
    return enrollments.data
      .filter((e: any) => e.status === 'ACTIVE' && e.lastAccessedAt)
      .sort((a: any, b: any) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())[0];
  };

  const lastCourse = getLastAccessedCourse();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-gray-600 mt-1">Ready to continue learning?</p>
        
        {lastCourse && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">Resume where you left off:</p>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{lastCourse.course?.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${lastCourse.progress || 0}%` }} />
                  </div>
                  <span className="text-sm text-gray-600">{lastCourse.progress || 0}%</span>
                </div>
              </div>
              <Link 
                href={`/learn/${lastCourse.course?.slug}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                Continue Learning
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* My Courses */}
      {enrollments?.data && enrollments.data.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">My Courses</h2>
            <Link href="/enrollments" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
          <div className="grid gap-4">
            {enrollmentsLoading ? (
              <div className="bg-white border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ) : (
              enrollments.data.slice(0, 3).map((enrollment: any) => (
                <div key={enrollment.id} className="bg-white border rounded-lg p-6 hover:border-gray-300 transition group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition">
                        {enrollment.course?.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        enrollment.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                        enrollment.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {enrollment.status === 'COMPLETED' ? '✓ Completed' : 
                         enrollment.status === 'ACTIVE' ? 'In Progress' : enrollment.status}
                      </span>
                      <Link 
                        href={`/learn/${enrollment.course?.slug}`}
                        className="px-3 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition"
                      >
                        {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{enrollment.progress || 0}%</span>
                  </div>
                  {enrollment.status === 'COMPLETED' && enrollment.completedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Completed on {new Date(enrollment.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Course Discovery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Discover New Courses</h2>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700 text-sm">
            Browse All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))
          ) : availableCourses?.data && availableCourses.data.length > 0 ? (
            availableCourses.data.slice(0, 3).map((course: any) => {
              const isEnrolled = enrollments?.data?.some((e: any) => e.courseId === course.id);
              const isWishlisted = wishlist.includes(course.id);
              
              return (
                <div key={course.id} className="bg-white border rounded-lg p-6 hover:border-gray-300 transition group">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition flex-1">
                        {course.title}
                      </h3>
                      <button
                        onClick={() => toggleWishlist(course.id)}
                        className={`ml-2 p-1 rounded transition ${
                          isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        {isWishlisted ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{course.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">{course.level}</span>
                      <span>•</span>
                      <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xl font-semibold text-gray-900">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                    {isEnrolled ? (
                      <Link 
                        href={`/learn/${course.slug}`}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                      >
                        Go to Course
                      </Link>
                    ) : (
                      <button
                        onClick={() => enrollMutation.mutate(course.id)}
                        disabled={enrollMutation.isPending}
                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition"
                      >
                        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No courses available at the moment
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {enrollments?.data && enrollments.data.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Your Learning Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{enrollments.data.length}</div>
              <div className="text-sm text-gray-600">Enrolled Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {enrollments.data.filter((e: any) => e.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {enrollments.data.filter((e: any) => e.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(enrollments.data.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.data.length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
