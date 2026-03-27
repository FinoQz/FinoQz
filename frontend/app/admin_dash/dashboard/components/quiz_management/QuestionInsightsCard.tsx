'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface QuestionInsightsCardProps {
  quizId: string;
}

interface QuestionInsightItem {
  questionId: string;
  text: string;
  correctRate: number;
  avgTime: number;
  answeredCount: number;
  skippedCount: number;
  skipRate: number;
}

export default function QuestionInsightsCard({ quizId }: QuestionInsightsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'hardest' | 'time' | 'skipped'>('hardest');
  const [questions, setQuestions] = useState<QuestionInsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get(`/api/analytics/question-insights?quizId=${quizId}`);
        const items = (response.data?.questions || []).map((question: QuestionInsightItem) => ({
          questionId: question.questionId,
          text: question.text,
          correctRate: Number(question.correctRate || 0),
          avgTime: Number(question.avgTime || 0),
          answeredCount: Number(question.answeredCount || 0),
          skippedCount: Number(question.skippedCount || 0),
          skipRate: Number(question.skipRate || 0)
        }));

        setQuestions(items);
      } catch (err) {
        console.error('Failed to load question insights:', err);
        setError('Failed to load insights');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [quizId]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hardestQuestions = useMemo(() => {
    return [...questions]
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 5);
  }, [questions]);

  const timeIntensive = useMemo(() => {
    return [...questions]
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);
  }, [questions]);

  const mostSkipped = useMemo(() => {
    return [...questions]
      .sort((a, b) => b.skippedCount - a.skippedCount)
      .slice(0, 5);
  }, [questions]);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Question-Level Insights</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Toggle Buttons */}
          <div className="flex gap-2 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveView('hardest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'hardest'
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hardest Questions
            </button>
            <button
              onClick={() => setActiveView('time')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'time'
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Time Intensive
            </button>
            <button
              onClick={() => setActiveView('skipped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'skipped'
                  ? 'bg-[var(--theme-primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Most Skipped
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading insights...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : questions.length === 0 ? (
            <div className="text-sm text-gray-500">No question insights available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Question</th>
                    {activeView === 'hardest' && (
                      <>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Correct Rate</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Avg Time</th>
                      </>
                    )}
                    {activeView === 'time' && (
                      <>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Avg Time</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Answered</th>
                      </>
                    )}
                    {activeView === 'skipped' && (
                      <>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Skipped</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Skip Rate</th>
                      </>
                    )}
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeView === 'hardest' &&
                    hardestQuestions.map((q, index) => (
                      <tr key={q.questionId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-700">Q{index + 1}: {q.text}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-red-600">{q.correctRate}%</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">{formatTime(q.avgTime)}</td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-xs text-[var(--theme-primary)] hover:underline font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  {activeView === 'time' &&
                    timeIntensive.map((q, index) => (
                      <tr key={q.questionId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-700">Q{index + 1}: {q.text}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-orange-600">{formatTime(q.avgTime)}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">{q.answeredCount}</td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-xs text-[var(--theme-primary)] hover:underline font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                  {activeView === 'skipped' &&
                    mostSkipped.map((q, index) => (
                      <tr key={q.questionId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-700">Q{index + 1}: {q.text}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-yellow-600">{q.skippedCount}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-600">{q.skipRate}%</td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-xs text-[var(--theme-primary)] hover:underline font-medium">View</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
