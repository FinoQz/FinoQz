'use client';

import React, { useState, useEffect } from 'react';
import { Eye, ArrowUpDown } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  attemptStatus: 'submitted' | 'in_progress' | 'not-attempted';
  score: number | null;
  timeTaken: string | null;
}

interface ParticipantsTableProps {
  selectedParticipants: string[];
  onSelectionChange: (selected: string[]) => void;
  onViewAttempt: (attemptData: Participant) => void;
  quizId?: string; // Add quizId prop to fetch data
}

export default function ParticipantsTable({
  selectedParticipants,
  onSelectionChange,
  onViewAttempt,
  quizId
}: ParticipantsTableProps) {
  const [sortField, setSortField] = useState<keyof Participant>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch participants when quizId is provided
  useEffect(() => {
    if (!quizId) {
      setParticipants([]);
      return;
    }

    const fetchParticipants = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [attemptsResponse, transactionsResponse] = await Promise.all([
          apiAdmin.get(`/api/quiz-attempts/quiz/${quizId}`),
          apiAdmin.get('/api/transactions/all?limit=200&dateRange=30')
        ]);
        const attempts = attemptsResponse.data.attempts || [];
        const transactions = transactionsResponse.data?.transactions || [];
        
        // Transform backend data to match Participant interface
        interface AttemptData {
          _id: string;
          userId?: { _id?: string; fullName: string; email: string; phone: string };
          startedAt: string;
          status: string;
          totalScore: number;
          percentage?: number;
          timeTaken?: number;
        }
        const transformedParticipants: Participant[] = attempts.map((attempt: AttemptData) => {
          const attemptUserId = attempt.userId?._id ? String(attempt.userId._id) : '';
          const matchedTxn = transactions.find((txn: { userId?: { _id?: string }; quizId?: { _id?: string } }) => {
            const txnUserId = txn.userId?._id ? String(txn.userId._id) : '';
            const txnQuizId = txn.quizId?._id ? String(txn.quizId._id) : '';
            return txnUserId && txnQuizId && txnUserId === attemptUserId && txnQuizId === quizId;
          });

          const paymentStatus = matchedTxn?.status === 'success'
            ? 'paid'
            : matchedTxn?.status === 'pending'
            ? 'pending'
            : 'unpaid';

          return {
          id: attempt._id,
          name: attempt.userId?.fullName || 'Unknown User',
          email: attempt.userId?.email || 'N/A',
          phone: attempt.userId?.phone || 'N/A',
          registrationDate: new Date(attempt.startedAt).toLocaleDateString('en-US'),
          paymentStatus,
          attemptStatus: attempt.status || 'not-attempted',
          score: typeof attempt.percentage === 'number' ? Math.round(attempt.percentage) : attempt.totalScore,
          timeTaken: attempt.timeTaken ? `${Math.floor(attempt.timeTaken / 60)} min` : null
        };
        });
        
        setParticipants(transformedParticipants);
      } catch (err) {
        console.error('Error fetching participants:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load participants';
        setError(errorMessage);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [quizId]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(participants.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedParticipants, id]);
    } else {
      onSelectionChange(selectedParticipants.filter(pid => pid !== id));
    }
  };

  const handleSort = (field: keyof Participant) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: string, type: 'payment' | 'attempt') => {
    if (type === 'payment') {
      const colors = {
        paid: 'bg-green-50 text-green-700',
        unpaid: 'bg-red-50 text-red-700',
        pending: 'bg-yellow-50 text-yellow-700'
      };
      return (
        <span className={`px-2.5 py-1 rounded text-[11px] font-medium ${colors[status as keyof typeof colors]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    } else {
      const colors = {
        submitted: 'bg-green-50 text-green-700',
        'in-progress': 'bg-blue-50 text-blue-700',
        'not-attempted': 'bg-gray-100 text-gray-600'
      };
      return (
        <span className={`px-2.5 py-1 rounded text-[11px] font-medium ${colors[status as keyof typeof colors]}`}>
          {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">All Participants</h3>
        <p className="text-xs text-gray-500 mt-0.5">{participants.length} total registrations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A7B] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading participants...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      ) : participants.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600 mb-2">No participants found</p>
            <p className="text-sm text-gray-500">Participants will appear here once users enroll</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-5 text-left border-b border-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.length === participants.length && participants.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-5 text-left border-b border-gray-100">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-800 transition"
                    >
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Email</th>
                  <th className="py-3 px-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Phone</th>
                  <th className="py-3 px-5 text-left border-b border-gray-100">
                    <button
                      onClick={() => handleSort('registrationDate')}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-800 transition"
                    >
                      Registration
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Payment</th>
                  <th className="py-3 px-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                  <th className="py-3 px-5 text-left border-b border-gray-100">
                    <button
                      onClick={() => handleSort('score')}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-800 transition"
                    >
                      Score
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Time</th>
                  <th className="py-3 px-5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors bg-white`}
                  >
                    <td className="py-3 px-5">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={(e) => handleSelectOne(participant.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-5">
                      <p className="font-medium text-gray-900 text-sm">{participant.name}</p>
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-500">{participant.email}</td>
                    <td className="py-3 px-5 text-sm text-gray-500">{participant.phone}</td>
                    <td className="py-3 px-5 text-sm text-gray-500">{participant.registrationDate}</td>
                    <td className="py-3 px-5">{getStatusBadge(participant.paymentStatus, 'payment')}</td>
                    <td className="py-3 px-5">{getStatusBadge(participant.attemptStatus, 'attempt')}</td>
                    <td className="py-3 px-5">
                      {participant.score !== null ? (
                        <span className="font-medium text-gray-900 text-sm">{participant.score}%</span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-sm text-gray-500">
                      {participant.timeTaken || '—'}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewAttempt(participant)}
                          disabled={participant.attemptStatus === 'not-attempted'}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 border border-transparent hover:border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                          title="View Attempt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Complete Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
            <p>Showing {participants.length} of {participants.length} participants</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
