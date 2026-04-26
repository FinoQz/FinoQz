'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import DashboardCharts from '../components/DashboardCharts';
import {
  TrendingUp, BookOpen, Wallet, Target, Loader2, Clock,
  CheckCircle2, ArrowRight, PlayCircle, ChevronLeft,
  ChevronRight, ArrowUpRight, Trophy
} from 'lucide-react';
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
  _id: string;
  quizId: string;
  quizTitle: string;
  percentage: number;
  lastSavedAt: string;
}

/* ── Section Label (matches admin pattern) ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/* ── KPI Card (matches admin StatCard) ── */
function KpiCard({
  label, value, sub, icon, accentBg, accentText, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: ReactNode; accentBg: string; accentText: string; trend?: string;
}) {
  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-200 overflow-hidden hover:shadow-md">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 opacity-[0.07] ${accentBg}`} />
      <div className="flex items-start justify-between relative z-10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBg} ${accentText}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
            <ArrowUpRight className="w-2.5 h-2.5" />{trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-9 h-9 bg-gray-100 rounded-xl" />
        <div className="w-12 h-4 bg-gray-100 rounded-full" />
      </div>
      <div className="h-7 w-20 bg-gray-100 rounded mb-1.5" />
      <div className="h-3 w-28 bg-gray-100 rounded mb-1" />
      <div className="h-2.5 w-20 bg-gray-100 rounded" />
    </div>
  );
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
        const formattedActivities: RecentActivity[] = (activities || []).map(
          (a: { _id: string; quizTitle: string; score: number; percentage: number; submittedAt: string }) => ({
            _id: a._id,
            quizTitle: a.quizTitle,
            score: a.score,
            percentage: a.percentage,
            submittedAt: new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          })
        );
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

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 xl:p-8 space-y-8">
        <div className="h-7 w-48 bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-[180px] bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-800 font-semibold mb-1">Error loading dashboard</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 xl:p-8 space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back — heres your learning snapshot.</p>
        </div>
      </div>

      {/* ── Banner Carousel ── */}
      {banners.length > 0 && (
        <section>
          <div className="relative w-full h-[180px] sm:h-[220px] rounded-2xl overflow-hidden shadow-sm group border border-gray-100">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{banner.title}</h2>
                  <p className="text-xs text-white/80 line-clamp-1 max-w-2xl">{banner.description}</p>
                </div>
              </div>
            ))}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBannerIdx(prev => (prev === 0 ? banners.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentBannerIdx(prev => (prev + 1) % banners.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-5 z-20 flex gap-1.5">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === currentBannerIdx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Continue Learning Alert ── */}
      {inProgressQuiz && (
        <section>
          <SectionLabel label="Resume Learning" />
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-amber-500 uppercase mb-0.5">Pick up where you left off</p>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{inProgressQuiz.quizTitle}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last saved on {inProgressQuiz.lastSavedAt}</p>
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2">
              <div className="w-full sm:w-44 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${inProgressQuiz.percentage}%` }}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-semibold text-gray-600">{inProgressQuiz.percentage}% done</span>
                <a
                  href={`/user_dash/quiz/${inProgressQuiz.quizId}/attempt`}
                  className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Resume
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── KPI Cards ── */}
      <section>
        <SectionLabel label="Your Stats" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label="Total Enrolled"
            value={data.totalQuizzes}
            sub="Lifetime enrolled"
            icon={<BookOpen className="w-4 h-4" />}
            accentBg="bg-blue-500"
            accentText="text-white"
          />
          <KpiCard
            label="In Progress"
            value={data.activeQuizzes}
            sub="Currently active"
            icon={<PlayCircle className="w-4 h-4" />}
            accentBg="bg-emerald-500"
            accentText="text-white"
          />
          <KpiCard
            label="Wallet Balance"
            value={`₹${data.walletBalance.toLocaleString()}`}
            sub="Available to spend"
            icon={<Wallet className="w-4 h-4" />}
            accentBg="bg-violet-500"
            accentText="text-white"
          />
          <KpiCard
            label="Completed"
            value={data.completedQuizzes}
            sub="Successfully finished"
            icon={<Trophy className="w-4 h-4" />}
            accentBg="bg-indigo-500"
            accentText="text-white"
          />
        </div>
      </section>

      {/* ── Charts + Activity ── */}
      <section>
        <SectionLabel label="Performance & Activity" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Charts — 2 cols */}
          <div className="lg:col-span-2">
            <DashboardCharts userId={userId} />
          </div>

          {/* Recent Activity — 1 col */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              <button className="text-[10px] font-semibold text-[#253A7B] flex items-center gap-1 hover:gap-1.5 transition-all">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={activity._id} className="relative pl-5 pb-3 last:pb-0 group">
                      {/* Timeline line */}
                      {index !== recentActivities.length - 1 && (
                        <div className="absolute left-[8px] top-5 bottom-[-12px] w-[2px] bg-gray-100" />
                      )}
                      {/* Dot */}
                      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#253A7B]" />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-white hover:shadow-sm transition-all duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1 flex-1 pr-2">{activity.quizTitle}</p>
                          <span className="text-[9px] font-medium text-gray-400 whitespace-nowrap">{activity.submittedAt}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-white border border-gray-100 rounded-lg px-2 py-1 flex justify-between items-center">
                            <span className="text-[9px] font-medium text-gray-400">Score</span>
                            <span className="text-[10px] font-bold text-[#253A7B]">{activity.score}</span>
                          </div>
                          <div className="flex-1 bg-white border border-gray-100 rounded-lg px-2 py-1 flex justify-between items-center">
                            <span className="text-[9px] font-medium text-gray-400">Result</span>
                            <span className={`text-[10px] font-bold ${activity.percentage >= 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
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
                  <Clock className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No recent activity yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a quiz to see your timeline</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
