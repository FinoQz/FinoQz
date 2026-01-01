'use client';

import React from 'react';
import { Flag, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface FlagQueueProps {
  flaggedPosts: Array<{
    id: string;
    title: string;
    author: string;
    flagCount: number;
    flagReason: string;
    date: string;
  }>;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}

export default function FlagQueue({ flaggedPosts, onApprove, onReject, onView }: FlagQueueProps) {
  if (flaggedPosts.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">No Flagged Posts</h3>
        <p className="text-sm text-gray-600">All posts have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200">
      <div className="p-4 border-b-2 border-gray-200 flex items-center gap-2">
        <Flag className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-gray-900">Flagged Posts Queue</h3>
        <span className="ml-auto px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
          {flaggedPosts.length} pending
        </span>
      </div>

      <div className="divide-y divide-gray-200">
        {flaggedPosts.map(post => (
          <div key={post.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{post.title}</h4>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    {post.flagCount}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">by {post.author} • {post.date}</p>
                <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">{post.flagReason}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onView(post.id)}
                  className="p-1.5 hover:bg-blue-50 rounded-lg transition text-[#253A7B]"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onApprove(post.id)}
                  className="p-1.5 hover:bg-green-50 rounded-lg transition text-green-600"
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onReject(post.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-600"
                  title="Reject & Remove"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
