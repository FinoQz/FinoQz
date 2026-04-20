'use client';

import React, { useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Trash2, CheckCircle, XCircle, Clock, Search, AlertCircle } from 'lucide-react';

interface DeletionRequest {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile?: string;
  };
  reason: string;
  requestedAt: string;
}

interface Props {
  requests: DeletionRequest[];
  onRefresh: () => void;
  onStatusChange: (msg: string) => void;
}

export default function DeletionRequestTable({ requests, onRefresh, onStatusChange }: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    onStatusChange(`Processing ${action}...`);
    try {
      await apiAdmin.post(`api/admin/panel/deletion-requests/${requestId}/${action}`);
      onStatusChange(`Request ${action}d successfully`);
      onRefresh();
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      onStatusChange(`Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
             <Trash2 className="w-8 h-8 text-gray-200" />
           </div>
           <h3 className="text-lg font-semibold text-gray-900 mb-1">No pending deletion requests</h3>
           <p className="text-gray-500 text-sm max-w-xs mx-auto">Users wishing to close their accounts will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                   <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason for Deletion</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested On</th>
                      <th className="px-6 py-4 text-right pr-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {requests.map((req) => (
                     <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-gray-900">{req.user?.fullName}</p>
                           <p className="text-[10px] text-gray-400 font-medium">{req.user?.email}</p>
                           <p className="text-[10px] text-gray-400 font-medium">{req.user?.mobile || 'No Mobile'}</p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                           <div className="flex gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                              <p className="text-xs text-gray-600 leading-relaxed italic">"{req.reason}"</p>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              <Clock className="w-3 h-3" />
                              {new Date(req.requestedAt).toLocaleDateString()}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                           <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleAction(req._id, 'reject')}
                                disabled={processingId === req._id}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAction(req._id, 'approve')}
                                disabled={processingId === req._id}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                Approve Deletion
                              </button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
}
