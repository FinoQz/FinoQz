'use client';

import React from 'react';
import { TrendingUp, Target, Clock, RotateCcw } from 'lucide-react';

export default function SecondaryMetrics() {
  const metrics = [
    { label: 'Avg Score', value: '72.5%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pass Rate', value: '68%', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Time', value: '38 min', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Attempts', value: '1,124', icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className={`${metric.bg} rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-200`}
          >
            <Icon className={`w-5 h-5 ${metric.color}`} />
            <div>
              <p className="text-xs text-gray-600 font-medium">{metric.label}</p>
              <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
