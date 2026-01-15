'use client';

import React from 'react';
import { Trophy, Medal, Award, TrendingUp, Zap } from 'lucide-react';

export default function TopUsers() {
  const topUsers = [
    { name: 'Rahul Sharma', attempts: 24, badge: 'Top Performer', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Priya Patel', attempts: 21, badge: 'High Activity', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Amit Kumar', attempts: 19, badge: 'Consistent', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Sneha Singh', attempts: 17, badge: 'Rising Star', icon: Medal, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Vikram Reddy', attempts: 15, badge: 'Active', icon: Award, color: 'text-orange-600', bg: 'bg-orange-100' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Top 5 Users</h3>
      
      <div className="space-y-3">
        {topUsers.map((user, index) => {
          const Icon = user.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
            >
              <div className={`w-10 h-10 rounded-full ${user.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${user.color}`} />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.attempts} attempts</p>
              </div>
              
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${user.bg} ${user.color}`}>
                {user.badge}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
