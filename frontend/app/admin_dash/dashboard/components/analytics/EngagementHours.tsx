'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface EngagementHoursProps {
  hourlyData: {
    hour: string;
    engagement: number;
  }[];
}

export default function EngagementHours({ hourlyData }: EngagementHoursProps) {
  const maxEngagement = Math.max(...hourlyData.map(h => h.engagement));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-sm font-semibold text-gray-700">High Engagement Hours</h3>
      </div>

      <div className="grid grid-cols-12 gap-1">
        {hourlyData.map((item, index) => {
          const intensity = (item.engagement / maxEngagement) * 100;
          const opacity = Math.max(0.1, intensity / 100);
          
          return (
            <div key={index} className="group relative">
              <div
                className="aspect-square rounded transition-all hover:scale-110 cursor-pointer"
                style={{ 
                  backgroundColor: `rgba(37, 58, 123, ${opacity})`,
                }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.hour}: {item.engagement}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hour labels */}
      <div className="grid grid-cols-12 gap-1 mt-2">
        {hourlyData.map((item, index) => (
          index % 2 === 0 && (
            <div key={index} className="col-span-2 text-center">
              <span className="text-xs text-gray-600">{item.hour}</span>
            </div>
          )
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(37, 58, 123, 0.2)' }}></div>
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(37, 58, 123, 0.6)' }}></div>
          <span className="text-xs text-gray-600">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(37, 58, 123, 1)' }}></div>
          <span className="text-xs text-gray-600">High</span>
        </div>
      </div>
    </div>
  );
}
