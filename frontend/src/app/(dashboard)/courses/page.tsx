'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses.api';
import { enrollmentsApi } from '@/lib/api/enrollments.api';
import { useAuth } from '@/hooks/useAuth';
import { Role, CourseStatus } from '@/types';
import { Table } from '@/components/ui/Table';
import { ErrorState } from '@/components/shared/ErrorState';
import Link from 'next/link';

export default function CoursesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', description: '', price: 0, level: 'ALL_LEVELS', categoryId: '' });
  const [formError, setFormError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const isInstructor = user?.role === Role.INSTRUCTOR;
  const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;
  const isStudent = user?.role === Role.STUDENT;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['courses', search, user?.id],
    queryFn: () => coursesApi.getAll({
      search: search || undefined,
      instructorId: isInstructor ? user?.id : undefined,
      status: isStudent ? 'PUBLISHED' : undefined,
      limit: 20,
    }),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', 'student', user?.id],
    queryFn: () => enrollmentsApi.getAll({ studentId: user?.id }),
    enabled: isStudent && !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowCreate(false);
      setForm({ title: '', slug: '', description: '', price: 0, level: 'ALL_LEVELS', categoryId: '' });
    },
    onError: (err: any) => setFormError(err.response?.data?.error || 'Failed to create course'),
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollmentsApi.enroll(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => coursesApi.changeStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    createMutation.mutate(form as any);
  };

  if (error) return <ErrorState message="Failed to load courses" onRetry={() => refetch()} />;

  const courses = data?.data || [];
  const enrolledCourseIds = enrollments?.data?.map((e: any) => e.courseId) || [];

  const filteredCourses = courses.filter((course: any) => {
    const matchesCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  if (isStudent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Courses</h1>
          <p className="text-gray-600 mt-1">Find the perfect course to advance your skills</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              
              return (
                <div key={course.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition group">
                  {course.thumbnail && (
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span className="px-2 py-1 bg-gray-100 rounded">{course.level}</span>
                        <span>•</span>
                        <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                      </div>
                      
                      {course.enrollmentCount !== undefined && (
                        <p className="text-xs text-gray-500">
                          {course.enrollmentCount} students enrolled
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xl font-bold text-gray-900">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      
                      {isEnrolled ? (
                        <Link 
                          href={`/learn/${course.slug}`}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                        >
                          Continue Learning
                        </Link>
                      ) : (
                        <button
                          onClick={() => enrollMutation.mutate(course.id)}
                          disabled={enrollMutation.isPending}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">{isInstructor ? 'Manage your courses' : 'Browse all courses'}</p>
        </div>
        {(isInstructor || isAdmin) && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Create Course
          </button>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showCreate && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Course</h2>
          {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  required
                  placeholder="my-course-slug"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL_LEVELS">All Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
                <input
                  value={form.categoryId}
                  onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                  placeholder="cuid..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
          { key: 'level', label: 'Level' },
          { key: 'price', label: 'Price', render: (item: any) => `$${item.price}` },
          {
            key: 'instructor',
            label: 'Instructor',
            render: (item: any) => item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : '-',
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (item: any) => (
              <div className="flex gap-2">
                {(isAdmin || item.instructorId === user?.id) && (
                  <>
                    {item.status === 'DRAFT' && (
                      <button
                        onClick={() => statusMutation.mutate({ id: item.id, status: 'PUBLISHED' })}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Publish
                      </button>
                    )}
                    {item.status === 'PUBLISHED' && (
                      <button
                        onClick={() => statusMutation.mutate({ id: item.id, status: 'ARCHIVED' })}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm('Delete this course?')) deleteMutation.mutate(item.id); }}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={courses}
        loading={isLoading}
        emptyMessage="No courses found"
      />
    </div>
  );
}
