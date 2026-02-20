'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses.api';
import { useAuth } from '@/hooks/useAuth';

export function AdminCourseManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '', slug: '', description: '', price: 0, level: 'BEGINNER', categoryId: '', maxStudents: 100
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => coursesApi.getAll({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setShowCreateForm(false);
      setCourseForm({ title: '', slug: '', description: '', price: 0, level: 'BEGINNER', categoryId: '', maxStudents: 100 });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => coursesApi.changeStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(courseForm as any);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Course
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                placeholder="course-slug"
                value={courseForm.slug}
                onChange={(e) => setCourseForm(prev => ({ ...prev, slug: e.target.value }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <textarea
              placeholder="Course Description"
              value={courseForm.description}
              onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Price"
                value={courseForm.price}
                onChange={(e) => setCourseForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={courseForm.level}
                onChange={(e) => setCourseForm(prev => ({ ...prev, level: e.target.value }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <input
                type="number"
                placeholder="Max Students"
                value={courseForm.maxStudents}
                onChange={(e) => setCourseForm(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses?.data?.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.instructor?.firstName} {course.instructor?.lastName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      course.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${course.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.enrollmentCount || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {course.status === 'DRAFT' && (
                        <button
                          onClick={() => statusMutation.mutate({ id: course.id, status: 'PUBLISHED' })}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Publish
                        </button>
                      )}
                      {course.status === 'PUBLISHED' && (
                        <button
                          onClick={() => statusMutation.mutate({ id: course.id, status: 'ARCHIVED' })}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete course?')) deleteMutation.mutate(course.id); }}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}