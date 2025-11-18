'use client';

import React from 'react';
import { CheckCircle, Edit3, RefreshCw, UserCheck, FileEdit, Activity } from 'lucide-react';

export default function RecentAdminActions() {
  const actions = [
    { action: 'Quiz Published', detail: 'Financial Literacy Basics', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', time: '2 mins ago' },
    { action: 'Price Updated', detail: 'Stock Market Fundamentals', icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-100', time: '15 mins ago' },
    { action: 'Refund Issued', detail: '₹299 to Amit Kumar', icon: RefreshCw, color: 'text-red-600', bg: 'bg-red-100', time: '1 hour ago' },
    { action: 'User Verified', detail: 'Sneha Singh approved', icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-100', time: '2 hours ago' },
    { action: 'Quiz Edited', detail: 'Tax Planning Strategies', icon: FileEdit, color: 'text-orange-600', bg: 'bg-orange-100', time: '3 hours ago' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Admin Actions</h3>
      </div>
      
      <div className="space-y-3">
        {actions.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
            >
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{item.action}</p>
                <p className="text-xs text-gray-500 truncate">{item.detail}</p>
              </div>
              
              <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
