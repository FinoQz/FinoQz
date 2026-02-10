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
  fetchPreviewData: (quizId: string) => Promise<QuizPreviewData>;
}

export default function QuizPreview({ quizId, onClose, onPurchase, fetchPreviewData }: QuizPreviewProps) {
  const [previewData, setPreviewData] = useState<QuizPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
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

  const currentQ = previewData.previewQuestions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
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
        <div className="px-6 py-8 min-h-[400px]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {previewData.previewQuestions.length}
              </span>
              <span className="text-sm text-gray-600">
                {currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {currentQ.text}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full text-left px-4 py-4 rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-[#253A7B] bg-[#253A7B]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-[#253A7B] bg-[#253A7B]'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestion(Math.min(previewData.previewQuestions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === previewData.previewQuestions.length - 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
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
