'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface AttemptsChartProps {
  data: {
    day: string;
    attempts: number;
  }[];
}

export default function AttemptsChart({ data }: AttemptsChartProps) {
  const maxAttempts = Math.max(...data.map(d => d.attempts));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-sm font-semibold text-gray-700">Quiz Attempts Per Day</h3>
      </div>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-600">
          <span>{maxAttempts}</span>
          <span>{Math.round(maxAttempts * 0.75)}</span>
          <span>{Math.round(maxAttempts * 0.5)}</span>
          <span>{Math.round(maxAttempts * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="absolute left-14 right-0 top-0 bottom-8">
          <div className="h-full flex items-end justify-between gap-2">
            {data.map((item, index) => {
              const height = (item.attempts / maxAttempts) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.attempts} attempts
                      </div>
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full bg-[#253A7B] rounded-t transition-all duration-300 hover:bg-[#1a2a5e]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-14 right-0 bottom-0 flex justify-between text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index} className="flex-1 text-center">{item.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
