'use client';

import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { AdminCourseManager } from '@/components/admin/AdminCourseManager';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { AdminReports } from '@/components/admin/AdminReports';
import { AdminAnnouncements } from '@/components/admin/AdminAnnouncements';
import { useState } from 'react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN;

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this area.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'courses', label: 'Course Management', icon: '📚' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your educational platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">1,234</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">56</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrollments</p>
                  <p className="text-2xl font-semibold text-gray-900">3,456</p>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">$89,234</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'courses' && <AdminCourseManager />}
        {activeTab === 'users' && <AdminUserManager />}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'announcements' && <AdminAnnouncements />}
      </div>
    </div>
  );
};
