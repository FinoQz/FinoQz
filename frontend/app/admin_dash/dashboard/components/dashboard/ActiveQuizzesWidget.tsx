"use client";

import React, { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";

export default function ActiveQuizzesWidget() {
  const [activeQuizzes, setActiveQuizzes] = useState<number | null>(null);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/active-quizzes');
        setActiveQuizzes(res.data.activeQuizzes);
        setSparklineData(res.data.sparkline || []);
      } catch {
        setActiveQuizzes(0);
        setSparklineData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg animate-pulse">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Active Quizzes</h3>
        </div>
        <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">LIVE</div>
      </div>

      {/* Count */}
      <div className="text-4xl font-bold text-white mb-4">
        {loading ? <span className="animate-pulse">...</span> : activeQuizzes}
      </div>
      <p className="text-sm text-white/90 mb-4">Quizzes in progress right now</p>

      {/* Sparkline */}
      <div className="flex items-end justify-between gap-1 h-12">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/20 rounded-t flex-1 animate-pulse" style={{ height: `${40 + (i % 3) * 10}%` }} />
          ))
        ) : (
          sparklineData.map((value, index) => (
            <div
              key={index}
              className="bg-white/30 rounded-t flex-1 transition-all duration-300 hover:bg-white/50"
              style={{ height: `${(value / Math.max(...sparklineData, 1)) * 100}%` }}
            />
          ))
        )}
      </div>
      <p className="text-xs text-white/70 mt-2">Last 8 hours activity</p>
    </div>
  );
}
