'use client';

import React, { useEffect, useState } from 'react';
import { X, Clock, Target, IndianRupee, Eye } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface PreviewQuestion {
  id: string;
  text: string;
  options: string[];
  type: 'mcq' | 'true-false';
  marks: number;
  correct?: number;
  explanation?: string;
}

interface PreviewData {
  quizId: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  pricingType: 'free' | 'paid';
  price: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  category: string;
  previewQuestions: PreviewQuestion[];
  totalQuestions: number;
}

interface AdminQuizPreviewModalProps {
  quizId: string;
  onClose: () => void;
  onEditQuestion?: (questionId: string) => void;
}

export default function AdminQuizPreviewModal({ quizId, onClose, onEditQuestion }: AdminQuizPreviewModalProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get(`/api/quizzes/${quizId}/preview`);
        setPreview(response.data?.data || null);
      } catch (err) {
        console.error('Failed to load quiz preview:', err);
        setError('Failed to load quiz preview');
        setPreview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [quizId]);

  const getDifficultyColor = (difficulty?: PreviewData['difficultyLevel']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#253A7B] bg-opacity-10 rounded-lg">
              <Eye className="w-5 h-5 text-[#ffffff]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quiz Preview</h2>
              <p className="text-xs text-gray-500">Admin view of live quiz content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#253A7B] rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          ) : !preview ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 text-sm">
              No preview data available.
            </div>
          ) : (
            <>
              {/* Header Info Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-[#253A7B] bg-opacity-10 text-[#ffffff] rounded text-xs font-medium">
                    {preview.category || 'Uncategorized'}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium capitalize ${getDifficultyColor(preview.difficultyLevel)}`}>
                    {preview.difficultyLevel || 'unknown'}
                  </span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1.5">
                  {preview.title || 'Untitled Quiz'}
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {preview.description || 'No description provided.'}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{preview.duration || 0} min</p>
                  </div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Marks</p>
                    <p className="text-sm font-semibold text-gray-900">{preview.totalMarks || 0}</p>
                  </div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <span className="text-lg font-medium px-1">?</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Questions</p>
                    <p className="text-sm font-semibold text-gray-900">{preview.totalQuestions || 0}</p>
                  </div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Price</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {preview.pricingType === 'free' ? 'Free' : `₹${preview.price || 0}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-semibold text-gray-900">Quiz Content</h3>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    {preview.previewQuestions.length} Questions
                  </span>
                </div>

                {preview.previewQuestions.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500">No questions available in this quiz.</p>
                  </div>
                ) : (
                  preview.previewQuestions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative group hover:border-gray-200 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium border border-gray-200">
                              Question {index + 1}
                            </span>
                            <span className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-100 font-medium">
                              {question.marks || 1} mark{(question.marks || 1) > 1 ? 's' : ''}
                            </span>
                            <span className="px-2.5 py-1 text-gray-500 text-[11px] font-medium uppercase tracking-wide">
                              {question.type === 'true-false' ? 'True/False' : 'Multiple Choice'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">{question.text}</p>
                        </div>
                        {onEditQuestion && (
                          <button
                            onClick={() => onEditQuestion(question.id)}
                            className="ml-4 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#253A7B] rounded text-xs transition border border-gray-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isCorrect = question.correct === optionIndex;
                          return (
                            <div
                              key={optionIndex}
                              className={`w-full px-4 py-2.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${isCorrect
                                ? 'border-green-200 bg-green-50/50'
                                : 'border-gray-100 bg-gray-50/30 hover:bg-gray-50'
                                }`}
                            >
                              <div className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-medium ${isCorrect
                                ? 'bg-green-500 border-green-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-400'
                                }`}>
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <span className={`flex-1 text-sm ${isCorrect ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                                {option}
                              </span>
                              {isCorrect && (
                                <span className="text-xs font-medium text-green-700 bg-green-100/80 px-2 py-0.5 rounded ml-2">Correct</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-4 p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-blue-800">
                          <span className="font-semibold block mb-1">Explanation:</span>
                          <span className="leading-relaxed opacity-90">{question.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
