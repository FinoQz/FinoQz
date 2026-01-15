'use client';

import React from 'react';
import { Edit, Trash2, Eye, Pin, Flag, ThumbsUp, MessageCircle, TrendingUp, Image, FileText, Video } from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    author: {
      name: string;
      avatar: string;
      role: 'Admin' | 'Moderator' | 'User';
    };
    category: string;
    tags: string[];
    likes: number;
    comments: number;
    views: number;
    publishDate: string;
    status: 'published' | 'draft' | 'flagged';
    isPinned: boolean;
    hasAttachments?: {
      images?: number;
      videos?: number;
      pdfs?: number;
    };
  };
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onTogglePublish: () => void;
}

export default function PostCard({ post, isSelected, onSelect, onEdit, onDelete, onTogglePin, onTogglePublish }: PostCardProps) {
  const getRoleBadgeColor = (role: string) => {
    if (role === 'Admin') return 'bg-purple-100 text-purple-700';
    if (role === 'Moderator') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Announcements': 'bg-green-100 text-green-700',
      'Discussions': 'bg-blue-100 text-blue-700',
      'Q&A': 'bg-yellow-100 text-yellow-700',
      'Tips': 'bg-purple-100 text-purple-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition hover:shadow-md ${
        isSelected ? 'border-[#253A7B] shadow-md' : 'border-gray-200'
      } ${post.status === 'flagged' ? 'border-l-4 border-l-red-500' : ''}`}
    >
      {/* Header: Author & Badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {post.author.avatar || post.author.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{post.author.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(post.author.role)}`}>
                {post.author.role}
              </span>
            </div>
            <p className="text-xs text-gray-600">{post.publishDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.isPinned && (
            <Pin className="w-4 h-4 text-[#253A7B] fill-[#253A7B]" />
          )}
          {post.status === 'flagged' && (
            <Flag className="w-4 h-4 text-red-500 fill-red-500" />
          )}
          {post.status === 'draft' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{post.title}</h3>

      {/* Excerpt */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>

      {/* Category & Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(post.category)}`}>
          {post.category}
        </span>
        {post.tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
            #{tag}
          </span>
        ))}
      </div>

      {/* Attachments */}
      {post.hasAttachments && (
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
          {post.hasAttachments.images && (
            <div className="flex items-center gap-1">
              <Image className="w-3.5 h-3.5" />
              <span>{post.hasAttachments.images}</span>
            </div>
          )}
          {post.hasAttachments.videos && (
            <div className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              <span>{post.hasAttachments.videos}</span>
            </div>
          )}
          {post.hasAttachments.pdfs && (
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{post.hasAttachments.pdfs}</span>
            </div>
          )}
        </div>
      )}

      {/* Metadata & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{post.views}</span>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg transition ${
              post.isPinned ? 'bg-[#253A7B] text-white' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={post.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePublish}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-600"
            title={post.status === 'published' ? 'Unpublish' : 'Publish'}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition text-[#253A7B]"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
