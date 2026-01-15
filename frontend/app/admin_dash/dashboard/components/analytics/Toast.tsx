'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200'
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900'
  };

  return (
    <div className={`fixed top-6 right-6 z-[100] max-w-md ${bgColors[type]} border-2 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-slide-in`}>
      {icons[type]}
      <p className={`flex-1 ${textColors[type]} font-medium`}>{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/50 rounded-lg transition"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
