'use client';

import React, { useEffect, useState, useRef } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { io, Socket } from 'socket.io-client';
import { TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import PendingUsersModal from '../components/dashboard/PendingUsersModal';
import StatsGrid from '../components/dashboard/StatsGrid';
import DashboardChartsSection from '../components/dashboard/DashboardChartsSection';
import DashboardWidgetsRow from '../components/dashboard/DashboardWidgetsRow';
import LiveMetricsGrid from '../components/dashboard/LiveMetricsGrid';

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
  updatedAt?: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    totalPaidUsers: 0,
    freeQuizAttempts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [growthPercent, setGrowthPercent] = useState<string>('0.0');
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [pendingUsersList, setPendingUsersList] = useState<PendingUser[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const isPendingModalOpenRef = useRef(false);
  const isFetchingPending = useRef(false);
  const [userData, setUserData] = useState<number[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const userGrowthLoaded = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchPendingUsers = async () => {
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
  };

  useEffect(() => {
    isPendingModalOpenRef.current = isPendingModalOpen;
  }, [isPendingModalOpen]);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL is not defined');
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(backendUrl, { withCredentials: true });
    }
    const socket = socketRef.current;

    const fetchInitialStats = async () => {
      try {
        const [statsRes, monthlyRes, pendingRes] = await Promise.all([
          apiAdmin.get('/api/admin/panel/dashboard-stats'),
          apiAdmin.get('/api/admin/panel/monthly-users'),
          apiAdmin.get('/api/admin/panel/pending-users'),
        ]);

        setPendingUsersList(pendingRes.data);

        const current = monthlyRes.data.currentMonth;
        const last = monthlyRes.data.lastMonth;
        const growth = last > 0 ? ((current - last) / last) * 100 : 100;

        setStats((prev) => ({
          ...prev,
          ...statsRes.data
        }));

        setGrowthPercent(growth.toFixed(1));
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching initial dashboard stats:', err);
        setLoading(false);
      }
    };

    fetchInitialStats();

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket:', socket.id);
      socket.emit('join-admin-room'); // ✅ This line is critical
    });

    socket.on('dashboard:stats', (data: Partial<DashboardStats>) => {
      console.log('📡 Real-time stats received:', data);
      setStats((prev) => ({ ...prev, ...data }));

      if (typeof data.pendingApprovals === 'number') {
        setAlertMessage(`You have ${data.pendingApprovals} pending user approvals`);
      }

      if (isPendingModalOpenRef.current) {
        fetchPendingUsers();
      }
    });

    socket.on('analytics:update', (data) => {
      if (data.type === 'userGrowth' && !userGrowthLoaded.current) {
        console.log('📈 WebSocket userGrowth:', data);
        setUserData(data.values || []);
        setDays(data.labels || []);
        setLoading(false);
        userGrowthLoaded.current = true;
      }
    });

    return () => {
      socket.off('dashboard:stats');
      socket.off('analytics:update');
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchFallback() {
      try {
        const res = await apiAdmin.get('/api/admin/panel/analytics/user-growth');
        if (!cancelled && !userGrowthLoaded.current) {
          setUserData(res.data.values || []);
          setDays(res.data.labels || []);
          setLoading(false);
          userGrowthLoaded.current = true;
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
        }
        console.error('❌ Fallback userGrowth fetch failed:', err);
      }
    }
    fetchFallback();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!alertMessage) return;
    const timer = setTimeout(() => setAlertMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [alertMessage]);

  const handleOpenPendingModal = async () => {
    setIsPendingModalOpen(true);
    await fetchPendingUsers();
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header with Alert Banner */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Comprehensive platform overview and analytics
          </p>
        </div>

        {alertMessage && (
          <div className="fixed top-6 right-6 bg-yellow-50 border border-yellow-300 text-yellow-900 px-4 py-3 rounded-xl shadow-lg animate-fade-in-out flex items-center gap-2 z-50">
            <AlertTriangle className="w-5 h-5 text-yellow-700" />
            <span className="text-sm font-medium">{alertMessage}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <StatsGrid
        totalUsers={stats.totalUsers}
        growthPercent={growthPercent}
        activeUsers={stats.activeUsers}
        pendingApprovals={stats.pendingApprovals}
        onPendingClick={handleOpenPendingModal}
      />

      {/* Charts Section */}
      <DashboardChartsSection userData={userData} days={days} loading={loading} />

      {/* Widgets Row */}
      <DashboardWidgetsRow />

      {/* Live Metric Widgets */}
      <LiveMetricsGrid />

      {/* Pending Users Modal */}
      <PendingUsersModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        users={pendingUsersList}
      />
    </div>
  );
}
