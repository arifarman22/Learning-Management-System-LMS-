'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

export function SuperAdminSystemSettings() {
  const [activeTab, setActiveTab] = useState('auth');

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: () => fetch('/api/system/settings').then(r => r.json()),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/system/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  });

  const tabs = [
    { id: 'auth', label: 'Authentication' },
    { id: 'security', label: 'Security' },
    { id: 'api', label: 'API Config' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">System Settings</h2>

      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border p-6">
        {activeTab === 'auth' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Authentication Policies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">JWT Access Token Expiry</label>
                <select className="w-full p-2 border rounded">
                  <option value="15m">15 minutes</option>
                  <option value="30m">30 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="2h">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">JWT Refresh Token Expiry</label>
                <select className="w-full p-2 border rounded">
                  <option value="7d">7 days</option>
                  <option value="14d">14 days</option>
                  <option value="30d">30 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password Policy</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Require uppercase letters</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Require special characters</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Minimum 8 characters</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">OAuth Providers</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Google OAuth</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">GitHub OAuth</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Microsoft OAuth</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Security Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Rate Limiting</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Max requests per window"
                    className="w-full p-2 border rounded"
                    defaultValue="100"
                  />
                  <select className="w-full p-2 border rounded">
                    <option value="15m">15 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="1d">1 day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CORS Origins</label>
                <textarea
                  className="w-full p-2 border rounded h-20"
                  placeholder="https://yourdomain.com&#10;https://app.yourdomain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Security Headers</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">HSTS</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">X-Frame-Options</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Content Security Policy</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Session Security</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Force logout on password change</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Limit concurrent sessions</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">API Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">API Base URL</label>
                <input
                  type="url"
                  className="w-full p-2 border rounded"
                  placeholder="https://api.yourdomain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API Version</label>
                <select className="w-full p-2 border rounded">
                  <option value="v1">v1</option>
                  <option value="v2">v2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Request Timeout (ms)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  defaultValue="30000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  defaultValue="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Environment Variables</label>
              <textarea
                className="w-full p-2 border rounded h-32 font-mono text-sm"
                placeholder="DATABASE_URL=postgresql://...&#10;REDIS_URL=redis://...&#10;SMTP_HOST=smtp.gmail.com"
              />
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Maintenance & Feature Toggles</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-gray-600">Temporarily disable access for all users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">New User Registration</h4>
                  <p className="text-sm text-gray-600">Allow new users to register</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Course Enrollment</h4>
                  <p className="text-sm text-gray-600">Allow students to enroll in courses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Payment Processing</h4>
                  <p className="text-sm text-gray-600">Enable payment gateway</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maintenance Message</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="We're performing scheduled maintenance. Please check back in 30 minutes."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={() => updateSettingsMutation.mutate({})}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}