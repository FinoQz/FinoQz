'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Link2 } from 'lucide-react';
import Image from 'next/image';

export interface ContentFormData {
  title: string;
  category: string;
  type: 'article' | 'video' | 'pdf' | 'tool';
  thumbnail: string;
  videoLink?: string;
  content?: string;
  toolLink?: string;
  visibility: string;
  tags: string[];
  isFeatured: boolean;
  views: number;
  likes: number;
}

interface ContentItem {
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
  videoLink?: string;
  content?: string;
  toolLink?: string;
  visibility?: string;
}

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContentFormData) => void;
  editData?: ContentItem | null;
}

export default function AddContentModal({ isOpen, onClose, onSubmit, editData }: AddContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: 'article' as 'article' | 'video' | 'pdf' | 'tool',
    thumbnail: '',
    videoLink: '',
    content: '',
    toolLink: '',
    visibility: 'public',
    tags: '',
    isFeatured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        category: editData.category || '',
        type: editData.type || 'article',
        thumbnail: editData.thumbnail || '',
        videoLink: editData.videoLink || '',
        content: editData.content || '',
        toolLink: editData.toolLink || '',
        visibility: editData.visibility || 'public',
        tags: editData.tags?.join(', ') || '',
        isFeatured: editData.isFeatured || false,
      });
      setImagePreview(editData.thumbnail || '');
    } else {
      setFormData({
        title: '',
        category: '',
        type: 'article',
        thumbnail: '',
        videoLink: '',
        content: '',
        toolLink: '',
        visibility: 'public',
        tags: '',
        isFeatured: false,
      });
      setImagePreview('');
    }
  }, [editData, isOpen]);

  useEffect(() => {
    if (formData.thumbnail) {
      setImagePreview(formData.thumbnail);
    }
  }, [formData.thumbnail]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        handleChange('thumbnail', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.type === 'video' && !formData.videoLink.trim()) newErrors.videoLink = 'Video link is required';
    if (formData.type === 'article' && !formData.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    onSubmit({
      ...formData,
      tags: tagsArray,
      views: editData?.views || 0,
      likes: editData?.likes || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{editData ? 'Edit Content' : 'Add New Content'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="Enter content title..."
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
              >
                <option value="">Select Category</option>
                <option value="Personal Finance">Personal Finance</option>
                <option value="Accounting">Accounting</option>
                <option value="Stock Market">Stock Market</option>
                <option value="Taxation">Taxation</option>
                <option value="Banking">Banking</option>
                <option value="Insurance">Insurance</option>
                <option value="Investment">Investment</option>
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="pdf">PDF / Resource</option>
                <option value="tool">Tool / Calculator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => handleChange('thumbnail', e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                  placeholder="Enter image URL..."
                />
                <label className="inline-flex px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition cursor-pointer items-center gap-2 font-medium">
                  <Upload className="w-4 h-4" />
                  Upload from Computer
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              {imagePreview && (
                <div className="w-32 h-32 border-2 border-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {formData.type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube/Vimeo Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.videoLink}
                  onChange={(e) => handleChange('videoLink', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              {errors.videoLink && <p className="text-xs text-red-500 mt-1">{errors.videoLink}</p>}
            </div>
          )}

          {formData.type === 'article' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={8}
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition resize-none"
                placeholder="Write your article content here..."
              />
              {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
            </div>
          )}

          {formData.type === 'tool' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tool/Calculator Link</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.toolLink}
                  onChange={(e) => handleChange('toolLink', e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                  placeholder="https://example.com/calculator"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => handleChange('visibility', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
            >
              <option value="public">Public</option>
              <option value="premium">Premium Only</option>
              <option value="quiz-buyers">Quiz Buyers Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              placeholder="New, Trending, Popular"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">Featured Content</p>
              <p className="text-xs text-gray-600">Show this content on homepage</p>
            </div>
            <button
              onClick={() => handleChange('isFeatured', !formData.isFeatured)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isFeatured ? 'bg-[#253A7B]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isFeatured ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium shadow-sm hover:shadow-md"
          >
            {editData ? 'Update Content' : 'Add Content'}
          </button>
        </div>
      </div>
    </div>
  );
}
