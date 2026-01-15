// 'use client';

// import React, { useEffect, useState, useRef } from 'react';
// import apiAdmin from '@/lib/apiAdmin';
// import { io, Socket } from 'socket.io-client';
// import {
//   TrendingUp,
//   Users,
//   Clock,
//   AlertTriangle,
// } from 'lucide-react';
// // import QuizCompletionRate from '../components/adminComponents/QuizCompletionRate';
// // import CategoryParticipation from '../components/adminComponents/CategoryParticipation';
// // import TopUsers from '../components/adminComponents/TopUsers';
// // import UpcomingQuizzes from '../components/adminComponents/UpcomingQuizzes';
// // import RecentAdminActions from '../components/adminComponents/RecentAdminActions';
// import LiveUsersWidget from '../components/dashboard/LiveUsersWidget';
// // import ActiveQuizzesWidget from '../components/adminComponents/ActiveQuizzesWidget';
// // import TodayRevenueWidget from '../components/adminComponents/TodayRevenueWidget';
// import PendingUsersModal from '../components/dashboard/PendingUsersModal';

// interface DashboardStats {
//   totalUsers: number;
//   activeUsers: number;
//   pendingApprovals: number;
//   totalRevenue: number;
//   totalPaidUsers: number;
//   freeQuizAttempts: number;
// }

// interface PendingUser {
//   _id: string;
//   fullName: string;
//   email: string;
//   mobile: string;
//   status: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export default function DashboardOverview() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalUsers: 0,
//     activeUsers: 0,
//     pendingApprovals: 0,
//     totalRevenue: 0,
//     totalPaidUsers: 0,
//     freeQuizAttempts: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [growthPercent, setGrowthPercent] = useState<string>('0.0');
//   const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
//   const [pendingUsersList, setPendingUsersList] = useState<PendingUser[]>([]);
//   const [alertMessage, setAlertMessage] = useState<string | null>(null);
//   const isPendingModalOpenRef = useRef(false);
//   const isFetchingPending = useRef(false);
//   const [userData, setUserData] = useState<number[]>([]);
//   const [days, setDays] = useState<string[]>([]);
//   const socketRef = useRef<Socket | null>(null);

//   const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

//   const fetchPendingUsers = async () => {
//     if (isFetchingPending.current) return;
//     isFetchingPending.current = true;
//     try {
//       const res = await apiAdmin.get('api/admin/panel/pending-users');
//       setPendingUsersList(res.data);
//     } catch (err) {
//       console.error('Error fetching pending users:', err);
//     } finally {
//       isFetchingPending.current = false;
//     }
//   };

//   useEffect(() => {
//     isPendingModalOpenRef.current = isPendingModalOpen;
//   }, [isPendingModalOpen]);

//   useEffect(() => {
//     const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
//     if (!backendUrl) {
//       console.error('NEXT_PUBLIC_BACKEND_URL is not defined');
//       return;
//     }

//     const socket = io(backendUrl, {
//       withCredentials: true,
//     });

//     let debounceTimer: NodeJS.Timeout | null = null;
//     let fallbackTimer: NodeJS.Timeout | null = null;
//     let statsReceived = false;

//     const fetchInitialStats = async () => {
//       try {
//         const [allRes, activeRes, monthlyRes] = await Promise.all([
//           apiAdmin.get('/api/admin/panel/all-users'),
//           apiAdmin.get('/api/admin/panel/approved-users'),
//           apiAdmin.get('/api/admin/panel/monthly-users'),
//         ]);

//         await fetchPendingUsers();

//         const totalUsers = allRes.data.length;
//         const activeUsers = activeRes.data.length;
//         const pendingApprovals = pendingUsersList.length;

//         const current = monthlyRes.data.currentMonth;
//         const last = monthlyRes.data.lastMonth;
//         const growth = last > 0 ? ((current - last) / last) * 100 : 100;

//         setStats((prev) => ({
//           ...prev,
//           totalUsers,
//           activeUsers,
//           pendingApprovals,
//         }));

//         setGrowthPercent(growth.toFixed(1));
//         setLoading(false);
//       } catch (err) {
//         console.error('❌ Error fetching initial dashboard stats:', err);
//         setLoading(false);
//       }
//     };

//     // Fetch immediately for fast UI
//     fetchInitialStats();

//     // Setup WebSocket
//     socket.on('connect', () => {
//       console.log('✅ Connected to WebSocket:', socket.id);
//     });

//     socket.on('dashboard:stats', (data: Partial<DashboardStats>) => {
//       console.log('📡 Real-time stats received:', data);
//       statsReceived = true;

//       setStats((prev) => ({
//         ...prev,
//         ...data,
//       }));

//       if (typeof data.pendingApprovals === 'number') {
//         setAlertMessage(`You have ${data.pendingApprovals} pending user approvals`);
//       }

//       if (isPendingModalOpenRef.current) {
//         if (debounceTimer) clearTimeout(debounceTimer);
//         debounceTimer = setTimeout(() => {
//           fetchPendingUsers();
//         }, 2000);
//       }
//     });

//     socket.on('disconnect', () => {
//       console.log('❌ WebSocket disconnected');
//     });

//     // Fallback if socket doesn't emit in 4s
//     fallbackTimer = setTimeout(() => {
//       if (!statsReceived) {
//         console.warn('⚠️ No WebSocket stats received — using fallback only');
//         // Already fetched above, so no need to re-fetch
//         setLoading(false);
//       }
//     }, 4000);

//     return () => {
//       socket.disconnect();
//       if (debounceTimer) clearTimeout(debounceTimer);
//       if (fallbackTimer) clearTimeout(fallbackTimer);
//     };
//   }, []);




//   useEffect(() => {
//     const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
//       withCredentials: true,
//     });

//     let socketReceived = false;

//     socket.on('connect', () => {
//       console.log('✅ Connected to WebSocket');
//     });

//     socket.on('analytics:update', (data) => {
//       if (data.type === 'userGrowth') {
//         console.log('📈 WebSocket userGrowth:', data);
//         setUserData(data.values || []);
//         setDays(data.labels || []);
//         setLoading(false);
//         socketReceived = true;
//       }
//     });

//     const fallbackTimer = setTimeout(async () => {
//       if (!socketReceived) {
//         console.warn('⚠️ No WebSocket userGrowth — using fallback API');
//         try {
//           const res = await apiAdmin.get('/api/admin/panel/analytics/user-growth');
//           setUserData(res.data.values || []);
//           setDays(res.data.labels || []);
//         } catch (err) {
//           console.error('❌ Fallback API failed:', err);
//         } finally {
//           setLoading(false);
//         }
//       }
//     }, 4000);

//     return () => {
//       socket.disconnect();
//       clearTimeout(fallbackTimer);
//     };
//   }, []);



//   useEffect(() => {
//     if (!alertMessage) return;
//     const timer = setTimeout(() => setAlertMessage(null), 3000);
//     return () => clearTimeout(timer);
//   }, [alertMessage]);

//   const handleOpenPendingModal = async () => {
//     setIsPendingModalOpen(true);
//     await fetchPendingUsers();
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="text-gray-500">Loading dashboard...</div>
//       </div>
//     );
//   }
'use client';

import React, { useEffect, useState, useRef } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { io, Socket } from 'socket.io-client';
import { TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import LiveUsersWidget from '../components/dashboard/LiveUsersWidget';
import PendingUsersModal from '../components/dashboard/PendingUsersModal';

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

    // ✅ Single socket instance
    if (!socketRef.current) {
      socketRef.current = io(backendUrl, { withCredentials: true });
    }
    const socket = socketRef.current;

    const fetchInitialStats = async () => {
      try {
        const [allRes, activeRes, monthlyRes] = await Promise.all([
          apiAdmin.get('/api/admin/panel/all-users'),
          apiAdmin.get('/api/admin/panel/approved-users'),
          apiAdmin.get('/api/admin/panel/monthly-users'),
        ]);

        await fetchPendingUsers();

        const totalUsers = allRes.data.length;
        const activeUsers = activeRes.data.length;
        const pendingApprovals = pendingUsersList.length;

        const current = monthlyRes.data.currentMonth;
        const last = monthlyRes.data.lastMonth;
        const growth = last > 0 ? ((current - last) / last) * 100 : 100;

        setStats((prev) => ({
          ...prev,
          totalUsers,
          activeUsers,
          pendingApprovals,
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
    });

    socket.on('dashboard:stats', (data: Partial<DashboardStats>) => {
      console.log('📡 Real-time stats received:', data);

      setStats((prev) => ({
        ...prev,
        ...data,
      }));

      if (typeof data.pendingApprovals === 'number') {
        setAlertMessage(`You have ${data.pendingApprovals} pending user approvals`);
      }

      if (isPendingModalOpenRef.current) {
        fetchPendingUsers();
      }
    });

    socket.on('analytics:update', (data) => {
      if (data.type === 'userGrowth') {
        console.log('📈 WebSocket userGrowth:', data);
        setUserData(data.values || []);
        setDays(data.labels || []);
        setLoading(false);
      }
    });

    return () => {
      // ✅ सिर्फ listeners हटाओ
      socket.off('dashboard:stats');
      socket.off('analytics:update');
    };
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

      {/* Stats Grid - 6 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Users */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">
              Total Users
            </div>
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shadow-sm">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs mt-2 text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span>+{growthPercent}% this month</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">
              Active Users
            </div>
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.activeUsers.toLocaleString()}
          </div>
          <div className="text-xs mt-2 text-green-700">Approved accounts</div>
        </div>

        {/* Pending Approval */}
        <div
          onClick={handleOpenPendingModal}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">
              Pending Approval
            </div>
            <div className="p-2 sm:p-3 bg-orange-50 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.pendingApprovals}
          </div>
          <div className="text-xs mt-2 text-orange-700">Requires action</div>
        </div>
        {/*yhn add hoga*/}

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Daily Revenue Chart */}
        {/* <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">
            Daily Revenue (Last 14 Days)
          </h3>
          <div className="h-64">
            {(() => {
              const revenueData = [
                3200, 4100, 3800, 5200, 6300, 5800, 7100,
                6800, 7800, 8200, 7500, 8900, 9200, 8450,
              ];
              const maxRevenue = Math.max(...revenueData);
              const days = [
                'Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10',
                'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14', 'Jan 15',
                'Jan 16', 'Jan 17', 'Jan 18',
              ];

              return (
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-end justify-between gap-2 border-b-2 border-l-2 border-gray-300 pb-2 pl-2">
                    {revenueData.map((revenue, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center group"
                      >
                        <div className="w-full relative">
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            ₹{revenue.toLocaleString()}
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-[#253A7B] to-[#4a6bb5] rounded-t hover:from-[#1a2a5e] hover:to-[#253A7B] transition-all duration-300 cursor-pointer"
                            style={{
                              height: `${(revenue / maxRevenue) * 200}px`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 pl-2">
                    {days.map((day, index) =>
                      index % 2 === 0 ? (
                        <div
                          key={index}
                          className="text-xs text-gray-600 flex-1 text-center"
                        >
                          {day}
                        </div>
                      ) : (
                        <div key={index} className="flex-1" />
                      )
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div> */}

        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">User Growth</h3>
          <div className="h-64 overflow-x-auto">
            <div style={{ minWidth: `${days.length * 60}px` }} className="h-full">
              {userData.length > 0 && days.length > 0 ? (() => {
                const minUsers = Math.min(...userData) - 5;
                const maxUsers = Math.max(...userData);
                const range = maxUsers - minUsers || 1;

                const yTicks = 5;
                const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
                  Math.round(minUsers + (range * (yTicks - i)) / yTicks)
                );

                return (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 relative border-b-2 border-l-2 border-gray-300 pl-10 pb-2">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-400 py-2 pr-1">
                        {yLabels.map((label, i) => (
                          <div key={i} className="h-[1px] -translate-y-1/2">
                            {label}
                          </div>
                        ))}
                      </div>

                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pl-2 pb-2">
                        {yLabels.map((_, i) => (
                          <div key={i} className="border-t border-gray-100" />
                        ))}
                      </div>

                      {/* Chart */}
                      {/*
                        Define width and height for the SVG chart
                      */}
                      {(() => {
                        const width = days.length * 60;
                        const height = 200;
                        return (
                          <svg className="w-full h-full" width={width} height={height} preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 0.3 }} />
                                <stop offset="100%" style={{ stopColor: '#4ade80', stopOpacity: 0 }} />
                              </linearGradient>
                            </defs>



                            {/* Area fill */}
                            <path
                              d={`M 0,${height - ((userData[0] - minUsers) / range) * height
                                } ${userData
                                  .map(
                                    (users, index) =>
                                      `L ${(index / (userData.length - 1)) * width},${height - ((users - minUsers) / range) * height}`
                                  )
                                  .join(' ')} L ${width},${height} L 0,${height} Z`}
                              fill="url(#userGradient)"
                            />

                            {/* Line path */}
                            <path
                              d={`M 0,${height - ((userData[0] - minUsers) / range) * height
                                } ${userData
                                  .map(
                                    (users, index) =>
                                      `L ${(index / (userData.length - 1)) * width},${height - ((users - minUsers) / range) * height}`
                                  )
                                  .join(' ')}`}
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />


                            {/* Dots */}
                            {userData.map((users, index) => {
                              const cx = `${(index / (userData.length - 1)) * 100}%`;
                              const baseY = 200 - ((users - minUsers) / range) * 200;
                              const cy = users === 0 ? 200 : baseY + 6;
                              const color = users === 0 ? '#22c55e' : '#ef4444';

                              return (
                                <g key={index}>
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r="5"
                                    fill={color}
                                    className="hover:r-7 transition-all cursor-pointer"
                                  />
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}

                      {/* Tooltips */}
                      <div className="absolute inset-0 flex items-end justify-between pl-2 pb-2">
                        {userData.map((users, index) => {
                          const bottom = users === 0
                            ? 0
                            : ((users - minUsers) / range) * 200 + 14;

                          const label =
                            users === 0
                              ? 'No users'
                              : users === 1
                                ? '1 user'
                                : `${users.toLocaleString()} users`;

                          return (
                            <div key={index} className="relative group" style={{ width: '60px' }}>
                              <div
                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                                style={{ bottom: `${bottom}px` }}
                              >
                                {label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="flex mt-2 pl-2 gap-[2px]">
                      {days.map((day, index) => (
                        <div
                          key={index}
                          className="text-[10px] text-gray-600 text-center"
                          style={{ width: '60px' }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })() : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Loading user growth data...
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Quiz Completion Rate */}
        {/* <QuizCompletionRate /> */}

        {/* Category Participation */}
        {/* <CategoryParticipation /> */}
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* <TopUsers />
        <UpcomingQuizzes />
        <RecentAdminActions /> */}
      </div>

      {/* Live Metric Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <LiveUsersWidget />
        {/* <ActiveQuizzesWidget />
        <TodayRevenueWidget /> */}
      </div>

      {/* Pending Users Modal */}
      <PendingUsersModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        users={pendingUsersList}
      />
    </div>
  );
}
