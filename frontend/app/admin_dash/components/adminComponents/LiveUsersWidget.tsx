'use client';

import React from 'react';
import { Users, Activity } from 'lucide-react';

export default function LiveUsersWidget() {
  const liveUsers = 23;
  
  // Sparkline data (dummy)
  const sparklineData = [12, 15, 14, 18, 20, 19, 22, 23];
  const maxValue = Math.max(...sparklineData);

  return (
    <div className="bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
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
