'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2, ArrowRight, History, Plus } from 'lucide-react';
import apiUser from '@/lib/apiUser';

type Transaction = {
  _id: string;
  type: 'credit' | 'debit';
  reason: string;
  timestamp: string;
  amount: number;
};

/* ── Section Label ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const [balanceRes, transactionsRes] = await Promise.all([
          apiUser.get('/api/wallet/balance'),
          apiUser.get('/api/wallet/transactions')
        ]);
        setBalance(balanceRes.data.balance || 0);
        setTransactions(transactionsRes.data.transactions || []);
      } catch (err) {
        console.error('Wallet fetch error:', err);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#253A7B]" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Securing your vault...</p>
      </div>
    );
  }

  const totalSpent = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalRefunds = transactions
    .filter(t => t.type === 'credit' && (t.reason?.toLowerCase().includes('refund') || t.reason?.toLowerCase().includes('cashback')))
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Wallet</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium italic">Manage your credits and transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Money
            </button>
        </div>
      </div>

      {/* ── Main Balance Card ── */}
      <div className="relative overflow-hidden bg-[#253A7B] rounded-3xl p-6 sm:p-10 shadow-xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-[0.02] rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Available Balance</p>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight tabular-nums">₹{balance.toLocaleString()}</h2>
            <p className="text-[10px] font-medium text-white/40 mt-2 italic leading-none">Last sync: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col gap-1 items-end pr-4 border-r border-white/10">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Status</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-xs font-bold text-white">Active</span>
                </div>
             </div>
             <button className="px-5 py-3 bg-white text-[#253A7B] rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all shadow-lg active:scale-95">
               Withdraw
             </button>
          </div>
        </div>
      </div>

      {/* ── Mini Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, sub: 'Lifetime usage', icon: <ArrowUpRight className="w-4 h-4" />, bg: 'bg-red-500', tx: 'text-red-500' },
          { label: 'Total Refunds', value: `₹${totalRefunds.toLocaleString()}`, sub: 'Cashbacks & Refunds', icon: <TrendingUp className="w-4 h-4" />, bg: 'bg-emerald-500', tx: 'text-emerald-500' },
          { label: 'Total Logs', value: transactions.length, sub: 'Log entries', icon: <History className="w-4 h-4" />, bg: 'bg-blue-500', tx: 'text-blue-500' },
        ].map((st) => (
          <div key={st.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 opacity-[0.05] ${st.bg}`} />
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${st.bg} text-white relative z-10`}>
              {st.icon}
            </div>
            <div className="relative z-10">
               <h3 className="text-xl font-bold text-gray-900 leading-none tabular-nums">{st.value}</h3>
               <p className="text-xs text-gray-500 mt-1 font-medium">{st.label}</p>
               <p className="text-[10px] text-gray-400 mt-0.5">{st.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Transaction History ── */}
      <section>
        <SectionLabel label="Transaction History" />
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[300px] flex flex-col">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {t.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{t.reason || 'No description'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Transaction ID: {t._id.slice(-8).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{new Date(t.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-black tabular-nums ${t.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
              <History className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No activities recorded</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
