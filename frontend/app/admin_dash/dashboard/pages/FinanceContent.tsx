/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import ContentCard from '../components/financecontent/ContentCard';
import AnalyticsPanel from '../components/financecontent/AnalyticsPanel';
import AddContentModal, { ContentFormData } from '../components/financecontent/AddContentModal';

interface ContentItem {
  id?: string;
  _id?: string;
  title: string;
  category: string;
  type: 'article' | 'video' | 'pdf' | 'tool';
  thumbnail: string;
  tags: string[];
  views: number;
  likes: number;
  uploadDate?: string;
  isVisible: boolean;
  isFeatured: boolean;
  videoLink?: string;
  content?: string;
  toolLink?: string;
}

export default function FinanceContent() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch content on mount
  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await apiAdmin.get('/api/finance-content/admin/all', {
        params: { page: 1, limit: 100 }
      });
      const items = (res.data.content || []).map((item: any) => ({
        id: item._id,
        _id: item._id,
        ...item,
        views: Number(item.views) || 0,
        likes: Number(item.likes) || 0,
        uploadDate: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      setContents(items);
    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const analyticsData = {
    totalContent: contents.length,
    totalViews: contents.reduce((sum, item) => sum + (Number(item.views) || 0), 0),
    monthlyEngagement: 67,
    topContent: contents
      .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
      .slice(0, 3)
      .map(item => ({
        title: item.title,
        views: Number(item.views) || 0,
        category: item.category,
      })),
  };

  const tabs = [
    { id: 'all', label: 'All Content' },
    { id: 'article', label: 'Articles' },
    { id: 'video', label: 'Videos' },
    { id: 'pdf', label: 'PDFs / Resources' },
    { id: 'tool', label: 'Tools / Calculators' },
    { id: 'featured', label: 'Featured' },
  ];

  const handleEdit = (id: string) => {
    const contentToEdit = contents.find(item => item._id === id || item.id === id);
    if (contentToEdit) {
      setEditingContent(contentToEdit);
      setShowAddModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiAdmin.delete(`/api/finance-content/admin/${id}`);
      setContents(contents.filter(item => item._id !== id && item.id !== id));
    } catch (err: any) {
      console.error('Error deleting content:', err);
      alert(err.response?.data?.message || 'Failed to delete content');
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      await apiAdmin.patch(`/api/finance-content/admin/${id}/visibility`);
      setContents(contents.map(item =>
        (item._id === id || item.id === id) ? { ...item, isVisible: !item.isVisible } : item
      ));
    } catch (err) {
      console.error('Error toggling visibility:', err);
      
      // Proper error handling with type safety
      const errorMessage = 
        err instanceof Error 
          ? err.message 
          : (err as any)?.response?.data?.message 
          ? (err as any).response.data.message
          : 'Failed to update visibility';
      
      alert(errorMessage);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await apiAdmin.patch(`/api/finance-content/admin/${id}/featured`);
      setContents(contents.map(item =>
        (item._id === id || item.id === id) ? { ...item, isFeatured: !item.isFeatured } : item
      ));
    } catch (err) {
      console.error('Error toggling featured:', err);
      
      // Proper error handling with type safety
      const errorMessage = 
        err instanceof Error 
          ? err.message 
          : (err as any)?.response?.data?.message 
          ? (err as any).response.data.message
          : 'Failed to update featured status';
      
      alert(errorMessage);
    }
  };

  const handleSaveContent = async (data: ContentFormData) => {
    try {
      // Handle tags - convert from string (comma-separated) or array to string array
      let tagsArray: string[] = [];
      if (typeof (data as any).tags === 'string') {
        tagsArray = (data as any).tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
      } else if (Array.isArray((data as any).tags)) {
        tagsArray = (data as any).tags.filter((t: string) => t && t.trim());
      }

      const payload = {
        title: data.title,
        category: data.category,
        type: data.type,
        content: data.content,
        thumbnail: data.thumbnail,
        videoLink: data.videoLink,
        toolLink: data.toolLink,
        tags: tagsArray,
        isFeatured: data.isFeatured,
        excerpt: data.content?.substring(0, 300) || ''
      };

      if (editingContent && (editingContent._id || editingContent.id)) {
        const contentId = editingContent._id || editingContent.id;
        await apiAdmin.put(`/api/finance-content/admin/${contentId}`, payload);
        
        // Refresh list
        await fetchContents();
      } else {
        await apiAdmin.post('/api/finance-content/admin/create', payload);
        
        // Refresh list
        await fetchContents();
      }

      setEditingContent(null);
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Error saving content:', err);
      alert(err.response?.data?.message || 'Failed to save content');
    }
  };

  const filteredContents = contents.filter(item => {
    const matchesTab = activeTab === 'all' ||
      activeTab === item.type ||
      (activeTab === 'featured' && item.isFeatured);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingContent(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading finance content...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Content</h1>
          <p className="text-gray-600 mt-1">Manage financial learning materials and resources</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New Content
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Analytics Panel */}
      <div className="mb-6">
        <AnalyticsPanel stats={analyticsData} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[#253A7B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {filteredContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map(content => (
            <ContentCard
              key={content._id || content.id}
              content={content}
              onEdit={() => handleEdit(content._id || content.id || '')}
              onDelete={() => handleDelete(content._id || content.id || '')}
              onToggleVisibility={() => handleToggleVisibility(content._id || content.id || '')}
              onToggleFeatured={() => handleToggleFeatured(content._id || content.id || '')}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first content'}
            </p>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      <AddContentModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveContent}
        editData={editingContent as any}
      />
    </div>
  );
}
