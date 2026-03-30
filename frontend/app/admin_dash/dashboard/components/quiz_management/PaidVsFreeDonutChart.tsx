'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PieChart } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface PaidVsFreeDonutChartProps {
  quizId: string;
}

export default function PaidVsFreeDonutChart({ quizId }: PaidVsFreeDonutChartProps) {
  const [paidCount, setPaidCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError('');

        const [transactionsRes, attemptsRes] = await Promise.all([
          apiAdmin.get('/api/transactions/all?status=success&dateRange=30'),
          apiAdmin.get(`/api/quiz-attempts/quiz/${quizId}`)
        ]);

        const transactions = transactionsRes.data?.transactions || [];
        const paidForQuiz = transactions.filter((txn: { quizId?: { _id?: string } | string }) => {
          const txnQuizId = typeof txn.quizId === 'string' ? txn.quizId : txn.quizId?._id;
          return String(txnQuizId || '') === String(quizId);
        });

        const stats = attemptsRes.data?.stats || {};
        const attemptsCount = Number(stats.totalAttempts || (attemptsRes.data?.attempts || []).length || 0);

        setPaidCount(paidForQuiz.length);
        setTotalAttempts(attemptsCount);
      } catch (err) {
        console.error('Failed to load paid vs free data:', err);
        setError('Failed to load paid vs free data');
        setPaidCount(0);
        setTotalAttempts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [quizId]);

  const freeCount = Math.max(totalAttempts - paidCount, 0);
  const total = paidCount + freeCount;

  const data = useMemo(() => {
    const paidPercentage = total > 0 ? Math.round((paidCount / total) * 100) : 0;
    const freePercentage = total > 0 ? Math.round((freeCount / total) * 100) : 0;
    return [
      { label: 'Paid', value: paidCount, color: 'bg-[#253A7B]', percentage: paidPercentage },
      { label: 'Free', value: freeCount, color: 'bg-blue-400', percentage: freePercentage }
    ];
  }, [paidCount, freeCount, total]);

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Paid vs Free Participants</h3>
        <PieChart className="w-5 h-5 text-purple-600" />
      </div>
      
      {/* Simplified Donut Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-500">Loading distribution...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : total === 0 ? (
        <div className="text-sm text-gray-500">No participant data available.</div>
      ) : (
        <>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#253A7B"
                  strokeWidth="20"
                  strokeDasharray={`${data[0].percentage * 2.51} ${251 - data[0].percentage * 2.51}`}
                  className="transition-all"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="20"
                  strokeDasharray={`${data[1].percentage * 2.51} ${251 - data[1].percentage * 2.51}`}
                  strokeDashoffset={`-${data[0].percentage * 2.51}`}
                  className="transition-all"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-3xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
