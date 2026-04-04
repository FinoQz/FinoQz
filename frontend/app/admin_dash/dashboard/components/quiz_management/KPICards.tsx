'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, CreditCard, IndianRupee } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';


interface KPICardsProps {
  quizId: string;
}

export default function KPICards({ quizId }: KPICardsProps) {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalAttempts: number;
    totalRevenue: number;
    paidUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch quiz-specific stats
        const [attemptsRes, revenueRes, paidRes] = await Promise.all([
          apiAdmin.get(`/api/quiz-attempts/quiz/${quizId}`),
          apiAdmin.get(`/api/analytics/quiz-revenue?quizId=${quizId}`),
          apiAdmin.get(`/api/analytics/quiz-paid-users?quizId=${quizId}`)
        ]);

        // Total users = unique users in attempts
        interface AttemptRecord {
          userId: string | { _id: string };
        }
        const attempts = Array.isArray(attemptsRes.data.attempts) ? attemptsRes.data.attempts : [];
        const userSet = new Set(attempts.map((a: AttemptRecord) => (typeof a.userId === 'string' ? a.userId : a.userId?._id)));
        const totalUsers = userSet.size;
        const totalAttempts = attempts.length;

        // Revenue
        const totalRevenue = Number(revenueRes.data?.totalRevenue || 0);

        // Paid users
        const paidUsers = Number(paidRes.data?.paidUsers || 0);

        setStats({
          totalUsers,
          totalAttempts,
          totalRevenue,
          paidUsers
        });
      } catch (err) {
        console.error('Failed to load KPI stats:', err);
        setError('Failed to load KPI stats');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchStats();
  }, [quizId]);

  const kpiData = useMemo(() => [
    {
      label: 'Registered',
      value: stats ? stats.totalUsers.toLocaleString() : '—',
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Attempted',
      value: stats ? stats.totalAttempts.toLocaleString() : '—',
      icon: UserCheck,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Paid users',
      value: stats ? stats.paidUsers.toLocaleString() : '—',
      icon: CreditCard,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Total revenue',
      value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : '—',
      icon: IndianRupee,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ], [stats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {error && (
        <div className="col-span-full text-sm text-red-600">{error}</div>
      )}
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{kpi.label}</p>
            </div>
            <p className={`text-xl font-semibold ${loading ? 'text-gray-400' : 'text-gray-900'}`}>{kpi.value}</p>
          </div>
        );
      })}
    </div>
  );
}
