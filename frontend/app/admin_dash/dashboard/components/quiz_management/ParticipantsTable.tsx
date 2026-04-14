'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Eye, ArrowUpDown, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

export interface ParticipantFilters {
  search: string;
  paymentStatus: string;
  attemptStatus: string;
  dateFrom: string;
  dateTo: string;
  scoreMin: string;
  scoreMax: string;
}

export interface ParticipantRow {
  attemptId: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  phone?: string; 
  city?: string;
  country?: string;
  gender?: string;
  userStatus?: string;
  joinDate?: string | null;
  enrolledAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  timeTaken: number | null;
  attemptStatus: string;
  score: number | null;
  totalScore: number;
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  paymentStatus: string;
  paidAmount: number;
}

interface ParticipantsTableProps {
  quizId?: string;
  quizTitle?: string;
  pricingType?: 'free' | 'paid';
  filters: ParticipantFilters;
  selectedParticipants: string[];
  onSelectionChange: (selected: string[]) => void;
  onViewAttempt: (attemptData: { attemptId: string; name: string; email: string; score: number; timeTaken: string | number }) => void;
}

const PAGE_SIZE = 15;

const fmtDT = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtTime = (secs: number | null) => {
  if (secs === null || secs === undefined) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
};

const statusBadge = (status: string, type: 'payment' | 'attempt') => {
  if (type === 'payment') {
    const cfg: Record<string, string> = {
      paid: 'bg-green-50 text-green-700 border border-green-200',
      unpaid: 'bg-red-50 text-red-700 border border-red-200',
      pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${cfg[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
  } else {
    const cfg: Record<string, string> = {
      submitted: 'bg-green-50 text-green-700 border border-green-200',
      in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
      'not-attempted': 'bg-gray-100 text-gray-500 border border-gray-200',
    };
    const label = { submitted: 'Submitted', in_progress: 'In Progress', 'not-attempted': 'Not Attempted' }[status] || status;
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${cfg[status] || 'bg-gray-100 text-gray-500'}`}>{label}</span>;
  }
};

export default function ParticipantsTable({
  quizId, quizTitle = 'Quiz', pricingType = 'free', filters,
  selectedParticipants, onSelectionChange, onViewAttempt,
}: ParticipantsTableProps) {
  const [allParticipants, setAllParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof ParticipantRow>('startedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!quizId) { setAllParticipants([]); return; }
    const fetch = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({ quizId });
        if (filters.search) params.set('search', filters.search);
        if (filters.paymentStatus && filters.paymentStatus !== 'all') params.set('paymentStatus', filters.paymentStatus);
        if (filters.attemptStatus && filters.attemptStatus !== 'all') params.set('attemptStatus', filters.attemptStatus);
        if (filters.scoreMin) params.set('scoreMin', filters.scoreMin);
        if (filters.scoreMax) params.set('scoreMax', filters.scoreMax);
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);
        params.set('includeEnrolled', 'true');
        const res = await apiAdmin.get(`/api/analytics/quiz-participants?${params.toString()}`);
        setAllParticipants(res.data?.participants || []);
        setPage(1);
      } catch (err) {
        console.error('ParticipantsTable fetch error:', err);
        setError('Failed to load participants');
        setAllParticipants([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [quizId, filters]);

  const sorted = useMemo(() => {
    return [...allParticipants].sort((a, b) => {
      const av = a[sortField] as string | number | null;
      const bv = b[sortField] as string | number | null;
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allParticipants, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: keyof ParticipantRow) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortBtn = ({ field, label }: { field: keyof ParticipantRow; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition whitespace-nowrap"
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-[#253A7B]' : 'opacity-30'}`} />
    </button>
  );

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? paginated.map(p => p.attemptId) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    onSelectionChange(checked ? [...selectedParticipants, id] : selectedParticipants.filter(x => x !== id));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">All Participants</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {allParticipants.length} total{selectedParticipants.length > 0 ? ` • ${selectedParticipants.length} selected` : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A7B] mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading participants...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : allParticipants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500 text-sm">No participants found</p>
          <p className="text-gray-400 text-xs mt-1">Try adjusting the filters or wait for users to attempt</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left w-8">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every(p => selectedParticipants.includes(p.attemptId))}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 accent-[#253A7B] rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 text-left"><SortBtn field="name" label="Name" /></th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="py-3 px-4 text-left"><SortBtn field="city" label="Location" /></th>
                  <th className="py-3 px-4 text-left"><SortBtn field="userStatus" label="User Status" /></th>
                  <th className="py-3 px-4 text-left"><SortBtn field="enrolledAt" label="Enrolled" /></th>
                  <th className="py-3 px-4 text-left"><SortBtn field="startedAt" label="Started" /></th>
                  <th className="py-3 px-4 text-left"><SortBtn field="submittedAt" label="Submitted" /></th>
                  <th className="py-3 px-4 text-left"><SortBtn field="timeTaken" label="Time" /></th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  {pricingType === 'paid' && (
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  )}
                  <th className="py-3 px-4 text-left"><SortBtn field="score" label="Score%" /></th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">✓/✗</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr
                    key={p.attemptId}
                    className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(p.attemptId)}
                        onChange={e => handleSelectOne(p.attemptId, e.target.checked)}
                        className="w-4 h-4 accent-[#253A7B] rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#253A7B]/10 flex items-center justify-center text-[#253A7B] text-[10px] font-bold shrink-0">
                          {p.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 max-w-[160px] truncate">{p.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{p.mobile || p.phone || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{p.city || '—'}</span>
                        <span className="text-[10px] text-gray-400">{p.country || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        p.userStatus === 'approved' || p.userStatus === 'Active' ? 'text-green-600 bg-green-50' : 
                        p.userStatus === 'blocked' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                      }`}>
                        {p.userStatus || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{fmtDT(p.enrolledAt)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{fmtDT(p.startedAt)}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{fmtDT(p.submittedAt)}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 font-medium">{fmtTime(p.timeTaken)}</td>
                    <td className="py-3 px-4">{statusBadge(p.attemptStatus, 'attempt')}</td>
                    {pricingType === 'paid' && (
                      <td className="py-3 px-4">{statusBadge(p.paymentStatus, 'payment')}</td>
                    )}
                    <td className="py-3 px-4">
                      {p.score !== null ? (
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${p.score >= 70 ? 'text-green-600' : p.score >= 40 ? 'text-orange-500' : 'text-red-600'}`}>
                            {p.score}%
                          </span>
                          <span className="text-[10px] text-gray-400">{p.totalScore}/{p.totalMarks} marks</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                        <span className="flex items-center gap-0.5 text-green-600">
                          <Check className="w-3 h-3" />{p.correctCount}
                        </span>
                        <span className="text-gray-300">/</span>
                        <span className="flex items-center gap-0.5 text-red-500">
                          <X className="w-3 h-3" />{p.incorrectCount}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onViewAttempt({
                          attemptId: p.attemptId,
                          name: p.name,
                          email: p.email,
                          score: p.score ?? 0,
                          timeTaken: p.timeTaken ?? 0,
                        })}
                        disabled={p.attemptStatus === 'not-attempted'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#253A7B]/5 hover:bg-[#253A7B] text-[#253A7B] hover:text-white border border-[#253A7B]/20 hover:border-[#253A7B] rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        title="View complete attempt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
            <p>
              Showing <span className="font-semibold text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span>–
              <span className="font-semibold text-gray-900">{Math.min(page * PAGE_SIZE, sorted.length)}</span> of{' '}
              <span className="font-semibold text-gray-900">{sorted.length}</span> participants
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-[#253A7B] text-white rounded-lg font-semibold">{page}</span>
              <span className="text-gray-400">of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
