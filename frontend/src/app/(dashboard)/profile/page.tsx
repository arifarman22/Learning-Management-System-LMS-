'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { enrollmentsApi } from '@/lib/api/enrollments.api';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/constants';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', 'student', user?.id],
    queryFn: () => enrollmentsApi.getAll({ studentId: user?.id }),
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.put(API_ENDPOINTS.USERS.BY_ID(user?.id!), data),
    onSuccess: () => {
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setTimeout(() => setProfileSuccess(''), 3000);
    },
    onError: (err: any) => {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
      setProfileSuccess('');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD(user?.id!), data),
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully!');
      setPasswordError('');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
      setPasswordSuccess('');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const learningStats = {
    totalCourses: enrollments?.data?.length || 0,
    completedCourses: enrollments?.data?.filter((e: any) => e.status === 'COMPLETED').length || 0,
    inProgressCourses: enrollments?.data?.filter((e: any) => e.status === 'ACTIVE').length || 0,
    averageProgress: enrollments?.data?.length && enrollments.data.length > 0 
      ? Math.round(enrollments.data.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.data.length)
      : 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-blue-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Learning Progress</div>
            <div className="text-2xl font-bold text-blue-600">{learningStats.averageProgress}%</div>
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{learningStats.totalCourses}</div>
          <div className="text-sm text-gray-600">Total Courses</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{learningStats.completedCourses}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">{learningStats.inProgressCourses}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {learningStats.completedCourses > 0 ? Math.round((learningStats.completedCourses / learningStats.totalCourses) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'preferences'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Preferences
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              {profileError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{profileError}</div>}
              {profileSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{profileSuccess}</div>}
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              {passwordError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{passwordSuccess}</div>}
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={8}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={8}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Account Actions</h4>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to logout from all devices?')) {
                      logout();
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition"
                >
                  Logout from All Devices
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Email notifications for new lessons</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Course completion reminders</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Weekly progress reports</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Learning Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Video Quality</label>
                      <select className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Auto</option>
                        <option>720p</option>
                        <option>1080p</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Playback Speed</label>
                      <select className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>0.5x</option>
                        <option>0.75x</option>
                        <option>1x</option>
                        <option>1.25x</option>
                        <option>1.5x</option>
                        <option>2x</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}