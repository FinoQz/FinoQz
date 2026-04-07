'use client';

import React, { useState } from 'react';
import { X, Download, Award, Clock, CheckCircle, XCircle, Circle, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface QuestionResult {
  questionNumber: number;
  status: 'correct' | 'wrong' | 'skipped';
  userAnswer?: string;
  correctAnswer?: string;
  questionText?: string;
  options?: string[];
  explanation?: string;
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizName: string;
  category: string;
  completionDate: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  timeTaken: string;
  percentage: number;
  passed: boolean;
  rank?: string;
  attemptsUsed?: number;
  totalAttempts?: number;
  canRetake: boolean;
  onRetake: () => void;
  onDownloadCertificate?: () => void;
  onViewCertificatePreview?: () => void;
  questionResults: QuestionResult[];
}

export default function ResultModal({
  isOpen,
  onClose,
  quizName,
  category,
  completionDate,
  score,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  skippedQuestions,
  timeTaken,
  percentage,
  passed,
  rank,
  attemptsUsed,
  totalAttempts,
  canRetake,
  onRetake,
  onDownloadCertificate,
  onViewCertificatePreview,
  questionResults,
}: ResultModalProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const toggleQuestionExpanded = (num: number) => {
    setExpandedQuestions(prev => ({ ...prev, [num]: !prev[num] }));
  };

  if (!isOpen) return null;

  const getStatusIcon = (status: 'correct' | 'wrong' | 'skipped') => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'wrong':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'skipped':
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Performance Analytics</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 font-medium">{quizName}</span>
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">{category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-12 custom-scrollbar">
          {/* Dashboard Summary Hero */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 justify-center bg-gray-50/30 rounded-3xl p-8 border border-gray-50">
             {/* Progress Gauge */}
            <div className="relative w-40 h-40 group">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  stroke="#253A7B"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="264"
                  strokeDashoffset={264 * (1 - percentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out shadow-sm"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900 tabular-nums">{percentage}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{passed ? 'Passed' : 'Failed'}</span>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
               <div className="space-y-1 text-center md:text-left">
                <span className="text-xs text-gray-400 font-semibold tracking-wide">Overall Proficiency</span>
                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                  <span className="text-6xl font-bold text-[#253A7B] tracking-tight">{score}</span>
                  <span className="text-2xl font-medium text-gray-300">/ {totalQuestions}</span>
                </div>
              </div>
              
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border-2 shadow-sm transition-all ${
                passed 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {passed ? 'Assessment Qualified' : 'Qualified Failed'}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Correct', value: correctAnswers, color: 'text-emerald-500', icon: CheckCircle },
              { label: 'Incorrect', value: wrongAnswers, color: 'text-rose-500', icon: XCircle },
              { label: 'Time Spent', value: timeTaken, color: 'text-gray-900', icon: Clock },
              { label: 'Global Rank', value: rank || '-', color: 'text-[#253A7B]', icon: Award },
            ].map((stat, i) => (
              <div key={i} className="p-5 border border-gray-100 rounded-2xl flex flex-col items-center bg-white hover:border-[#253A7B]/20 transition-all shadow-sm">
                <stat.icon className={`w-5 h-5 mb-4 ${stat.color} opacity-40`} />
                <span className="text-[10px] text-gray-400 font-bold mb-1">{stat.label}</span>
                <span className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Assessment Breakdown */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <h3 className="text-sm font-bold text-gray-900">Detailed Question Analysis</h3>
              
              {/* Visual Legend */}
              <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                  <span className="text-[10px] text-gray-500 font-bold">Selection: Correct</span>
                </div>
                <div className="flex items-center gap-2 px-3 border-l border-gray-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />
                  <span className="text-[10px] text-gray-500 font-bold">Selection: Incorrect</span>
                </div>
                <div className="flex items-center gap-2 px-3 border-l border-gray-200">
                  <div className="w-2.5 h-2.5 rounded-[3px] border border-emerald-400 bg-emerald-50 shadow-sm" />
                  <span className="text-[10px] text-gray-500 font-bold">Actual Answer</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {questionResults.map((q) => (
                <div
                  key={q.questionNumber}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:border-gray-200 transition-all"
                >
                  <div 
                    className="px-5 py-4 flex items-center gap-4 sm:gap-6 cursor-pointer hover:bg-gray-50/50"
                    onClick={() => toggleQuestionExpanded(q.questionNumber)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                      q.status === 'correct' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                    }`}>
                      {getStatusIcon(q.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-400">Question {q.questionNumber}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          q.status === 'correct' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                        }`}>
                          {q.status === 'correct' ? '+1 Point' : '0 Points'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{q.questionText}</p>
                    </div>

                    <div className="shrink-0">
                      {expandedQuestions[q.questionNumber] ? <ChevronUp className="w-5 h-5 text-gray-400 transition-transform" /> : <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />}
                    </div>
                  </div>

                  {expandedQuestions[q.questionNumber] && (
                    <div className="px-5 pb-6 pt-0 border-t border-gray-50">
                      <div className="pl-0 sm:pl-14 space-y-6 mt-5">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-2xl">{q.questionText}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options?.map((opt, oIdx) => {
                            const normalizedOpt = opt.trim().toLowerCase();
                            const normalizedUser = (q.userAnswer || "").trim().toLowerCase();
                            const normalizedCorrect = (q.correctAnswer || "").trim().toLowerCase();

                            const isUserChoice = normalizedOpt === normalizedUser;
                            const isCorrectChoice = normalizedOpt === normalizedCorrect;
                            const isBoth = isUserChoice && isCorrectChoice;
                            const isWrongChoice = isUserChoice && !isCorrectChoice;

                            let colorScheme = 'bg-white border-gray-100 text-gray-400 hover:border-gray-200';
                            if (isBoth) colorScheme = 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-1 ring-emerald-500/20';
                            else if (isWrongChoice) colorScheme = 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm ring-1 ring-rose-500/20';
                            else if (isCorrectChoice) colorScheme = 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm transition-all';

                            return (
                              <div
                                key={oIdx}
                                className={`px-4 py-3.5 rounded-xl border-2 transition-all flex items-center justify-between group h-fit min-h-[44px] ${colorScheme}`}
                              >
                                <span className={`text-xs ${isUserChoice || isCorrectChoice ? 'font-bold' : 'font-medium'} leading-normal pr-4`}>{opt}</span>
                                <div className="flex gap-2 shrink-0">
                                  {isUserChoice && (
                                    <span className={`text-[8px] font-bold px-2 py-1 rounded-lg shadow-sm border ${
                                      isWrongChoice 
                                        ? 'bg-rose-100 text-rose-700 border-rose-300' 
                                        : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                    }`}>
                                      {isWrongChoice ? 'Selection: Incorrect' : 'Selection: Correct ✔'}
                                    </span>
                                  )}
                                  {isCorrectChoice && !isUserChoice && (
                                    <span className="text-[8px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-sm">
                                      Actual Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl shadow-inner-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <Eye className="w-4 h-4 text-[#253A7B]/60" />
                              <span className="text-[10px] text-[#253A7B] font-bold uppercase tracking-wider">Solution Rationale</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed font-normal italic">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Qualified Badge & Actions */}
          {passed && (
            <div className="bg-[#253A7B] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4">
                <Award className="w-64 h-64" />
              </div>
              
              <Award className="w-12 h-12 text-white/40 mx-auto mb-6" />
              <h3 className="text-2xl font-bold tracking-tight mb-3">Qualified Assessment Success</h3>
              <p className="text-sm text-white/70 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                Congratulations on exceeding the performance benchmark. Your official certification is ready.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <button
                  onClick={onDownloadCertificate}
                  className="w-full sm:w-auto px-10 py-3.5 bg-white text-[#253A7B] rounded-xl text-xs font-bold hover:bg-blue-50 transition shadow-xl"
                >
                  Download Certificate
                </button>
                <button
                  onClick={onViewCertificatePreview}
                  className="w-full sm:w-auto px-10 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold hover:bg-white/20 transition backdrop-blur-sm"
                >
                  View Preview
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 text-xs font-bold text-gray-400 hover:text-gray-900 transition"
          >
            Close Dashboard
          </button>
          {canRetake && (
            <button
              onClick={onRetake}
              className="w-full sm:w-auto px-12 py-3.5 bg-[#253A7B] text-white rounded-xl text-xs font-bold hover:bg-[#1a2a5e] transition shadow-lg"
            >
              Retake Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
