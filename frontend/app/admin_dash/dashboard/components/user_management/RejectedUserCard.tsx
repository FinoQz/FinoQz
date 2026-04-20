'use client';

import React, { useState } from 'react';
import { Mail, Phone, Clock, Calendar, XCircle } from 'lucide-react';

interface RejectedUserCardProps {
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile?: string;
    createdAt: string;
    rejectedAt: string;
  };
}

export default function RejectedUserCard({ user }: RejectedUserCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-red-200 group transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* User Info Section */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0 transition-colors group-hover:bg-red-500 group-hover:text-white">
            <span className="font-bold text-lg">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">{user.fullName}</h3>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              {user.mobile && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5 border-l border-gray-100 pl-4">
                  <Phone className="w-3.5 h-3.5" />
                  {user.mobile}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status & Date Section */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-gray-50 pt-3 lg:pt-0 gap-1 mt-auto lg:mt-0">
           <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
             <XCircle className="w-3 h-3" />
             Rejected
           </div>
           <div className="flex flex-col lg:items-end">
              <p className="text-[10px] text-gray-400 font-medium">Rejected on {formatDate(user.rejectedAt)}</p>
              <p className="text-[10px] text-gray-400 font-medium hidden lg:block">at {formatTime(user.rejectedAt)}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
