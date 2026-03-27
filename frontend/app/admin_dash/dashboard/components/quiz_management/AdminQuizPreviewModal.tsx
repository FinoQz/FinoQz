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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quiz Preview</h2>
              <p className="text-xs text-gray-600">Admin preview of live quiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-sm text-gray-500">Loading preview...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : !preview ? (
            <div className="text-sm text-gray-500">No preview data available.</div>
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[var(--theme-primary)] bg-opacity-10 text-[var(--theme-primary)] rounded-full text-sm font-medium">
                    {preview.category || 'Uncategorized'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getDifficultyColor(preview.difficultyLevel)}`}>
                    {preview.difficultyLevel || 'unknown'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {preview.title || 'Untitled Quiz'}
                </h1>
                <p className="text-gray-700 leading-relaxed">
                  {preview.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <Clock className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-xs text-blue-700 mb-1">Duration</p>
                  <p className="text-lg font-bold text-blue-900">{preview.duration || 0} min</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <Target className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-xs text-green-700 mb-1">Total Marks</p>
                  <p className="text-lg font-bold text-green-900">{preview.totalMarks || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <p className="text-xs text-purple-700 mb-1">Total Questions</p>
                  <p className="text-lg font-bold text-purple-900">{preview.totalQuestions || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <IndianRupee className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-xs text-orange-700 mb-1">Price</p>
                  <p className="text-lg font-bold text-orange-900">
                    {preview.pricingType === 'free' ? 'Free' : `₹${preview.price || 0}`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Preview Questions</h3>
                {preview.previewQuestions.length === 0 ? (
                  <div className="text-sm text-gray-500">No preview questions available.</div>
                ) : (
                  preview.previewQuestions.map((question, index) => (
                    <div key={question.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                          <span className="text-xs text-gray-600">{question.marks || 1} mark</span>
                        </div>
                        {onEditQuestion && (
                          <button
                            className="text-blue-600 hover:underline text-xs font-medium"
                            onClick={() => onEditQuestion(question.id)}
                            title="Edit Question"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <p className="text-gray-800 mb-3">{question.text}</p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700">
                            {option}
                          </div>
                        ))}
                      </div>
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
