'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, MessageCircle, Share2, TrendingUp, Send, X, Edit, Trash2 } from 'lucide-react';
import apiUser from '@/lib/apiUser';


interface Insight {
  _id: string;
  authorId: string;
  authorName: string;
  content: string;
  images?: string[];
  category?: string;
  tags?: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  isPinned: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [newInsight, setNewInsight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likedInsights, setLikedInsights] = useState<Set<string>>(new Set());
  const [editingInsight, setEditingInsight] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  useEffect(() => {
    fetchInsights();
  }, []);

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
    if (!newInsight.trim()) return;
    
    setIsSubmitting(true);
    try {
      await apiUser.post('/api/insights', { content: newInsight.trim() });
      setNewInsight('');
      fetchInsights();
    } catch (error) {
      console.error('Error creating insight:', error);
      alert('Failed to create insight');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInsight = async (insightId: string) => {
    if (!editContent.trim()) return;
    
    try {
      await apiUser.put(`/api/insights/${insightId}`, { 
        content: editContent.trim() 
      });
      setEditingInsight(null);
      setEditContent('');
      fetchInsights();
    } catch (error) {
      console.error('Error editing insight:', error);
      alert('Failed to edit insight');
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    if (!confirm('Are you sure you want to delete this insight?')) return;
    
    try {
      await apiUser.delete(`/api/insights/${insightId}`);
      fetchInsights();
    } catch (error) {
      console.error('Error deleting insight:', error);
      alert('Failed to delete insight');
    }
  };

  const startEditingInsight = (insight: Insight) => {
    setEditingInsight(insight._id);
    setEditContent(insight.content);
  };

  const cancelEditingInsight = () => {
    setEditingInsight(null);
    setEditContent('');
  };

  const handleLikeInsight = async (insightId: string) => {
    try {
      const response = await apiUser.post(`/api/insights/${insightId}/like`);
      
      // Update local state
      setInsights(insights.map(insight => 
        insight._id === insightId 
          ? { ...insight, likeCount: response.data.likeCount }
          : insight
      ));
      
      // Track liked state
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
      
      // Update local state
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
      
      // Update comment count
      setInsights(insights.map(insight => 
        insight._id === selectedInsight 
          ? { ...insight, commentCount: insight.commentCount + 1 }
          : insight
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await apiUser.delete(`/api/insights/comments/${commentId}`);
      
      if (selectedInsight) {
        handleViewComments(selectedInsight);
        
        // Update comment count
        setInsights(insights.map(insight => 
          insight._id === selectedInsight 
            ? { ...insight, commentCount: Math.max(0, insight.commentCount - 1) }
            : insight
        ));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Community Insights</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Connect with other learners and share your journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Insights</div>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{insights.length}</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Likes</div>
            <Heart className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.reduce((sum, insight) => sum + insight.likeCount, 0)}
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Comments</div>
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.reduce((sum, insight) => sum + insight.commentCount, 0)}
          </div>
        </div>
      </div>

      {/* Create Insight */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6">
        <textarea
          placeholder="Share your thoughts with the community..."
          value={newInsight}
          onChange={(e) => setNewInsight(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">{newInsight.length}/500</span>
          <button 
            onClick={handleCreateInsight}
            disabled={isSubmitting || !newInsight.trim()}
            className="px-6 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-secondary)] transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Insight'}
          </button>
        </div>
      </div>

      {/* Insights Feed */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No insights yet. Be the first to share!</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition">
              {insight.isPinned && (
                <div className="mb-2">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pinned</span>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] flex items-center justify-center text-white font-bold text-lg">
                  {insight.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{insight.authorName}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(insight.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {/* Show edit/delete only if user has permission */}
                    {(insight.canEdit || insight.canDelete) && (
                      <div className="flex items-center gap-2">
                        {insight.canEdit && (
                          <button 
                            onClick={() => startEditingInsight(insight)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit insight"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {insight.canDelete && (
                          <button 
                            onClick={() => handleDeleteInsight(insight._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete insight"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingInsight === insight._id ? (
                    <div className="mb-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={cancelEditingInsight}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditInsight(insight._id)}
                          className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-secondary)] transition"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{insight.content}</p>
                  )}
                  
                  {insight.images && insight.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {insight.images.map((img, idx) => (
                        <img key={idx} src={img} alt="" className="rounded-lg w-full h-48 object-cover" />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLikeInsight(insight._id)}
                      className={`flex items-center gap-2 transition ${
                        likedInsights.has(insight._id) 
                          ? 'text-red-600' 
                          : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedInsights.has(insight._id) ? 'fill-red-600' : ''}`} />
                      <span className="text-sm font-medium">{insight.likeCount}</span>
                    </button>
                    <button 
                      onClick={() => handleViewComments(insight._id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{insight.commentCount}</span>
                    </button>
                    <button 
                      onClick={() => handleShareInsight(insight._id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{insight.shareCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comments Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Comments</h3>
              <button 
                onClick={() => setSelectedInsight(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  maxLength={500}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-secondary)] transition disabled:bg-gray-400"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{comment.userName}</h4>
                          {/* Show delete button only if user has permission */}
                          {comment.canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comment.commentText}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600">
                            <Heart className="w-3 h-3" />
                            <span>{comment.likeCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
