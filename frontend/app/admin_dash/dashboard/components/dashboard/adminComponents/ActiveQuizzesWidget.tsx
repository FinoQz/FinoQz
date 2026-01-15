"use client";

import React from "react";
import { PlayCircle } from "lucide-react";

export default function ActiveQuizzesWidget() {
  // Sample data for active quizzes with sparkline
  const activeQuizzes = 15;
  const sparklineData = [8, 10, 9, 12, 14, 13, 16, 15];

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
      <div className="text-4xl font-bold text-white mb-4">{activeQuizzes}</div>
      <p className="text-sm text-white/90 mb-4">Quizzes in progress right now</p>

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
      <p className="text-xs text-white/70 mt-2">Last 8 hours activity</p>
    </div>
  );
}
