'use client';

import React, { useState } from 'react';
import { X, Download, Award, Clock, CheckCircle, XCircle, Circle, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface QuestionResult {
  questionNumber: number;
  status: 'correct' | 'wrong' | 'skipped';
  userAnswer?: string;
  correctAnswer?: string;
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
  const [showQuestionDetails, setShowQuestionDetails] = useState(false);

  if (!isOpen) return null;

  const getStatusIcon = (status: 'correct' | 'wrong' | 'skipped') => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-4 h-4 text-[#253A7B]" />;
      case 'wrong':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'skipped':
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-gray-200">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-[#253A7B] to-[#1e3166]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Quiz Result</h2>
              <p className="text-sm text-blue-100">
                {quizName} • {category}
              </p>
              <p className="text-xs text-blue-200 mt-1">Completed on {completionDate}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Score Display */}
          <div className="text-center py-8 bg-white rounded-2xl border-2 border-gray-200">
            <div className="mb-6">
              <p className="text-sm text-gray-600 font-medium mb-3">Your Score</p>
              <p className="text-6xl font-bold text-[#253A7B]">
                {score} <span className="text-4xl text-gray-400">/ {totalQuestions}</span>
              </p>
            </div>
            
            {/* Pass/Fail Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              {passed ? (
                <span className="flex items-center gap-2 text-[#253A7B] bg-blue-50 px-6 py-2 rounded-full font-semibold border-2 border-[#253A7B]">
                  <CheckCircle className="w-5 h-5" />
                  Passed
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-700 bg-gray-100 px-6 py-2 rounded-full font-semibold border-2 border-gray-300">
                  <XCircle className="w-5 h-5" />
                  Failed
                </span>
              )}
            </div>

            {/* Percentage Circle */}
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#253A7B"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#253A7B]">{percentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-lg transition">
              <p className="text-xs text-gray-600 mb-2 font-medium">Total Questions</p>
              <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-lg transition">
              <p className="text-xs text-gray-600 mb-2 font-medium">Correct</p>
              <p className="text-3xl font-bold text-[#253A7B]">{correctAnswers}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-lg transition">
              <p className="text-xs text-gray-600 mb-2 font-medium">Wrong</p>
              <p className="text-3xl font-bold text-gray-600">{wrongAnswers}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-lg transition">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-3 h-3 text-gray-600" />
                <p className="text-xs text-gray-600 font-medium">Time Taken</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{timeTaken}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 text-sm py-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#253A7B] border-2 border-gray-200"></div>
              <span className="text-gray-700 font-medium">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-gray-200"></div>
              <span className="text-gray-700 font-medium">Wrong</span>
            </div>
            {skippedQuestions > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-200"></div>
                <span className="text-gray-700 font-medium">Skipped</span>
              </div>
            )}
          </div>

          {/* Rank & Attempts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rank && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Your Rank</p>
                <p className="text-xl font-bold text-[#253A7B]">{rank}</p>
              </div>
            )}
            {attemptsUsed && totalAttempts && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Attempts Used</p>
                <p className="text-xl font-bold text-gray-900">
                  {attemptsUsed} <span className="text-gray-500">of {totalAttempts}</span>
                </p>
              </div>
            )}
          </div>

          {/* Question Summary */}
          <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowQuestionDetails(!showQuestionDetails)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
            >
              <span className="font-bold text-gray-900">Question Summary</span>
              {showQuestionDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showQuestionDetails && (
              <div className="max-h-64 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {questionResults.map((q) => (
                  <div
                    key={q.questionNumber}
                    className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-200 font-bold text-sm text-gray-700">
                      Q{q.questionNumber}
                    </div>
                    <div className="flex-1">
                      {q.status === 'correct' ? (
                        <p className="text-sm text-[#253A7B] font-semibold">Marked correct</p>
                      ) : q.status === 'wrong' ? (
                        <p className="text-sm text-gray-700">
                          Your answer: <span className="font-semibold">{q.userAnswer}</span> • 
                          Correct: <span className="font-semibold text-[#253A7B]">{q.correctAnswer}</span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 font-medium">Not answered</p>
                      )}
                    </div>
                    {getStatusIcon(q.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View Correct Answers Link */}
          <div className="text-center">
            <button className="text-sm text-[#253A7B] hover:underline font-semibold">
              View correct answers in detail →
            </button>
          </div>

          {/* Certificate Section */}
          {passed ? (
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 border-2 border-[#253A7B] rounded-2xl p-6 text-center">
              <Award className="w-16 h-16 text-[#253A7B] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-sm text-gray-700 mb-6 font-medium">
                You are eligible for a certificate.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onDownloadCertificate}
                  className="flex items-center gap-2 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-semibold shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Certificate
                </button>
                <button
                  onClick={onViewCertificatePreview}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-[#253A7B] text-[#253A7B] rounded-xl hover:bg-[#253A7B] hover:text-white transition font-semibold"
                >
                  <Eye className="w-5 h-5" />
                  View Preview
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-600 font-medium">
                Certificate is available only for passed quizzes. Keep practicing!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold"
          >
            Close
          </button>
          {canRetake && (
            <button
              onClick={onRetake}
              className="w-full sm:w-auto px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-semibold shadow-lg"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
