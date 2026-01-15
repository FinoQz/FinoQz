'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function QuestionInsightsCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'hardest' | 'time' | 'skipped'>('hardest');

  const hardestQuestions = [
    { id: 6, text: 'Cryptocurrency concept', correctRate: 54, avgTime: '2:45' },
    { id: 8, text: 'IPO process', correctRate: 63, avgTime: '3:12' },
    { id: 3, text: 'Capital gains tax rate', correctRate: 68, avgTime: '2:18' },
    { id: 5, text: 'Mutual fund NAV', correctRate: 71, avgTime: '2:56' },
    { id: 2, text: 'Define EBITDA', correctRate: 76, avgTime: '2:30' }
  ];

  const timeIntensive = [
    { id: 8, text: 'IPO process', avgTime: '3:12', attempts: 892 },
    { id: 5, text: 'Mutual fund NAV', avgTime: '2:56', attempts: 876 },
    { id: 6, text: 'Cryptocurrency concept', avgTime: '2:45', attempts: 854 },
    { id: 2, text: 'Define EBITDA', avgTime: '2:30', attempts: 889 },
    { id: 3, text: 'Capital gains tax rate', avgTime: '2:18', attempts: 892 }
  ];

  const mostSkipped = [
    { id: 6, text: 'Cryptocurrency concept', skipped: 124, skipRate: 14 },
    { id: 8, text: 'IPO process', skipped: 98, skipRate: 11 },
    { id: 3, text: 'Capital gains tax rate', skipped: 87, skipRate: 10 },
    { id: 5, text: 'Mutual fund NAV', skipped: 76, skipRate: 9 },
    { id: 7, text: 'Balance sheet components', skipped: 65, skipRate: 7 }
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Question-Level Insights</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Toggle Buttons */}
          <div className="flex gap-2 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveView('hardest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'hardest'
                  ? 'bg-[#253A7B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hardest Questions
            </button>
            <button
              onClick={() => setActiveView('time')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'time'
                  ? 'bg-[#253A7B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Time Intensive
            </button>
            <button
              onClick={() => setActiveView('skipped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'skipped'
                  ? 'bg-[#253A7B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Most Skipped
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Question</th>
                  {activeView === 'hardest' && (
                    <>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Correct Rate</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Avg Time</th>
                    </>
                  )}
                  {activeView === 'time' && (
                    <>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Avg Time</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Attempts</th>
                    </>
                  )}
                  {activeView === 'skipped' && (
                    <>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Skipped</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Skip Rate</th>
                    </>
                  )}
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeView === 'hardest' &&
                  hardestQuestions.map((q) => (
                    <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">Q{q.id}: {q.text}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-red-600">{q.correctRate}%</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">{q.avgTime}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-xs text-[#253A7B] hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                {activeView === 'time' &&
                  timeIntensive.map((q) => (
                    <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">Q{q.id}: {q.text}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-orange-600">{q.avgTime}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">{q.attempts}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-xs text-[#253A7B] hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                {activeView === 'skipped' &&
                  mostSkipped.map((q) => (
                    <tr key={q.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">Q{q.id}: {q.text}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-yellow-600">{q.skipped}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">{q.skipRate}%</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-xs text-[#253A7B] hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
