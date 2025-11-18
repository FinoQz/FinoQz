'use client';

import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function QuestionAccuracyChart() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [questions, setQuestions] = useState([
    { id: 1, text: 'What is compound interest?', correctRate: 89 },
    { id: 2, text: 'Define EBITDA', correctRate: 76 },
    { id: 3, text: 'Capital gains tax rate', correctRate: 68 },
    { id: 4, text: 'Stock market basics', correctRate: 82 },
    { id: 5, text: 'Mutual fund NAV', correctRate: 71 },
    { id: 6, text: 'Cryptocurrency concept', correctRate: 54 },
    { id: 7, text: 'Balance sheet components', correctRate: 79 },
    { id: 8, text: 'IPO process', correctRate: 63 }
  ]);

  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    const sorted = [...questions].sort((a, b) => 
      newOrder === 'desc' ? b.correctRate - a.correctRate : a.correctRate - b.correctRate
    );
    setQuestions(sorted);
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Question Accuracy</h3>
        <button
          onClick={handleSort}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium text-gray-700"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sort
        </button>
      </div>
      
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">Q{question.id}: {question.text}</span>
              <span className="text-sm font-bold text-gray-900">{question.correctRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  question.correctRate >= 75
                    ? 'bg-green-500'
                    : question.correctRate >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${question.correctRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600">Easy (≥75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-gray-600">Medium (50-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-600">Hard (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
}
