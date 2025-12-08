'use client';

import React from 'react';
import { Wallet, TrendingUp, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function WalletPage() {
  const transactions = [
    { id: 1, type: 'credit', amount: 500, description: 'Wallet Top-up', date: '2025-01-18' },
    { id: 2, type: 'debit', amount: 299, description: 'Quiz Purchase - Tax Planning', date: '2025-01-17' },
    { id: 3, type: 'credit', amount: 1000, description: 'Refund - Payment Issue', date: '2025-01-15' },
    { id: 4, type: 'debit', amount: 499, description: 'Quiz Purchase - Stock Market', date: '2025-01-12' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Wallet</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your wallet balance and transactions</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-8 h-8 text-white" />
          <h2 className="text-xl font-semibold text-white">Available Balance</h2>
        </div>
        <div className="text-5xl font-bold text-white mb-4">₹2,450</div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white text-[#253A7B] rounded-xl font-semibold hover:bg-gray-100 transition">
            Add Money
          </button>
          <button className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition">
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Spent</div>
            <div className="p-2 bg-red-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹3,580</div>
          <div className="text-xs mt-2 text-gray-600">Last 30 days</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Refunds</div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹1,000</div>
          <div className="text-xs mt-2 text-green-700">Received</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Transactions</div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">47</div>
          <div className="text-xs mt-2 text-gray-600">All time</div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {transaction.type === 'credit' ? (
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-600">{transaction.date}</p>
                </div>
              </div>
              <div className={`text-lg font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
