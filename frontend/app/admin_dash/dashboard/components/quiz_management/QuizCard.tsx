'use client';

import React from 'react';
import { Clock, IndianRupee, Users, Edit2, Trash2, Copy } from 'lucide-react';

interface Quiz {
  _id: string;
  quizTitle: string;   // ✅ backend field
  description: string;
  createdAt: string;
  duration: number; // in minutes
  price: number; // 0 for free
  status: 'published' | 'draft';
  participantCount?: number;
}

interface QuizCardProps {
  quiz: Quiz;
  onViewParticipants?: (quizId: string) => void;
  onEnroll?: (quizId: string) => void;
  onEdit?: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
  onDuplicate?: (quizId: string) => void;
}

export default function QuizCard({ 
  quiz, 
  onViewParticipants, 
  onEnroll,
  onEdit,
  onDelete,
  onDuplicate
}: QuizCardProps) {
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
          <h3 className="font-semibold text-gray-900 text-base mb-1">{quiz.quizTitle}</h3>
          <p className="text-xs text-gray-500">Created {formatDate(quiz.createdAt)}</p>
          {quiz.participantCount !== undefined && (
            <p className="text-xs text-gray-500">{quiz.participantCount} participants</p>
          )}
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
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(quiz)}
              className="flex items-center gap-1 px-3 py-1.5 text-[#253A7B] hover:bg-[#253A7B]/10 rounded-lg transition text-sm font-medium"
              title="Edit quiz"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(quiz._id)}
              className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
              title="Duplicate quiz"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(quiz)}
              className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
              title="Delete quiz"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {onViewParticipants && (
            <button
              onClick={() => onViewParticipants(quiz._id)}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
              title="View participants"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Participants</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
