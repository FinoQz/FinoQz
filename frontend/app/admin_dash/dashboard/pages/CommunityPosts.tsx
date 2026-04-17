'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, TrendingUp, MessageSquare, Eye, ThumbsUp, FileText, Edit2, Trash2, Pin, Tag, FolderTree } from 'lucide-react';
import StatusMessage from '../components/community/StatusMessage'
import apiAdmin from '@/lib/apiAdmin';

interface Post {
  _id: string;
  title: string;
  content: string;
  forumCategory: string;
  forumAction: string;
  authorName: string;
  authorModel: string;
  isActive: boolean;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
}

interface ForumTag {
  _id: string;
  name: string;
  type: 'category' | 'action';
}

type TabType = 'posts' | 'create-new' | 'tags';

export default function CommunityPosts() {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [actionStatus, setActionStatus] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [forumTags, setForumTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // New Post Form
  const [newPost, setNewPost] = useState({ title: '', content: '', forumCategory: '', forumAction: '' });
  
  // New Tag Form
  const [newTag, setNewTag] = useState({ name: '', type: 'category' });

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const fetchTags = async () => {
    try {
      const res = await apiAdmin.get('/api/forum-tags');
      setForumTags(res.data.tags || []);
    } catch (err) {
      console.error('Failed to fetch tags', err);
    }
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 10
      };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      // Note: Backend might not support category filtering directly yet, but we'll try to pass it if implemented
      
      const response = await apiAdmin.get('/api/insights/admin/all', { params });
      
      let fetchedPosts = response.data.insights || [];
      // Client side filter by category if needed
      if (selectedCategory !== 'all') {
        fetchedPosts = fetchedPosts.filter((p: Post) => p.forumCategory === selectedCategory);
      }
      
      setPosts(fetchedPosts);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, selectedCategory]);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [activeTab, fetchPosts]);

  // Actions
  const handleDeletePost = async (postId: string) => {
    if(!confirm("Delete this post?")) return;
    try {
      await apiAdmin.delete(`/api/insights/admin/${postId}`);
      setActionStatus('Post deleted successfully');
      setTimeout(() => setActionStatus(''), 3000);
      fetchPosts();
    } catch (err) {
      setActionStatus('Failed to delete post');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const handleTogglePin = async (postId: string) => {
    try {
      await apiAdmin.patch(`/api/insights/admin/${postId}/pin`);
      setActionStatus('Post pin status updated');
      setTimeout(() => setActionStatus(''), 3000);
      fetchPosts();
    } catch (err) {
      setActionStatus('Failed to update pin status');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const handleCreatePost = async () => {
    if(!newPost.title || !newPost.content) return;
    try {
      await apiAdmin.post('/api/insights/admin/create', newPost);
      setActionStatus('Post published successfully!');
      setActiveTab('posts');
      setNewPost({ title: '', content: '', forumCategory: '', forumAction: '' });
      setTimeout(() => setActionStatus(''), 3000);
    } catch (err) {
      setActionStatus('Failed to create post');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const handleCreateTag = async () => {
    if(!newTag.name) return;
    try {
      await apiAdmin.post('/api/forum-tags', newTag);
      setActionStatus('Tag created successfully!');
      setNewTag({ name: '', type: 'category' });
      fetchTags();
      setTimeout(() => setActionStatus(''), 3000);
    } catch (err) {
      setActionStatus('Failed to create tag');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if(!confirm('Delete this tag?')) return;
    try {
      await apiAdmin.delete(`/api/forum-tags/${tagId}`);
      setActionStatus('Tag deleted');
      fetchTags();
      setTimeout(() => setActionStatus(''), 3000);
    } catch (err) {
      setActionStatus('Failed to delete tag');
      setTimeout(() => setActionStatus(''), 3000);
    }
  };

  const categories = forumTags.filter(t => t.type === 'category');
  const actions = forumTags.filter(t => t.type === 'action');

  if (activeTab === 'tags') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button onClick={() => setActiveTab('posts')} className="text-[#253A7B] hover:underline text-sm mb-2">← Back to Posts</button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Manage Forum Categories & Actions</h1>
          </div>
          {actionStatus && <StatusMessage message={actionStatus} />}
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Add New Tag</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={newTag.name}
                onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                placeholder="Tag Name (e.g. Finance, Diagnose)" 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
              />
              <select 
                value={newTag.type}
                onChange={(e) => setNewTag({...newTag, type: e.target.value as 'category' | 'action'})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
              >
                <option value="category">Category (Topic)</option>
                <option value="action">Action (Goal)</option>
              </select>
              <button 
                onClick={handleCreateTag} 
                className="px-6 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FolderTree className="w-5 h-5 text-[#253A7B]" /> Categories</h3>
              <ul className="divide-y divide-gray-100">
                {categories.length === 0 ? <p className="text-gray-500 text-sm">No categories defined yet.</p> : null}
                {categories.map(tag => (
                  <li key={tag._id} className="py-3 flex items-center justify-between">
                    <span className="font-medium text-gray-700">{tag.name}</span>
                    <button onClick={() => handleDeleteTag(tag._id)} className="text-red-500 hover:text-red-700 text-sm"><Trash2 className="w-4 h-4"/></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-green-600" /> Actions</h3>
              <ul className="divide-y divide-gray-100">
                {actions.length === 0 ? <p className="text-gray-500 text-sm">No actions defined yet.</p> : null}
                {actions.map(tag => (
                  <li key={tag._id} className="py-3 flex items-center justify-between">
                    <span className="font-medium text-gray-700">{tag.name}</span>
                    <button onClick={() => handleDeleteTag(tag._id)} className="text-red-500 hover:text-red-700 text-sm"><Trash2 className="w-4 h-4"/></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'create-new') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button onClick={() => setActiveTab('posts')} className="text-[#253A7B] hover:underline text-sm mb-2">← Back to Posts</button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Create Decision Forum Post</h1>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scenario Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="e.g. Profit increasing but cash flow negative. What's wrong?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select 
                    value={newPost.forumCategory}
                    onChange={(e) => setNewPost({...newPost, forumCategory: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Action / Goal</label>
                  <select 
                    value={newPost.forumAction}
                    onChange={(e) => setNewPost({...newPost, forumAction: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
                  >
                    <option value="">Select Action...</option>
                    {actions.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                <textarea
                  rows={8}
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Describe your scenario..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B]"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.title || !newPost.content}
                  className="px-6 py-2.5 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium disabled:opacity-50"
                >
                  Publish Post
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
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
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Decision Forum</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage forum posts and categories</p>
        </div>
        <button
          onClick={() => setActiveTab('tags')}
          className="px-4 py-2 bg-white border border-gray-300 text-[#253A7B] rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
        >
          <FolderTree className="w-4 h-4" />
          Manage Categories
        </button>
      </div>

      {actionStatus && <StatusMessage message={actionStatus} />}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 bg-gray-50 rounded-t-xl">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
          <button
            onClick={() => setActiveTab('create-new')}
            className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium flex items-center gap-2 justify-center text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>

        {/* Posts List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-600">Loading posts...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">{error}</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No posts found</div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       {post.isPinned && <Pin className="w-3 h-3 text-[#253A7B] fill-current" />}
                       {post.forumCategory && <span className="bg-[#eef2ff] border border-[#c7d2fe] text-[#3730a3] px-2 py-0.5 rounded text-xs font-semibold">{post.forumCategory}</span>}
                       {post.forumAction && <span className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] px-2 py-0.5 rounded text-xs font-semibold">{post.forumAction}</span>}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">{post.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-semibold text-gray-800">By {post.authorName} ({post.authorModel})</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3"/> {post.likeCount}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> {post.commentCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleTogglePin(post._id)}
                      className="px-3 py-1 text-xs font-medium border rounded hover:bg-gray-100"
                    >
                      {post.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="px-3 py-1 text-xs font-medium border border-red-200 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <span className="text-sm text-gray-600">Total {total} posts</span>
        </div>
      </div>
    </div>
  );
}
