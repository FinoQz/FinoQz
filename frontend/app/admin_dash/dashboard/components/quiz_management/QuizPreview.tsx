'use client';

import React, { useState } from 'react';
import { X, Clock, Target, Award, Users, Calendar, Eye, IndianRupee } from 'lucide-react';
import QuizAttempt from './QuizAttempt';

interface QuizPreviewProps {
  quizData: {
    quizTitle: string;
    description: string;
    category: string;
    duration: string;
    totalMarks: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    pricingType: 'free' | 'paid';
    price: string;
    attemptLimit: 'unlimited' | '1';
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    tags: string[];
    coverImagePreview: string;
    negativeMarking: boolean;
    negativePerWrong: string;
  };
  onClose: () => void;
}

export default function QuizPreview({ quizData, onClose }: QuizPreviewProps) {
  const [showQuizAttempt, setShowQuizAttempt] = useState(false);

  const {
    quizTitle,
    description,
    category,
    duration,
    totalMarks,
    difficultyLevel,
    pricingType,
    price,
    attemptLimit,
    startDate,
    startTime,
    endDate,
    endTime,
    tags,
    coverImagePreview,
    negativeMarking,
    negativePerWrong
  } = quizData;

  const handleStartQuiz = () => {
    setShowQuizAttempt(true);
  };

  const handleExitQuiz = () => {
    setShowQuizAttempt(false);
  };

  // Show Quiz Attempt Screen
  if (showQuizAttempt) {
    return (
      <QuizAttempt
        quizData={{
          quizTitle,
          duration,
          totalMarks,
          negativeMarking,
          negativePerWrong
        }}
        onExit={handleExitQuiz}
        onSubmit={(score, answers) => {
          console.log('Quiz submitted with score:', score, 'answers:', answers);
        }}
      />
    );
  }

  const getDifficultyColor = () => {
    switch (difficultyLevel) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date || !time) return 'Not set';
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Student Preview</h2>
              <p className="text-xs text-gray-600">How students will see this quiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cover Image */}
          {coverImagePreview && (
            <div className="w-full h-64 rounded-xl overflow-hidden">
              <img
                src={coverImagePreview}
                alt="Quiz cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#253A7B] bg-opacity-10 text-[#253A7B] rounded-full text-sm font-medium">
                {category || 'Uncategorized'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getDifficultyColor()}`}>
                {difficultyLevel}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {quizTitle || 'Untitled Quiz'}
            </h1>
            <p className="text-gray-700 leading-relaxed">
              {description || 'No description provided'}
            </p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Duration */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <Clock className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-xs text-blue-700 mb-1">Duration</p>
              <p className="text-lg font-bold text-blue-900">{duration || '0'} min</p>
            </div>

            {/* Total Marks */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <Target className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-xs text-green-700 mb-1">Total Marks</p>
              <p className="text-lg font-bold text-green-900">{totalMarks || '0'}</p>
            </div>

            {/* Attempts */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-xs text-purple-700 mb-1">Attempts</p>
              <p className="text-lg font-bold text-purple-900 capitalize">{attemptLimit}</p>
            </div>

            {/* Pricing */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <IndianRupee className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-xs text-orange-700 mb-1">Price</p>
              <p className="text-lg font-bold text-orange-900">
                {pricingType === 'free' ? 'Free' : `₹${price}`}
              </p>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="space-y-4">
            {/* Schedule */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Schedule</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Starts</p>
                  <p className="font-medium text-gray-900">{formatDateTime(startDate, startTime)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Ends</p>
                  <p className="font-medium text-gray-900">{formatDateTime(endDate, endTime)}</p>
                </div>
              </div>
            </div>

            {/* Rules & Guidelines */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Rules & Guidelines</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>You have <strong>{duration || '0'} minutes</strong> to complete this quiz</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>You can attempt this quiz <strong>{attemptLimit === 'unlimited' ? 'unlimited times' : 'only once'}</strong></span>
                </li>
                {negativeMarking && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">⚠</span>
                    <span><strong>Negative marking:</strong> {negativePerWrong || '0'} marks will be deducted for each wrong answer</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">ℹ</span>
                  <span>Make sure you have a stable internet connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">ℹ</span>
                  <span>Your progress will be auto-saved</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Close Preview
            </button>
            <button
              onClick={handleStartQuiz}
              className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium shadow-lg"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
