'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, MessageCircle, Share2, Send, X, Edit, Trash2 } from 'lucide-react';
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

export default function Community() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [forumTags, setForumTags] = useState<ForumTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New Post State
  const [newPost, setNewPost] = useState({ title: '', content: '', forumCategory: '', forumAction: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Interactions
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
      // Assuming user has access. If required, make a public endpoint for tags.
      const response = await apiUser.get('/api/forum-tags');
      setForumTags(response.data.tags || []);
    } catch (error) {
      console.warn('Could not fetch forum tags - might need public route', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await apiUser.get('/api/insights', {
        params: { limit: 20 }
      });
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
      alert('Failed to post question');
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
        insight._id === insightId 
          ? { ...insight, likeCount: response.data.likeCount }
          : insight
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

  const handleShareInsight = async (insightId: string) => {
    try {
      await apiUser.post(`/api/insights/${insightId}/share`);
      setInsights(insights.map(insight => 
        insight._id === insightId 
          ? { ...insight, shareCount: insight.shareCount + 1 }
          : insight
      ));
      alert('Insight shared!');
    } catch (error) {
      console.error('Error sharing insight:', error);
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
      await apiUser.post(`/api/insights/${selectedInsight}/comment`, { 
        commentText: newComment.trim() 
      });
      
      setNewComment('');
      handleViewComments(selectedInsight);
      
      setInsights(insights.map(insight => 
        insight._id === selectedInsight 
          ? { ...insight, commentCount: insight.commentCount + 1 }
          : insight
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const categories = forumTags.filter(t => t.type === 'category');
  const actions = forumTags.filter(t => t.type === 'action');

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-gray-500 font-medium">Loading Forum...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen max-w-5xl mx-auto bg-gray-50/50">
      
      {/* Header Banner */}
      <div className="mb-8 text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#253A7B] tracking-tight mb-2">Decision Forum</h1>
        <p className="text-gray-500 font-medium">Ask real-world questions. Learn from others.</p>
      </div>

      {/* Create Post Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-10">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#253A7B]" />
          Ask a Question
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select 
            value={newPost.forumCategory}
            onChange={(e) => setNewPost({...newPost, forumCategory: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#253A7B]/20"
          >
            <option value="">Select Category...</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          <select 
            value={newPost.forumAction}
            onChange={(e) => setNewPost({...newPost, forumAction: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#253A7B]/20"
          >
            <option value="">Select Goal...</option>
            {actions.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
          </select>
        </div>

        <input
          type="text"
          placeholder="Scenario Title (e.g. Profit increasing but cash flow negative)"
          value={newPost.title}
          onChange={(e) => setNewPost({...newPost, title: e.target.value})}
          className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#253A7B]/20 mb-4"
        />

        <textarea
          placeholder="Describe your scenario in detail..."
          value={newPost.content}
          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
          className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#253A7B]/20 resize-none min-h-[120px]"
        />
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleCreateInsight}
            disabled={isSubmitting || !newPost.title.trim() || !newPost.content.trim()}
            className="px-6 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-bold shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {insights.length === 0 ? (
           <div className="text-center p-12 text-gray-400 font-medium">No discussions yet. Be the first to start one!</div>
        ) : (
          insights.map((insight) => (
            <div key={insight._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition group">
              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {insight.forumCategory && (
                  <span className="px-2.5 py-1 rounded bg-[#eef2ff] border border-[#c7d2fe] text-[#3730a3] text-xs font-bold uppercase tracking-wider">
                    {insight.forumCategory}
                  </span>
                )}
                {insight.forumAction && (
                  <span className="px-2.5 py-1 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs font-bold uppercase tracking-wider">
                    {insight.forumAction}
                  </span>
                )}
                {insight.isPinned && (
                  <span className="px-2.5 py-1 rounded bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold uppercase tracking-wider ml-auto">
                    Pinned
                  </span>
                )}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
                {insight.title || 'Untitled Discussion'}
              </h3>
              <p className="text-gray-600 mb-4 whitespace-pre-wrap text-sm leading-relaxed">
                {insight.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 flex-wrap gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                    <span className="w-4 h-4 rounded-full bg-[#253A7B] text-white flex items-center justify-center text-[8px]">
                      {insight.authorName?.charAt(0)}
                    </span>
                    {insight.authorName}
                  </span>
                  <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLikeInsight(insight._id)}
                    className={`flex items-center gap-1.5 transition text-sm font-semibold ${
                      likedInsights.has(insight._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedInsights.has(insight._id) ? 'fill-current' : ''}`} />
                    {insight.likeCount}
                  </button>
                  <button 
                    onClick={() => handleViewComments(insight._id)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#253A7B] transition text-sm font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {insight.commentCount}
                  </button>
                  <button 
                    onClick={() => handleShareInsight(insight._id)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-[#253A7B] transition text-sm font-semibold"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  
                  {insight.canDelete && (
                    <button 
                      onClick={() => handleDeleteInsight(insight._id)}
                      className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
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

      {/* Discussion Drawer / Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Discussion</h3>
              <button 
                onClick={() => setSelectedInsight(null)}
                className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 bg-white">
              {comments.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">No answers yet. Provide your insight!</div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 relative group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold text-xs mt-1">
                        {comment.userName?.charAt(0)}
                      </div>
                      <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none p-4 w-full">
                         <div className="flex justify-between items-center mb-1">
                           <h4 className="font-bold text-gray-900 text-sm">{comment.userName}</h4>
                           <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                             {new Date(comment.createdAt).toLocaleDateString()}
                           </span>
                         </div>
                         <p className="text-sm text-gray-700 leading-relaxed">{comment.commentText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#253A7B]/20"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition disabled:opacity-50"
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
