'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, FileQuestion, AlertCircle, Lock, ShoppingCart, CheckCircle2, ChevronRight, Play, Info, RotateCcw } from 'lucide-react';
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
  attemptLimit?: 'unlimited' | '1' | string;
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

export default function QuizPreview({ quizId, onClose, onPurchase, canPreview }: QuizPreviewProps) {
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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/5">
        <div className="bg-white border border-gray-200 rounded-xl max-w-sm w-full p-10 text-center shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Initialising Preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/5">
        <div className="bg-white border border-gray-200 rounded-xl max-w-sm w-full p-8 text-center shadow-lg">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">{error}</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!previewData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/10">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-3xl w-full my-4 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{previewData.category}</span>
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-[10px] font-bold text-[#253A7B] uppercase tracking-widest">Trial Preview</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">{previewData.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Duration</span>
              <span className="text-xs font-bold text-gray-700">{previewData.duration} min</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Questions</span>
              <span className="text-xs font-bold text-gray-700">{previewData.totalQuestions} Total</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Marks</span>
              <span className="text-xs font-bold text-gray-700">{previewData.totalMarks} Points</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Limit</span>
              <span className="text-xs font-bold text-gray-700 capitalize">{previewData.attemptLimit || 'Unlimited'}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {!canPreview ? (
            <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="max-w-xs text-center p-8">
                <Lock className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-gray-900 mb-2">Enrollment Required</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                  Please enroll in this quiz to unlock the preview set and access all training materials.
                </p>
                <button
                  onClick={onPurchase}
                  disabled={canPreview}
                  className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition shadow-sm ${
                    canPreview 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
                  }`}
                >
                  {canPreview ? 'Already Enrolled' : 'Enroll Now'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-start gap-3">
                <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                  Viewing sample items. Full solutions, explanations, and certifications are available upon complete enrollment.
                </p>
              </div>

              {(previewData.previewQuestions || []).map((question, qIdx) => (
                <div key={qIdx} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item {qIdx + 1}</span>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{question.marks} PT</span>
                  </div>
                  
                  <p className="text-sm font-bold text-gray-900 leading-relaxed">
                    {question.text}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {question.options.map((option, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSelect(qIdx, oIdx)}
                        className={`text-left px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${
                          selectedAnswers[qIdx] === oIdx
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-3 opacity-40 font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <div className="hidden md:block">
            {previewData.pricingType === 'paid' && (
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Fee</span>
                <span className="text-lg font-black text-gray-900 leading-none">₹{previewData.price}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-2 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-900 transition-colors"
            >
              Exit
            </button>
            <button
              onClick={onPurchase}
              disabled={canPreview}
              className={`flex-[2] md:flex-none flex items-center justify-center gap-2 px-8 py-2 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-colors ${
                canPreview
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              {canPreview ? 'Already Enrolled' : 'Enroll Now'}
              <ChevronRight className={`w-3.5 h-3.5 ${canPreview ? 'text-gray-300' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

