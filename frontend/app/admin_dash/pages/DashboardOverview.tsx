'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalRevenue: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/panel/pending-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          pendingApprovals: res.data.length || 0,
          totalRevenue: 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Comprehensive platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Total Users</div>
            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-md">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
          <div className="flex items-center gap-1 text-xs mt-2 text-gray-700">
            <TrendingUp className="w-4 h-4" />
            <span>+12% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Active Users</div>
            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-md">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.activeUsers}</div>
          <div className="text-xs mt-2 text-gray-600">Approved accounts</div>
        </div>

        <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Pending Approval</div>
            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-md">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-800">{stats.pendingApprovals}</div>
          <div className="text-xs mt-2 text-gray-700">Requires action</div>
        </div>

        <div className="bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-400 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Total Revenue</div>
            <div className="p-2 sm:p-3 bg-white rounded-lg shadow-md">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">₹{stats.totalRevenue}</div>
          <div className="flex items-center gap-1 text-xs mt-2 text-gray-700">
            <TrendingUp className="w-4 h-4" />
            <span>+24% this month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Daily Revenue (Last 14 Days)</h3>
          <div className="h-48 sm:h-64 flex items-end justify-center border-b border-l border-gray-200">
            <div className="text-gray-400 text-sm">Chart placeholder - No data yet</div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">User Growth</h3>
          <div className="h-48 sm:h-64 flex items-end justify-center border-b border-l border-gray-200">
            <div className="text-gray-400 text-sm">Chart placeholder - No data yet</div>
          </div>
        </div>
      </div>
    </div>
  );
}
