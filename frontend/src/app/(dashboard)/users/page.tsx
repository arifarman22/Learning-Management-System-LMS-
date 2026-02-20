'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';
import { Table } from '@/components/ui/Table';
import { ErrorState } from '@/components/shared/ErrorState';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.USERS.BASE, { params: { search: search || undefined, limit: 20 } });
      return res.data;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(isActive ? API_ENDPOINTS.USERS.DEACTIVATE(id) : API_ENDPOINTS.USERS.ACTIVATE(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  if (error) return <ErrorState message="Failed to load users" onRetry={() => refetch()} />;

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage platform users</p>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <Table
        columns={[
          { key: 'name', label: 'Name', render: (item: any) => `${item.firstName} ${item.lastName}` },
          { key: 'email', label: 'Email' },
          {
            key: 'role',
            label: 'Role',
            render: (item: any) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                item.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                item.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                item.role === 'INSTRUCTOR' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.role}
              </span>
            ),
          },
          {
            key: 'isActive',
            label: 'Status',
            render: (item: any) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          { key: 'createdAt', label: 'Joined', render: (item: any) => new Date(item.createdAt).toLocaleDateString() },
          {
            key: 'actions',
            label: 'Actions',
            render: (item: any) => (
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActiveMutation.mutate({ id: item.id, isActive: item.isActive })}
                  className={`text-xs px-2 py-1 rounded ${item.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => { if (confirm('Delete this user?')) deleteMutation.mutate(item.id); }}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        data={users}
        loading={isLoading}
        emptyMessage="No users found"
      />
    </div>
  );
}
