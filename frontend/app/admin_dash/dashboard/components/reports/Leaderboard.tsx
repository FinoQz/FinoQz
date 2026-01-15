'use client';

import React from 'react';
import { Trophy, Clock } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  userName: string;
  avatar: string;
  score: number;
  totalScore: number;
  percentage: number;
  timeTaken: string;
}

interface LeaderboardProps {
  topPerformers: LeaderboardEntry[];
}

export default function Leaderboard({ topPerformers }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-sm font-semibold text-gray-700">Top 5 Performers</h3>
      </div>
      
      <div className="space-y-3">
        {topPerformers.map((performer, index) => (
          <div
            key={performer.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
          >
            {/* Rank Badge */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm bg-gray-100 text-gray-700">
              {index + 1}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#253A7B] to-blue-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {performer.avatar}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {performer.userName}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-medium text-[#253A7B]">
                  {performer.score}/{performer.totalScore} ({performer.percentage}%)
                </span>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {performer.timeTaken}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
