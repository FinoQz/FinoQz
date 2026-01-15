'use client';

import React from 'react';
import { X, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marks: number;
  maxMarks: number;
}

interface AttemptModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptData: {
    userName: string;
    email: string;
    quizTitle: string;
    attemptDate: string;
    score: number;
    totalScore: number;
    percentage: number;
    timeTaken: string;
    questions: Question[];
  } | null;
  onRegrade: () => void;
}

export default function AttemptModal({ isOpen, onClose, attemptData, onRegrade }: AttemptModalProps) {
  if (!isOpen || !attemptData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Attempt Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {attemptData.userName} • {attemptData.quizTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Score</p>
            <p className="text-lg font-bold text-gray-900">
              {attemptData.score}/{attemptData.totalScore}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Percentage</p>
            <p className="text-lg font-bold text-gray-900">{attemptData.percentage}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Time Taken</p>
            <p className="text-lg font-bold text-gray-900">{attemptData.timeTaken}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Attempt Date</p>
            <p className="text-sm text-gray-900">{attemptData.attemptDate}</p>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {attemptData.questions.map((q, index) => (
            <div
              key={q.id}
              className={`rounded-lg border-2 p-4 ${
                q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {q.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Question {index + 1}
                    </h4>
                    <span className="text-sm font-medium text-gray-700">
                      {q.marks}/{q.maxMarks} marks
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mb-3">{q.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        User Answer
                      </p>
                      <p
                        className={`text-sm px-3 py-2 rounded-lg ${
                          q.isCorrect
                            ? 'bg-green-100 text-green-900'
                            : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {q.userAnswer}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                        Correct Answer
                      </p>
                      <p className="text-sm bg-white px-3 py-2 rounded-lg text-gray-900 border border-gray-200">
                        {q.correctAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between sticky bottom-0 bg-white">
          <button
            onClick={onRegrade}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regrade Attempt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
