'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function SuperAdminAuditLogs() {
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    dateFrom: '',
    dateTo: '',
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => fetch(`/api/audit/logs?${new URLSearchParams(filters)}`).then(r => r.json()),
  });

  const { data: securityEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => fetch('/api/security/events').then(r => r.json()),
  });

  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    LOGIN: 'bg-gray-100 text-gray-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    FAILED_LOGIN: 'bg-red-100 text-red-800',
  };

  const riskColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
    CRITICAL: 'bg-red-200 text-red-900',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Audit Logs & Security</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">1,247</div>
          <div className="text-sm text-gray-600">Total Events Today</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">98.5%</div>
          <div className="text-sm text-gray-600">System Uptime</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-600">Security Alerts</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">12</div>
          <div className="text-sm text-gray-600">Failed Logins</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Audit Log Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
            <input
              type="text"
              placeholder="User email"
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLogs?.data?.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium">{log.user?.firstName} {log.user?.lastName}</div>
                    <div className="text-gray-600">{log.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{log.resource}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Security Events</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {securityEvents?.data?.map((event: any) => (
            <div key={event.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${riskColors[event.riskLevel]}`}>
                      {event.riskLevel}
                    </span>
                    <span className="font-medium">{event.type}</span>
                    <span className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    IP: {event.ipAddress} | User Agent: {event.userAgent}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs border rounded hover:bg-gray-50">
                    Investigate
                  </button>
                  <button className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                    Block IP
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}