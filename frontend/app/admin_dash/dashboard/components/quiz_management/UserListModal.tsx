'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Users, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiAdmin from '@/lib/apiAdmin';
import { exportParticipantsToExcel, exportParticipantsToPDF } from '@/utils/exportUtils';

export type UserListType = 'registered' | 'enrolled' | 'participated' | 'paid';

interface UserRecord {
  _id?: string;
  fullName?: string;
  name?: string;
  email: string;
  mobile?: string;
  phone?: string;
  enrolledAt?: string;
  startedAt?: string;
  submittedAt?: string;
  amount?: number;
  attemptStatus?: string;
  paymentStatus?: string;
  score?: number | null;
  correctCount?: number;
  incorrectCount?: number;
  city?: string;
  country?: string;
  createdAt?: string;
}

interface UserListModalProps {
  quizId: string;
  quizTitle: string;
  listType: UserListType;
  onClose: () => void;
}

const TITLES: Record<UserListType, string> = {
  registered: 'Registered Users',
  enrolled: 'Enrolled Users',
  participated: 'Participated Users',
  paid: 'Paid Users',
};

const fmt = (d?: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

type SortKey = 'name' | 'email' | 'date' | 'score';
type SortDir = 'asc' | 'desc';

export default function UserListModal({ quizId, quizTitle, listType, onClose }: UserListModalProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        let endpoint = '';
        if (listType === 'registered') endpoint = `/api/analytics/quiz-registered-users?quizId=${quizId}`;
        else if (listType === 'enrolled') endpoint = `/api/analytics/quiz-enrolled-users?quizId=${quizId}`;
        else if (listType === 'participated') endpoint = `/api/analytics/quiz-participants?quizId=${quizId}`;
        else endpoint = `/api/analytics/quiz-enrolled-users?quizId=${quizId}`;
        const res = await apiAdmin.get(endpoint);
        const raw = res.data?.users || res.data?.participants || [];
        setUsers(raw);
      } catch (err) {
        console.error('UserListModal fetch error:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [quizId, listType]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = users.filter(u => {
      const n = (u.fullName || u.name || '').toLowerCase();
      const e = (u.email || '').toLowerCase();
      return !q || n.includes(q) || e.includes(q);
    });
    result = [...result].sort((a, b) => {
      let av: string | number = '', bv: string | number = '';
      if (sortKey === 'name') { av = a.fullName || a.name || ''; bv = b.fullName || b.name || ''; }
      else if (sortKey === 'email') { av = a.email || ''; bv = b.email || ''; }
      else if (sortKey === 'score') { av = a.score ?? -1; bv = b.score ?? -1; }
      else { av = a.enrolledAt || a.startedAt || ''; bv = b.enrolledAt || b.startedAt || ''; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    : <ChevronDown className="w-3 h-3 opacity-30" />;

  const handleExport = async (fmt: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const rows = filtered.map((u, i) => ({
        name: u.fullName || u.name || 'Unknown',
        email: u.email || 'N/A',
        phone: u.phone || 'N/A',
        enrolledAt: u.enrolledAt ? new Date(u.enrolledAt).toLocaleString() : '—',
        startedAt: u.startedAt ? new Date(u.startedAt).toLocaleString() : '—',
        submittedAt: u.submittedAt ? new Date(u.submittedAt).toLocaleString() : '—',
        timeTaken: '—',
        attemptStatus: u.attemptStatus || '—',
        paymentStatus: u.paymentStatus || '—',
        score: u.score != null ? `${u.score}%` : '—',
        totalScore: '—',
        totalMarks: '—',
        correctCount: u.correctCount ?? 0,
        incorrectCount: u.incorrectCount ?? 0,
        totalQuestions: (u.correctCount ?? 0) + (u.incorrectCount ?? 0),
      }));
      const title = `${quizTitle} - ${TITLES[listType]}`;
      if (fmt === 'excel') await exportParticipantsToExcel(rows, title);
      else exportParticipantsToPDF(rows, title);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
          className="relative bg-white w-full sm:max-w-4xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#253A7B] to-[#1a2a5e]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{TITLES[listType]}</h3>
                <p className="text-blue-200 text-[11px]">{quizTitle} • {users.length} users</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting || users.length === 0}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting || users.length === 0}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#253A7B] bg-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#253A7B]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Users className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">No users found</p>
                {search && <p className="text-xs mt-1">Try clearing the search</p>}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="py-3 px-5 text-left">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                        Name <SortIcon k="name" />
                      </button>
                    </th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="py-3 px-5 text-left">
                      <button onClick={() => handleSort('date')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                        {listType === 'participated' ? 'Started At' : 'Date'} <SortIcon k="date" />
                      </button>
                    </th>
                    {(listType === 'participated') && (
                      <>
                        <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-5 text-left">
                          <button onClick={() => handleSort('score')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800">
                            Score <SortIcon k="score" />
                          </button>
                        </th>
                        <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">✓/✗</th>
                      </>
                    )}
                    {listType === 'enrolled' && (
                      <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const name = u.fullName || u.name || 'Unknown';
                    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                    const dateVal = u.startedAt || u.enrolledAt;
                    return (
                      <tr key={u._id || `${u.email}-${i}`} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-5 text-xs text-gray-400 font-medium">{i + 1}</td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#253A7B] to-blue-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {initials}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-500">{u.email}</td>
                        <td className="py-3 px-5 text-sm text-gray-500">{u.mobile || u.phone || '—'}</td>
                        <td className="py-3 px-5 text-sm text-gray-500">
                          <span className="font-medium">{u.city || '—'}</span>
                          <span className="text-[10px] text-gray-400 block">{u.country || '—'}</span>
                        </td>
                        <td className="py-3 px-5 text-xs text-gray-500">{fmt(dateVal)}</td>
                        {listType === 'participated' && (
                          <>
                            <td className="py-3 px-5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                u.attemptStatus === 'submitted' ? 'bg-green-50 text-green-700' :
                                u.attemptStatus === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {u.attemptStatus || '—'}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-sm font-bold text-[#253A7B]">
                              {u.score != null ? `${u.score}%` : '—'}
                            </td>
                            <td className="py-3 px-5 text-xs text-gray-600">
                              <span className="text-green-600 font-semibold">{u.correctCount ?? 0}✓</span>
                              {' / '}
                              <span className="text-red-500 font-semibold">{u.incorrectCount ?? 0}✗</span>
                            </td>
                          </>
                        )}
                        {listType === 'enrolled' && (
                          <td className="py-3 px-5 text-sm font-medium text-gray-700">
                            {u.amount ? `₹${u.amount}` : 'Free'}
                          </td>
                        )}
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
              Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of <span className="font-semibold text-gray-900">{users.length}</span> users
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
