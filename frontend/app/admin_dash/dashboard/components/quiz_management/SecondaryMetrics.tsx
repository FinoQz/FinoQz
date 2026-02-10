'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Award, Clock, RotateCcw } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface SecondaryMetricsProps {
  quizId: string;
}

interface QuizStats {
  totalAttempts?: number;
  avgPercentage?: number;
  maxScore?: number;
  avgTimeTaken?: number;
}

export default function SecondaryMetrics({ quizId }: SecondaryMetricsProps) {
  const [stats, setStats] = useState<QuizStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get(`/api/analytics/quiz-stats?quizId=${quizId}`);
        const quizStats = Array.isArray(response.data) ? response.data[0] : null;
        setStats(quizStats || {});
      } catch (err) {
        console.error('Failed to load secondary metrics:', err);
        setError('Failed to load metrics');
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [quizId]);

  const metrics = useMemo(() => {
    const avgScore = typeof stats.avgPercentage === 'number' ? `${stats.avgPercentage.toFixed(1)}%` : '—';
    const maxScore = typeof stats.maxScore === 'number' ? String(stats.maxScore) : '—';
    const avgTime = typeof stats.avgTimeTaken === 'number'
      ? `${Math.round(stats.avgTimeTaken / 60)} min`
      : '—';
    const attempts = typeof stats.totalAttempts === 'number' ? stats.totalAttempts.toLocaleString() : '—';

    return [
      { label: 'Avg Score', value: avgScore, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Top Score', value: maxScore, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Avg Time', value: avgTime, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Attempts', value: attempts, icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50' }
    ];
  }, [stats]);

  return (
    <div className="flex flex-wrap gap-3">
      {loading ? (
        <div className="text-sm text-gray-500">Loading metrics...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`${metric.bg} rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-200`}
            >
              <Icon className={`w-5 h-5 ${metric.color}`} />
              <div>
                <p className="text-xs text-gray-600 font-medium">{metric.label}</p>
                <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
