"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight } from "lucide-react";

export default function TodayRevenueWidget() {
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [percentageIncrease, setPercentageIncrease] = useState<number | null>(null);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import("@/lib/apiAdmin")).default.get(
          "/api/admin/panel/analytics/today-revenue"
        );
        setTodayRevenue(res.data.todayRevenue);
        setPercentageIncrease(res.data.percentageIncrease);
        setSparklineData(res.data.sparkline || []);
      } catch {
        setTodayRevenue(0);
        setPercentageIncrease(0);
        setSparklineData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isPositive = (percentageIncrease ?? 0) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const maxSparkline = Math.max(...sparklineData, 1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Today&apos;s Revenue</h3>
            <p className="text-[10px] text-gray-400">Real-time earnings</p>
          </div>
        </div>
        {!loading && percentageIncrease !== null && (
          <div
            className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border
              ${isPositive
                ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                : "text-red-600 bg-red-50 border-red-100"
              }`
            }
          >
            <TrendIcon className="w-3 h-3" />
            {percentageIncrease > 0 ? "+" : ""}{percentageIncrease}%
          </div>
        )}
      </div>

      {/* Revenue amount */}
      <div className="px-5 pt-5 pb-3">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-9 w-32 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 tabular-nums leading-none">
                {todayRevenue !== null ? `₹${todayRevenue.toLocaleString()}` : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Earned so far today</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              vs yesterday
            </div>
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div className="px-5 pb-5">
        <div className="flex items-end gap-0.5 h-14 mt-2">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`revenue-skeleton-${i}`}
                className="bg-gray-100 rounded-t flex-1 animate-pulse"
                style={{ height: `${35 + (i % 4) * 10}%` }}
              />
            ))
          ) : sparklineData.length > 0 ? (
            sparklineData.map((value, index) => {
              const heightPct = (value / maxSparkline) * 100;
              const isMax = value === Math.max(...sparklineData);
              return (
                <div
                  key={`revenue-bar-${index}`}
                  className={`rounded-t flex-1 transition-all duration-500 cursor-default
                    ${isMax ? "bg-violet-500" : "bg-violet-200 hover:bg-violet-400"}`}
                  style={{ height: `${Math.max(heightPct, 3)}%` }}
                  title={`₹${value.toLocaleString()}`}
                />
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              No data yet
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">Hourly revenue trend (last 12 hours)</p>
      </div>
    </div>
  );
}
