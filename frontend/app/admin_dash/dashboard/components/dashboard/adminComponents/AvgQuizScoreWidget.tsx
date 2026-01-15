"use client";

import React from "react";
import { Award, TrendingUp } from "lucide-react";

export default function AvgQuizScoreWidget() {
  const avgScore = 78.5;
  const percentageChange = 5;
  const sparklineData = [72, 74, 73, 76, 77, 76, 79, 78.5];

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Avg Quiz Score</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-white bg-white/20 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +{percentageChange}%
        </div>
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-2 mb-4">
        <div className="text-4xl font-bold text-white">{avgScore}</div>
        <div className="text-xl text-white/80">/ 100</div>
      </div>
      <p className="text-sm text-white/90 mb-4">Platform average score</p>

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
      <p className="text-xs text-white/70 mt-2">Weekly average trend</p>
    </div>
  );
}
