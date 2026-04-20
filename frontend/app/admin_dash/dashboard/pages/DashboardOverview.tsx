'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { io, Socket } from 'socket.io-client';
import {
  AlertTriangle, Bell, Users, TrendingUp, Clock,
  DollarSign, BookOpen, BarChart2, ArrowUpRight,
} from 'lucide-react';

// Zone 1
import ActionQueueWidget from '../components/dashboard/ActionQueueWidget';
// Zone 2
import UserGrowthChart from '../components/dashboard/UserGrowthChart';
import DailyRevenueChart from '../components/dashboard/DailyRevenueChart';
import ConversionFunnelWidget from '../components/dashboard/ConversionFunnelWidget';
import PrivateGroupHealth from '../components/dashboard/PrivateGroupHealth';
// Zone 3
import QuizCompletionRate from '../components/dashboard/QuizCompletionRate';
import CategoryParticipation from '../components/dashboard/CategoryParticipation';
import TodayRevenueWidget from '../components/dashboard/TodayRevenueWidget';
import ActiveQuizzesWidget from '../components/dashboard/ActiveQuizzesWidget';
// Zone 4
import UpcomingQuizzes from '../components/dashboard/UpcomingQuizzes';
import PlatformPulse from '../components/dashboard/PlatformPulse';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalRevenue: number;
  totalPaidUsers: number;
  freeQuizAttempts: number;
}

interface PendingUser {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  status: string;
  createdAt?: string;
}

/* ── Reusable compact KPI card ── */
function StatCard({
  label, value, sub, icon, accentBg, accentText, trend, onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
  trend?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3
        ${onClick ? 'cursor-pointer hover:border-gray-200 hover:shadow-md' : ''}
        transition-all duration-200 overflow-hidden`}
    >
      {/* decorative accent strip */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 opacity-[0.07] ${accentBg}`} />

      <div className="flex items-start justify-between relative z-10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentBg} ${accentText}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
            <ArrowUpRight className="w-2.5 h-2.5" />
            {trend}
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

/* ── Section header ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/* ── Skeleton card ── */
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

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, activeUsers: 0, pendingApprovals: 0,
    totalRevenue: 0, totalPaidUsers: 0, freeQuizAttempts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [growthPercent, setGrowthPercent] = useState<string>('0.0');
  const [pendingUsersList, setPendingUsersList] = useState<PendingUser[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<number[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const userGrowthLoaded = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  const isFetchingPending = useRef(false);

  const fetchPendingUsers = useCallback(async () => {
    if (isFetchingPending.current) return;
    isFetchingPending.current = true;
    try {
      const res = await apiAdmin.get('api/admin/panel/pending-users');
      setPendingUsersList(res.data);
    } catch (err) {
      console.error('Error fetching pending users:', err);
    } finally {
      isFetchingPending.current = false;
    }
  }, []);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;
    if (!socketRef.current) socketRef.current = io(backendUrl, { withCredentials: true });
    const socket = socketRef.current;

    const fetchInitialStats = async () => {
      try {
        const [statsRes, monthlyRes, pendingRes] = await Promise.all([
          apiAdmin.get('/api/admin/panel/analytics/dashboard-stats'),
          apiAdmin.get('/api/admin/panel/analytics/monthly-users'),
          apiAdmin.get('/api/admin/panel/pending-users'),
        ]);
        setPendingUsersList(pendingRes.data);
        const current = monthlyRes.data.currentMonth;
        const last = monthlyRes.data.lastMonth;
        const growth = last > 0 ? ((current - last) / last) * 100 : 100;
        setStats(prev => ({ ...prev, ...statsRes.data }));
        setGrowthPercent(growth.toFixed(1));
      } catch (err) {
        console.error('❌ Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialStats();

    socket.on('connect', () => socket.emit('join-admin-room'));
    socket.on('dashboard:stats', (data: Partial<DashboardStats>) => {
      setStats(prev => ({ ...prev, ...data }));
      if (typeof data.pendingApprovals === 'number') {
        setAlertMessage(`${data.pendingApprovals} users awaiting approval`);
        fetchPendingUsers();
      }
    });
    socket.on('analytics:update', (data) => {
      if (data.type === 'userGrowth' && !userGrowthLoaded.current) {
        setUserData(data.values || []);
        setDays(data.labels || []);
        userGrowthLoaded.current = true;
      }
    });
    return () => { socket.off('dashboard:stats'); socket.off('analytics:update'); };
  }, [fetchPendingUsers]);

  useEffect(() => {
    let cancelled = false;
    apiAdmin.get('/api/admin/panel/analytics/user-growth').then(res => {
      if (!cancelled && !userGrowthLoaded.current) {
        setUserData(res.data.values || []);
        setDays(res.data.labels || []);
        userGrowthLoaded.current = true;
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!alertMessage) return;
    const t = setTimeout(() => setAlertMessage(null), 4500);
    return () => clearTimeout(t);
  }, [alertMessage]);

  return (
    <div className="p-4 sm:p-6 xl:p-8 space-y-8 bg-gray-50/60 min-h-full">

      {/* Alert toast */}
      {alertMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 flex items-center gap-2.5 bg-white border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          {alertMessage}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back — here whats happening today.</p>
        </div>
        {stats.pendingApprovals > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm">
            <Bell className="w-3.5 h-3.5" />
            {stats.pendingApprovals} pending
          </div>
        )}
      </div>

      {/* ════ ZONE 1 — Action Required ════ */}
      <section>
        <SectionLabel label="Action Required" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Approval queue — 3 of 5 cols */}
          <div className="lg:col-span-3">
            <ActionQueueWidget users={pendingUsersList} onRefetch={fetchPendingUsers} />
          </div>
          {/* KPI cluster — 2 of 5 cols (2×2 grid) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {loading ? (
              [1, 2, 3, 4].map(i => <SkeletonCard key={`top-kpi-skeleton-${i}`} />)
            ) : (<>
              <StatCard
                label="Total Users"
                value={stats.totalUsers.toLocaleString()}
                sub="Registered on platform"
                trend={`${growthPercent}%`}
                icon={<Users className="w-4 h-4" />}
                accentBg="bg-blue-500"
                accentText="text-white"
              />
              <StatCard
                label="Active Users"
                value={stats.activeUsers.toLocaleString()}
                sub="Approved accounts"
                icon={<TrendingUp className="w-4.5 h-4.5" />}
                accentBg="bg-emerald-500"
                accentText="text-white"
              />
              <StatCard
                label="Pending"
                value={stats.pendingApprovals}
                sub="Awaiting your review"
                icon={<Clock className="w-4.5 h-4.5" />}
                accentBg="bg-amber-500"
                accentText="text-white"
              />
              <StatCard
                label="Total Revenue"
                value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
                sub="All time collected"
                icon={<DollarSign className="w-4.5 h-4.5" />}
                accentBg="bg-violet-500"
                accentText="text-white"
              />
            </>)}
          </div>
        </div>
      </section>

      {/* ════ ZONE 2 — Revenue & Pipeline ════ */}
      <section>
        <SectionLabel label="Revenue & Pipeline" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: stacked charts — 2 of 3 cols */}
          <div className="lg:col-span-2 space-y-4">
            <UserGrowthChart userData={userData} days={days} loading={loading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DailyRevenueChart />
              <ConversionFunnelWidget />
            </div>
          </div>
          {/* Right: private groups — 1 col */}
          <div>
            <PrivateGroupHealth />
          </div>
        </div>
      </section>

      {/* ════ ZONE 3 — Community & Engagement ════ */}
      <section>
        <SectionLabel label="Community & Engagement" />

        {/* Row of 4 distinct mini-stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {loading ? (
            [1,2,3,4].map(i => <SkeletonCard key={i} />)
          ) : (<>
            <StatCard
              label="Paid Enrollments"
              value={stats.totalPaidUsers.toLocaleString()}
              sub="Paid quiz access"
              icon={<DollarSign className="w-4 h-4" />}
              accentBg="bg-violet-500"
              accentText="text-white"
            />
            <StatCard
              label="Free Attempts"
              value={stats.freeQuizAttempts.toLocaleString()}
              sub="Landing page quiz"
              icon={<BookOpen className="w-4 h-4" />}
              accentBg="bg-blue-500"
              accentText="text-white"
            />
            <StatCard
              label="Paid Members"
              value={stats.totalPaidUsers.toLocaleString()}
              sub="Active subscribers"
              icon={<BarChart2 className="w-4 h-4" />}
              accentBg="bg-emerald-500"
              accentText="text-white"
            />
            <StatCard
              label="Total Revenue"
              value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
              sub="All time collected"
              icon={<TrendingUp className="w-4 h-4" />}
              accentBg="bg-indigo-500"
              accentText="text-white"
            />
          </>)}
        </div>

        {/* Bottom: Quiz Overview + Category Participation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuizCompletionRate />
          <CategoryParticipation />
        </div>

        {/* Revenue + Active Quizzes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <TodayRevenueWidget />
          <ActiveQuizzesWidget />
        </div>
      </section>

      {/* ════ ZONE 4 — Scheduling & Activity ════ */}
      <section>
        <SectionLabel label="Scheduling & Activity" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UpcomingQuizzes />
          <PlatformPulse />
        </div>
      </section>
    </div>
  );
}

