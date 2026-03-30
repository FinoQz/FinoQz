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
  const [isHovered, setIsHovered] = useState(false);

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
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
              <span className="text-gray-900 font-semibold text-base sm:text-lg">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{user.fullName}</h3>

              {/* Status Chip */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-xs font-medium rounded-full ${
                  user.status === 'awaiting_admin_approval'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Shield className="w-3 h-3" />
                {user.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Approve / Reject Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => onAction(user._id, 'approve')}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-800 text-white rounded-xl hover:bg-black hover:shadow-lg transition-all duration-300 font-medium"
            >
              Approve
            </button>
            <button
              onClick={() => onAction(user._id, 'reject')}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-xl hover:bg-gray-700 hover:shadow-lg transition-all duration-300 font-medium"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Hover Popup */}
      {isHovered && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
          <div className="pointer-events-auto bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-900">{user.fullName}</h4>
                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">
                  Signup Details
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

                  {/* Email Verified Badge */}
                  <span
                    className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.emailVerified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.emailVerified ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                  </span>
                </div>
              </div>

              {/* Phone */}
              {user.mobile && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                    <p className="text-sm text-gray-900 font-medium">{user.mobile}</p>

                    {/* Mobile Verified Badge */}
                    <span
                      className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        user.mobileVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.mobileVerified ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {user.mobileVerified ? 'Mobile Verified' : 'Mobile Not Verified'}
                    </span>
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

              {/* Signup Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Signup Time</p>
                  <p className="text-sm text-gray-900 font-medium">{formatTime(user.createdAt)}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
