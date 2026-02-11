'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, MessageSquare, Heart, Share2, TrendingUp, 
  Eye, Edit2, Trash2, Pin, ToggleLeft, ToggleRight, BarChart 
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Insight {
  _id: string;
  authorName: string;
  content: string;
  category?: string;
  tags?: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Analytics {
  overview: {
    totalInsights: number;
    activeInsights: number;
    pinnedInsights: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  mostEngaged: any[];
  topContributors: any[];
}

export default function InsightsManagement() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newInsight, setNewInsight] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchInsights();
    fetchAnalytics();
  }, [filter, searchQuery]);

  const fetchInsights = async () => {
    try {
      const response = await apiAdmin.get('/api/insights/admin/all', {
        params: {
          filter: filter !== 'all' ? filter : undefined,
          search: searchQuery || undefined,
          limit: 50
        }
      });
      
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiAdmin.get('/api/insights/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreateInsight = async () => {
    if (!newInsight.trim()) return;
    
    setIsCreating(true);
    try {
      await apiAdmin.post('/api/insights/admin/create', { 
        content: newInsight.trim() 
      });
      
      setNewInsight('');
      fetchInsights();
      fetchAnalytics();
    } catch (error) {
      console.error('Error creating insight:', error);
      alert('Failed to create insight');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await apiAdmin.patch(`/api/insights/admin/${id}/pin`);
      fetchInsights();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update insight');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await apiAdmin.patch(`/api/insights/admin/${id}/status`);
      fetchInsights();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update insight');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insight?')) return;
    
    try {
      await apiAdmin.delete(`/api/insights/admin/${id}`);
      fetchInsights();
      fetchAnalytics();
    } catch (error) {
      console.error('Error deleting insight:', error);
      alert('Failed to delete insight');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Community Insights Management</h1>
          <p className="text-gray-600 mt-2">Manage community posts and engagement</p>
        </div>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <BarChart className="w-5 h-5" />
          {showAnalytics ? 'Hide' : 'Show'} Analytics
        </button>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && analytics && (
        <div className="mb-8 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Insights</div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalInsights}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.overview.activeInsights}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Pinned</div>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.overview.pinnedInsights}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Likes</div>
              <div className="text-2xl font-bold text-red-600">
                {analytics.overview.totalLikes}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Comments</div>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.overview.totalComments}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Shares</div>
              <div className="text-2xl font-bold text-teal-600">
                {analytics.overview.totalShares}
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {analytics.topContributors.map((contributor, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{contributor.authorName}</div>
                    <div className="text-sm text-gray-500">
                      {contributor.postCount} posts • {contributor.totalLikes} likes
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">#{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Insight */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Create Admin Insight</h3>
        <textarea
          placeholder="Write an insight as admin..."
          value={newInsight}
          onChange={(e) => setNewInsight(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">{newInsight.length}/500</span>
          <button
            onClick={handleCreateInsight}
            disabled={isCreating || !newInsight.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Insight'}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'inactive'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setFilter('pinned')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pinned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pinned
            </button>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center text-gray-500">
            No insights found
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                      {insight.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{insight.authorName}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(insight.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{insight.content}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{insight.likeCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{insight.commentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>{insight.shareCount}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mb-4">
                {insight.isPinned && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Pinned
                  </span>
                )}
                {insight.isActive ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    Inactive
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePin(insight._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    insight.isPinned
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                  {insight.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => handleToggleStatus(insight._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    insight.isActive
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {insight.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {insight.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(insight._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
