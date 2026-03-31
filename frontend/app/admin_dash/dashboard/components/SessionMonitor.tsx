'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, LogIn, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SessionMonitor() {
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Only trigger if not already showing
      setIsExpired(true);
    };

    window.addEventListener('finoqz-admin-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('finoqz-admin-unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogin = () => {
    setIsExpired(false);
    // Force redirect to admin login
    router.push('/landing/auth/user_login/login');
  };

  return (
    <AnimatePresence>
      {isExpired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setIsExpired(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 overflow-hidden"
          >
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Session Expired</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">
                  Your admin session has ended due to security policies. Please sign in again to continue.
                </p>
              </div>

              <button
                onClick={handleLogin}
                className="group relative w-full bg-[#253A7B] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-[#1a2a5e] active:scale-[0.98] shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                Login Again
              </button>

              <button 
                onClick={() => setIsExpired(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Close Button */}
            <button
               onClick={() => setIsExpired(false)}
               className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
