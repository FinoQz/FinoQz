'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileText, DollarSign, UserCheck, Calendar, Download } from 'lucide-react';
import KpiCard from '../components/analytics/KpiCard';
import FiltersBar from '../components/analytics/FiltersBar';
import UserGrowthChart from '../components/analytics/UserGrowthChart';
import AttemptsChart from '../components/analytics/AttemptsChart';
import FreeVsPaidChart from '../components/analytics/FreeVsPaidChart';
import TopCategories from '../components/analytics/TopCategories';
import TopQuizzes from '../components/analytics/TopQuizzes';
import EngagementHours from '../components/analytics/EngagementHours';
import RecentEvents from '../components/analytics/RecentEvents';
import Toast from '../components/analytics/Toast';
import api from '@/lib/api';

// TypeScript interfaces for API responses
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalQuizzes: number;
  activeQuizzes: number;
  totalAttempts: number;
  totalRevenue: number;
  certificatesIssued: number;
}

interface UserGrowthData {
  date: string;
  users: number;
}

interface TransformedUserGrowthData {
  date: string;
  users: number;
  attempts: number;
  revenue: number;
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // State for API data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<TransformedUserGrowthData[]>([]);
  const [attemptsData, setAttemptsData] = useState<Array<{ day: string; attempts: number }>>([]);
  const [topCategories, setTopCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [topQuizzes, setTopQuizzes] = useState<Array<{ id: string; title: string; attempts: number }>>([]);

  // Keep hourly engagement and recent events as placeholder for now
  const hourlyEngagement = [
    { hour: '12A', engagement: 45 },
    { hour: '1A', engagement: 32 },
    { hour: '2A', engagement: 28 },
    { hour: '3A', engagement: 25 },
    { hour: '4A', engagement: 22 },
    { hour: '5A', engagement: 30 },
    { hour: '6A', engagement: 65 },
    { hour: '7A', engagement: 120 },
    { hour: '8A', engagement: 185 },
    { hour: '9A', engagement: 245 },
    { hour: '10A', engagement: 290 },
    { hour: '11A', engagement: 310 },
    { hour: '12P', engagement: 285 },
    { hour: '1P', engagement: 265 },
    { hour: '2P', engagement: 295 },
    { hour: '3P', engagement: 320 },
    { hour: '4P', engagement: 340 },
    { hour: '5P', engagement: 365 },
    { hour: '6P', engagement: 380 },
    { hour: '7P', engagement: 395 },
    { hour: '8P', engagement: 410 },
    { hour: '9P', engagement: 385 },
    { hour: '10P', engagement: 295 },
    { hour: '11P', engagement: 180 }
  ];

  const recentEvents = [
    {
      id: '1',
      type: 'revenue' as const,
      title: 'Revenue Spike Detected',
      description: 'Revenue increased by 23% in the last 24 hours',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'quiz' as const,
      title: 'New Quiz Created',
      description: '"Advanced Investment Strategies" published by admin',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      type: 'user' as const,
      title: 'User Milestone Reached',
      description: '10,000+ registered users milestone achieved',
      timestamp: '1 day ago'
    },
    {
      id: '4',
      type: 'revenue' as const,
      title: 'Payment Gateway Update',
      description: 'Successfully processed 150+ transactions today',
      timestamp: '1 day ago'
    }
  ];

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all analytics data in parallel
        const [statsResponse, growthResponse, quizStatsResponse, categoryResponse] = await Promise.all([
          api.get<DashboardStats>('/analytics/dashboard-stats'),
          api.get<UserGrowthData[]>(`/analytics/user-growth?dateRange=${dateRange}`),
          api.get('/analytics/quiz-stats'),
          api.get('/analytics/category-performance')
        ]);

        setDashboardStats(statsResponse.data);
        
        // Transform user growth data to match chart format
        const transformedGrowthData = growthResponse.data.map((item, index) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: item.users,
          attempts: 0, // Placeholder
          revenue: 0 // Placeholder
        }));
        
        setUserGrowthData(transformedGrowthData);

        // Transform quiz stats for top quizzes
        const quizStats = quizStatsResponse.data || [];
        const transformedQuizzes = quizStats.slice(0, 5).map((quiz: any) => ({
          id: quiz.quizId,
          title: quiz.quizTitle,
          attempts: quiz.totalAttempts
        }));
        setTopQuizzes(transformedQuizzes);

        // TODO: Create dedicated backend endpoint for daily attempts breakdown
        // For now, using empty array until real endpoint is available
        setAttemptsData([]);

        // Transform category performance
        const categoryStats = categoryResponse.data || [];
        const transformedCategories = categoryStats.map((cat: any) => ({
          name: cat.category || 'Uncategorized',
          count: cat.totalAttempts
        }));
        setTopCategories(transformedCategories);

      } catch (err: unknown) {
        console.error('Failed to fetch analytics data:', err);
        const errorMessage = (err instanceof Error && 'response' in err 
          ? (err as Error & { response?: { data?: { message?: string } } }).response?.data?.message 
          : undefined) || 'Failed to load analytics data';
        setError(errorMessage);
        setToast({ type: 'error', message: 'Failed to load analytics data' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  // Compute KPI data from dashboard stats
  const kpiData = dashboardStats ? {
    totalUsers: dashboardStats.totalUsers,
    totalQuizzes: dashboardStats.totalQuizzes,
    totalPurchases: `₹${dashboardStats.totalRevenue.toLocaleString()}`,
    dailyActiveUsers: dashboardStats.activeUsers
  } : {
    totalUsers: 0,
    totalQuizzes: 0,
    totalPurchases: '₹0',
    dailyActiveUsers: 0
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedQuiz('all');
    setSelectedUserType('all');
    setToast({ type: 'success', message: 'Filters reset successfully' });
  };

  const handleExport = (format: string) => {
    setToast({ type: 'success', message: `Exporting analytics as ${format}...` });
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A7B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Platform insights and performance metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Picker */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Export Button */}
          <button 
            onClick={() => handleExport('CSV')}
            className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <KpiCard
          icon={Users}
          label="Total Users"
          value={kpiData.totalUsers.toLocaleString()}
          trend={{ value: '12.5% from last month', isPositive: true }}
        />
        <KpiCard
          icon={FileText}
          label="Total Quizzes Created"
          value={kpiData.totalQuizzes}
          trend={{ value: '8 new this week', isPositive: true }}
        />
        <KpiCard
          icon={DollarSign}
          label="Total Purchases"
          value={kpiData.totalPurchases}
          trend={{ value: '15.3% from last month', isPositive: true }}
        />
        <KpiCard
          icon={UserCheck}
          label="Daily Active Users"
          value={kpiData.dailyActiveUsers.toLocaleString()}
          suffix="DAU"
        />
      </div>

      {/* Filters */}
      <FiltersBar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedQuiz={selectedQuiz}
        onQuizChange={setSelectedQuiz}
        selectedUserType={selectedUserType}
        onUserTypeChange={setSelectedUserType}
        onReset={handleResetFilters}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <UserGrowthChart data={userGrowthData} />
        <AttemptsChart data={attemptsData} />
      </div>

      {/* Free vs Paid & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FreeVsPaidChart freeParticipation={4532} paidParticipation={6214} />
        <TopCategories categories={topCategories} />
      </div>

      {/* Bottom Section - Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TopQuizzes quizzes={topQuizzes} />
        <EngagementHours hourlyData={hourlyEngagement} />
        <RecentEvents events={recentEvents} />
      </div>

      {/* Data Update Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">Data updates every 15 minutes • Last updated: 2 minutes ago</p>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
