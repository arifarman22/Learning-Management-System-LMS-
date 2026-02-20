'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';

export function AdminUserManager() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({ studentId: '', courseId: '' });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BASE);
      return response.data;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.BASE);
      return response.data;
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.post(API_ENDPOINTS.USERS.DEACTIVATE(userId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const activateUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.post(API_ENDPOINTS.USERS.ACTIVATE(userId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const manualEnrollMutation = useMutation({
    mutationFn: (data: { studentId: string; courseId: string }) => 
      apiClient.post(API_ENDPOINTS.ENROLLMENTS.BASE, { courseId: data.courseId, studentId: data.studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEnrollmentForm({ studentId: '', courseId: '' });
    },
  });

  const handleManualEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (enrollmentForm.studentId && enrollmentForm.courseId) {
      manualEnrollMutation.mutate(enrollmentForm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Manual Enrollment */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Manual Enrollment</h2>
        <form onSubmit={handleManualEnroll} className="flex gap-4">
          <select
            value={enrollmentForm.studentId}
            onChange={(e) => setEnrollmentForm(prev => ({ ...prev, studentId: e.target.value }))}
            className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Student</option>
            {users?.data?.filter((u: any) => u.role === 'STUDENT').map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
          <select
            value={enrollmentForm.courseId}
            onChange={(e) => setEnrollmentForm(prev => ({ ...prev, courseId: e.target.value }))}
            className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Course</option>
            {courses?.data?.map((course: any) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={manualEnrollMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {manualEnrollMutation.isPending ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users?.data?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.isActive ? (
                        <button
                          onClick={() => blockUserMutation.mutate(user.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          disabled={user.role === 'SUPER_ADMIN'}
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => activateUserMutation.mutate(user.id)}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900">{selectedUser.role.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900">{selectedUser.isActive ? 'Active' : 'Blocked'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Joined</label>
                <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              {selectedUser.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="text-gray-900">{selectedUser.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}