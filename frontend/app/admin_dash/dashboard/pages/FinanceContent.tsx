'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import ContentCard from '../components/financecontent/ContentCard';
import AnalyticsPanel from '../components/financecontent/AnalyticsPanel';
import AddContentModal, { ContentFormData } from '../components/financecontent/AddContentModal';

export default function FinanceContent() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  type ContentType = typeof contents[0] | null;
  const [editingContent, setEditingContent] = useState<ContentType>(null);

  // Dummy data
  const [contents, setContents] = useState([
    {
      id: 1,
      title: 'Understanding Stock Market Basics: A Beginner\'s Guide',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
      category: 'Stock Market',
      type: 'article' as const,
      tags: ['New', 'Featured'],
      views: 15420,
      likes: 342,
      uploadDate: '2024-11-15',
      isVisible: true,
      isFeatured: true,
    },
    {
      id: 2,
      title: 'How to Calculate Your Tax Liability in 2024',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      category: 'Taxation',
      type: 'video' as const,
      tags: ['Trending'],
      views: 28900,
      likes: 567,
      uploadDate: '2024-11-10',
      isVisible: true,
      isFeatured: false,
    },
    {
      id: 3,
      title: 'Personal Finance Checklist 2024',
      thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
      category: 'Personal Finance',
      type: 'pdf' as const,
      tags: ['Featured'],
      views: 12300,
      likes: 289,
      uploadDate: '2024-11-08',
      isVisible: true,
      isFeatured: true,
    },
    {
      id: 4,
      title: 'EMI Calculator - Home Loan & Car Loan',
      thumbnail: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400',
      category: 'Personal Finance',
      type: 'tool' as const,
      tags: ['New'],
      views: 34100,
      likes: 892,
      uploadDate: '2024-11-20',
      isVisible: true,
      isFeatured: false,
    },
    {
      id: 5,
      title: 'Mutual Funds vs Fixed Deposits: Which is Better?',
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400',
      category: 'Investment',
      type: 'article' as const,
      tags: ['Trending'],
      views: 19200,
      likes: 421,
      uploadDate: '2024-11-18',
      isVisible: false,
      isFeatured: false,
    },
    {
      id: 6,
      title: 'GST Returns Filing Made Easy',
      thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      category: 'Accounting',
      type: 'video' as const,
      tags: ['Featured'],
      views: 22100,
      likes: 534,
      uploadDate: '2024-11-12',
      isVisible: true,
      isFeatured: true,
    },
  ]);

  const analyticsData = {
    totalContent: contents.length,
    totalViews: contents.reduce((sum, item) => sum + item.views, 0),
    monthlyEngagement: 67,
    topContent: contents
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
      .map(item => ({
        title: item.title,
        views: item.views,
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

  const handleEdit = (id: number) => {
    const contentToEdit = contents.find(item => item.id === id);
    if (contentToEdit) {
      setEditingContent(contentToEdit);
      setShowAddModal(true);
    }
  };

  const handleDelete = (id: number) => {
    setContents(contents.filter(item => item.id !== id));
  };

  const handleToggleVisibility = (id: number) => {
    setContents(contents.map(item =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
  };

  const handleSaveContent = (data: ContentFormData) => {
    if (editingContent) {
      // Update existing content
      setContents(contents.map(item =>
        item.id === editingContent.id ? { ...item, ...data } : item
      ));
      setEditingContent(null);
    } else {
      // Add new content
      const newContent = {
        ...data,
        id: contents.length + 1,
        views: 0,
        likes: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        isVisible: true,
      };
      setContents([newContent, ...contents]);
    }
  };

  const filteredContents = contents.filter(item => {
    const matchesTab = activeTab === 'all' ||
      activeTab === item.type ||
      (activeTab === 'featured' && (item.isFeatured || item.tags.includes('Featured')));
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingContent(null);
  };

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
              key={content.id}
              content={content}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
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
        editData={editingContent}
      />
    </div>
  );
}
