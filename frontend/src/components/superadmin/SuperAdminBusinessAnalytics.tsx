'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function SuperAdminBusinessAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: revenue } = useQuery({
    queryKey: ['revenue-analytics', timeRange],
    queryFn: () => fetch(`/api/analytics/revenue?range=${timeRange}`).then(r => r.json()),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscription-analytics'],
    queryFn: () => fetch('/api/analytics/subscriptions').then(r => r.json()),
  });

  const { data: payouts } = useQuery({
    queryKey: ['instructor-payouts'],
    queryFn: () => fetch('/api/payouts/pending').then(r => r.json()),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Business Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600">${revenue?.data?.total?.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-xs text-green-600 mt-1">+12.5% vs last period</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600">${revenue?.data?.platformFee?.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Platform Revenue</div>
          <div className="text-xs text-blue-600 mt-1">15% commission</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600">{subscriptions?.data?.active || 0}</div>
          <div className="text-sm text-gray-600">Active Subscriptions</div>
          <div className="text-xs text-purple-600 mt-1">+8 this month</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-orange-600">${payouts?.data?.pending?.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Pending Payouts</div>
          <div className="text-xs text-orange-600 mt-1">{payouts?.data?.count || 0} instructors</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            {revenue?.data?.breakdown?.map((item: any) => (
              <div key={item.category} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.category}</div>
                  <div className="text-sm text-gray-600">{item.count} transactions</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Subscription Plans</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">Basic Plan</div>
                <div className="text-sm text-gray-600">$9.99/month</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{subscriptions?.data?.plans?.basic || 0}</div>
                <div className="text-sm text-gray-600">subscribers</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">Pro Plan</div>
                <div className="text-sm text-gray-600">$19.99/month</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{subscriptions?.data?.plans?.pro || 0}</div>
                <div className="text-sm text-gray-600">subscribers</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">Enterprise Plan</div>
                <div className="text-sm text-gray-600">$49.99/month</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{subscriptions?.data?.plans?.enterprise || 0}</div>
                <div className="text-sm text-gray-600">subscribers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Instructor Payouts</h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Process All Payouts
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payouts?.data?.instructors?.map((payout: any) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{payout.instructor.firstName} {payout.instructor.lastName}</div>
                    <div className="text-sm text-gray-600">{payout.instructor.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">${payout.totalEarnings.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">${payout.platformFee.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-green-600">${payout.payoutAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{payout.period}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                        Pay Now
                      </button>
                      <button className="px-3 py-1 text-xs border rounded hover:bg-gray-50">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Payment Gateway Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Gateway</label>
            <select className="w-full p-2 border rounded">
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="razorpay">Razorpay</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Platform Commission (%)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              defaultValue="15"
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payout Schedule</label>
            <select className="w-full p-2 border rounded">
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Payout Amount</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              defaultValue="50"
              min="1"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}