'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, ListChecks, Users, ActivitySquare, Calendar, Clock, PieChart } from 'lucide-react';

interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  activeQuizzes: number;
  mostAttemptedQuiz: {
    quizTitle: string;
    attempts: number;
  } | null;
  quizzesToday?: number;
  avgAttemptsPerQuiz?: number;
}

export default function QuizCompletionRate() {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/quiz-admin-dashboard');
        setStats(res.data);
      } catch (err) {
        setStats({ totalQuizzes: 0, totalAttempts: 0, activeQuizzes: 0, mostAttemptedQuiz: null, quizzesToday: 0, avgAttemptsPerQuiz: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-[#e6eafd] rounded-lg">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Admin Quiz Overview</h3>
      </div>
      <div
        className="
          flex gap-2 overflow-x-auto pb-1
          sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4 sm:overflow-x-visible
        "
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Card 1 */}
        <div className="min-w-[130px] max-w-[180px] w-full rounded-xl border border-gray-200 shadow p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-shrink-0 min-h-[80px]">
          <div className="flex items-center gap-1 mb-0">
            <ListChecks className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
            <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">Total Quizzes</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--theme-primary)]">{loading ? <span className="animate-pulse">...</span> : stats?.totalQuizzes ?? 0}</div>
        </div>
        {/* Card 2 */}
        <div className="min-w-[130px] max-w-[180px] w-full rounded-xl border border-gray-200 shadow p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-shrink-0 min-h-[80px]">
          <div className="flex items-center gap-1 mb-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
            <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">Total Attempts</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--theme-primary)]">{loading ? <span className="animate-pulse">...</span> : stats?.totalAttempts ?? 0}</div>
        </div>
        {/* Card 3 */}
        <div className="min-w-[130px] max-w-[180px] w-full rounded-xl border border-gray-200 shadow p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-shrink-0 min-h-[80px]">
          <div className="flex items-center gap-1 mb-0">
            <ActivitySquare className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
            <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">Active Quizzes</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--theme-primary)]">{loading ? <span className="animate-pulse">...</span> : stats?.activeQuizzes ?? 0}</div>
        </div>
        {/* Card 4 */}
        <div className="min-w-[130px] max-w-[180px] w-full rounded-xl border border-gray-200 shadow p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-shrink-0 min-h-[80px]">
          <div className="flex items-center gap-1 mb-0">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
            <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">Most Attempted Quiz</span>
          </div>
          <div className="text-[11px] sm:text-sm font-semibold text-[var(--theme-primary)]">
            {loading ? <span className="animate-pulse">...</span> : stats?.mostAttemptedQuiz?.quizTitle || 'N/A'}
            {stats?.mostAttemptedQuiz?.attempts ? (
              <span className="ml-1 text-xs text-gray-500">({stats.mostAttemptedQuiz.attempts} attempts)</span>
            ) : null}
          </div>
        </div>
        {/* Card 5 */}
        <div className="min-w-[130px] max-w-[180px] w-full rounded-xl border border-gray-200 shadow p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-shrink-0 min-h-[80px]">
          <div className="flex items-center gap-1 mb-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
            <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">Quizzes Today</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--theme-primary)]">{loading ? <span className="animate-pulse">...</span> : stats?.quizzesToday ?? 0}</div>
        </div>
        {/* Card 6 */}
        <div className="min-w-[130px] max-w-[180px] w-full rounded-xl border border-gray-200 shadow p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1 flex-shrink-0 min-h-[80px]">
          <div className="flex items-center gap-1 mb-0">
            <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
            <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">Avg Attempts/Quiz</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--theme-primary)]">{loading ? <span className="animate-pulse">...</span> : (stats?.avgAttemptsPerQuiz ?? 0).toFixed(1)}</div>
        </div>
      </div>
      {/* Slider hint for mobile */}
      {!loading && stats && Object.keys(stats).length > 2 && (
        <div className="block sm:hidden text-xs text-gray-400 mt-2 text-center select-none">
          Swipe to see more stats &rarr;
        </div>
      )}
    </div>
  );
}
