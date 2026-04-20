'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Send, ShieldAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmation.toLowerCase() === 'delete my account') {
      onConfirm(reason);
      handleClose();
    }
  };

  const handleClose = () => {
    setConfirmation('');
    setReason('');
    setStep(1);
    onClose();
  };

  const isConfirmDisabled = confirmation.toLowerCase() !== 'delete my account';

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-900 tracking-tight">Account Removal</h3>
               <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest italic">Moderated Request</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="p-5 bg-red-50/50 border border-red-100 rounded-3xl">
              <p className="text-[11px] font-bold text-red-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <AlertTriangle className="w-3.5 h-3.5" /> Important Notice
              </p>
              <ul className="text-[12px] text-red-800 space-y-2 font-medium opacity-80 decoration-red-200">
                <li>• Permanent loss of all quiz progression</li>
                <li>• Certificates will be invalidated immediately</li>
                <li>• This request requires manual Admin approval</li>
                <li>• You will receive an email once processed</li>
              </ul>
            </div>

            <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Reason for leaving</label>
               <textarea
                 value={reason}
                 onChange={(e) => setReason(e.target.value)}
                 className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50/50 transition-all resize-none h-24"
                 placeholder="Tell us why you want to delete your account (optional)..."
               />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-black transition-all group overflow-hidden relative"
            >
              <span className="relative z-10">Proceed with Request</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center py-2 px-1">
              <p className="text-sm text-gray-500 font-medium">To proceed with the formal deletion request, please type the following confirmation phrase below:</p>
            </div>

            <div className="bg-gray-900/5 p-4 rounded-2xl text-center border-l-4 border-gray-900">
               <span className="font-black text-gray-900 tracking-wider">DELETE MY ACCOUNT</span>
            </div>

            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-center text-sm font-bold placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-all"
              placeholder="Type confirmation here..."
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border border-gray-100 text-gray-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                className="flex-[1.5] py-4 bg-red-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-xl shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
