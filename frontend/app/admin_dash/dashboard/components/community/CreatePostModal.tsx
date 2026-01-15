'use client';

import React, { useState } from 'react';
import { X, Upload, Calendar, Globe, Lock, Users, Bold, Italic, Link as LinkIcon, List } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: PostData) => void;
  editPost?: PostData | null;
}

export interface PostData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  visibility: 'public' | 'members' | 'admin';
  scheduleDate?: string;
  attachments: File[];
}

export default function CreatePostModal({ isOpen, onClose, onSubmit, editPost }: CreatePostModalProps) {
  const [title, setTitle] = useState(editPost?.title || '');
  const [content, setContent] = useState(editPost?.content || '');
  const [category, setCategory] = useState(editPost?.category || 'Discussions');
  const [tagsInput, setTagsInput] = useState(editPost?.tags.join(', ') || '');
  const [visibility, setVisibility] = useState<'public' | 'members' | 'admin'>(editPost?.visibility || 'public');
  const [scheduleDate, setScheduleDate] = useState(editPost?.scheduleDate || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    if (title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
      onSubmit({
        title,
        content,
        category,
        tags,
        visibility,
        scheduleDate: scheduleDate || undefined,
        attachments
      });
      handleClose();
    }
  };

  const handleSaveDraft = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    console.log('Save as draft:', { title, content, category, tags });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setCategory('Discussions');
    setTagsInput('');
    setVisibility('public');
    setScheduleDate('');
    setAttachments([]);
    setErrors({});
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Share content with the community</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="Enter an engaging title..."
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            <p className="text-xs text-gray-600 mt-1">{title.length}/200 characters</p>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
              >
                <option value="Announcements">Announcements</option>
                <option value="Discussions">Discussions</option>
                <option value="Q&A">Q&A</option>
                <option value="Tips">Tips</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                placeholder="finance, investment, tips"
              />
            </div>
          </div>

          {/* Rich Text Toolbar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-2 border-b border-gray-200 flex items-center gap-1">
                <button className="p-2 hover:bg-gray-200 rounded transition" title="Bold">
                  <Bold className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition" title="Italic">
                  <Italic className="w-4 h-4 text-gray-700" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button className="p-2 hover:bg-gray-200 rounded transition" title="Link">
                  <LinkIcon className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition" title="List">
                  <List className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 focus:outline-none resize-none"
                placeholder="Write your post content here..."
              />
            </div>
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#253A7B] transition cursor-pointer">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Upload images, PDFs, or video links</span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf"
              />
            </label>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, i) => (
                  <div key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibility & Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value as "public" | "members" | "admin")}
                    className="w-4 h-4 text-[#253A7B]"
                  />
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Public</span>
                </label>
                <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="visibility"
                    value="members"
                    checked={visibility === 'members'}
                    onChange={(e) => setVisibility(e.target.value as "public" | "members" | "admin")}
                    className="w-4 h-4 text-[#253A7B]"
                  />
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Members Only</span>
                </label>
                <label className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="visibility"
                    value="admin"
                    checked={visibility === 'admin'}
                    onChange={(e) => setVisibility(e.target.value as "public" | "members" | "admin")}
                    className="w-4 h-4 text-[#253A7B]"
                  />
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Admin Only</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Publication
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Leave empty to publish immediately
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium shadow-sm hover:shadow-md"
          >
            {editPost ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
