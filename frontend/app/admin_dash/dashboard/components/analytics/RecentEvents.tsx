'use client';

import React from 'react';
import { Activity, TrendingUp, FileText, Users } from 'lucide-react';

interface Event {
  id: string;
  type: 'revenue' | 'quiz' | 'user';
  title: string;
  description: string;
  timestamp: string;
}

interface RecentEventsProps {
  events: Event[];
}

export default function RecentEvents({ events }: RecentEventsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'revenue': return TrendingUp;
      case 'quiz': return FileText;
      case 'user': return Users;
      default: return Activity;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-sm font-semibold text-gray-700">Recent Analytics Events</h3>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = getIcon(event.type);
          return (
            <div key={event.id} className="flex items-start gap-3">
              {/* Timeline line */}
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#253A7B]" />
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 absolute top-8"></div>
                )}
              </div>

              {/* Event content */}
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
