'use client';

import React from 'react';
import { PieChart } from 'lucide-react';

interface FreeVsPaidChartProps {
  freeParticipation: number;
  paidParticipation: number;
}

export default function FreeVsPaidChart({ freeParticipation, paidParticipation }: FreeVsPaidChartProps) {
  const total = freeParticipation + paidParticipation;
  const freePercentage = Math.round((freeParticipation / total) * 100);
  const paidPercentage = Math.round((paidParticipation / total) * 100);

  // Calculate SVG circle dash array for donut chart
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const freeStrokeDasharray = `${(freePercentage / 100) * circumference} ${circumference}`;
  const paidStrokeDasharray = `${(paidPercentage / 100) * circumference} ${circumference}`;
  const paidStrokeDashoffset = -((freePercentage / 100) * circumference);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-sm font-semibold text-gray-700">Free vs Paid Quiz Participation</h3>
      </div>

      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="transform -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
            />
            {/* Free segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="20"
              strokeDasharray={freeStrokeDasharray}
              strokeLinecap="round"
            />
            {/* Paid segment */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#253A7B"
              strokeWidth="20"
              strokeDasharray={paidStrokeDasharray}
              strokeDashoffset={paidStrokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#253A7B]"></div>
              <span className="text-sm text-gray-700">Paid Quizzes</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{paidParticipation.toLocaleString()}</p>
              <p className="text-xs text-gray-600">{paidPercentage}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-700">Free Quizzes</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{freeParticipation.toLocaleString()}</p>
              <p className="text-xs text-gray-600">{freePercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
