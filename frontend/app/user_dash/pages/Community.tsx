'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, MessageCircle, Share2, Send, X, Edit, Trash2, Hash, Users, Activity } from 'lucide-react';
import apiUser from '@/lib/apiUser';

interface Insight {
  _id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  forumCategory: string;
  forumAction: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  isPinned: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface ForumTag {
  _id: string;
  name: string;
  type: 'category' | 'action';
}

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  commentText: string;
  likeCount: number;
  createdAt: string;
  canDelete?: boolean;
}

/* ── Section Label (consistent with dashboard) ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export default function Community() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [forumTags, setForumTags] = useState<ForumTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newPost, setNewPost] = useState({ title: '', content: '', forumCategory: '', forumAction: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likedInsights, setLikedInsights] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    fetchTags();
    fetchInsights();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await apiUser.get('/api/forum-tags');
      setForumTags(response.data.tags || []);
    } catch (error) {
      console.warn('Could not fetch forum tags', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await apiUser.get('/api/insights', { params: { limit: 20 } });
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInsight = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setIsSubmitting(true);
    try {
      await apiUser.post('/api/insights', newPost);
      setNewPost({ title: '', content: '', forumCategory: '', forumAction: '' });
      fetchInsights();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiUser.delete(`/api/insights/${insightId}`);
      fetchInsights();
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  const handleLikeInsight = async (insightId: string) => {
    try {
      const response = await apiUser.post(`/api/insights/${insightId}/like`);
      setInsights(insights.map(insight => 
        insight._id === insightId ? { ...insight, likeCount: response.data.likeCount } : insight
      ));
      if (response.data.liked) {
        setLikedInsights(new Set(likedInsights).add(insightId));
      } else {
        const newLiked = new Set(likedInsights);
        newLiked.delete(insightId);
        setLikedInsights(newLiked);
      }
    } catch (error) {
      console.error('Error liking insight:', error);
    }
  };

  const handleViewComments = async (insightId: string) => {
    try {
      const response = await apiUser.get(`/api/insights/${insightId}`);
      setComments(response.data.comments || []);
      setSelectedInsight(insightId);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedInsight) return;
    try {
      await apiUser.post(`/api/insights/${selectedInsight}/comment`, { commentText: newComment.trim() });
      setNewComment('');
      handleViewComments(selectedInsight);
      setInsights(insights.map(insight => 
        insight._id === selectedInsight ? { ...insight, commentCount: insight.commentCount + 1 } : insight
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const categories = forumTags.filter(t => t.type === 'category');
  const actions = forumTags.filter(t => t.type === 'action');

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Initializing Forum...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-10 max-w-5xl mx-auto">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Community Forum</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium italic">Collaborate, share insights, and learn together.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full">
              <Users className="w-3.5 h-3.5 text-[#253A7B]" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{insights.length} Discussions</span>
           </div>
        </div>
      </div>

      {/* ── Create Post ── */}
      <section>
        <SectionLabel label="New Discussion" />
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#253A7B] opacity-[0.02] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="relative group">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#253A7B] transition-colors" />
              <select 
                value={newPost.forumCategory}
                onChange={(e) => setNewPost({...newPost, forumCategory: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold text-gray-600 uppercase tracking-widest focus:outline-none focus:border-[#253A7B]/40 focus:ring-4 focus:ring-[#253A7B]/5 transition-all appearance-none"
              >
                <option value="">Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="relative group">
              <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#253A7B] transition-colors" />
              <select 
                value={newPost.forumAction}
                onChange={(e) => setNewPost({...newPost, forumAction: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold text-gray-600 uppercase tracking-widest focus:outline-none focus:border-[#253A7B]/40 focus:ring-4 focus:ring-[#253A7B]/5 transition-all appearance-none"
              >
                <option value="">Topic Type</option>
                {actions.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <input
            type="text"
            placeholder="Insight Title (e.g. Impact of Fed rate hike on EM bonds)"
            value={newPost.title}
            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#253A7B]/40 focus:ring-4 focus:ring-[#253A7B]/5 transition-all mb-4"
          />

          <textarea
            placeholder="Share your logic, question or insight..."
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#253A7B]/40 focus:ring-4 focus:ring-[#253A7B]/5 transition-all resize-none min-h-[120px]"
          />
          
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleCreateInsight}
              disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim()}
              className="px-8 py-3 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Share with Community'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Posts Feed ── */}
      <section>
        <SectionLabel label="Latest Discussions" />
        <div className="space-y-6">
          {insights.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Feed is empty</p>
             </div>
          ) : (
            insights.map((insight) => (
              <div key={insight._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-center gap-2 mb-4">
                  {insight.forumCategory && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[#253A7B] text-[9px] font-black uppercase tracking-wider">
                      {insight.forumCategory}
                    </span>
                  )}
                  {insight.forumAction && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                      {insight.forumAction}
                    </span>
                  )}
                  {insight.isPinned && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-black uppercase tracking-wider ml-auto">
                      Pinned
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#253A7B] transition-colors">
                  {insight.title || 'Untitled Discussion'}
                </h3>
                <p className="text-gray-500 mb-6 whitespace-pre-wrap text-[13px] leading-relaxed line-clamp-3">
                  {insight.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-[#253A7B] flex items-center justify-center text-[10px] font-bold border border-gray-100">
                      {insight.authorName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <p className="text-[11px] font-bold text-gray-800 leading-none mb-1">{insight.authorName}</p>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(insight.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50/50 p-1 rounded-xl border border-gray-50">
                    <button 
                      onClick={() => handleLikeInsight(insight._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                        likedInsights.has(insight._id) ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedInsights.has(insight._id) ? 'fill-current' : ''}`} />
                      <span className="text-[10px] font-bold">{insight.likeCount}</span>
                    </button>
                    <button 
                      onClick={() => handleViewComments(insight._id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-[#253A7B] hover:bg-blue-50 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{insight.commentCount}</span>
                    </button>
                    
                    {insight.canDelete && (
                      <button 
                        onClick={() => handleDeleteInsight(insight._id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Comments Modal ── */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <p className="text-[10px] font-bold text-[#253A7B] uppercase tracking-[0.2em] mb-1">Peer Insights</p>
                <h3 className="text-base font-bold text-gray-900">Discussion Threads</h3>
              </div>
              <button onClick={() => setSelectedInsight(null)} className="p-2 hover:bg-gray-200 rounded-xl transition text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                   <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Be the first to provide insight</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-4 group">
                    <div className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center text-[#253A7B] font-bold text-xs mt-1 shadow-sm">
                      {comment.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                       <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none p-4 w-full group-hover:bg-white transition-colors group-hover:shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-900 text-[11px] uppercase tracking-wider">{comment.userName}</h4>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[13px] text-gray-600 leading-relaxed font-medium">{comment.commentText}</p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Share your perspective..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none focus:border-[#253A7B]/40 focus:ring-4 focus:ring-[#253A7B]/5 transition-all"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="absolute right-2 p-1.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
