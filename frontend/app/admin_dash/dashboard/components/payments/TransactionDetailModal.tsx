'use client';

import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  method: string;
  date: string;
  quizId?: string;
  quizTitle?: string;
  gatewayTxnId: string;
  gatewayResponse: string;
  refundHistory?: Array<{
    date: string;
    amount: number;
    reason: string;
    adminUser: string;
  }>;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onRefund: (txnId: string, reason: string) => void;
}

export default function TransactionDetailModal({ 
  isOpen, 
  onClose, 
  transaction,
  onRefund 
}: TransactionDetailModalProps) {
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [copiedField, setCopiedField] = useState<string>('');

  if (!isOpen || !transaction) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleRefund = () => {
    if (refundReason.trim()) {
      onRefund(transaction.id, refundReason);
      setShowRefundConfirm(false);
      setRefundReason('');
      onClose();
    }
  };

  const canRefund = transaction.status === 'success' && !transaction.refundHistory;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
            <p className="text-sm text-gray-600 mt-1">Transaction ID: {transaction.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              transaction.status === 'success' ? 'bg-green-100 text-green-700' :
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              transaction.status === 'failed' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {transaction.status.toUpperCase()}
            </span>
            {transaction.status === 'refunded' && (
              <span className="text-sm text-gray-600">Refunded on {transaction.refundHistory?.[0]?.date}</span>
            )}
          </div>

          {/* User & Payment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">User Name</label>
                <p className="text-gray-900 font-medium mt-1">{transaction.userName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-900">{transaction.email}</p>
                  <button
                    onClick={() => copyToClipboard(transaction.email, 'email')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
                <p className="text-gray-900 mt-1 font-mono text-sm">{transaction.userId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Amount</label>
                <p className="text-2xl font-bold text-[#253A7B] mt-1">₹{transaction.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Payment Method</label>
                <p className="text-gray-900 font-medium mt-1">{transaction.method}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Transaction Date</label>
                <p className="text-gray-900 mt-1">{transaction.date}</p>
              </div>
            </div>
          </div>

          {/* Quiz Info */}
          {transaction.quizId && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <label className="text-xs font-medium text-blue-700 uppercase">Quiz Purchased</label>
              <p className="text-gray-900 font-medium mt-1">{transaction.quizTitle}</p>
              <p className="text-sm text-gray-600 mt-1">Quiz ID: {transaction.quizId}</p>
            </div>
          )}

          {/* Gateway Info */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Gateway Transaction ID</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-900 font-mono text-sm">{transaction.gatewayTxnId}</p>
                <button
                  onClick={() => copyToClipboard(transaction.gatewayTxnId, 'gateway')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copiedField === 'gateway' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Gateway Response</label>
              <pre className="text-xs text-gray-700 mt-1 bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto">
                {transaction.gatewayResponse}
              </pre>
            </div>
          </div>

          {/* Refund History */}
          {transaction.refundHistory && transaction.refundHistory.length > 0 && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <label className="text-sm font-semibold text-red-900 mb-3 block">Refund History</label>
              {transaction.refundHistory.map((refund, index) => (
                <div key={index} className="bg-white p-3 rounded-lg mb-2 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">₹{refund.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{refund.date}</p>
                    </div>
                    <span className="text-xs text-gray-600">by {refund.adminUser}</span>
                  </div>
                  <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {refund.reason}</p>
                </div>
              ))}
            </div>
          )}

          {/* Refund Confirmation */}
          {showRefundConfirm && (
            <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Confirm Refund</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    This will refund ₹{transaction.amount.toLocaleString()} to the customer.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  placeholder="Enter reason for refund..."
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowRefundConfirm(false);
                    setRefundReason('');
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={!refundReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Refund
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Close
          </button>
          {canRefund && !showRefundConfirm && (
            <button
              onClick={() => setShowRefundConfirm(true)}
              className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Process Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
