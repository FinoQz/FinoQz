"use client";

import React from "react";
import { UserPlus, TrendingUp } from "lucide-react";

export default function NewSignupsWidget() {
  const newSignups = 34;
  const percentageIncrease = 22;
  const sparklineData = [12, 18, 15, 24, 28, 26, 31, 34];

  return (
    <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">New Signups</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-white bg-white/20 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +{percentageIncrease}%
        </div>
      </div>

      {/* Count */}
      <div className="text-4xl font-bold text-white mb-4">{newSignups}</div>
      <p className="text-sm text-white/90 mb-4">Registered today</p>

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
      <p className="text-xs text-white/70 mt-2">Last 8 days signups</p>
    </div>
  );
}
