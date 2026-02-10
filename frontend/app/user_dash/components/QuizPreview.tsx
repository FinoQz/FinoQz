'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, FileQuestion, AlertCircle, Lock, ShoppingCart } from 'lucide-react';

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
      const data = await fetchPreviewData(quizId);
      setPreviewData(data);
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-3xl w-full my-8 max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{previewData.title}</h2>
            <p className="text-sm text-gray-600 mt-1">Preview Mode - Limited Questions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Notice */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                This is a limited preview
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Youre viewing {previewData.previewQuestions.length} out of {previewData.totalQuestions} questions. 
                Purchase the full quiz to access all questions, save your progress, and earn certificates.
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{previewData.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{previewData.totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total Marks:</span>
              <span className="font-semibold text-gray-900">{previewData.totalMarks}</span>
            </div>
            {previewData.pricingType === 'paid' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-lg font-bold text-[#253A7B]">₹{previewData.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="px-6 py-6 min-h-[320px] max-h-[45vh] overflow-y-auto">
          {canPreview ? (
            <div className="space-y-6">
              {previewData.previewQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Question {questionIndex + 1} of {previewData.previewQuestions.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    {question.text}
                  </h3>

                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                          selectedAnswers[questionIndex] === optionIndex
                            ? 'border-[#253A7B] bg-[#253A7B]/5'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedAnswers[questionIndex] === optionIndex
                              ? 'border-[#253A7B] bg-[#253A7B]'
                              : 'border-gray-300'
                          }`}>
                            {selectedAnswers[questionIndex] === optionIndex && (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-gray-800">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[320px] flex items-center justify-center text-center">
              <div className="max-w-md w-full border border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50">
                <Lock className="w-10 h-10 text-[#253A7B] mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900">Please enroll to preview</p>
                <p className="text-sm text-gray-600 mt-2">
                  Enroll in this quiz to unlock the preview questions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-sm text-gray-600">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Preview answers are not saved and no score is recorded
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition font-medium"
              >
                Close Preview
              </button>
              {previewData.pricingType === 'paid' && (
                <button
                  onClick={onPurchase}
                  className="px-6 py-3 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium flex items-center gap-2"
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
