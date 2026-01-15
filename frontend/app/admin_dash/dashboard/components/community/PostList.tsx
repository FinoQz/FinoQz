'use client';

import React from 'react';
import PostCard from './PostCard';
import { CheckSquare, Square } from 'lucide-react';

interface Post {
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
}

interface PostListProps {
  posts: Post[];
  selectedPostId: string | null;
  onSelectPost: (id: string) => void;
  selectedPosts: string[];
  onToggleSelectPost: (id: string) => void;
  onToggleSelectAll: () => void;
  onEditPost: (id: string) => void;
  onDeletePost: (id: string) => void;
  onTogglePin: (id: string) => void;
  onTogglePublish: (id: string) => void;
}

export default function PostList({
  posts,
  selectedPostId,
  onSelectPost,
  selectedPosts,
  onToggleSelectPost,
  onToggleSelectAll,
  onEditPost,
  onDeletePost,
  onTogglePin,
  onTogglePublish
}: PostListProps) {
  const pinnedPosts = posts.filter(p => p.isPinned);
  const regularPosts = posts.filter(p => !p.isPinned);
  const allSelected = selectedPosts.length === posts.length && posts.length > 0;

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      {selectedPosts.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSelectAll}
              className="p-1.5 hover:bg-blue-100 rounded-lg transition"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5 text-[#253A7B]" />
              ) : (
                <Square className="w-5 h-5 text-[#253A7B]" />
              )}
            </button>
            <span className="text-sm font-medium text-gray-700">
              {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
              Publish
            </button>
            <button className="px-3 py-1.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
              Unpublish
            </button>
            <button className="px-3 py-1.5 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Pinned Posts Section */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pinned Posts</h3>
          {pinnedPosts.map(post => (
            <div key={post.id} className="flex items-start gap-3">
              <button
                onClick={() => onToggleSelectPost(post.id)}
                className="mt-4 p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                {selectedPosts.includes(post.id) ? (
                  <CheckSquare className="w-5 h-5 text-[#253A7B]" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div className="flex-1">
                <PostCard
                  post={post}
                  isSelected={selectedPostId === post.id}
                  onSelect={() => onSelectPost(post.id)}
                  onEdit={() => onEditPost(post.id)}
                  onDelete={() => onDeletePost(post.id)}
                  onTogglePin={() => onTogglePin(post.id)}
                  onTogglePublish={() => onTogglePublish(post.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regular Posts Section */}
      <div className="space-y-3">
        {pinnedPosts.length > 0 && (
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">All Posts</h3>
        )}
        {regularPosts.map(post => (
          <div key={post.id} className="flex items-start gap-3">
            <button
              onClick={() => onToggleSelectPost(post.id)}
              className="mt-4 p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              {selectedPosts.includes(post.id) ? (
                <CheckSquare className="w-5 h-5 text-[#253A7B]" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <div className="flex-1">
              <PostCard
                post={post}
                isSelected={selectedPostId === post.id}
                onSelect={() => onSelectPost(post.id)}
                onEdit={() => onEditPost(post.id)}
                onDelete={() => onDeletePost(post.id)}
                onTogglePin={() => onTogglePin(post.id)}
                onTogglePublish={() => onTogglePublish(post.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <p className="text-gray-600">No posts found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
