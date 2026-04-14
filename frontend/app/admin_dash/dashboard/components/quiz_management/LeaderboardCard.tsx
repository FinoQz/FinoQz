'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Eye } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import LeaderboardModal from './LeaderboardModal';

interface LeaderboardCardProps {
  quizId: string;
  quizTitle?: string;
}

interface TopPerformer {
  userId: string;
  fullName: string;
  email: string;
  avgPercentage: number;
  totalAttempts: number;
  certificatesEarned?: number;
}

export default function LeaderboardCard({ quizId, quizTitle = 'Quiz' }: LeaderboardCardProps) {
  const [topScorers, setTopScorers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

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
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600';
    return 'bg-[#253A7B]';
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-[#253A7B] hover:underline font-medium flex items-center gap-1 hover:text-blue-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Full Leaderboard
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : topScorers.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-gray-400">
            <Trophy className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No leaderboard data available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topScorers.map((scorer, index) => {
              const rank = index + 1;
              const initials = (scorer.fullName || 'U').split(' ').slice(0, 2).map(p => p[0]).join('');
              const pct = scorer.avgPercentage?.toFixed(1) || '0.0';
              return (
                <div
                  key={scorer.userId}
                  className={`flex items-center gap-4 p-4 rounded-xl hover:brightness-95 transition border ${
                    rank === 1 ? 'bg-yellow-50 border-yellow-100' :
                    rank === 2 ? 'bg-gray-50 border-gray-100' :
                    rank === 3 ? 'bg-orange-50/50 border-orange-100' :
                    'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 shrink-0">{getRankIcon(rank)}</div>
                  <div className={`w-10 h-10 rounded-full ${getRankColor(rank)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{scorer.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">{scorer.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-black ${rank === 1 ? 'text-yellow-600' : 'text-gray-900'}`}>{pct}%</p>
                    <p className="text-[10px] text-gray-400">{scorer.totalAttempts} attempt{scorer.totalAttempts !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <LeaderboardModal
          quizId={quizId}
          quizTitle={quizTitle}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
