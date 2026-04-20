'use client';

import React, { useState } from 'react';
import { Mail, Phone, Clock, Calendar, CheckCircle, XCircle, Shield } from 'lucide-react';

interface HoverDetailsProps {
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile?: string;
    createdAt: string;
    status?: string;
    emailVerified?: boolean;
    mobileVerified?: boolean;
  };
  onAction: (id: string, action: 'approve' | 'reject') => void;
}

export default function HoverDetails({ user, onAction }: HoverDetailsProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:border-amber-200 group transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* User Info Section */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 transition-colors group-hover:bg-amber-500 group-hover:text-white">
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
            {/* Verification Badges */}
            <div className="flex gap-2 mt-2">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${user.emailVerified ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                Email {user.emailVerified ? 'Verified' : 'Unverified'}
              </span>
              {user.mobile && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${user.mobileVerified ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                  Mobile {user.mobileVerified ? 'Verified' : 'Unverified'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions & Meta Section */}
        <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end justify-between border-t lg:border-t-0 border-gray-50 pt-3 lg:pt-0 gap-3">
           <div className="flex gap-2 w-full sm:w-auto">
             <button
               onClick={() => onAction(user._id, 'approve')}
               className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold bg-[#253A7B] text-white rounded-lg hover:opacity-90 transition-all"
             >
               Approve
             </button>
             <button
               onClick={() => onAction(user._id, 'reject')}
               className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
             >
               Reject
             </button>
           </div>
           <div className="flex flex-col lg:items-end border-t sm:border-t-0 sm:border-l lg:border-l-0 border-gray-50 pt-2 sm:pt-0 sm:pl-3 lg:pl-0">
              <p className="text-[10px] text-gray-400 font-medium">Joined {formatDate(user.createdAt)}</p>
              <p className="text-[10px] text-gray-400 font-medium hidden lg:block">at {formatTime(user.createdAt)}</p>
           </div>
        </div>
      </div>
    </div>
  );
}