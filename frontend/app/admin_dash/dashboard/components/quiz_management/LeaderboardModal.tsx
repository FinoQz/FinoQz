'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Trophy, Medal, Award, Search, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiAdmin from '@/lib/apiAdmin';
import { exportLeaderboardToExcel, exportLeaderboardToPDF } from '@/utils/exportUtils';

interface TopPerformer {
  userId: string;
  fullName: string;
  email: string;
  avgPercentage: number;
  totalScore: number;
  totalAttempts: number;
  certificatesEarned: number;
  city?: string;
  country?: string;
  gender?: string;
}

interface LeaderboardModalProps {
  quizId: string;
  quizTitle: string;
  onClose: () => void;
}

type SortKey = 'rank' | 'name' | 'score' | 'attempts';

export default function LeaderboardModal({ quizId, quizTitle, onClose }: LeaderboardModalProps) {
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await apiAdmin.get(`/api/analytics/top-performers?quizId=${quizId}&limit=200`);
        setPerformers(res.data || []);
      } catch {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [quizId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = performers.filter(p =>
      !q || (p.fullName || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q)
    );
    result = [...result].sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortKey === 'name') { av = a.fullName || ''; bv = b.fullName || ''; }
      else if (sortKey === 'score') { av = a.avgPercentage; bv = b.avgPercentage; }
      else if (sortKey === 'attempts') { av = a.totalAttempts; bv = b.totalAttempts; }
      else { av = a.avgPercentage; bv = b.avgPercentage; } // rank = default sort by score desc
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [performers, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'rank' || key === 'score' ? 'desc' : 'asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3 opacity-30" />;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
  };

  const getRowBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50/60 border-yellow-100';
    if (rank === 2) return 'bg-gray-50/60 border-gray-100';
    if (rank === 3) return 'bg-orange-50/40 border-orange-100';
    return 'bg-white border-gray-50';
  };

  const handleExport = async (fmt: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const rows = filtered.map((p, i) => ({
        rank: i + 1,
        name: p.fullName || 'Unknown',
        email: p.email || 'N/A',
        avgPercentage: p.avgPercentage,
        totalScore: p.totalScore,
        totalAttempts: p.totalAttempts,
        certificatesEarned: p.certificatesEarned,
      }));
      if (fmt === 'excel') await exportLeaderboardToExcel(rows, quizTitle);
      else exportLeaderboardToPDF(rows, quizTitle);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-400 to-orange-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Full Leaderboard</h3>
                <p className="text-yellow-100 text-[11px]">{quizTitle} • {performers.length} participants</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting || performers.length === 0}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting || performers.length === 0}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#253A7B] bg-white"
              />
            </div>
          </div>

          {/* Top 3 Podium (only if no search) */}
          {!search && !loading && filtered.length >= 3 && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
              <div className="flex items-end justify-center gap-3">
                {/* 2nd */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold text-sm mb-1">
                    {(filtered[1]?.fullName || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <Medal className="w-5 h-5 text-gray-400 mb-1" />
                  <p className="text-xs font-bold text-gray-700 max-w-[80px] truncate text-center">{filtered[1]?.fullName}</p>
                  <p className="text-sm font-black text-gray-900">{filtered[1]?.avgPercentage?.toFixed(1)}%</p>
                </div>
                {/* 1st */}
                <div className="flex flex-col items-center -mt-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-base mb-1 shadow-lg shadow-yellow-200">
                    {(filtered[0]?.fullName || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <Trophy className="w-6 h-6 text-yellow-500 mb-1" />
                  <p className="text-xs font-bold text-gray-900 max-w-[80px] truncate text-center">{filtered[0]?.fullName}</p>
                  <p className="text-lg font-black text-yellow-600">{filtered[0]?.avgPercentage?.toFixed(1)}%</p>
                </div>
                {/* 3rd */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm mb-1">
                    {(filtered[2]?.fullName || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <Award className="w-5 h-5 text-orange-500 mb-1" />
                  <p className="text-xs font-bold text-gray-700 max-w-[80px] truncate text-center">{filtered[2]?.fullName}</p>
                  <p className="text-sm font-black text-gray-900">{filtered[2]?.avgPercentage?.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Trophy className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">No leaderboard data</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-5 text-left">
                      <button onClick={() => handleSort('rank')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                        Rank <SortIcon k="rank" />
                      </button>
                    </th>
                    <th className="py-3 px-5 text-left">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                        Name <SortIcon k="name" />
                      </button>
                    </th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-5 text-right">
                      <button onClick={() => handleSort('score')} className="flex items-center gap-1 justify-end w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                        Avg Score <SortIcon k="score" />
                      </button>
                    </th>
                    <th className="py-3 px-5 text-right">
                      <button onClick={() => handleSort('attempts')} className="flex items-center gap-1 justify-end w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                        Attempts <SortIcon k="attempts" />
                      </button>
                    </th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="py-3 px-5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Certs</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const rank = i + 1;
                    const initials = (p.fullName || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                    const pct = p.avgPercentage?.toFixed(1) || '0.0';
                    return (
                      <tr key={p.userId} className={`border-b ${getRowBg(rank)} hover:brightness-95 transition-all`}>
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-center w-8 h-8">{getRankIcon(rank)}</div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                              rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                              rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                              rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                              'bg-[#253A7B]'
                            }`}>{initials}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{p.fullName || 'Unknown'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-500">{p.email}</td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`text-lg font-black ${rank === 1 ? 'text-yellow-600' : rank <= 3 ? 'text-orange-500' : 'text-[#253A7B]'}`}>{pct}%</span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div className={`h-full rounded-full ${rank === 1 ? 'bg-yellow-400' : 'bg-[#253A7B]'}`} style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-right text-sm font-medium text-gray-700">{p.totalAttempts}</td>
                        <td className="py-3 px-5 text-left">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-700">{p.city || '—'}</span>
                            <span className="text-[10px] text-gray-400">{p.country || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-right">
                          {p.certificatesEarned > 0
                            ? <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">🏅 {p.certificatesEarned}</span>
                            : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-900">{filtered.length}</span> participants
            </p>
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-300 transition">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
