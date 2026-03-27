'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

export default function RevenueChart() {
  const [data, setData] = useState<{ day: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get('/api/analytics/revenue?dateRange=7');
        const dailyRevenue = response.data?.dailyRevenue || [];
        const formatted = dailyRevenue.map((item: { date: string; revenue: number }) => {
          const dateObj = new Date(item.date);
          const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          return { day, revenue: Number(item.revenue || 0) };
        });

        setData(formatted);
      } catch (err) {
        console.error('Failed to load revenue analytics:', err);
        setError('Failed to load revenue analytics');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  const maxRevenue = useMemo(() => (data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0), [data]);
  const totalRevenue = useMemo(() => data.reduce((sum, d) => sum + d.revenue, 0), [data]);

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Revenue Over Time</h3>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500">Loading revenue...</div>
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-sm text-gray-500">No revenue data available.</div>
      ) : (
        <>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-12">{item.day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] h-full rounded-full flex items-center justify-end pr-3 transition-all"
                    style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
                  >
                    <span className="text-xs font-bold text-white">₹{(item.revenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">Total: ₹{(totalRevenue / 1000).toFixed(0)}k this week</p>
        </>
      )}
    </div>
  );
}
