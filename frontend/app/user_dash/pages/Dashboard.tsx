'use client';

import React, { useState, useEffect } from 'react';
import DashboardCharts from '../components/DashboardCharts';
import { TrendingUp, BookOpen, Wallet, Target, Loader2, Clock, CheckCircle2, Trophy, ArrowRight, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import apiUser from '@/lib/apiUser';

interface DashboardData {
  totalQuizzes: number;
  activeQuizzes: number;
  walletBalance: number;
  completedQuizzes: number;
}

interface RecentActivity {
  _id: string;
  quizTitle: string;
  score: number;
  percentage: number;
  submittedAt: string;
}

interface BannerData {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
}

interface InProgressQuiz {
  _id: string; // attempt id
  quizId: string;
  quizTitle: string;
  percentage: number;
  lastSavedAt: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    walletBalance: 0,
    completedQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [inProgressQuiz, setInProgressQuiz] = useState<InProgressQuiz | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, bannersRes] = await Promise.all([
          apiUser.get('/api/user/dashboard/summary'),
          apiUser.get('/api/banners/active').catch(() => ({ data: { data: [] } }))
        ]);

        const { summary, latestInProgress, recentActivities: activities } = summaryRes.data;

        setData({
          totalQuizzes: summary.totalEnrolled,
          activeQuizzes: summary.activeQuizzes,
          walletBalance: summary.walletBalance,
          completedQuizzes: summary.completedQuizzes,
        });

        setBanners(bannersRes.data?.data || []);

        if (latestInProgress) {
          setInProgressQuiz({
            _id: latestInProgress._id,
            quizId: latestInProgress.quizId || '',
            quizTitle: latestInProgress.quizTitle,
            percentage: latestInProgress.percentage,
            lastSavedAt: new Date(latestInProgress.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          });
        } else {
          setInProgressQuiz(null);
        }

        const formattedActivities: RecentActivity[] = (activities || []).map((a: { _id: string; quizTitle: string; score: number; percentage: number; submittedAt: string }) => ({
          _id: a._id,
          quizTitle: a.quizTitle,
          score: a.score,
          percentage: a.percentage,
          submittedAt: new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }));
        setRecentActivities(formattedActivities);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Banner Auto-Slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#f8fafc]">
      {/* Header & Banner Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-800">Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1.5 mb-6">Welcome back! Here is your quick overview.</p>

        {/* Dynamic Promotional Banner Carousel */}
        {banners.length > 0 && (
          <div className="relative w-full h-[180px] sm:h-[240px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] group">
            {banners.map((banner, index) => (
              <div 
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBannerIdx ? 'opacity-100 relative z-10' : 'opacity-0 z-0'}`}
              >
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">{banner.title}</h2>
                  <p className="text-sm text-white/80 line-clamp-2 max-w-2xl">{banner.description}</p>
                </div>
              </div>
            ))}
            
            {/* Banner Controls */}
            {banners.length > 1 && (
              <>
                <button onClick={() => setCurrentBannerIdx(prev => (prev === 0 ? banners.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentBannerIdx(prev => (prev + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
                  {banners.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentBannerIdx(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIdx ? 'bg-white w-4' : 'bg-white/50'}`}></button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Smart Widget: Continue Learning */}
      {inProgressQuiz && (
        <div className="mb-8 bg-white border border-slate-200/60 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 p-[2px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <PlayCircle className="w-7 h-7 text-amber-500" fill="currentColor" stroke="white" />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-amber-500 uppercase mb-1">Pick up where you left off</div>
              <h3 className="text-lg font-semibold text-slate-800 line-clamp-1">{inProgressQuiz.quizTitle}</h3>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Last saved on {inProgressQuiz.lastSavedAt}</p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-3">
            <div className="w-full sm:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${inProgressQuiz.percentage}%` }}></div>
            </div>
            <div className="w-full flex justify-between sm:justify-end items-center gap-4">
              <span className="text-sm font-bold text-slate-700">{inProgressQuiz.percentage}% Completed</span>
              <a href={`/user_dash/quiz/${inProgressQuiz.quizId}/attempt`} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
                Resume Quiz
              </a>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-slate-500 tracking-wide">Total Enrolled</div>
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
          </div>
          <div className="text-3xl font-medium text-slate-800 tracking-tight">{data.totalQuizzes}</div>
          <div className="text-xs mt-2 font-medium text-slate-400">Lifetime enrolled</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-slate-500 tracking-wide">In Progress</div>
            <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl group-hover:scale-105 transition-transform">
              <PlayCircle className="w-5 h-5 text-emerald-600" strokeWidth={2} />
            </div>
          </div>
          <div className="text-3xl font-medium text-slate-800 tracking-tight">{data.activeQuizzes}</div>
          <div className="text-xs mt-2 font-medium text-emerald-500">Currently being taken</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-slate-500 tracking-wide">Wallet Balance</div>
            <div className="p-2.5 bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-violet-600" strokeWidth={2} />
            </div>
          </div>
          <div className="text-3xl font-medium text-slate-800 tracking-tight">₹{data.walletBalance.toLocaleString()}</div>
          <div className="text-xs mt-2 font-medium text-violet-500">Available to spend</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-slate-500 tracking-wide">Completed Quizzes</div>
            <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5 text-indigo-600" strokeWidth={2} />
            </div>
          </div>
          <div className="text-3xl font-medium text-slate-800 tracking-tight">{data.completedQuizzes}</div>
          <div className="text-xs mt-2 font-medium text-indigo-500">Successfully finished</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts Section occupies 2/3 */}
        <div className="lg:col-span-2">
          <DashboardCharts userId={userId} />
        </div>

        {/* Recent Activity Feed occupies 1/3 */}
        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-slate-800 tracking-tight">Recent Activity</h3>
            <button className="text-xs font-medium text-[#253A7B] flex items-center gap-1 hover:gap-1.5 transition-all">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity._id} className="relative pl-6 pb-4 last:pb-0 group">
                    {/* Timeline Line */}
                    {index !== recentActivities.length - 1 && (
                      <div className="absolute left-[9px] top-6 bottom-[-16px] w-[2px] bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>
                    )}
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-blue-50 border-[3px] border-white shadow-sm flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#253A7B]"></div>
                    </div>
                    
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 hover:bg-white hover:shadow-sm transition-all duration-300">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-slate-800 line-clamp-1 flex-1 pr-2">{activity.quizTitle}</h4>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap pt-0.5">{activity.submittedAt}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex justify-between items-center bg-white px-2 py-1 rounded-md border border-slate-100 flex-1">
                          <span className="text-[10px] font-medium text-slate-400">Score</span>
                          <span className="text-xs font-medium text-[#253A7B]">{activity.score}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white px-2 py-1 rounded-md border border-slate-100 flex-1">
                          <span className="text-[10px] font-medium text-slate-400">Result</span>
                          <span className={`text-xs font-medium ${activity.percentage >= 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {activity.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                <Clock className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No recent activity yet</p>
                <p className="text-xs text-slate-400 mt-1">Start a quiz to seeing your timeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
