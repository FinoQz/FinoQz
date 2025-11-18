'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function UpcomingQuizzes() {
  const upcomingQuizzes = [
    { title: 'Advanced Stock Market Analysis', date: '2025-01-20', time: '10:00 AM' },
    { title: 'Tax Planning for Professionals', date: '2025-01-22', time: '02:30 PM' },
    { title: 'Cryptocurrency Investment Basics', date: '2025-01-25', time: '11:00 AM' }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Scheduled Quizzes</h3>
      </div>
      
      <div className="space-y-3">
        {upcomingQuizzes.map((quiz, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
          >
            <div className="w-12 h-12 bg-[#253A7B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-[#253A7B]" />
            </div>
            
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm mb-1">{quiz.title}</p>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(quiz.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {quiz.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition text-sm font-medium">
        View All Scheduled
      </button>
    </div>
  );
}
