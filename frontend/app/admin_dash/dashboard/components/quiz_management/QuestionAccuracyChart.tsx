'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface QuestionAccuracyChartProps {
  quizId: string;
}

interface QuestionAccuracyItem {
  questionId: string;
  text: string;
  correctRate: number;
}

export default function QuestionAccuracyChart({ quizId }: QuestionAccuracyChartProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [questions, setQuestions] = useState<QuestionAccuracyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchAccuracy = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get(`/api/analytics/question-insights?quizId=${quizId}`);
        const items = (response.data?.questions || []).map((question: {
          questionId: string;
          text: string;
          correctRate: number;
        }) => ({
          questionId: question.questionId,
          text: question.text,
          correctRate: Number(question.correctRate || 0)
        }));

        setQuestions(items);
      } catch (err) {
        console.error('Failed to load question accuracy:', err);
        setError('Failed to load question accuracy');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccuracy();
  }, [quizId]);

  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
  };

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) =>
      sortOrder === 'desc' ? b.correctRate - a.correctRate : a.correctRate - b.correctRate
    );
  }, [questions, sortOrder]);

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Question Accuracy</h3>
        <button
          onClick={handleSort}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium text-gray-700"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sort
        </button>
      </div>
      
      {loading ? (
        <div className="text-sm text-gray-500">Loading accuracy...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : sortedQuestions.length === 0 ? (
        <div className="text-sm text-gray-500">No question accuracy data available.</div>
      ) : (
        <div className="space-y-3">
          {sortedQuestions.map((question, index) => (
            <div key={question.questionId} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">
                  Q{index + 1}: {question.text}
                </span>
                <span className="text-sm font-bold text-gray-900">{question.correctRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    question.correctRate >= 75
                      ? 'bg-green-500'
                      : question.correctRate >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${question.correctRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600">Easy (≥75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-gray-600">Medium (50-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-600">Hard (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
}
