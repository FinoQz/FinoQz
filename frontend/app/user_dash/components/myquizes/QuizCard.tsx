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
  bestScore?: number;
  coverImage?: string;
  attemptId?: string;
}

interface QuizCardProps {
  quiz: QuizData;
  onAction: (quizId: QuizData['id'], action: 'start' | 'continue' | 'view' | 'retake') => void;
}

export default function QuizCard({ quiz, onAction }: QuizCardProps) {
  const isUnlimited = quiz.attemptLimit === 'unlimited';
  const isCompleted = quiz.isAttempted && quiz.progress === 100;
  // A quiz is deactivated if it's single-attempt and completed
  const isDeactivated = isCompleted && !isUnlimited;
  const isInProgress = quiz.isAttempted && quiz.progress !== undefined && quiz.progress < 100;

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
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-900 transition-all duration-300 flex flex-col group relative ${
      isDeactivated ? 'opacity-90' : 'opacity-100'
    }`}>
      {/* Deactivated Overlay */}
      {isDeactivated && (
        <div className="absolute inset-0 z-20 bg-gray-50/10 backdrop-blur-[0.5px] pointer-events-none flex flex-col items-center justify-center p-6 text-center">
           {/* We keep it subtle so the report is still visible underneath */}
        </div>
      )}
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

        <div className="absolute bottom-3 right-3 z-30">
          {isDeactivated ? (
            <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-lg">
              <Lock className="w-3 h-3" /> Locked
            </span>
          ) : getStatusBadge()}
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
          <div className="mb-4 space-y-3">
            <div className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl relative overflow-hidden group/score">
              <div className="flex justify-between items-end mb-2 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold leading-none mb-1.5 uppercase tracking-wider">Latest Performance</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#253A7B] tabular-nums">{quiz.score}</span>
                    <span className="text-[11px] font-bold text-gray-400">/ {quiz.totalQuestions || quiz.questions}</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-[#253A7B]/5 text-[#253A7B] text-[9px] font-black rounded uppercase">
                      {Math.round(((quiz.score || 0) / (quiz.totalQuestions || quiz.questions || 1)) * 100)}%
                    </span>
                  </div>
                </div>
                {quiz.lastAttempted && (
                  <div className="text-right">
                    <span className="text-[9px] text-gray-300 font-bold block uppercase mb-0.5 whitespace-nowrap">Attempted On</span>
                    <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">{quiz.lastAttempted}</span>
                  </div>
                )}
              </div>
              <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-gray-200 relative z-10">
                <div
                  style={{ width: `${(quiz.score / (quiz.totalQuestions || quiz.questions)) * 100}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${
                    ((quiz.score / (quiz.totalQuestions || quiz.questions)) * 100) >= 40 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></div>
              </div>
              {/* Subtle background decoration */}
              <Trophy className="absolute -bottom-1 -right-1 w-12 h-12 text-[#253A7B]/5 rotate-12 group-hover/score:scale-110 transition-transform" />
            </div>

              {isUnlimited && quiz.bestScore !== undefined && quiz.bestScore !== quiz.score && (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/50 border border-emerald-100/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Personal Best</span>
                  </div>
                  <span className="text-xs font-black text-emerald-700">{quiz.bestScore} <span className="text-[10px] font-medium opacity-60">pts</span></span>
                </div>
              )}

              {isUnlimited && quiz.totalAttempts !== undefined && quiz.totalAttempts > 0 && (
                <div className="flex items-center justify-between px-3 py-2 bg-blue-50/30 border border-blue-100/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3 h-3 text-[#253A7B]" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Total Attempts</span>
                  </div>
                  <span className="text-xs font-black text-[#253A7B]">{quiz.totalAttempts}</span>
                </div>
              )}
            </div>
        ) : quiz.isAttempted && quiz.progress && quiz.progress < 100 ? (
          <div className="mb-4 bg-amber-50/30 p-3 rounded-xl border border-amber-100/50 relative overflow-hidden group/progress">
            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-[10px] text-amber-600 font-bold leading-none uppercase tracking-wider">In Progress</span>
              <span className="text-[11px] font-black text-amber-600 tabular-nums">{quiz.progress}%</span>
            </div>
            <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-amber-100/50 relative z-10">
              <div
                style={{ width: `${quiz.progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-400 transition-all duration-1000"
              ></div>
            </div>
            <RotateCcw className="absolute -bottom-1 -right-1 w-10 h-10 text-amber-500/10 -rotate-45 group-hover/progress:rotate-0 transition-transform duration-500" />
          </div>
        ) : (
          <div className="mb-4 py-4 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/30 group-hover:bg-gray-50/80 transition-colors">
            <Play className="w-5 h-5 text-gray-200 mb-1 group-hover:text-[#253A7B] transition-colors" />
            <span className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">Ready for attempt</span>
          </div>
        )}

        {/* Structured Footer Actions */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
          {isDeactivated ? (
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-500 rounded-xl font-bold text-[10px] sm:text-xs text-center border border-gray-200 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                No Retakes Available
              </div>
              {isCompleted && (
                <button
                  onClick={() => onAction(quiz.id, 'view')}
                  className="p-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition-all shadow-md z-30"
                  title="View Report"
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
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
                  !quiz.isAttempted
                    ? 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
                    : quiz.progress && quiz.progress < 100
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
                }`}
              >
                {!quiz.isAttempted ? 'Start Now' : quiz.progress && quiz.progress < 100 ? 'Resume' : 'Retake Quiz'}
                {!quiz.isAttempted && <ChevronRight className="w-3.5 h-3.5" />}
                {quiz.progress && quiz.progress < 100 && <Play className="w-3 h-3 fill-current" />}
                {isUnlimited && isCompleted && <RotateCcw className="w-3.5 h-3.5" />}
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

