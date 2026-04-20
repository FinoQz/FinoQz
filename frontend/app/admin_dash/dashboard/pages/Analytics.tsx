'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  UserCheck, 
  Calendar, 
  Download, 
  BarChart3, 
  PieChart, 
  LayoutDashboard, 
  Database,
  TrendingUp,
  Target,
  ChevronLeft,
  CheckCircle,
  File,
  Clock,
  Activity
} from 'lucide-react';
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
import QuizPicker from '../components/analytics/QuizPicker';
import QuizDetailAnalytics from '../components/analytics/QuizDetailAnalytics';
import UserLocationChart from '../components/analytics/UserLocationChart';
import apiAdmin from '@/lib/apiAdmin';

// TypeScript interfaces for API responses
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalQuizzes: number;
  activeQuizzes: number;
  totalAttempts: number;
  totalRevenue: number;
  certificatesIssued: number;
  participationSplit: {
    free: number;
    paid: number;
  };
}

interface UserGrowthData {
  date: string;
  users: number;
  attempts?: number;
  revenue?: number;
}

interface TransformedUserGrowthData {
  date: string;
  users: number;
  attempts: number;
  revenue: number;
}

interface QuizStats {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
}

interface CategoryStats {
  category: string;
  totalAttempts: number;
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [view, setView] = useState<'overview' | 'detail'>('overview');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // State for API data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<TransformedUserGrowthData[]>([]);
  const [attemptsData, setAttemptsData] = useState<Array<{ day: string; attempts: number }>>([]);
  const [topCategories, setTopCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [topQuizzes, setTopQuizzes] = useState<Array<{ id: string; title: string; attempts: number }>>([]);
  const [userLocationCities, setUserLocationCities] = useState<Array<{
    city: string; profileCount: number; activityCount: number; total: number;
  }>>([]);

  const hourlyEngagement: Array<{ hour: string; engagement: number }> = [];
  const recentEvents: Array<{ id: string; type: 'revenue' | 'quiz' | 'user'; title: string; description: string; timestamp: string }> = [];

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all analytics data in parallel
        const [statsResponse, growthResponse, quizStatsResponse, categoryResponse, locationResponse] = await Promise.all([
          apiAdmin.get<DashboardStats>('api/analytics/dashboard-stats'),
          apiAdmin.get<UserGrowthData[]>(`api/analytics/user-growth?dateRange=${dateRange}`),
          apiAdmin.get('api/analytics/quiz-stats'),
          apiAdmin.get('api/analytics/category-performance'),
          apiAdmin.get('api/analytics/user-locations').catch(() => ({ data: { cities: [] } }))
        ]);

        // Set location data
        setUserLocationCities(locationResponse.data?.cities || []);

        setDashboardStats(statsResponse.data);
        
        // Transform user growth data to match chart format
        const transformedGrowthData = growthResponse.data.map((item: UserGrowthData) => ({
          date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          users: item.users,
          attempts: item.attempts || 0,
          revenue: item.revenue || 0,
        }));
        
        setUserGrowthData(transformedGrowthData);

        // Transform quiz stats for top quizzes
        const quizStats = quizStatsResponse.data || [];
        const transformedQuizzes = quizStats.slice(0, 5).map((quiz: QuizStats) => ({
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
        const transformedCategories = categoryStats.map((cat: CategoryStats) => ({
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

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuizId(quizId);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 border-b border-gray-100 pb-6 sm:pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {view === 'overview' ? (
              <>
                <BarChart3 className="w-6 h-6 text-[#253A7B]" />
                Analytics & Insights
              </>
            ) : (
              <>
                <FileText className="w-6 h-6 text-[#253A7B]" />
                Quiz Performance Report
              </>
            )}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {view === 'overview' 
              ? 'Monitor platform performance and strategic metrics' 
              : 'Detailed analysis and participant tracking for selected quiz'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {view === 'overview' && (
            <>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 outline-none focus:border-[#253A7B] transition-all"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>

              <button 
                onClick={() => handleExport('CSV')}
                className="flex items-center gap-2 px-4 py-2 bg-[#253A7B] text-white text-xs font-semibold rounded-lg hover:bg-[#1a2a5e] transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {view === 'detail' && selectedQuizId ? (
        <QuizDetailAnalytics 
          quizId={selectedQuizId} 
          onBack={() => { setView('overview'); setSelectedQuizId(null); }} 
        />
      ) : (
        <>
          {/* Stats Summary - Matching QuizManagement Style */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-5">
            {([
              { label: 'Total Users', value: kpiData.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600' },
              { label: 'Quiz Inventory', value: kpiData.totalQuizzes, icon: FileText, color: 'text-emerald-600' },
              { label: 'Gross Revenue', value: kpiData.totalPurchases, icon: DollarSign, color: 'text-amber-600' },
              { label: 'Active Nodes', value: kpiData.dailyActiveUsers.toLocaleString(), icon: Activity, color: 'text-indigo-600' }
            ]).map((stat, i) => (
              <div key={i} className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-none mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-6">
                {/* User Growth Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Growth Trend</h3>
                   </div>
                   <UserGrowthChart data={userGrowthData} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                          <PieChart className="w-4 h-4 text-gray-400" />
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Segmentation</h3>
                      </div>
                      <FreeVsPaidChart 
                        freeParticipation={dashboardStats?.participationSplit.free || 0} 
                        paidParticipation={dashboardStats?.participationSplit.paid || 0} 
                      />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                          <Database className="w-4 h-4 text-gray-400" />
                          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Categories</h3>
                      </div>
                      <TopCategories categories={topCategories} />
                    </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <LayoutDashboard className="w-4 h-4 text-[#253A7B]" />
                      <h3 className="text-sm font-bold text-gray-900">Drill-down Selector</h3>
                   </div>
                   <QuizPicker onSelect={handleQuizSelect} />
                </div>

                {/* User Location Chart */}
                <UserLocationChart cities={userLocationCities} />

                <div className="bg-gray-900 p-6 rounded-xl text-white relative overflow-hidden group shadow-lg">
                   <div className="relative z-10">
                      <h4 className="text-base font-bold mb-2">Detailed Reports</h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">
                        Select a quiz to analyze individual scores, participants, and question-level insights.
                      </p>
                   </div>
                   <Target className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-5 group-hover:scale-110 transition-transform duration-500" />
                </div>
             </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="pt-8 border-t border-gray-100 flex items-center justify-center">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
          Powered by FinoQz Intelligence Engine
        </p>
      </div>

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
