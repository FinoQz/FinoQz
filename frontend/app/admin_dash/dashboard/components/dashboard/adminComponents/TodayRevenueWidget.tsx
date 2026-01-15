"use client";

import React from "react";
import { TrendingUp, DollarSign } from "lucide-react";

export default function TodayRevenueWidget() {
  const todayRevenue = 8450;
  const percentageIncrease = 18;
  const sparklineData = [3200, 4100, 3800, 5200, 6300, 7100, 7800, 8450];

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Today&apos;s Revenue</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-white bg-white/20 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +{percentageIncrease}%
        </div>
      </div>

      {/* Amount */}
      <div className="text-4xl font-bold text-white mb-4">₹{todayRevenue.toLocaleString()}</div>
      <p className="text-sm text-white/90 mb-4">Earned so far today</p>

      {/* Sparkline */}
      <div className="flex items-end justify-between gap-1 h-12">
        {sparklineData.map((value, index) => (
          <div
            key={index}
            className="bg-white/30 rounded-t flex-1 transition-all duration-300 hover:bg-white/50"
            style={{ height: `${(value / Math.max(...sparklineData)) * 100}%` }}
          />
        ))}
      </div>
      <p className="text-xs text-white/70 mt-2">Hourly revenue trend</p>
    </div>
  );
}
