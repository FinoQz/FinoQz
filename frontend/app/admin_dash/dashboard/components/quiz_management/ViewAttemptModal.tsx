
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Check, XCircle, Edit3 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface AttemptData {
  attemptId: string;
  name: string;
  score: number;
  timeTaken: string;
}
interface ViewAttemptModalProps {
  attemptData: AttemptData;
  onClose: () => void;
}

export default function ViewAttemptModal({ attemptData, onClose }: ViewAttemptModalProps) {
  const [questions, setQuestions] = useState<Array<{
    id: string;
    text: string;
    userAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
    totalMarks: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptData.attemptId) return;

    const fetchAttemptDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get(`/api/quiz-attempts/${attemptData.attemptId}`);
        const attempt = response.data;

        const formattedQuestions = (attempt.answers || []).map((answer: {
          questionId?: { _id?: string; text?: string; marks?: number };
          selectedAnswer?: unknown;
          isCorrect?: boolean;
          marksAwarded?: number;
        }) => {
          const selected = answer.selectedAnswer;
          const userAnswer = Array.isArray(selected)
            ? selected.join(', ')
            : typeof selected === 'string' || typeof selected === 'number'
            ? String(selected)
            : selected
            ? JSON.stringify(selected)
            : '—';

          return {
            id: String(answer.questionId?._id || ''),
            text: answer.questionId?.text || 'Question text not available',
            userAnswer,
            isCorrect: Boolean(answer.isCorrect),
            marksAwarded: Number(answer.marksAwarded || 0),
            totalMarks: Number(answer.questionId?.marks || 0)
          };
        });

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error('Failed to load attempt details:', err);
        setError('Failed to load attempt details');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptData.attemptId]);

  const totalScore = useMemo(() => {
    return questions.reduce((sum, question) => sum + question.marksAwarded, 0);
  }, [questions]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{attemptData.name}&apos;s Attempt</h2>
              <p className="text-sm text-gray-600 mt-1">
                Score: <span className="font-bold text-[var(--theme-primary)]">{attemptData.score}%</span> • 
                Time: {attemptData.timeTaken}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-xl font-medium text-sm flex items-center gap-2 cursor-not-allowed"
                title="Manual mark editing is not available yet"
              >
                <Edit3 className="w-4 h-4" />
                Edit Marks
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="text-sm text-gray-500">Loading attempt details...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : questions.length === 0 ? (
              <div className="text-sm text-gray-500">No answers available for this attempt.</div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id || index} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Question {index + 1}
                    </h3>
                    {question.isCorrect ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>

                  <p className="text-gray-700 mb-4">{question.text}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Answer */}
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase mb-2">User&apos;s Answer</p>
                      <p className="text-gray-900">{question.userAnswer}</p>
                    </div>

                    {/* Correctness */}
                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase mb-2">Correctness</p>
                      <p className="text-gray-900">{question.isCorrect ? 'Correct' : 'Incorrect'}</p>
                    </div>
                  </div>

                  {/* Marks */}
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm text-gray-600">Marks:</span>
                    <span className="font-bold text-lg text-gray-900">{question.marksAwarded}</span>
                    <span className="text-sm text-gray-600">/ {question.totalMarks}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-2xl font-bold text-gray-900">{totalScore}</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
