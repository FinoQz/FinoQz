'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, CreditCard, IndianRupee } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

export default function KPICards() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalAttempts: number;
    totalRevenue: number;
  } | null>(null);
  const [paidCount, setPaidCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const [dashboardRes, revenueRes] = await Promise.all([
          apiAdmin.get('/api/analytics/dashboard-stats'),
          apiAdmin.get('/api/transactions/revenue-stats?dateRange=30')
        ]);

        const dashboard = dashboardRes.data || {};
        const revenueStats = revenueRes.data || {};
        const statusBreakdown = Array.isArray(revenueStats.statusBreakdown) ? revenueStats.statusBreakdown : [];
        const successRow = statusBreakdown.find((row: { _id?: string }) => row._id === 'success');

        setStats({
          totalUsers: Number(dashboard.totalUsers || 0),
          totalAttempts: Number(dashboard.totalAttempts || 0),
          totalRevenue: Number(dashboard.totalRevenue || 0)
        });
        setPaidCount(Number(successRow?.count || 0));
      } catch (err) {
        console.error('Failed to load KPI stats:', err);
        setError('Failed to load KPI stats');
        setStats(null);
        setPaidCount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      value: paidCount !== null ? paidCount.toLocaleString() : '—',
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
  ], [stats, paidCount]);

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
            className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
              <div className={`w-10 h-10 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${loading ? 'text-gray-400' : 'text-gray-900'}`}>{kpi.value}</p>
          </div>
        );
      })}
    </div>
  );
}
