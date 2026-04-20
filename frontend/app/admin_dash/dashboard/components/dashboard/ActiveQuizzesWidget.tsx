"use client";

import React, { useEffect, useState } from "react";
import { PlayCircle, Zap, BarChart2 } from "lucide-react";

export default function ActiveQuizzesWidget() {
  const [activeQuizzes, setActiveQuizzes] = useState<number | null>(null);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import("@/lib/apiAdmin")).default.get(
          "/api/admin/panel/analytics/active-quizzes"
        );
        setActiveQuizzes(res.data.activeQuizzes);
        setSparklineData(res.data.sparkline || []);
      } catch {
        setActiveQuizzes(0);
        setSparklineData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxSparkline = Math.max(...sparklineData, 1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Active Quizzes</h3>
            <p className="text-[10px] text-gray-400">In progress right now</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          LIVE
        </div>
      </div>

      {/* Count & sub */}
      <div className="px-5 pt-4 pb-2">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-9 w-16 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-gray-900 tabular-nums leading-none">
              {activeQuizzes ?? 0}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              quizzes live
            </div>
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div className="px-5 pb-5">
        <div className="flex items-end gap-0.5 h-12 mt-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-t flex-1 animate-pulse"
                style={{ height: `${35 + (i % 3) * 15}%` }}
              />
            ))
          ) : sparklineData.length > 0 ? (
            sparklineData.map((value, index) => {
              const heightPct = (value / maxSparkline) * 100;
              return (
                <div
                  key={index}
                  className="bg-emerald-200 hover:bg-emerald-400 rounded-t flex-1 transition-all duration-500 cursor-default"
                  style={{ height: `${Math.max(heightPct, 3)}%` }}
                  title={`${value} quizzes`}
                />
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-gray-200" />
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">Last 8 hours activity</p>
      </div>
    </div>
  );
}
