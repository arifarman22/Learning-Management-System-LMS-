'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
    targetAudience: 'ALL',
    expiresAt: '',
  });

  const { data: announcements } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      // Mock data since we don't have announcements API
      return {
        data: [
          {
            id: '1',
            title: 'System Maintenance',
            message: 'Scheduled maintenance on Sunday 2-4 AM',
            type: 'WARNING',
            targetAudience: 'ALL',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
          },
          {
            id: '2',
            title: 'New Course Available',
            message: 'Advanced React Patterns course is now live!',
            type: 'INFO',
            targetAudience: 'STUDENTS',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
          },
        ]
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock API call
      return { data: { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), isActive: true } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setShowCreateForm(false);
      setAnnouncementForm({ title: '', message: '', type: 'INFO', targetAudience: 'ALL', expiresAt: '' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock API call
      return { data: { id } };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(announcementForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create Announcement
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Create Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                placeholder="Announcement Title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Announcement Message"
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <select
                value={announcementForm.type}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="SUCCESS">Success</option>
                <option value="ERROR">Error</option>
              </select>
              <select
                value={announcementForm.targetAudience}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Users</option>
                <option value="STUDENTS">Students Only</option>
                <option value="INSTRUCTORS">Instructors Only</option>
                <option value="ADMINS">Admins Only</option>
              </select>
              <input
                type="datetime-local"
                value={announcementForm.expiresAt}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Announcement'}
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

      <div className="space-y-4">
        {announcements?.data?.map((announcement: any) => (
          <div key={announcement.id} className="bg-white border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    announcement.type === 'INFO' ? 'bg-blue-100 text-blue-800' :
                    announcement.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                    announcement.type === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {announcement.type}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                    {announcement.targetAudience}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{announcement.message}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                  {announcement.expiresAt && (
                    <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleMutation.mutate(announcement.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    announcement.isActive 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {announcement.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Edit
                </button>
                <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}