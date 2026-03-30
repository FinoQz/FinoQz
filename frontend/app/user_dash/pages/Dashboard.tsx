'use client';

import React, { useState, useEffect } from 'react';
import DashboardCharts from '../components/DashboardCharts';
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
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quizzes available and enrolled
        // Optionally fetch userId from session/localStorage if available
        // Example: setUserId(sessionStorage.getItem('userId') || undefined);
        const userIdParam = userId ? `?userId=${userId}` : '';
        const [quizzesRes, myQuizzesRes, walletRes, certificatesRes] = await Promise.all([
          apiUser.get(`/api/quiz/quizzes${userIdParam}`), // User-specific quizzes (visibility)
          apiUser.get(`/api/quiz/my-quizzes${userIdParam}`), // User-specific enrolled quizzes
          apiUser.get(`/api/wallet/balance${userIdParam}`), // User-specific wallet balance
          apiUser.get(`/api/certificates/user${userIdParam}`), // User-specific certificates
        ]);

        setData({
          totalQuizzes: quizzesRes.data?.data?.length || 0,
          activeQuizzes: myQuizzesRes.data?.data?.length || 0,
          walletBalance: walletRes.data?.balance || 0,
          certificates: certificatesRes.data?.certificates?.length || 0,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Error fetching dashboard data:', error);
        const message = err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data ? String(err.response.data.message) : 'Failed to load dashboard data. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Optionally set userId here if you want to use session/localStorage
    // setUserId(sessionStorage.getItem('userId') || undefined);
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
      <DashboardCharts userId={userId} />
    </div>
  );
}
