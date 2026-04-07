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
  enrolledCount?: number;
  participantCount?: number;
  category?: string;
  categoryName?: string;
  visibility?: string;
  assignedGroups?: string[];
  assignedIndividuals?: string[];
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
  const getVisibilityMeta = () => {
    const visibility = String(quiz.visibility || 'public').toLowerCase();
    if (visibility === 'public') {
      return {
        label: 'Public',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };
    }

    if (visibility === 'private') {
      const groupCount = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups.length : 0;
      return {
        label: groupCount > 0 ? `Private • Group (${groupCount})` : 'Private • Group',
        className: 'bg-amber-50 text-amber-700 border border-amber-200',
      };
    }

    if (visibility === 'individual') {
      const userCount = Array.isArray(quiz.assignedIndividuals) ? quiz.assignedIndividuals.length : 0;
      return {
        label: userCount > 0 ? `Private • Individual (${userCount})` : 'Private • Individual',
        className: 'bg-violet-50 text-violet-700 border border-violet-200',
      };
    }

    return {
      label: 'Private',
      className: 'bg-gray-100 text-gray-700 border border-gray-200',
    };
  };

  const visibilityMeta = getVisibilityMeta();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-[#253A7B]/30 hover:shadow-md transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
              quiz.status === 'published'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              {quiz.status}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${visibilityMeta.className}`}>
              {visibilityMeta.label}
            </span>
            {(quiz.categoryName || quiz.category) && (
              <span className="text-[10px] text-gray-400 font-medium break-words">{quiz.categoryName || quiz.category}</span>
            )}
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 group-hover:text-[#253A7B] transition-colors leading-snug mb-0.5 break-words">
            {quiz.quizTitle}
          </h3>
          <p className="text-[11px] text-gray-400">
            ID: <span className="font-medium text-gray-500">{quiz._id.slice(-8)}</span>
            &nbsp;·&nbsp;Created {formatDate(quiz.createdAt)}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 lg:gap-8 shrink-0 sm:px-0 lg:px-8 sm:border-t sm:border-gray-100 sm:pt-3 lg:pt-0 lg:border-t-0 lg:border-x lg:border-gray-100">
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Duration</p>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {quiz.duration} min
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Price</p>
            <div className="text-xs sm:text-sm font-semibold">
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
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Enrolled</p>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {quiz.enrolledCount ?? 0}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">Participants</p>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {quiz.participantCount ?? 0}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 shrink-0 w-full lg:w-auto">
          {/* Primary: View Details */}
          {onPreview && (
            <button
              onClick={() => onPreview(quiz._id)}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-[#253A7B] text-white text-xs font-semibold rounded-lg hover:bg-[#1a2a5e] transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </button>
          )}

          {/* Secondary actions */}
          <div className="flex items-center justify-end sm:justify-start gap-1 sm:border-l border-gray-200 sm:pl-2 sm:ml-1">
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
