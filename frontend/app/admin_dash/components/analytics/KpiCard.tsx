'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  suffix?: string;
}

export default function KpiCard({ icon: Icon, label, value, trend, suffix }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</h3>
        <Icon className="w-5 h-5 text-[#253A7B]" />
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {suffix && <span className="text-lg text-gray-600">{suffix}</span>}
      </div>
      {trend && (
        <p className={`text-xs mt-2 ${trend.isPositive ? 'text-gray-600' : 'text-gray-500'}`}>
          {trend.isPositive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  );
}
