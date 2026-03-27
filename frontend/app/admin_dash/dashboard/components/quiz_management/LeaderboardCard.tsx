'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Eye, Pin } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface LeaderboardCardProps {
  quizId: string;
}

interface TopPerformer {
  userId: string;
  fullName: string;
  email: string;
  avgPercentage: number;
  totalAttempts: number;
}

export default function LeaderboardCard({ quizId }: LeaderboardCardProps) {
  const [topScorers, setTopScorers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchTopPerformers = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get(`/api/analytics/top-performers?quizId=${quizId}&limit=5`);
        setTopScorers(response.data || []);
      } catch (err) {
        console.error('Failed to load top performers:', err);
        setError('Failed to load leaderboard');
        setTopScorers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, [quizId]);

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
        return 'bg-[var(--theme-primary)]';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
        </div>
        <button className="text-sm text-[var(--theme-primary)] hover:underline font-medium">
          View Full Leaderboard
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading leaderboard...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : topScorers.length === 0 ? (
        <div className="text-sm text-gray-500">No leaderboard data available.</div>
      ) : (
        <div className="space-y-3">
          {topScorers.map((scorer, index) => (
            <div
              key={scorer.userId}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-10 h-10">
                {getRankIcon(index + 1)}
              </div>

              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full ${getRankColor(index + 1)} flex items-center justify-center text-white font-bold text-sm`}>
                {(scorer.fullName || 'U')
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-bold text-gray-900">{scorer.fullName || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{scorer.email || '—'}</p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{scorer.avgPercentage?.toFixed(1) || '0'}%</p>
                <p className="text-xs text-gray-500">Attempts: {scorer.totalAttempts}</p>
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
      )}
    </div>
  );
}
