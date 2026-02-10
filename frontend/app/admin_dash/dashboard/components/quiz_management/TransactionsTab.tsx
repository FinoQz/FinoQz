'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface TransactionsTabProps {
  quizId: string;
}

export default function TransactionsTab({ quizId }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    user: string;
    email: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    gateway: string;
    date: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get('/api/transactions/all?limit=200&dateRange=30');
        const rawTransactions = response.data?.transactions || [];

        const filtered = rawTransactions.filter((txn: { quizId?: { _id?: string } | string }) => {
          const txnQuizId = typeof txn.quizId === 'string' ? txn.quizId : txn.quizId?._id;
          return String(txnQuizId || '') === String(quizId);
        });

        const mapped = filtered.map((txn: {
          _id: string;
          userId?: { fullName?: string; email?: string };
          amount: number;
          status: 'success' | 'pending' | 'failed';
          paymentMethod: string;
          createdAt: string;
        }) => ({
          id: txn._id,
          user: txn.userId?.fullName || 'Unknown',
          email: txn.userId?.email || '—',
          amount: txn.amount,
          status: txn.status === 'success' ? 'completed' : txn.status,
          gateway: txn.paymentMethod || '—',
          date: new Date(txn.createdAt).toLocaleString('en-IN')
        }));

        setTransactions(mapped);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setError('Failed to load transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [quizId]);

  const summary = useMemo(() => {
    const totalPaid = transactions
      .filter((txn) => txn.status === 'completed')
      .reduce((sum, txn) => sum + txn.amount, 0);
    const pending = transactions
      .filter((txn) => txn.status === 'pending')
      .reduce((sum, txn) => sum + txn.amount, 0);
    const failed = transactions
      .filter((txn) => txn.status === 'failed')
      .reduce((sum, txn) => sum + txn.amount, 0);

    return {
      totalPaid,
      refunds: 0,
      pending,
      failed
    };
  }, [transactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">₹{summary.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Refunds</p>
          <p className="text-2xl font-bold text-red-600">₹{summary.refunds.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">₹{summary.pending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-2xl font-bold text-gray-600">₹{summary.failed.toLocaleString()}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">All Transactions</h3>
          <p className="text-sm text-gray-600 mt-1">{transactions.length} total transactions</p>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading transactions...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No transactions available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Gateway</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr
                    key={txn.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="py-4 px-6">
                      <p className="font-mono text-sm text-gray-900">{txn.id}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{txn.user}</p>
                      <p className="text-xs text-gray-500">{txn.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900">₹{txn.amount}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(txn.status)}
                        {getStatusBadge(txn.status)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{txn.gateway}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{txn.date}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={txn.status !== 'completed'}
                          className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
