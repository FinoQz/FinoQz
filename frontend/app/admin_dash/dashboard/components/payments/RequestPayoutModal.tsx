'use client';

import React, { useState } from 'react';
import { X, DollarSign, Building2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, accountDetails: string) => void;
  availableBalance: number;
}

export default function RequestPayoutModal({ isOpen, onClose, onSubmit, availableBalance }: RequestPayoutModalProps) {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requestAmount = parseFloat(amount);
    
    if (!amount || requestAmount <= 0) {
      newErrors.amount = 'Valid amount is required';
    } else if (requestAmount > availableBalance) {
      newErrors.amount = `Amount cannot exceed available balance of ₹${availableBalance.toLocaleString()}`;
    } else if (requestAmount < 1000) {
      newErrors.amount = 'Minimum payout amount is ₹1,000';
    }
    
    if (!accountNumber.trim() || accountNumber.length < 9) {
      newErrors.accountNumber = 'Valid account number is required';
    }
    
    if (!ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      newErrors.ifscCode = 'Valid IFSC code is required (e.g., SBIN0001234)';
    }
    
    if (!accountHolder.trim()) {
      newErrors.accountHolder = 'Account holder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const accountDetails = `${accountHolder} | A/C: ${accountNumber} | IFSC: ${ifscCode}`;
      onSubmit(parseFloat(amount), accountDetails);
      handleClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setAccountNumber('');
    setIfscCode('');
    setAccountHolder('');
    setErrors({});
    onClose();
  };

  const requestMax = () => {
    setAmount(availableBalance.toString());
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Payout</h2>
              <p className="text-sm text-gray-600 mt-0.5">Withdraw funds to your bank account</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Available Balance */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900">₹{availableBalance.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Payout Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-lg">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-24 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition text-lg"
                placeholder="0.00"
                step="0.01"
                min="1000"
                max={availableBalance}
              />
              <button
                type="button"
                onClick={requestMax}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#253A7B] text-white rounded-lg text-xs font-medium hover:bg-[#1a2a5e] transition"
              >
                Max
              </button>
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            <p className="text-xs text-gray-600 mt-1">Minimum payout: ₹1,000</p>
          </div>

          {/* Bank Account Details */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Building2 className="w-5 h-5" />
              <h3 className="font-semibold">Bank Account Details</h3>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                placeholder="Enter full name as per bank"
              />
              {errors.accountHolder && <p className="text-xs text-red-500 mt-1">{errors.accountHolder}</p>}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                  placeholder="Enter bank account number"
                />
              </div>
              {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition uppercase"
                placeholder="SBIN0001234"
                maxLength={11}
              />
              {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Processing Time</p>
              <p className="mt-1">Payouts are typically processed within 2-3 business days. Youll receive a confirmation email once the transfer is initiated.</p>
            </div>
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
            Request Payout
          </button>
        </div>
      </div>
    </div>
  );
}
