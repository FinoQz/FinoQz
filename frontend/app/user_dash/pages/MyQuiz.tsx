'use client';

import React from 'react';
import { BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MyQuiz() {
  const quizzes = [
    { id: 1, title: 'Personal Finance Basics', status: 'completed', score: 85, date: '2025-01-15' },
    { id: 2, title: 'Stock Market Analysis', status: 'in-progress', score: null, date: '2025-01-18' },
    { id: 3, title: 'Tax Planning', status: 'completed', score: 92, date: '2025-01-10' },
    { id: 4, title: 'Cryptocurrency Basics', status: 'not-started', score: null, date: null },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">My Quiz</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">View and manage your quiz attempts</p>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    {quiz.status === 'completed' && (
                      <>
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                        <span className="text-sm text-gray-600">Score: {quiz.score}%</span>
                        <span className="text-sm text-gray-500">{quiz.date}</span>
                      </>
                    )}
                    {quiz.status === 'in-progress' && (
                      <span className="flex items-center gap-1 text-sm text-orange-600">
                        <Clock className="w-4 h-4" />
                        In Progress
                      </span>
                    )}
                    {quiz.status === 'not-started' && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <XCircle className="w-4 h-4" />
                        Not Started
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium text-sm">
                {quiz.status === 'completed' ? 'View Results' : quiz.status === 'in-progress' ? 'Continue' : 'Start Quiz'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}