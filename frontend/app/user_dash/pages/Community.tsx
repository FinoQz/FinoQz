'use client';

import React from 'react';
import { MessageSquare, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';

export default function Community() {
  const posts = [
    { id: 1, author: 'Rahul Sharma', avatar: 'R', content: 'Just completed the Personal Finance quiz! Great learning experience. 🎉', likes: 24, comments: 5, time: '2 hours ago' },
    { id: 2, author: 'Priya Patel', avatar: 'P', content: 'Anyone else finding the Stock Market module challenging? Tips appreciated!', likes: 18, comments: 12, time: '5 hours ago' },
    { id: 3, author: 'Amit Kumar', avatar: 'A', content: 'Earned my 10th certificate today! FinoQz has been an amazing journey. 🏆', likes: 45, comments: 8, time: '1 day ago' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Community</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Connect with other learners and share your journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Posts</div>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">156</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Your Posts</div>
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">8</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Engagement</div>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">342</div>
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6">
        <textarea
          placeholder="Share your thoughts with the community..."
          className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-3">
          <button className="px-6 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium">
            Post
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] flex items-center justify-center text-white font-bold text-lg">
                {post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{post.author}</h3>
                    <p className="text-xs text-gray-500">{post.time}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{post.content}</p>
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
