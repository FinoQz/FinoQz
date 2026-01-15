'use client';

import React, { useState } from 'react';
import { X, ThumbsUp, MessageCircle, TrendingUp, Share2, Clock, User, Image as ImageIcon } from 'lucide-react';
import ModerationTools from './ModerationTools';

interface PostDetailPanelProps {
  post: {
    id: string;
    title: string;
    content: string;
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
    shares: number;
    publishDate: string;
    status: 'published' | 'draft' | 'flagged';
    attachments?: Array<{
      type: 'image' | 'video' | 'pdf';
      url: string;
      name: string;
    }>;
    activityLog: Array<{
      action: string;
      user: string;
      timestamp: string;
    }>;
  };
  onClose: () => void;
}

export default function PostDetailPanel({ post, onClose }: PostDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'activity'>('content');
  
  const engagementRate = ((post.likes + post.comments) / post.views * 100).toFixed(1);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b-2 border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-gray-200 flex">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-4 py-3 font-medium transition ${
            activeTab === 'content'
              ? 'text-[#253A7B] border-b-2 border-[#253A7B]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 px-4 py-3 font-medium transition ${
            activeTab === 'activity'
              ? 'text-[#253A7B] border-b-2 border-[#253A7B]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Activity Log
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeTab === 'content' ? (
          <>
            {/* Author Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {post.author.avatar || post.author.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{post.author.name}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {post.author.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{post.publishDate}</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                  {post.category}
                </span>
                {post.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Attachments</h3>
                <div className="grid grid-cols-2 gap-2">
                  {post.attachments.map((att, i) => (
                    <div key={i} className="p-3 border-2 border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700 truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Likes</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{post.likes}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Comments</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{post.comments}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Views</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{post.views}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Engagement</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{engagementRate}%</p>
              </div>
            </div>
          </>
        ) : (
          /* Activity Log */
          <div className="space-y-3">
            {post.activityLog.map((activity, i) => (
              <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.user}</span> {activity.action}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Tools - Fixed at bottom */}
      <div className="border-t-2 border-gray-200">
        <ModerationTools postId={post.id} postStatus={post.status} />
      </div>
    </div>
  );
}
