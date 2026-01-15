'use client';

import React from 'react';
import { RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';

interface TransactionsTabProps {
  quizId: string;
}

export default function TransactionsTab({ quizId }: TransactionsTabProps) {
  const transactions = [
    {
      id: 'TXN-001-2025',
      user: 'Rahul Sharma',
      amount: 299,
      status: 'completed',
      gateway: 'Razorpay',
      date: '2025-01-15 14:30',
      email: 'rahul.sharma@email.com'
    },
    {
      id: 'TXN-002-2025',
      user: 'Priya Patel',
      amount: 299,
      status: 'completed',
      gateway: 'Razorpay',
      date: '2025-01-14 11:20',
      email: 'priya.patel@email.com'
    },
    {
      id: 'TXN-003-2025',
      user: 'Amit Kumar',
      amount: 299,
      status: 'pending',
      gateway: 'Razorpay',
      date: '2025-01-14 09:45',
      email: 'amit.kumar@email.com'
    },
    {
      id: 'TXN-004-2025',
      user: 'Sneha Singh',
      amount: 299,
      status: 'completed',
      gateway: 'Stripe',
      date: '2025-01-13 16:10',
      email: 'sneha.singh@email.com'
    },
    {
      id: 'TXN-005-2025',
      user: 'Vikram Reddy',
      amount: 299,
      status: 'failed',
      gateway: 'Razorpay',
      date: '2025-01-13 10:30',
      email: 'vikram.reddy@email.com'
    }
  ];

  const summary = {
    totalPaid: 89400,
    refunds: 2980,
    pending: 1495,
    failed: 1196
  };

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
      </div>
    </div>
  );
}
