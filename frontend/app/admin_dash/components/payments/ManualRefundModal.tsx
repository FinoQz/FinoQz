'use client';

import React, { useState } from 'react';
import { X, Search, AlertCircle } from 'lucide-react';

interface ManualRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (txnId: string, amount: number, reason: string) => void;
}

export default function ManualRefundModal({ isOpen, onClose, onSubmit }: ManualRefundModalProps) {
  const [txnId, setTxnId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!txnId.trim()) newErrors.txnId = 'Transaction ID is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!reason.trim()) newErrors.reason = 'Refund reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(txnId, parseFloat(amount), reason);
      handleClose();
    }
  };

  const handleClose = () => {
    setTxnId('');
    setAmount('');
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manual Refund</h2>
            <p className="text-sm text-gray-600 mt-1">Process a refund for any transaction</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Admin Refund Authorization Required</p>
              <p className="mt-1">Only users with Finance role can process manual refunds. This action will be logged in the audit trail.</p>
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                placeholder="TXN123456789"
              />
            </div>
            {errors.txnId && <p className="text-xs text-red-500 mt-1">{errors.txnId}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent resize-none transition"
              placeholder="Enter detailed reason for manual refund..."
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium shadow-sm hover:shadow-md"
          >
            Process Refund
          </button>
        </div>
      </div>
    </div>
  );
}
