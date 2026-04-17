'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, Eye, EyeOff, Layout,
  BarChart3, Folders, BookOpen, Filter, ArrowUpDown, MoreVertical,
  ChevronRight, Globe, CheckCircle2, Clock, MessageSquare, User
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import CategoryManagement from '../components/financecontent/CategoryManagement';
import ResourceEditor from '../components/financecontent/ResourceEditor';
import FinanceAnalyticsPanel from '../components/financecontent/FinanceAnalyticsPanel';

interface FinanceResource {
  _id: string;
  title: string;
  slug: string;
  type: 'blog' | 'video' | 'pdf' | 'excel';
  categoryId: { name: string; icon: string };
  subCategoryId: { name: string };
  isPublished: boolean;
  isVisible: boolean;
  analytics: { views: number; engagementScore: number };
  createdAt: string;
}

export default function FinanceContentAdmin() {
  const [activeTab, setActiveTab] = useState<'insights' | 'hub' | 'hierarchy' | 'discussions'>('hub');
  const [resources, setResources] = useState<FinanceResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingResource, setEditingResource] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [search]);

  const fetchResources = async () => {
    try {
      const res = await apiAdmin.get('/api/finance-content/admin/all', { params: { search } });
      setResources(res.data.content || []);
    } catch (err) {
      console.error('Fetch Resources Error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublished = async (id: string) => {
    try {
      await apiAdmin.patch(`/api/finance-content/admin/${id}/publish`);
      fetchResources();
    } catch (err) { alert('Update failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this asset forever?')) return;
    try {
      await apiAdmin.delete(`/api/finance-content/admin/${id}`);
      fetchResources();
    } catch (err) { alert('Delete failed'); }
  };

  const fetchDiscussions = async () => {
    setDiscussionsLoading(true);
    try {
      const res = await apiAdmin.get('/api/finance-content/admin/discussions');
      setDiscussions(res.data.discussions || []);
    } catch (err) { console.error('Discussion fetch error'); }
    finally { setDiscussionsLoading(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      await apiAdmin.delete(`/api/finance-content/admin/discussions/${commentId}`);
      fetchDiscussions();
    } catch (err) { alert('Delete comment failed'); }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 space-y-8">
      {/* SaaS Dashboard Header */}
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Admin</span>
            <ChevronRight className="w-2.5 h-2.5" />
            <span className="text-[#253A7B]">Finance Intelligence</span>
          </div>
          <h1 className="text-[24px] font-bold text-gray-800 tracking-tight">Resource Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#253A7B] transition-colors" />
            <input
              type="text"
              placeholder="Query assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[12px] font-medium outline-none focus:ring-2 focus:ring-[#253A7B]/5 focus:border-[#253A7B]/20 w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setShowEditor(true)}
            className="px-5 py-2.5 bg-[#253A7B] text-white rounded-xl text-[12px] font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Post New Content
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-gray-100">
        {[
          { id: 'insights', label: 'Platform Insights', icon: BarChart3 },
          { id: 'hub', label: 'Content Hub', icon: Layout },
          { id: 'hierarchy', label: 'Folders & Hierarchy', icon: Folders },
          { id: 'discussions', label: 'Discussions', icon: MessageSquare }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === 'discussions') fetchDiscussions();
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-bold transition-all ${activeTab === tab.id
                ? 'bg-white text-[#253A7B] shadow-sm ring-1 ring-black/5'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label.toUpperCase()}
          </button>
        ))}
      </nav>

      <main className="min-h-[60vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <FinanceAnalyticsPanel />
            </motion.div>
          )}

          {activeTab === 'hierarchy' && (
            <motion.div key="hierarchy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <CategoryManagement />
            </motion.div>
          )}

          {activeTab === 'discussions' && (
            <motion.div key="discussions" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">All Community Discussions</p>
                <button onClick={fetchDiscussions} className="px-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-white transition-all">Refresh</button>
              </div>
              {discussionsLoading ? (
                <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#253A7B]/20 border-t-[#253A7B] rounded-full animate-spin" /></div>
              ) : discussions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-gray-100">
                  <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">No discussions yet</p>
                </div>
              ) : discussions.map((d) => (
                <div key={d._id} className="bg-white border border-gray-100 rounded-[24px] p-6 space-y-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold text-[11px] flex-shrink-0">
                        {d.userAvatar ? <img src={d.userAvatar} className="w-full h-full object-cover rounded-xl" /> : d.userName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-gray-800">{d.userName}</span>
                          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()}</span>
                          {d.resourceId?.title && (
                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{d.resourceId.title.slice(0, 25)}...</span>
                          )}
                        </div>
                        <p className="text-[13px] font-medium text-gray-700 leading-relaxed mt-1">{d.text}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-gray-300">
                          <span>{d.likes?.length || 0} likes</span>
                          <span>{d.replies?.length || 0} replies</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteComment(d._id)} className="flex-shrink-0 p-2 hover:bg-red-50 hover:text-red-600 text-gray-300 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {d.replies?.length > 0 && (
                    <div className="pl-11 space-y-3 pt-3 border-t border-gray-50">
                      {d.replies.map((r: any) => (
                        <div key={r._id} className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                              {r.userName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-gray-700">{r.userName}</span>
                              <p className="text-[12px] font-medium text-gray-500 leading-relaxed">{r.text}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteComment(r._id)} className="flex-shrink-0 p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-200 rounded-lg transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-50">
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Asset Details</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono text-center">Classification</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono text-center">Network Stats</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono text-center">Status</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono text-right text-center">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-8 py-6 h-16 bg-white" />
                        </tr>
                      ))
                    ) : resources.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <BookOpen className="w-8 h-8 text-gray-200" />
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">No assets deployed</p>
                          </div>
                        </td>
                      </tr>
                    ) : resources.map((res) => (
                      <tr key={res._id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-center text-[#253A7B]">
                              {res.type === 'blog' && <BookOpen className="w-4 h-4" />}
                              {res.type === 'video' && <Globe className="w-4 h-4" />}
                              {res.type === 'pdf' && <BarChart3 className="w-4 h-4" />}
                              {res.type === 'excel' && <BarChart3 className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="text-[13px] font-bold text-gray-800 tracking-tight leading-snug">{res.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{res.type}</span>
                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                <span className="text-[9px] font-bold text-gray-400">ID: {res._id.slice(-6)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/50 text-[#253A7B] rounded-lg border border-blue-100/30">
                            <span className="text-[10px] font-bold uppercase tracking-tight">{res.categoryId?.name}</span>
                          </div>
                          <p className="text-[9px] font-bold text-gray-300 mt-1 uppercase tracking-tighter">/ {res.subCategoryId?.name || 'GENERIC'}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[14px] font-bold text-gray-800">{res.analytics?.views || 0}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">REACH</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${res.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                            {res.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span className="text-[9px] font-bold uppercase tracking-widest">{res.isPublished ? 'Live' : 'Draft'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setEditingResource(res); setShowEditor(true); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 border border-transparent hover:border-blue-100 hover:shadow-sm transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleTogglePublished(res._id)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border border-transparent transition-all ${res.isPublished ? 'text-amber-500 hover:bg-amber-50 hover:border-amber-100' : 'text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100'
                                }`}
                            >
                              {res.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDelete(res._id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern SaaS Editor */}
      <AnimatePresence>
        {showEditor && (
          <ResourceEditor
            content={editingResource}
            onClose={() => { setShowEditor(false); setEditingResource(null); }}
            onSave={() => { setShowEditor(false); setEditingResource(null); fetchResources(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

