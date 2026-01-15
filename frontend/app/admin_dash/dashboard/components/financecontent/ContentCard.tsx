'use client';

import React, { useState } from 'react';
import { Eye, Heart, Edit, Trash2, EyeOff, FileText, Video, FileDown, Calculator } from 'lucide-react';
import Image from 'next/image';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ContentCardProps {
  content: {
    id: number;
    title: string;
    category: string;
    type: 'article' | 'video' | 'pdf' | 'tool';
    thumbnail: string;
    tags: string[];
    views: number;
    likes: number;
    uploadDate: string;
    isVisible: boolean;
    isFeatured: boolean;
  };
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number) => void;
}

export default function ContentCard({ content, onEdit, onDelete, onToggleVisibility }: ContentCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getTypeIcon = () => {
    switch (content.type) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileDown className="w-4 h-4" />;
      case 'tool':
        return <Calculator className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Personal Finance': 'bg-blue-100 text-blue-700',
      'Accounting': 'bg-green-100 text-green-700',
      'Stock Market': 'bg-purple-100 text-purple-700',
      'Taxation': 'bg-orange-100 text-orange-700',
      'Banking': 'bg-cyan-100 text-cyan-700',
      'Insurance': 'bg-pink-100 text-pink-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {content.thumbnail ? (
          <Image
            src={content.thumbnail}
            alt={content.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {getTypeIcon()}
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1 text-xs font-medium text-gray-700">
          {getTypeIcon()}
          <span className="capitalize">{content.type}</span>
        </div>

        {/* Tags */}
        <div className="absolute top-3 right-3 flex gap-1">
          {content.isFeatured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg shadow-sm">
              Featured
            </span>
          )}
          {content.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-[#253A7B] text-white text-xs font-medium rounded-lg shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Hidden Overlay */}
        {!content.isVisible && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg">
              <EyeOff className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Hidden</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="mb-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(content.category)}`}>
            {content.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
          {content.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{content.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{content.likes.toLocaleString()}</span>
          </div>
          <div className="ml-auto text-xs text-gray-500">
            {content.uploadDate}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={() => onEdit(content.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          <button
            onClick={() => onToggleVisibility(content.id)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            title={content.isVisible ? 'Hide' : 'Show'}
          >
            {content.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete(content.id)}
        contentTitle={content.title}
      />
    </div>
  );
}
