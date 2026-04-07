'use client';

import React, { useState } from 'react';
import { Mail, Phone, Clock, Calendar, CheckCircle } from 'lucide-react';

interface ApprovedUserCardProps {
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile?: string;
    createdAt: string;
    approvedAt: string;
  };
}

export default function ApprovedUserCard({ user }: ApprovedUserCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };


  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(true)}
    >
      {/* Main Card - Shows only name */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
              <span className="text-gray-700 font-semibold text-base sm:text-lg">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{user.fullName}</h3>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Approved
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(user.approvedAt)}
          </div>
        </div>
      </div>

      {/* Hover Details Card - Fixed Position Popup */}
      {isHovered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:pointer-events-none">
          <div className="absolute inset-0 bg-black/20 sm:hidden pointer-events-auto" onClick={(e) => { e.stopPropagation(); setIsHovered(false); }} />
          <div className="pointer-events-auto relative bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsHovered(false); }}
              className="absolute top-4 right-4 sm:hidden p-1 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-200 pr-8">
                <h4 className="text-lg font-bold text-gray-900 truncate">{user.fullName}</h4>
                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Approved User
                </p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-sm text-gray-900 font-medium">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              {user.mobile && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                    <p className="text-sm text-gray-900 font-medium">{user.mobile}</p>
                  </div>
                </div>
              )}

              {/* Signup Date */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Signup Date</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {/* Approval Date */}
              <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Approval Date</p>
                  <p className="text-sm text-gray-900 font-semibold">{formatDate(user.approvedAt)}</p>
                </div>
              </div>

              {/* Approval Time */}
              <div className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Approval Time</p>
                  <p className="text-sm text-gray-900 font-semibold">{formatTime(user.approvedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
