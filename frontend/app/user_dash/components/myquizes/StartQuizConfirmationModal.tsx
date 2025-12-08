'use client';

import React from 'react';
import { X, Play, Info, Clock, FileQuestion, Star } from 'lucide-react';

interface StartQuizConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quizTitle: string;
  category: string;
  duration: number;
  totalQuestions: number;
  rating: number;
  isFree: boolean;
  price?: number;
}

export default function StartQuizConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  quizTitle,
  category,
  duration,
  totalQuestions,
  rating,
  isFree,
  price,
}: StartQuizConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border-2 border-gray-200">
        {/* Header */}
        <div className="p-5 border-b-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Start Quiz</h2>
                <p className="text-xs text-gray-600">Ready to test your knowledge?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Quiz Title & Category */}
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-3 py-1.5 bg-[#253A7B] text-white rounded-full font-semibold">
                {category}
              </span>
              {isFree ? (
                <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-semibold border border-green-300">
                  Free
                </span>
              ) : (
                <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold border border-blue-300">
                  ₹{price}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">{quizTitle}</h3>
          </div>

          {/* Quiz Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition group">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#253A7B] transition">
                <Clock className="w-5 h-5 text-[#253A7B] group-hover:text-white transition" />
              </div>
              <p className="text-xs text-gray-600 mb-1.5 font-medium">Duration</p>
              <p className="text-lg font-bold text-gray-900">{duration} min</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition group">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#253A7B] transition">
                <FileQuestion className="w-5 h-5 text-[#253A7B] group-hover:text-white transition" />
              </div>
              <p className="text-xs text-gray-600 mb-1.5 font-medium">Questions</p>
              <p className="text-lg font-bold text-gray-900">{totalQuestions}</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition group">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-gray-600 mb-1.5 font-medium">Rating</p>
              <p className="text-lg font-bold text-gray-900">{rating}</p>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-[#253A7B] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#253A7B] rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#253A7B] mb-2">Instructions</p>
                <ul className="text-xs text-gray-700 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#253A7B] font-bold mt-0.5">•</span>
                    <span>You have {duration} minutes to complete this quiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#253A7B] font-bold mt-0.5">•</span>
                    <span>All {totalQuestions} questions must be answered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#253A7B] font-bold mt-0.5">•</span>
                    <span>You can review and change answers before submitting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#253A7B] font-bold mt-0.5">•</span>
                    <span>Make sure you have a stable internet connection</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto flex-1 px-5 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] hover:shadow-xl transition font-semibold shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <Play className="w-4 h-4" />
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
