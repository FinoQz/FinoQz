'use client';

import React from 'react';
import { Trophy, Medal, Award, Eye, Pin } from 'lucide-react';

export default function LeaderboardCard() {
  const topScorers = [
    {
      rank: 1,
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      score: 92,
      timeTaken: '38 min',
      avatar: 'PP'
    },
    {
      rank: 2,
      name: 'Anjali Verma',
      email: 'anjali.verma@email.com',
      score: 88,
      timeTaken: '40 min',
      avatar: 'AV'
    },
    {
      rank: 3,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      score: 85,
      timeTaken: '42 min',
      avatar: 'RS'
    },
    {
      rank: 4,
      name: 'Sneha Singh',
      email: 'sneha.singh@email.com',
      score: 78,
      timeTaken: '45 min',
      avatar: 'SS'
    },
    {
      rank: 5,
      name: 'Vikram Reddy',
      email: 'vikram.reddy@email.com',
      score: 75,
      timeTaken: '43 min',
      avatar: 'VR'
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default:
        return 'bg-[#253A7B]';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
        </div>
        <button className="text-sm text-[#253A7B] hover:underline font-medium">
          View Full Leaderboard
        </button>
      </div>

      <div className="space-y-3">
        {topScorers.map((scorer) => (
          <div
            key={scorer.rank}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-10 h-10">
              {getRankIcon(scorer.rank)}
            </div>

            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full ${getRankColor(scorer.rank)} flex items-center justify-center text-white font-bold text-sm`}>
              {scorer.avatar}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-bold text-gray-900">{scorer.name}</p>
              <p className="text-xs text-gray-500">{scorer.email}</p>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{scorer.score}%</p>
              <p className="text-xs text-gray-500">{scorer.timeTaken}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-blue-100 rounded-lg transition"
                title="View Profile"
              >
                <Eye className="w-4 h-4 text-blue-600" />
              </button>
              <button
                className="p-2 hover:bg-yellow-100 rounded-lg transition"
                title="Pin Winner"
              >
                <Pin className="w-4 h-4 text-yellow-600" />
              </button>
              <button
                className="p-2 hover:bg-green-100 rounded-lg transition"
                title="Award Badge"
              >
                <Award className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
