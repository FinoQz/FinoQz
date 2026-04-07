'use client';

import { Clock, FileQuestion, Calendar, Trophy, RotateCcw, Lock, CheckCircle2, ChevronRight, BarChart3, Play } from 'lucide-react';

export interface QuizData {
  id: number | string;
  title: string;
  category: string;
  price: number;
  duration: number;
  questions: number;
  isPaid: boolean;
  isAttempted: boolean;
  attemptLimit?: 'unlimited' | '1';
  score?: number;
  totalQuestions?: number;
  lastAttempted?: string;
  progress?: number; // 0-100
  totalAttempts?: number;
  coverImage?: string;
  attemptId?: string;
}

interface QuizCardProps {
  quiz: QuizData;
  onAction: (quizId: any, action: 'start' | 'continue' | 'view' | 'retake') => void;
}

export default function QuizCard({ quiz, onAction }: QuizCardProps) {
  const isUnlimited = quiz.attemptLimit === 'unlimited';
  const isCompleted = quiz.isAttempted && quiz.progress === 100;
  const isExpired = isCompleted && !isUnlimited;

  const getStatusBadge = () => {
    if (!quiz.isAttempted) {
      return (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded border border-blue-100">
          Ready
        </span>
      );
    }
    if (quiz.progress && quiz.progress < 100) {
      return (
        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded border border-amber-100">
          In Progress
        </span>
      );
    }
    return (
      <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${
        isUnlimited 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
          : 'bg-gray-100 text-gray-500 border-gray-200'
      }`}>
        {isUnlimited ? 'Unlimited' : 'Finalized'}
      </span>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-900 transition-all duration-300 flex flex-col group ${
      isExpired ? 'opacity-80' : 'opacity-100'
    }`}>
      {/* Media Section */}
      <div className="relative aspect-video bg-gray-50 border-b border-gray-100 overflow-hidden">
        {quiz.coverImage ? (
          <img src={quiz.coverImage} alt={quiz.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-200" />
          </div>
        )}
        
        {/* Subtle Meta Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 text-[10px] font-medium rounded">
            {quiz.category}
          </span>
          <div className="px-2 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 text-[10px] font-medium rounded">
            {isUnlimited ? 'Unlimited Attempts' : 'Single Attempt'}
          </div>
        </div>

        <div className="absolute bottom-3 right-3">
          {getStatusBadge()}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Main Title */}
        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug mb-3 min-h-[2rem]">
          {quiz.title}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Clock className="w-3 h-3" />
            {quiz.duration} min
          </div>
          <div className="flex items-center gap-1.5 border-l border-gray-100 pl-3 text-xs text-gray-400 font-medium">
            <FileQuestion className="w-3 h-3" />
            {quiz.questions} Questions
          </div>
        </div>

        {/* Achievement/Result Bar */}
        {isCompleted && quiz.score !== undefined ? (
          <div className="mb-4 p-3 bg-gray-50/50 border border-gray-100 rounded-xl">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold leading-none mb-1.5">Achievement Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-900 tabular-nums">{quiz.score}</span>
                  <span className="text-[11px] font-medium text-gray-400">/ {quiz.totalQuestions || quiz.questions}</span>
                </div>
              </div>
              {quiz.lastAttempted && (
                <span className="text-[10px] text-gray-400 font-bold">{quiz.lastAttempted}</span>
              )}
            </div>
            <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-gray-200">
              <div
                style={{ width: `${(quiz.score / (quiz.totalQuestions || quiz.questions)) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#253A7B] transition-all duration-1000"
              ></div>
            </div>
          </div>
        ) : quiz.isAttempted && quiz.progress && quiz.progress < 100 ? (
          <div className="mb-4 bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-amber-600 font-bold leading-none">In Progress</span>
              <span className="text-[11px] font-bold text-amber-600">{quiz.progress}%</span>
            </div>
            <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-amber-100/50">
              <div
                style={{ width: `${quiz.progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-400 transition-all duration-1000"
              ></div>
            </div>
          </div>
        ) : (
          <div className="mb-4 py-3 flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
            <span className="text-[10px] text-gray-400 font-bold tracking-tight">Available for attempt</span>
          </div>
        )}

        {/* Structured Footer Actions */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
          {isExpired ? (
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 py-2.5 px-4 bg-gray-50 text-gray-400 rounded-xl font-bold text-[10px] sm:text-xs text-center border border-gray-100 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Assessment Finalized
              </div>
              {isCompleted && (
                <button
                  onClick={() => onAction(quiz.id, 'view')}
                  className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:border-[#253A7B] hover:text-[#253A7B] transition-all shadow-sm"
                  title="View Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  if (!quiz.isAttempted) onAction(quiz.id, 'start');
                  else if (quiz.progress && quiz.progress < 100) onAction(quiz.id, 'continue');
                  else if (isUnlimited) onAction(quiz.id, 'retake');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  !quiz.isAttempted
                    ? 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
                    : quiz.progress && quiz.progress < 100
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-white text-[#253A7B] border-2 border-[#253A7B]/10 hover:border-[#253A7B]/30 hover:bg-blue-50/50'
                }`}
              >
                {!quiz.isAttempted ? 'Start' : quiz.progress && quiz.progress < 100 ? 'Resume' : 'Retake'}
                {!quiz.isAttempted && <ChevronRight className="w-3.5 h-3.5" />}
                {quiz.progress && quiz.progress < 100 && <Play className="w-3 h-3 fill-current" />}
              </button>

              {isCompleted && (
                <button
                  onClick={() => onAction(quiz.id, 'view')}
                  className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:border-[#253A7B] hover:text-[#253A7B] transition-all shadow-sm"
                  title="View Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

