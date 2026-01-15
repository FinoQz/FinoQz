'use client';

import React from 'react';
import { Activity, CheckCircle, Edit3, RefreshCw, UserPlus, FileEdit } from 'lucide-react';

export default function ActivityTimeline() {
  const activities = [
    {
      id: 1,
      type: 'published',
      description: 'Quiz published by Admin',
      user: 'Super Admin',
      timestamp: '2025-01-15 10:30 AM',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      id: 2,
      type: 'edited',
      description: 'Quiz settings updated',
      user: 'Admin User',
      timestamp: '2025-01-14 03:45 PM',
      icon: Edit3,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      id: 3,
      type: 'refund',
      description: 'Refund processed for Amit Kumar',
      user: 'Finance Admin',
      timestamp: '2025-01-14 11:20 AM',
      icon: RefreshCw,
      color: 'text-red-600',
      bg: 'bg-red-100'
    },
    {
      id: 4,
      type: 'manual-marks',
      description: 'Manual marks edited for Sneha Singh',
      user: 'Exam Admin',
      timestamp: '2025-01-13 05:15 PM',
      icon: FileEdit,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      id: 5,
      type: 'user-added',
      description: 'New participant added manually',
      user: 'Admin User',
      timestamp: '2025-01-13 02:30 PM',
      icon: UserPlus,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <p className="font-medium text-gray-900">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>by {activity.user}</span>
                  <span>•</span>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-4 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm">
        View Full Activity Log
      </button>
    </div>
  );
}
