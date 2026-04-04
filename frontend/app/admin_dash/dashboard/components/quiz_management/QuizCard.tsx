'use client';

import React from 'react';
import { Clock, IndianRupee, Users, Edit2, Trash2, Eye } from 'lucide-react';

interface Quiz {
  _id: string;
  quizTitle: string;
  description: string;
  createdAt: string;
  duration: number;
  price: number;
  status: 'published' | 'draft';
  participantCount?: number;
  category?: string;
}

interface QuizCardProps {
  quiz: Quiz;
  onViewParticipants?: (quizId: string) => void;
  onEdit?: (quiz: Quiz) => void;
  onDelete?: (quiz: Quiz) => void;
  onPreview?: (quizId: string) => void;
}

export default function QuizCard({
  quiz,
  onViewParticipants,
  onEdit,
  onDelete,
  onPreview,
}: QuizCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#253A7B]/30 hover:shadow-md transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
              quiz.status === 'published'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              {quiz.status}
            </span>
            {quiz.category && (
              <span className="text-[10px] text-gray-400 font-medium">{quiz.category}</span>
            )}
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#253A7B] transition-colors truncate mb-0.5">
            {quiz.quizTitle}
          </h3>
          <p className="text-xs text-gray-400">
            ID: <span className="font-medium text-gray-500">{quiz._id.slice(-8)}</span>
            &nbsp;·&nbsp;Created {formatDate(quiz.createdAt)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 shrink-0 lg:px-8 lg:border-x lg:border-gray-100">
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Duration</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {quiz.duration} min
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Price</p>
            <div className="text-sm font-semibold">
              {quiz.price === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <span className="flex items-center gap-0.5 text-gray-700">
                  <IndianRupee className="w-3 h-3" />
                  {quiz.price}
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Participants</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {quiz.participantCount ?? 0}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Primary: View Details */}
          {onPreview && (
            <button
              onClick={() => onPreview(quiz._id)}
              className="flex items-center gap-2 px-4 py-2 bg-[#253A7B] text-white text-xs font-semibold rounded-lg hover:bg-[#1a2a5e] transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </button>
          )}

          {/* Secondary actions */}
          <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
            {onEdit && (
              <button
                onClick={() => onEdit(quiz)}
                title="Edit Quiz"
                className="p-2 text-gray-400 hover:text-[#253A7B] hover:bg-blue-50 rounded-lg transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onViewParticipants && (
              <button
                onClick={() => onViewParticipants(quiz._id)}
                title="View Participants"
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Users className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(quiz)}
                title="Delete Quiz"
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
