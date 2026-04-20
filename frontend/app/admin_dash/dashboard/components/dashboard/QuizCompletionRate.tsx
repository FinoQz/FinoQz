'use client';

import React, { useEffect, useState } from 'react';
import { LayoutGrid, ListChecks, Users, ActivitySquare, BarChart3, Clock, PieChart, Trophy } from 'lucide-react';

interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  activeQuizzes: number;
  mostAttemptedQuiz: { quizTitle: string; attempts: number } | null;
  quizzesToday?: number;
  avgAttemptsPerQuiz?: number;
}

interface StatItem {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  wide?: boolean;
}

export default function QuizCompletionRate() {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/quiz-admin-dashboard');
        setStats(res.data);
      } catch {
        setStats({ totalQuizzes: 0, totalAttempts: 0, activeQuizzes: 0, mostAttemptedQuiz: null, quizzesToday: 0, avgAttemptsPerQuiz: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items: StatItem[] = [
    {
      label: 'Total Quizzes',
      value: stats?.totalQuizzes ?? 0,
      sub: 'Published on platform',
      icon: <ListChecks className="w-4 h-4" />,
      iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
    },
    {
      label: 'Total Attempts',
      value: (stats?.totalAttempts ?? 0).toLocaleString(),
      sub: 'All time submissions',
      icon: <Users className="w-4 h-4" />,
      iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    },
    {
      label: 'Active Now',
      value: stats?.activeQuizzes ?? 0,
      sub: 'Live quizzes',
      icon: <ActivitySquare className="w-4 h-4" />,
      iconBg: 'bg-green-50', iconColor: 'text-green-600',
    },
    {
      label: 'Added Today',
      value: stats?.quizzesToday ?? 0,
      sub: 'New this session',
      icon: <Clock className="w-4 h-4" />,
      iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    },
    {
      label: 'Avg Attempts / Quiz',
      value: (stats?.avgAttemptsPerQuiz ?? 0).toFixed(1),
      sub: 'Engagement rate',
      icon: <PieChart className="w-4 h-4" />,
      iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
    },
    {
      label: 'Top Quiz',
      value: stats?.mostAttemptedQuiz?.quizTitle || 'N/A',
      sub: stats?.mostAttemptedQuiz?.attempts ? `${stats.mostAttemptedQuiz.attempts} attempts` : 'No data yet',
      icon: <Trophy className="w-4 h-4" />,
      iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600',
      wide: true,
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e8ecf9] flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-[#253A7B]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Quiz Overview</h3>
            <p className="text-[10px] text-gray-400">Platform-wide quiz analytics</p>
          </div>
        </div>
        {!loading && stats && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            {stats.activeQuizzes} live
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="p-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={`quiz-skeleton-${i}`} className={`bg-gray-50 rounded-xl p-3.5 animate-pulse ${i === 6 ? 'col-span-2 sm:col-span-1' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-14 mb-1.5" />
                <div className="h-2.5 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item, i) => (
              <div
                key={item.label}
                className={`group bg-gray-50 border border-gray-100 rounded-2xl p-3.5 hover:border-gray-200 hover:shadow-sm transition-all duration-200
                  ${item.wide ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-3`}>
                  {item.icon}
                </div>
                <p className="text-base font-bold text-gray-900 leading-none tabular-nums truncate">{item.value}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">{item.label}</p>
                {item.sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
