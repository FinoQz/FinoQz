'use client';

import React, { useState } from 'react';
import { Plus, Search, TrendingUp, MessageSquare, Eye, ThumbsUp, FileText, Edit2, Trash2, Pin } from 'lucide-react';
import StatusMessage from '../components/community/StatusMessage'

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: 'Admin' | 'Moderator' | 'User';
  };
  category: 'Announcements' | 'Discussions' | 'Q&A' | 'Tips';
  status: 'published' | 'draft' | 'flagged';
  isPinned: boolean;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
}

type TabType = 'all' | 'published' | 'draft' | 'flagged' | 'create-new';

export default function CommunityPosts() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [actionStatus, setActionStatus] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Dummy posts data
  const dummyPosts: Post[] = [
    {
      _id: '1',
      title: 'New Financial Literacy Quiz Launched',
      content: 'We are excited to announce the launch of our comprehensive Financial Literacy Quiz covering topics from basic budgeting to advanced investment strategies...',
      author: { name: 'Admin Team', role: 'Admin' },
      category: 'Announcements',
      status: 'published',
      isPinned: true,
      likes: 142,
      comments: 28,
      views: 1543,
      createdAt: '2024-11-28'
    },
    {
      _id: '2',
      title: 'Best Practices for Portfolio Diversification',
      content: 'Learn essential strategies for spreading your investments across different asset classes to minimize risk and maximize returns...',
      author: { name: 'Michael Chen', role: 'Moderator' },
      category: 'Tips',
      status: 'published',
      isPinned: false,
      likes: 89,
      comments: 15,
      views: 876,
      createdAt: '2024-11-27'
    },
    {
      _id: '3',
      title: 'How to Calculate Compound Interest?',
      content: 'Understanding compound interest is crucial for long-term financial planning. Here\'s a step-by-step guide...',
      author: { name: 'Priya Sharma', role: 'User' },
      category: 'Q&A',
      status: 'published',
      isPinned: false,
      likes: 56,
      comments: 23,
      views: 654,
      createdAt: '2024-11-26'
    },
    {
      _id: '4',
      title: 'Stock Market Trends Discussion',
      content: 'Let\'s discuss the current market trends and what they mean for retail investors...',
      author: { name: 'Vikram Singh', role: 'User' },
      category: 'Discussions',
      status: 'published',
      isPinned: false,
      likes: 34,
      comments: 45,
      views: 432,
      createdAt: '2024-11-25'
    },
    {
      _id: '5',
      title: 'Suspicious Investment Scheme Alert',
      content: 'Warning: This post contains potentially misleading information about guaranteed returns...',
      author: { name: 'Unknown User', role: 'User' },
      category: 'Discussions',
      status: 'flagged',
      isPinned: false,
      likes: 2,
      comments: 8,
      views: 234,
      createdAt: '2024-11-24'
    },
    {
      _id: '6',
      title: 'Upcoming Platform Features',
      content: 'Draft announcement about new features including real-time market analytics and personalized learning paths...',
      author: { name: 'Admin Team', role: 'Admin' },
      category: 'Announcements',
      status: 'draft',
      isPinned: false,
      likes: 0,
      comments: 0,
      views: 12,
      createdAt: '2024-11-29'
    }
  ];

  const [posts, setPosts] = useState<Post[]>(dummyPosts);

  // Filter posts based on active tab and search
  const getFilteredPosts = () => {
    let filtered = posts;

    // Filter by tab
    if (activeTab !== 'all' && activeTab !== 'create-new') {
      filtered = filtered.filter(post => post.status === activeTab);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  // Stats calculation
  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    flagged: posts.filter(p => p.status === 'flagged').length,
    totalEngagement: posts.reduce((sum, p) => sum + p.likes + p.comments, 0),
    totalViews: posts.reduce((sum, p) => sum + p.views, 0)
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
    setActionStatus('Post deleted successfully');
    setTimeout(() => setActionStatus(''), 3000);
  };

  const handleTogglePin = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p._id === postId ? { ...p, isPinned: !p.isPinned } : p
    ));
    setActionStatus('Post pin status updated');
    setTimeout(() => setActionStatus(''), 3000);
  };

  const handleApprovePost = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p._id === postId ? { ...p, status: 'published' as const } : p
    ));
    setActionStatus('Post approved and published');
    setTimeout(() => setActionStatus(''), 3000);
  };

  const handleRejectPost = (postId: string) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
    setActionStatus('Post rejected and removed');
    setTimeout(() => setActionStatus(''), 3000);
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
                  <option value="Discussions">Discussions</option>
                  <option value="Q&A">Q&A</option>
                  <option value="Tips">Tips</option>
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
            <option value="Discussions">Discussions</option>
            <option value="Q&A">Q&A</option>
            <option value="Tips">Tips</option>
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
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No posts found matching your criteria</p>
            </div>
          ) : (
            filteredPosts.map(post => (
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
                          <span className="font-medium text-gray-700">{post.author.name}</span>
                          <span className={`px-2 py-1 rounded-full font-semibold ${
                            post.author.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            post.author.role === 'Moderator' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {post.author.role}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">
                            {post.category}
                          </span>
                          <span>{post.createdAt}</span>
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
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
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
      </div>
    </div>
  );
}
