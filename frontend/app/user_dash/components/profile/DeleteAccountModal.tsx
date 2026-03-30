'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [confirmation, setConfirmation] = React.useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmation.toLowerCase() === 'delete my account') {
      onConfirm();
      handleClose();
    }
  };

  const handleClose = () => {
    setConfirmation('');
    onClose();
  };

  const isConfirmDisabled = confirmation.toLowerCase() !== 'delete my account';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Warning Message */}
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-sm text-red-900 font-medium mb-2">
            ⚠️ This action cannot be undone!
          </p>
          <ul className="text-xs text-red-800 space-y-1 ml-4 list-disc">
            <li>All your quiz history will be permanently deleted</li>
            <li>Your certificates will no longer be accessible</li>
            <li>Your profile data will be removed from our servers</li>
            <li>You will lose access to any premium features</li>
          </ul>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            placeholder="Type here..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}
