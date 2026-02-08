'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Wallet, Award, Loader2 } from 'lucide-react';
import apiUser from '@/lib/apiUser';

interface DashboardData {
  totalQuizzes: number;
  activeQuizzes: number;
  walletBalance: number;
  certificates: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    walletBalance: 0,
    certificates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [totalQuizzesRes, activeQuizzesRes, walletRes, certificatesRes] = await Promise.all([
          apiUser.get('/api/quiz-attempts/user/all?status=submitted'),
          apiUser.get('/api/quiz-attempts/user/all?status=in_progress'),
          apiUser.get('/api/wallet/balance'),
          apiUser.get('/api/certificates/user'),
        ]);

        setData({
          totalQuizzes: totalQuizzesRes.data?.length || 0,
          activeQuizzes: activeQuizzesRes.data?.length || 0,
          walletBalance: walletRes.data?.balance || 0,
          certificates: certificatesRes.data?.length || 0,
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 font-medium mb-2">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Welcome back! Heres your quiz activity overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Total Quizzes</div>
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shadow-sm">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.totalQuizzes}</div>
          <div className="text-xs mt-2 text-gray-600">Attempted quizzes</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Active Quizzes</div>
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.activeQuizzes}</div>
          <div className="text-xs mt-2 text-green-700">In progress</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Wallet Balance</div>
            <div className="p-2 sm:p-3 bg-purple-50 rounded-lg shadow-sm">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">₹{data.walletBalance.toLocaleString()}</div>
          <div className="text-xs mt-2 text-purple-600">Available balance</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Certificates</div>
            <div className="p-2 sm:p-3 bg-orange-50 rounded-lg shadow-sm">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{data.certificates}</div>
          <div className="text-xs mt-2 text-orange-700">Earned certificates</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center border-b border-l border-gray-200">
            <div className="text-gray-400 text-sm">Chart placeholder - Activity data</div>
          </div>
        </div>

        {/* Quiz Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Quiz Progress</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center border-b border-l border-gray-200">
            <div className="text-gray-400 text-sm">Chart placeholder - Progress data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
