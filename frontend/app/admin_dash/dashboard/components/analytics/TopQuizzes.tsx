'use client';

import React from 'react';
import { Award } from 'lucide-react';

interface TopQuizzesProps {
  quizzes: {
    id: string;
    title: string;
    attempts: number;
  }[];
}

export default function TopQuizzes({ quizzes }: TopQuizzesProps) {
  const maxAttempts = Math.max(...quizzes.map(q => q.attempts));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-sm font-semibold text-gray-700">Top Performing Quizzes</h3>
      </div>

      <div className="space-y-4">
        {quizzes.map((quiz, index) => {
          const percentage = (quiz.attempts / maxAttempts) * 100;
          return (
            <div key={quiz.id} className="group">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-[#253A7B] transition">
                    {quiz.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{quiz.attempts.toLocaleString()} attempts</p>
                </div>
              </div>
              <div className="pl-9">
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#253A7B] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
