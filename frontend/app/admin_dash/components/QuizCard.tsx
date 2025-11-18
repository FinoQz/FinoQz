'use client';

import React from 'react';
import { Clock, IndianRupee, Users } from 'lucide-react';

interface Quiz {
  _id: string;
  title: string;
  createdAt: string;
  duration: number; // in minutes
  price: number; // 0 for free
  status: 'published' | 'draft';
  participantCount?: number;
}

interface QuizCardProps {
  quiz: Quiz;
  onViewParticipants?: (quizId: string) => void;
}

export default function QuizCard({ quiz, onViewParticipants }: QuizCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
        {/* Title & Date */}
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-1">{quiz.title}</h3>
          <p className="text-xs text-gray-500">Created {formatDate(quiz.createdAt)}</p>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{quiz.duration} min</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1 text-gray-700">
          {quiz.price === 0 ? (
            <span className="text-sm font-medium text-green-600">Free</span>
          ) : (
            <>
              <IndianRupee className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{quiz.price}</span>
            </>
          )}
        </div>

        {/* Status */}
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              quiz.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {quiz.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Actions */}
        <div>
          <button
            onClick={() => onViewParticipants?.(quiz._id)}
            className="flex items-center gap-2 text-[#253A7B] hover:text-[#1a2a5e] transition text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            Participants
          </button>
        </div>
      </div>
    </div>
  );
}
