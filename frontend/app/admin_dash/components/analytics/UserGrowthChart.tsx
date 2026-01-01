'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface UserGrowthChartProps {
  data: {
    date: string;
    users: number;
    attempts: number;
    revenue: number;
  }[];
}

type ChartType = 'users' | 'attempts' | 'revenue';

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('users');

  const getChartData = () => {
    return data.map(item => ({
      date: item.date,
      value: activeChart === 'users' ? item.users : activeChart === 'attempts' ? item.attempts : item.revenue
    }));
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));

  const getLabel = () => {
    switch (activeChart) {
      case 'users': return 'Users';
      case 'attempts': return 'Attempts';
      case 'revenue': return 'Revenue (₹)';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#253A7B]" />
          <h3 className="text-sm font-semibold text-gray-700">User Growth Over Time</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveChart('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeChart === 'users'
                ? 'bg-[#253A7B] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveChart('attempts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeChart === 'attempts'
                ? 'bg-[#253A7B] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Attempts
          </button>
          <button
            onClick={() => setActiveChart('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeChart === 'revenue'
                ? 'bg-[#253A7B] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Revenue
          </button>
        </div>
      </div>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-600">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-8">
          <div className="relative h-full flex items-end justify-between gap-2">
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {getLabel()}: {item.value.toLocaleString()}
                      </div>
                    </div>
                    {/* Area fill */}
                    <div
                      className="w-full bg-gradient-to-t from-[#253A7B]/20 to-[#253A7B]/5 rounded-t transition-all duration-300 hover:from-[#253A7B]/30"
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
          {chartData.map((item, index) => (
            <span key={index} className="flex-1 text-center">{item.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
