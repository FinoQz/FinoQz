'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, TrendingUp, MessageSquare, Eye, ThumbsUp, FileText, Edit2, Trash2, Pin } from 'lucide-react';
import StatusMessage from '../components/community/StatusMessage'
import apiAdmin from '@/lib/apiAdmin';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id?: string;
    fullName?: string;
    name?: string;
    email?: string;
    role?: 'Admin' | 'Moderator' | 'User';
  };
  category: 'Announcements' | 'Tips' | 'Updates' | 'General' | 'Discussions' | 'Q&A';
  status: 'published' | 'draft' | 'archived' | 'flagged';
  isPinned: boolean;
  likes: number;
  comments?: number;
  views: number;
  createdAt: string;
  updatedAt?: string;
}

type TabType = 'all' | 'published' | 'draft' | 'flagged' | 'create-new';

export default function CommunityPosts() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [actionStatus, setActionStatus] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCategory, searchQuery]);

  // Fetch posts from backend API
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 10
      };
      
      if (activeTab !== 'all' && activeTab !== 'create-new') {
        params.status = activeTab;
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await apiAdmin.get('/api/community/posts', { params });
      
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Failed to fetch posts:', err);
      setError(error.response?.data?.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, searchQuery, currentPage]);

  useEffect(() => {
    if (activeTab !== 'create-new') {
      fetchPosts();
    }
  }, [activeTab, fetchPosts]);

  // Stats calculation
  const stats = {
    total: total,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    flagged: posts.filter(p => p.status === 'flagged' || p.status === 'archived').length,
    totalEngagement: posts.reduce((sum, p) => sum + p.likes + (p.comments || 0), 0),
    totalViews: posts.reduce((sum, p) => sum + p.views, 0)
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await apiAdmin.delete(`/api/community/posts/${postId}`);
      setActionStatus('Post deleted successfully');
      setTimeout(() => setActionStatus(''), 3000);
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionStatus(error.response?.data?.message || 'Failed to delete post');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const handleTogglePin = async (postId: string) => {
    try {
      await apiAdmin.patch(`/api/community/posts/${postId}/pin`);
      setActionStatus('Post pin status updated');
      setTimeout(() => setActionStatus(''), 3000);
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionStatus(error.response?.data?.message || 'Failed to update pin status');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await apiAdmin.put(`/api/community/posts/${postId}`, { status: 'published' });
      setActionStatus('Post approved and published');
      setTimeout(() => setActionStatus(''), 3000);
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionStatus(error.response?.data?.message || 'Failed to approve post');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      await apiAdmin.delete(`/api/community/posts/${postId}`);
      setActionStatus('Post rejected and removed');
      setTimeout(() => setActionStatus(''), 3000);
      fetchPosts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setActionStatus(error.response?.data?.message || 'Failed to reject post');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  // Render create new post form
  if (activeTab === 'create-new') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className="text-[#253A7B] hover:underline text-sm mb-2"
            >
              ← Back to Posts
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Create New Post</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Post Title</label>
                <input
                  type="text"
                  placeholder="Enter post title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]">
                  <option value="Announcements">Announcements</option>
                  <option value="Tips">Tips</option>
                  <option value="Updates">Updates</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                <textarea
                  rows={8}
                  placeholder="Write your post content..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setActionStatus('Post published successfully!');
                    setActiveTab('all');
                    setTimeout(() => setActionStatus(''), 3000);
                  }}
                  className="px-6 py-2.5 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium"
                >
                  Publish Post
                </button>
                <button
                  onClick={() => {
                    setActionStatus('Post saved as draft');
                    setActiveTab('all');
                    setTimeout(() => setActionStatus(''), 3000);
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Community Posts</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Manage community content and engagement</p>
      </div>

      {/* Status Message */}
      {actionStatus && <StatusMessage message={actionStatus} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Total Posts</h3>
            <FileText className="w-4 h-4 text-[#253A7B]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Published</h3>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Drafts</h3>
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Flagged</h3>
            <FileText className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Engagement</h3>
            <ThumbsUp className="w-4 h-4 text-[#253A7B]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEngagement}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-600 uppercase">Total Views</h3>
            <Eye className="w-4 h-4 text-[#253A7B]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { key: 'all', label: 'All Posts', count: stats.total },
              { key: 'published', label: 'Published', count: stats.published },
              { key: 'draft', label: 'Drafts', count: stats.draft },
              { key: 'flagged', label: 'Flagged', count: stats.flagged }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? 'border-[#253A7B] text-[#253A7B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
          >
            <option value="all">All Categories</option>
            <option value="Announcements">Announcements</option>
            <option value="Tips">Tips</option>
            <option value="Updates">Updates</option>
            <option value="General">General</option>
          </select>
          <button
            onClick={() => setActiveTab('create-new')}
            className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium flex items-center gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>

        {/* Posts List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A7B] mx-auto mb-3"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-[#253A7B] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No posts found matching your criteria</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-4">
                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && (
                            <Pin className="w-4 h-4 text-[#253A7B] fill-current" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">
                            {post.author.fullName || post.author.name || post.author.email || 'Unknown'}
                          </span>
                          {post.author.role && (
                            <span className={`px-2 py-1 rounded-full font-semibold ${
                              post.author.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                              post.author.role === 'Moderator' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {post.author.role}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                            {post.category}
                          </span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' :
                        post.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      {post.comments !== undefined && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePin(post._id)}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        {post.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => setEditingPost(post)}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      {post.status === 'flagged' && (
                        <>
                          <button
                            onClick={() => handleApprovePost(post._id)}
                            className="px-3 py-1.5 text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPost(post._id)}
                            className="px-3 py-1.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="px-3 py-1.5 text-xs bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
