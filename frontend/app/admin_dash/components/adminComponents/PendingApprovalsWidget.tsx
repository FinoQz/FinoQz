"use client";

import React from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function PendingApprovalsWidget() {
  const pendingCount = 8;
  const sparklineData = [15, 12, 10, 14, 11, 9, 10, 8];

  return (
    <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg animate-pulse">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Pending Approvals</h3>
        </div>
        <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          URGENT
        </div>
      </div>

      {/* Count */}
      <div className="text-4xl font-bold text-white mb-4">{pendingCount}</div>
      <p className="text-sm text-white/90 mb-4">User approvals waiting</p>

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
      <p className="text-xs text-white/70 mt-2">Pending trend (last 8 days)</p>
    </div>
  );
}
