'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Users, Activity } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import { io, Socket } from 'socket.io-client';

export default function LiveUsersWidget() {
  const [liveUsers, setLiveUsers] = useState<number>(0);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const fallbackCalled = useRef(false);

  // Fetch fallback data immediately
  useEffect(() => {
    fetchLiveDataFallback();
  }, []);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('❌ NEXT_PUBLIC_BACKEND_URL not defined');
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(backendUrl, { withCredentials: true });
    }
    const socket = socketRef.current;

    let fallbackTimer: NodeJS.Timeout | null = setTimeout(() => {
      if (!fallbackCalled.current) {
        console.warn('⚠️ No WebSocket data — using fallback API');
        fetchLiveDataFallback();
        fallbackCalled.current = true;
      }
    }, 1000); // shorter timeout

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket:', socket.id);
    });

    socket.on('analytics:update', (data) => {
      if (data.type === 'liveUsers') {
        console.log('📡 WebSocket liveUsers:', data);
        setLiveUsers(data.liveUsers || 0);
        setSparklineData(data.sparkline || []);
        setLoading(false);
        fallbackCalled.current = true; // prevent fallback
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      }
    });

    return () => {
      socket.off('analytics:update');
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const fetchLiveDataFallback = async () => {
    try {
      const res = await apiAdmin.get('/api/admin/panel/analytics/live-users', {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
      setLiveUsers(res.data.liveUsers || 0);
      setSparklineData(res.data.sparkline || []);
      setLoading(false);
    } catch (err) {
      console.error('❌ Fallback API failed:', err);
      setLoading(false);
    }
  };

  const maxValue = Math.max(...sparklineData, 1); // avoid divide by 0

  if (loading) {
    // Simple skeleton loader
    return (
      <div className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-2xl p-6 border border-gray-200 shadow-lg animate-pulse min-h-[200px] flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-white opacity-60" />
        </div>
        <div className="h-8 w-24 bg-white/30 rounded mb-2" />
        <div className="h-4 w-32 bg-white/20 rounded mb-4" />
        <div className="flex gap-1 w-full h-12 mt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 bg-white/20 rounded-t" style={{ height: `${30 + (i % 3) * 10}%` }} />
          ))}
        </div>
        <p className="text-xs text-white/60 mt-4">Loading user growth data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-white animate-pulse" />
            <h3 className="text-lg font-semibold text-white">Live Users</h3>
          </div>
          <p className="text-4xl font-bold text-white">{liveUsers}</p>
          <p className="text-sm text-white/70 mt-1">Active right now</p>
        </div>

        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-1 h-12 mt-4">
        {sparklineData.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-white/30 rounded-t transition-all hover:bg-white/50"
            style={{ height: `${(value / maxValue) * 100}%` }}
          />
        ))}
      </div>

      <p className="text-xs text-white/60 mt-2">Last 8 hours activity</p>
    </div>
  );
}
