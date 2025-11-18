'use client';

import React from 'react';
import { PieChart } from 'lucide-react';

export default function PaidVsFreeDonutChart() {
  const data = [
    { label: 'Paid', value: 456, color: 'bg-[#253A7B]', percentage: 51 },
    { label: 'Free', value: 436, color: 'bg-blue-400', percentage: 49 }
  ];

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Paid vs Free Participants</h3>
        <PieChart className="w-5 h-5 text-purple-600" />
      </div>
      
      {/* Simplified Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#253A7B"
              strokeWidth="20"
              strokeDasharray={`${data[0].percentage * 2.51} ${251 - data[0].percentage * 2.51}`}
              className="transition-all"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="20"
              strokeDasharray={`${data[1].percentage * 2.51} ${251 - data[1].percentage * 2.51}`}
              strokeDashoffset={`-${data[0].percentage * 2.51}`}
              className="transition-all"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-3xl font-bold text-gray-900">892</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${item.color}`} />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
