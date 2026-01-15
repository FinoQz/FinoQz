'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AttemptsBarChart() {
  const data = [
    { date: 'Jan 10', attempts: 45 },
    { date: 'Jan 11', attempts: 62 },
    { date: 'Jan 12', attempts: 58 },
    { date: 'Jan 13', attempts: 71 },
    { date: 'Jan 14', attempts: 89 },
    { date: 'Jan 15', attempts: 103 },
    { date: 'Jan 16', attempts: 94 }
  ];

  const maxAttempts = Math.max(...data.map(d => d.attempts));

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Attempts by Date</h3>
        <BarChart3 className="w-5 h-5 text-[#253A7B]" />
      </div>
      
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer transition-all hover:from-[#253A7B] hover:to-[#1a2a5e]"
                style={{ height: `${(item.attempts / maxAttempts) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {item.attempts} attempts
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">{item.date.split(' ')[1]}</span>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">Peak: {maxAttempts} attempts on {data.find(d => d.attempts === maxAttempts)?.date}</p>
    </div>
  );
}
