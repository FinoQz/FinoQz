import React, { useState, useEffect } from 'react';
import { Download, Search, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, User, BarChart2 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import AttemptAnalysisModal from './AttemptAnalysisModal';

interface Participant {
  attemptId: string;
  userId: string;
  name: string;
  email: string;
  attemptStatus: string;
  score: number | null;
  totalScore: number;
  totalMarks: number;
  paymentStatus: string;
  paymentMethod: string;
  paidAmount: number;
  startedAt: string | null;
  submittedAt: string | null;
  timeTaken: number | null;
}

interface QuizParticipantTableProps {
  quizId: string;
  onBack: () => void;
}

export default function QuizParticipantTable({ quizId, onBack }: QuizParticipantTableProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const res = await apiAdmin.get(`/api/analytics/quiz-participants?quizId=${quizId}`);
        setParticipants(res.data.participants || []);
      } catch (err) {
        console.error('Failed to fetch participants:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [quizId]);

  const filtered = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.email.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || p.paymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Header / Actions */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 leading-none">
              Recorded Submissions
            </h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1.5 uppercase tracking-wider">{filtered.length} Attempts matched</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#253A7B] transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:border-[#253A7B] transition-all font-semibold text-gray-600 cursor-pointer"
            >
              <option value="all">All Access</option>
              <option value="paid">Paid Only</option>
              <option value="free">Free Only</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <button className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-[#253A7B] transition-all flex items-center gap-2 text-xs font-semibold shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center">
             <div className="w-6 h-6 border-2 border-[#253A7B] border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Fetching candidates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center text-xs font-medium text-gray-400 uppercase tracking-widest">
            No Records Found
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-[10px] uppercase tracking-wider text-center">Score</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-[10px] uppercase tracking-wider text-center">Duration</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-[10px] uppercase tracking-wider text-right">Date/Time</th>
                <th className="px-6 py-4 font-semibold text-gray-500 text-[10px] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#253A7B] font-bold text-[10px]">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[10px] text-gray-400 lowercase">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      p.attemptStatus === 'submitted' || p.attemptStatus === 'completed'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : p.attemptStatus === 'in_progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {p.attemptStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold ${getScoreColor(p.score)}`}>
                      {p.score !== null ? `${p.score}%` : '--'}
                    </span>
                    {p.score !== null && (
                      <p className="text-[9px] text-gray-400 font-medium">({p.totalScore}/{p.totalMarks})</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-medium text-gray-500">
                    {formatTime(p.timeTaken)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      p.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-100' : 
                      p.paymentStatus === 'free' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {p.paymentStatus}
                    </span>
                    <div className="mt-1 flex flex-col">
                      {p.paymentStatus === 'free' ? (
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Free</p>
                      ) : p.paidAmount > 0 ? (
                        <p className="text-[10px] font-bold text-gray-900">₹{p.paidAmount}</p>
                      ) : (
                        <p className="text-[9px] text-gray-400 font-medium italic">Pending</p>
                      )}
                      <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">
                        {p.paymentMethod}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs font-semibold text-gray-900">
                      {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : p.startedAt ? new Date(p.startedAt).toLocaleDateString() : '--'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {p.submittedAt ? new Date(p.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedAttemptId(p.attemptId); setIsAnalysisOpen(true); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-[#253A7B] transition-colors group relative"
                      title="Analyze Attempt"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Deep Audit
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AttemptAnalysisModal 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)} 
        attemptId={selectedAttemptId || ''} 
      />
    </div>
  );
}
