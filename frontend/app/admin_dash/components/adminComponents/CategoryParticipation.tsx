'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function CategoryParticipation() {
  const categories = [
    { name: 'Personal Finance', participants: 456, color: 'bg-blue-500' },
    { name: 'Stock Market', participants: 389, color: 'bg-purple-500' },
    { name: 'Accounting', participants: 312, color: 'bg-green-500' },
    { name: 'Taxation', participants: 278, color: 'bg-orange-500' },
    { name: 'Corporate Finance', participants: 198, color: 'bg-red-500' }
  ];

  const maxParticipants = Math.max(...categories.map(c => c.participants));

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Category-wise Participation</h3>
        <BarChart3 className="w-5 h-5 text-[#253A7B]" />
      </div>
      
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
              <span className="text-sm font-bold text-gray-900">{category.participants}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`${category.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${(category.participants / maxParticipants) * 100}%` }}
              >
                <span className="text-xs font-bold text-white opacity-0 hover:opacity-100 transition">
                  {category.participants}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">Total Participants: {categories.reduce((sum, c) => sum + c.participants, 0)}</p>
      </div>
    </div>
  );
}
