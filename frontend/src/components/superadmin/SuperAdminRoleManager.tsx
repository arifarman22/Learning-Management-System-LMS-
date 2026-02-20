'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function SuperAdminRoleManager() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => fetch('/api/permissions').then(r => r.json()),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }),
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'ADMIN' }),
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Role & Permission Management</h2>
        <button
          onClick={() => setShowCreateAdmin(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Create Admin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium mb-4">Users & Roles</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users?.data?.map((user: any) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedUser?.id === user.id ? 'border-red-500 bg-red-50' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'ADMIN' ? 'bg-orange-100 text-orange-800' :
                    user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-medium mb-4">Manage: {selectedUser.firstName} {selectedUser.lastName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => {
                    updateRoleMutation.mutate({ userId: selectedUser.id, role: e.target.value });
                    setSelectedUser({ ...selectedUser, role: e.target.value });
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permissions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {permissions?.data?.map((perm: any) => (
                    <label key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedUser.permissions?.includes(perm.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                  Save Changes
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-3 py-2 border text-sm rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Admin</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createAdminMutation.mutate({
                email: formData.get('email'),
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                password: formData.get('password'),
              });
              setShowCreateAdmin(false);
            }}>
              <div className="space-y-4">
                <input
                  name="firstName"
                  placeholder="First Name"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}