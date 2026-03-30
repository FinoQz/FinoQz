'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, FileQuestion, AlertCircle, Lock, ShoppingCart } from 'lucide-react';
import apiUser from '@/lib/apiUser';

interface PreviewQuestion {
  text: string;
  options: string[];
  type: string;
  marks: number;
}

interface QuizPreviewData {
  quizId: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  pricingType: string;
  price: number;
  difficultyLevel: string;
  category: string;
  previewQuestions: PreviewQuestion[];
  totalQuestions: number;
  isPreview: boolean;
}

interface QuizPreviewProps {
  quizId: string;
  onClose: () => void;
  onPurchase: () => void;
  canPreview: boolean;
  fetchPreviewData: (quizId: string) => Promise<QuizPreviewData>;
}

export default function QuizPreview({ quizId, onClose, onPurchase, canPreview, fetchPreviewData }: QuizPreviewProps) {
  const [previewData, setPreviewData] = useState<QuizPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    loadPreviewData();
  }, [quizId]);

  const loadPreviewData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiUser.get(`/api/quizzes/quizzes/${quizId}/preview`);
      // Fix: Use response.data.data
      setPreviewData(response.data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full p-6 text-center shadow-2xl border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 bg-black/10">
      <div className="bg-white rounded-[28px] max-w-3xl w-full my-4 max-h-[95vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{previewData.title}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Preview Mode - Limited Questions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Notice */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-yellow-900">
                This is a limited preview
              </p>
              <p className="text-[11px] sm:text-xs text-yellow-700 mt-1">
                You&apos;re viewing {previewData.previewQuestions ? previewData.previewQuestions.length : 0} out of {previewData.totalQuestions} questions.
                Purchase the full quiz to access all questions, save your progress, and earn certificates.
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{previewData.duration} minutes</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <FileQuestion className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{previewData.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-gray-500">Total Marks:</span>
              <span className="font-semibold text-gray-900">{previewData.totalMarks}</span>
            </div>
            {previewData.pricingType === 'paid' && (
              <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                <span className="text-base sm:text-lg font-bold text-[#253A7B]">₹{previewData.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 min-h-[220px] max-h-[40vh] sm:max-h-[45vh] overflow-y-auto">
          {canPreview ? (
            <div className="space-y-4 sm:space-y-6">
              {(previewData.previewQuestions || []).map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">
                      Question {questionIndex + 1} of {previewData.previewQuestions.length}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-4">
                    {question.text}
                  </h3>

                  <div className="space-y-2 sm:space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all ${
                          selectedAnswers[questionIndex] === optionIndex
                            ? 'border-[#253A7B] bg-[#253A7B]/5'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedAnswers[questionIndex] === optionIndex
                              ? 'border-[#253A7B] bg-[#253A7B]'
                              : 'border-gray-300'
                          }`}>
                            {selectedAnswers[questionIndex] === optionIndex && (
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-gray-800 text-xs sm:text-base">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[180px] sm:min-h-[320px] flex items-center justify-center text-center">
              <div className="max-w-md w-full border border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 bg-gray-50">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-[#253A7B] mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-semibold text-gray-900">Please enroll to preview</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                  Enroll in this quiz to unlock the preview questions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 z-10">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between flex-wrap">
            <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Preview answers are not saved and no score is recorded
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition font-medium"
              >
                Close Preview
              </button>
              {previewData.pricingType === 'paid' && (
                <button
                  onClick={onPurchase}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Purchase Full Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
