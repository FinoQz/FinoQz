'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function RevenueChart() {
  // Dummy data - will be replaced with recharts
  const data = [
    { day: 'Mon', revenue: 12000 },
    { day: 'Tue', revenue: 18000 },
    { day: 'Wed', revenue: 15000 },
    { day: 'Thu', revenue: 22000 },
    { day: 'Fri', revenue: 28000 },
    { day: 'Sat', revenue: 19000 },
    { day: 'Sun', revenue: 24000 }
  ];

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Revenue Over Time</h3>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 w-12">{item.day}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#253A7B] to-[#1a2a5e] h-full rounded-full flex items-center justify-end pr-3 transition-all"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              >
                <span className="text-xs font-bold text-white">₹{(item.revenue / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">Total: ₹{(data.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(0)}k this week</p>
    </div>
  );
}
