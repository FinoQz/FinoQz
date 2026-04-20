'use client';

import React, { useEffect, useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Mail, CheckCircle2, Clock, Trash2, X, Send, User, MessageSquare, Calendar } from 'lucide-react';

interface ContactQuery {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'archived';
  createdAt: string;
}

export default function ContactQueries() {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await apiAdmin.get('/api/contact/admin/all');
      setQueries(res.data);
    } catch (err) {
      console.error('Failed to fetch contact queries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedQuery || !replyMessage.trim()) return;
    setSendingResponse(true);
    setActionStatus(null);
    try {
      await apiAdmin.post(`/api/contact/admin/respond/${selectedQuery._id}`, { replyMessage });
      setActionStatus({ type: 'success', msg: 'Response sent successfully!' });
      setReplyMessage('');
      fetchQueries();
      setTimeout(() => setSelectedQuery(null), 2000);
    } catch (err) {
      setActionStatus({ type: 'error', msg: 'Failed to send response.' });
    } finally {
      setSendingResponse(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await apiAdmin.delete(`/api/contact/admin/${id}`);
      setQueries(prev => prev.filter(q => q._id !== id));
      if (selectedQuery?._id === id) setSelectedQuery(null);
    } catch (err) {
      console.error('Failed to delete query:', err);
    }
  };

  const updateStatus = async (id: string, status: ContactQuery['status']) => {
    try {
      await apiAdmin.patch(`/api/contact/admin/${id}`, { status });
      setQueries(prev => prev.map(q => q._id === id ? { ...q, status } : q));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#253A7B]/20 border-t-[#253A7B] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading queries...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Contact Queries</h1>
        <p className="text-gray-500 mt-2 font-medium">Review and respond to user inquiries effectively</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Subject & Message</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {queries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <Mail className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium">No inquiries found in your inbox</p>
                    </div>
                  </td>
                </tr>
              ) : (
                queries.map((query) => (
                  <tr key={query._id} className="hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#253A7B] to-[#1e3a8a] flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {query.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{query.name}</div>
                          <div className="text-xs text-gray-400 font-medium mt-0.5">{query.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-800 line-clamp-1">{query.subject}</div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1 font-medium">{query.message}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight ${
                        query.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        query.status === 'responded' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        'bg-gray-50 text-gray-400 border border-gray-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          query.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                          query.status === 'responded' ? 'bg-emerald-400' :
                          'bg-gray-300'
                        }`} />
                        {query.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setSelectedQuery(query)}
                          className="p-2.5 text-blue-500 hover:bg-blue-100/50 rounded-xl transition-all duration-200"
                          title="View & Respond"
                        >
                          <Mail className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(query._id)}
                          className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                          title="Delete Query"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedQuery(null)} />
          
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#253A7B] to-[#1e3a8a] p-8 text-white relative">
              <button 
                onClick={() => setSelectedQuery(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Query Details</h3>
                  <p className="text-blue-100/80 text-sm font-medium mt-0.5">Reference ID: {selectedQuery._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <User className="w-3 h-3" /> User
                  </div>
                  <div className="font-bold text-gray-900">{selectedQuery.name}</div>
                  <div className="text-sm text-gray-500">{selectedQuery.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3" /> Received On
                  </div>
                  <div className="font-bold text-gray-900">{new Date(selectedQuery.createdAt).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{new Date(selectedQuery.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <MessageSquare className="w-3 h-3" /> Subject & Message
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-sm font-bold text-[#253A7B] mb-3">{selectedQuery.subject}</div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedQuery.message}</p>
                </div>
              </div>

              {/* Response Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <Send className="w-3 h-3" /> Your Response
                  </div>
                  {actionStatus && (
                    <span className={`text-xs font-bold ${actionStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {actionStatus.msg}
                    </span>
                  )}
                </div>
                <textarea 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your professional response here..."
                  className="w-full h-32 p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-[#253A7B]/30 focus:outline-none transition-all text-sm text-gray-700 resize-none font-medium"
                />
                <button 
                  onClick={handleRespond}
                  disabled={sendingResponse || !replyMessage.trim()}
                  className="w-full bg-[#253A7B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#1a2a5e] transition-all disabled:opacity-50 shadow-lg shadow-[#253A7B]/20"
                >
                  {sendingResponse ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Response Email
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
