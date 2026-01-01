'use client';

import React from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';

interface QuestionStatsProps {
  scoreDistribution: { range: string; count: number }[];
  questionAccuracy: { question: string; accuracy: number }[];
  mostMissedQuestions: { question: string; missRate: number }[];
}

export default function QuestionStats({
  scoreDistribution,
  questionAccuracy,
  mostMissedQuestions
}: QuestionStatsProps) {
  const maxCount = Math.max(...scoreDistribution.map(s => s.count));
  const maxAccuracy = 100;

  return (
    <div className="space-y-6">
      {/* Score Distribution Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#253A7B]" />
          <h3 className="text-sm font-semibold text-gray-700">Score Distribution</h3>
        </div>
        <div className="space-y-3">
          {scoreDistribution.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{item.range}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#253A7B] h-2 rounded-full transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question-wise Accuracy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#253A7B]" />
          <h3 className="text-sm font-semibold text-gray-700">Question-wise Accuracy</h3>
        </div>
        <div className="space-y-3">
          {questionAccuracy.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 line-clamp-1">{item.question}</span>
                <span className="text-sm font-semibold text-gray-900">{item.accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#253A7B] h-2 rounded-full transition-all"
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Missed Questions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#253A7B]" />
          <h3 className="text-sm font-semibold text-gray-700">Top 5 Most Missed</h3>
        </div>
        <div className="space-y-3">
          {mostMissedQuestions.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 line-clamp-2">{item.question}</p>
                <p className="text-xs text-gray-600 mt-1">{item.missRate}% missed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
