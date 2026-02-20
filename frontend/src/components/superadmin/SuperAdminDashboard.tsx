'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminRoleManager } from './SuperAdminRoleManager';
import { SuperAdminSystemSettings } from './SuperAdminSystemSettings';
import { SuperAdminAuditLogs } from './SuperAdminAuditLogs';
import { SuperAdminBusinessAnalytics } from './SuperAdminBusinessAnalytics';

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">Super Admin privileges required.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: '📊' },
    { id: 'roles', label: 'Roles & Permissions', icon: '👥' },
    { id: 'settings', label: 'System Settings', icon: '⚙️' },
    { id: 'audit', label: 'Audit & Security', icon: '🔒' },
    { id: 'business', label: 'Business Analytics', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Control Center</h1>
              <p className="text-gray-600">System architecture and platform governance</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg">
              <span className="text-sm font-medium">🔴 SUPER ADMIN</span>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border">
                <div className="text-3xl font-bold text-blue-600">99.9%</div>
                <div className="text-sm text-gray-600">System Uptime</div>
                <div className="text-xs text-green-600 mt-1">All systems operational</div>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <div className="text-3xl font-bold text-green-600">2,847</div>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-xs text-green-600 mt-1">+127 this month</div>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <div className="text-3xl font-bold text-purple-600">156</div>
                <div className="text-sm text-gray-600">Active Courses</div>
                <div className="text-xs text-purple-600 mt-1">+12 this week</div>
              </div>
              <div className="bg-white p-6 rounded-lg border">
                <div className="text-3xl font-bold text-orange-600">$47.2K</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
                <div className="text-xs text-orange-600 mt-1">+18.5% growth</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Gateway</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment System</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email Service</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Degraded</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">Recent Admin Actions</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Admin created new course category</span>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">User role updated to Instructor</span>
                    <span className="text-xs text-gray-500">4h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Security alert: Multiple failed logins</span>
                    <span className="text-xs text-gray-500">6h ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="text-sm font-medium">System Settings</div>
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="text-sm font-medium">View Audit Logs</div>
                </button>
                <button
                  onClick={() => setActiveTab('roles')}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-sm font-medium">Manage Roles</div>
                </button>
                <button
                  onClick={() => setActiveTab('business')}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-sm font-medium">Revenue Analytics</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && <SuperAdminRoleManager />}
        {activeTab === 'settings' && <SuperAdminSystemSettings />}
        {activeTab === 'audit' && <SuperAdminAuditLogs />}
        {activeTab === 'business' && <SuperAdminBusinessAnalytics />}
      </div>
    </div>
  );
}