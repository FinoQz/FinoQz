'use client';

import React, { useState } from 'react';
import { TrendingUp, BarChart2, MousePointer2 } from 'lucide-react';

interface UserGrowthChartProps {
  data: {
    date: string;
    users: number;
    attempts: number;
    revenue: number;
  }[];
}

type ChartType = 'users' | 'attempts' | 'revenue';

export default function UserGrowthChart({ data = [] }: UserGrowthChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('users');

  const getChartData = () => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      date: item.date,
      value: activeChart === 'users' ? item.users : activeChart === 'attempts' ? item.attempts : item.revenue
    }));
  };

  const chartData = getChartData();
  const rawMaxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;
  const maxValue = rawMaxValue === 0 ? 10 : rawMaxValue;

  const getLabel = () => {
    switch (activeChart) {
      case 'users': return 'New Registrations';
      case 'attempts': return 'Total Participation';
      case 'revenue': return 'Revenue (₹)';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col h-full min-h-[350px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#253A7B]/5 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#253A7B]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-none">Growth Metrics</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">Historical performance data</p>
          </div>
        </div>
        
        <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100">
          {(['users', 'attempts', 'revenue'] as ChartType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveChart(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                activeChart === type
                  ? 'bg-white text-[#253A7B] shadow-sm ring-1 ring-black/5'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
           <BarChart2 className="w-10 h-10 text-gray-100 mb-2" />
           <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Synchronizing Data...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative min-h-[200px]">
          {/* Y-Axis Labels & Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
              <div key={ratio} className="flex items-center gap-3 group">
                <span className="w-10 text-[9px] font-bold text-gray-400 text-right">
                  {Math.round(maxValue * ratio).toLocaleString()}
                </span>
                <div className="flex-1 h-[1px] bg-gray-50 group-first:bg-transparent" />
              </div>
            ))}
          </div>

          {/* Bars Container */}
          <div className="flex-1 ml-12 mr-2 relative flex items-end justify-between gap-1 sm:gap-2 pt-2">
            {chartData.map((item, index) => {
              const height = (item.value / maxValue) * 100;
              const isVisibleLabel = index === 0 || index === chartData.length - 1 || index % 7 === 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group h-full relative">
                  <div className="flex-1 w-full relative flex flex-col justify-end">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover:scale-100">
                      <div className="bg-gray-900 text-white p-2 rounded-lg shadow-xl flex flex-col items-center min-w-[80px]">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{item.date}</span>
                        <span className="text-[11px] font-bold">{item.value.toLocaleString()}</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                    
                    {/* Bar Track */}
                    <div className="w-full h-full bg-gray-50/50 rounded-t-sm relative overflow-hidden flex flex-col justify-end">
                        {/* Actual Value Bar */}
                        <div
                          className="w-full bg-[#253A7B] rounded-t-sm transition-all duration-500 ease-out group-hover:bg-[#3b59b3]"
                          style={{ height: `${Math.max(height, item.value > 0 ? 2 : 0)}%` }}
                        />
                    </div>
                  </div>
                  
                  {/* X-Axis Label - Positioned absolutely to avoid layout shifts */}
                  {isVisibleLabel && (
                    <div className="absolute top-full pt-2 flex justify-center w-full">
                       <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap">
                         {item.date}
                       </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <MousePointer2 className="w-3 h-3 text-gray-300" />
            <p className="text-[9px] font-medium text-gray-400 uppercase">Hover bars for live audit</p>
         </div>
         <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[9px] font-bold text-gray-900 uppercase">{getLabel()}</p>
         </div>
      </div>
    </div>
  );
}
