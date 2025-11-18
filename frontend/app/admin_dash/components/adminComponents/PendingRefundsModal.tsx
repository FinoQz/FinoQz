"use client";

import React from "react";
import { X, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign, User, Calendar, AlertCircle } from "lucide-react";

interface RefundRequest {
  id: string;
  userName: string;
  userEmail: string;
  quizTitle: string;
  amount: number;
  requestDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

interface PendingRefundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PendingRefundsModal({ isOpen, onClose }: PendingRefundsModalProps) {
  if (!isOpen) return null;

  const refundRequests: RefundRequest[] = [
    {
      id: "REF001",
      userName: "Amit Kumar",
      userEmail: "amit.kumar@example.com",
      quizTitle: "Advanced Stock Market Analysis",
      amount: 499,
      requestDate: "2025-01-15",
      reason: "Technical issues during quiz - unable to complete due to app crash",
      status: "pending",
    },
    {
      id: "REF002",
      userName: "Priya Sharma",
      userEmail: "priya.sharma@example.com",
      quizTitle: "Tax Planning for Professionals",
      amount: 299,
      requestDate: "2025-01-16",
      reason: "Payment deducted twice for the same quiz",
      status: "pending",
    },
  ];

  const handleApprove = (id: string) => {
    console.log("Approving refund:", id);
    // API call to approve refund
  };

  const handleReject = (id: string) => {
    console.log("Rejecting refund:", id);
    // API call to reject refund
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#253A7B] to-[#1a2a5e] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pending Refund Requests</h2>
              <p className="text-sm text-white/90 mt-1">{refundRequests.length} requests awaiting review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {refundRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-[#253A7B]/30 transition-all duration-300"
              >
                {/* Request Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] rounded-xl shadow-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl">{request.id}</h3>
                      <p className="text-sm text-gray-500">Requested on {formatDate(request.requestDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xl font-bold text-[#253A7B]">
                      <DollarSign className="w-6 h-6" />
                      ₹{request.amount}
                    </div>
                    <span className="text-xs text-orange-700 font-bold bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                      PENDING
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">User</p>
                      <p className="text-sm font-bold text-gray-900">{request.userName}</p>
                      <p className="text-xs text-gray-600">{request.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Quiz</p>
                      <p className="text-sm font-bold text-gray-900">{request.quizTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-xs font-bold text-[#253A7B] mb-2 uppercase tracking-wide">Refund Reason:</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{request.reason}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Refund
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Request
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {refundRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No pending refund requests at the moment.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 p-5 flex items-center justify-between">
          <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#253A7B]" />
            Process refunds carefully. All actions are logged.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
