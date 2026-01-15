'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function QuizCompletionRate() {
  const completionData = {
    completed: 68,
    nonCompleted: 32,
    totalAttempts: 1248
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">Quiz Completion Rate</h3>
      
      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10B981"
              strokeWidth="20"
              strokeDasharray={`${completionData.completed * 2.51} ${251 - completionData.completed * 2.51}`}
              className="transition-all"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#EF4444"
              strokeWidth="20"
              strokeDasharray={`${completionData.nonCompleted * 2.51} ${251 - completionData.nonCompleted * 2.51}`}
              strokeDashoffset={`-${completionData.completed * 2.51}`}
              className="transition-all"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-3xl font-bold text-gray-900">{completionData.completed}%</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{Math.floor(completionData.totalAttempts * (completionData.completed / 100))}</p>
            <p className="text-xs text-gray-500">{completionData.completed}%</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Incomplete</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{Math.floor(completionData.totalAttempts * (completionData.nonCompleted / 100))}</p>
            <p className="text-xs text-gray-500">{completionData.nonCompleted}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
