'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronRight, ClipboardCheck, Loader2 } from 'lucide-react';
import apiUser from '@/lib/apiUser';

interface PendingUser {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  createdAt?: string;
}

interface ActionQueueWidgetProps {
  users: PendingUser[];
  onRefetch: () => void;
}

function formatRelTime(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function ActionQueueWidget({ users, onRefetch }: ActionQueueWidgetProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<PendingUser[]>(users);

  useEffect(() => { setLocalUsers(users); }, [users]);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setLoadingId(userId);
    try {
      const res = await apiUser.post(`api/admin/panel/${action}/${userId}`);
      if (res.status === 200) {
        setLocalUsers(prev => prev.filter(u => u._id !== userId));
        onRefetch();
      }
    } catch (err) {
      console.error(`❌ ${action} failed`, err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Approval Queue</h3>
            <p className="text-[10px] text-gray-400">User access requests</p>
          </div>
        </div>
        {localUsers.length > 0 && (
          <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            {localUsers.length} pending
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 max-h-64">
        {localUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">All clear!</p>
            <p className="text-xs text-gray-400 mt-0.5">No pending approval requests</p>
          </div>
        ) : (
          localUsers.slice(0, 6).map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {user.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{user.fullName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>

              {/* Time */}
              <span className="text-[10px] text-gray-400 shrink-0 hidden sm:block whitespace-nowrap">
                {formatRelTime(user.createdAt)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {loadingId === user._id ? (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(user._id, 'approve')}
                      className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAction(user._id, 'reject')}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer: show-more link */}
      {localUsers.length > 6 && (
        <div className="border-t border-gray-50 px-5 py-3">
          <button className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
            View {localUsers.length - 6} more requests
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
