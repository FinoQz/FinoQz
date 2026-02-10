'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface AttemptsBarChartProps {
  quizId: string;
}

export default function AttemptsBarChart({ quizId }: AttemptsBarChartProps) {
  const [data, setData] = useState<{ date: string; attempts: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get(`/api/quiz-attempts/quiz/${quizId}`);
        const attempts = response.data?.attempts || [];

        const now = new Date();
        const days = Array.from({ length: 7 }).map((_, i) => {
          const day = new Date(now);
          day.setDate(now.getDate() - (6 - i));
          return {
            key: day.toISOString().slice(0, 10),
            label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };
        });

        const counts = attempts.reduce((acc: Record<string, number>, attempt: { submittedAt?: string; startedAt?: string }) => {
          const rawDate = attempt.submittedAt || attempt.startedAt;
          if (!rawDate) return acc;
          const key = new Date(rawDate).toISOString().slice(0, 10);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const mapped = days.map(day => ({
          date: day.label,
          attempts: counts[day.key] || 0
        }));

        setData(mapped);
      } catch (err) {
        console.error('Failed to load attempts by date:', err);
        setError('Failed to load attempts');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [quizId]);

  const maxAttempts = useMemo(() => (data.length > 0 ? Math.max(...data.map(d => d.attempts)) : 0), [data]);

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Attempts by Date</h3>
        <BarChart3 className="w-5 h-5 text-[#253A7B]" />
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-500">Loading attempts...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-sm text-gray-500">No attempts data available.</div>
      ) : (
        <>
          <div className="flex items-end justify-between gap-2 h-48">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer transition-all hover:from-[#253A7B] hover:to-[#1a2a5e]"
                    style={{ height: `${maxAttempts > 0 ? (item.attempts / maxAttempts) * 100 : 0}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {item.attempts} attempts
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.date.split(' ')[1]}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4">Peak: {maxAttempts} attempts on {data.find(d => d.attempts === maxAttempts)?.date}</p>
        </>
      )}
    </div>
  );
}
