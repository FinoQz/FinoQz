'use client';

import React from 'react';
import { Clock, FileQuestion, Calendar } from 'lucide-react';

export interface QuizData {
  id: number;
  title: string;
  category: string;
  price: number;
  duration: number;
  questions: number;
  isPaid: boolean;
  isAttempted: boolean;
  score?: number;
  totalQuestions?: number;
  lastAttempted?: string;
  progress?: number; // 0-100
}

interface QuizCardProps {
  quiz: QuizData;
  onAction: (quizId: number, action: 'start' | 'continue' | 'view' | 'retake') => void;
}

export default function QuizCard({ quiz, onAction }: QuizCardProps) {
  const getStatusInfo = () => {
    if (!quiz.isAttempted) {
      return {
        text: 'Not Attempted',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
      };
    }
    if (quiz.progress && quiz.progress < 100) {
      return {
        text: `In Progress (${quiz.progress}%)`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      };
    }
    return {
      text: `Completed`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    };
  };

  const getActionButton = () => {
    if (!quiz.isAttempted) {
      return {
        label: 'Start Quiz',
        action: 'start' as const,
        style: 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]',
      };
    }
    if (quiz.progress && quiz.progress < 100) {
      return {
        label: 'Continue',
        action: 'continue' as const,
        style: 'bg-orange-500 text-white hover:bg-orange-600',
      };
    }
    return {
      label: 'View Result',
      action: 'view' as const,
      style: 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]',
    };
  };

  const statusInfo = getStatusInfo();
  const actionButton = getActionButton();

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Header with Category Badge */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#253A7B] transition flex-1">
            {quiz.title}
          </h3>
          <span className="inline-block text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold ml-2">
            {quiz.category}
          </span>
        </div>

        {/* Price Badge */}
        <div>
          {quiz.isPaid ? (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              ₹{quiz.price}
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Quiz Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Duration & Questions */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{quiz.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <FileQuestion className="w-4 h-4" />
            <span className="font-medium">{quiz.questions} Qs</span>
          </div>
        </div>

        {/* Status Section */}
        <div className={`p-3 rounded-xl ${statusInfo.bgColor} mb-4`}>
          <p className={`text-sm font-semibold ${statusInfo.color} mb-2`}>
            {statusInfo.text}
          </p>
          
          {/* Progress Bar (if in progress) */}
          {quiz.progress !== undefined && quiz.progress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${quiz.progress}%` }}
              ></div>
            </div>
          )}

          {/* Score Display (if completed) */}
          {quiz.isAttempted && quiz.progress === 100 && quiz.score !== undefined && quiz.totalQuestions && (
            <p className="text-lg font-bold text-green-600">
              Score: {quiz.score}/{quiz.totalQuestions}
            </p>
          )}

          {/* Last Attempted Date */}
          {quiz.isAttempted && quiz.lastAttempted && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
              <Calendar className="w-3 h-3" />
              <span>Last attempted: {quiz.lastAttempted}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => onAction(quiz.id, actionButton.action)}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${actionButton.style}`}
          >
            {actionButton.label}
          </button>
          
          {/* Retake button if completed */}
          {quiz.isAttempted && quiz.progress === 100 && (
            <button
              onClick={() => onAction(quiz.id, 'retake')}
              className="px-4 py-2.5 border-2 border-[#253A7B] text-[#253A7B] rounded-xl hover:bg-[#253A7B] hover:text-white transition font-medium"
            >
              Retake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
