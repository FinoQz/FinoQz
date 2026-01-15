'use client';

import React, { useState } from 'react';
import { Upload, X, Tag, Award, CheckSquare, Square } from 'lucide-react';

interface MediaAdvancedProps {
  coverImage: File | null;
  coverImagePreview: string;
  tags: string[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  saveAsDraft: boolean;
  onCoverImageChange: (file: File | null, preview: string) => void;
  onTagsChange: (tags: string[]) => void;
  onDifficultyLevelChange: (level: 'easy' | 'medium' | 'hard') => void;
  onSaveAsDraftChange: (value: boolean) => void;
}

export default function MediaAdvanced({
  coverImage,
  coverImagePreview,
  tags,
  difficultyLevel,
  saveAsDraft,
  onCoverImageChange,
  onTagsChange,
  onDifficultyLevelChange,
  onSaveAsDraftChange
}: MediaAdvancedProps) {
  const [tagInput, setTagInput] = useState('');

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onCoverImageChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onCoverImageChange(null, '');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Media & Advanced Settings</h2>
        <p className="text-sm text-gray-600">Add cover image, tags, and additional settings</p>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cover Image (Optional)
        </label>
        {coverImagePreview ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200">
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition flex items-center justify-center">
            <label className="cursor-pointer text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Click to upload cover image</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tags (Optional)
        </label>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Enter a tag"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleAddTag}
            className="px-4 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#253A7B] bg-opacity-10 text-[#253A7B] rounded-lg text-sm"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-[#253A7B] hover:bg-opacity-20 rounded-full p-0.5 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Tags help users find your quiz easier</p>
      </div>

      {/* Difficulty Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Difficulty Level <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Easy */}
          <div
            onClick={() => onDifficultyLevelChange('easy')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              difficultyLevel === 'easy'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className={`w-5 h-5 ${difficultyLevel === 'easy' ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <h4 className={`font-semibold text-sm ${difficultyLevel === 'easy' ? 'text-green-700' : 'text-gray-900'}`}>
                  Easy
                </h4>
                <p className="text-xs text-gray-600">Beginner friendly</p>
              </div>
            </div>
          </div>

          {/* Medium */}
          <div
            onClick={() => onDifficultyLevelChange('medium')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              difficultyLevel === 'medium'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className={`w-5 h-5 ${difficultyLevel === 'medium' ? 'text-yellow-600' : 'text-gray-400'}`} />
              <div>
                <h4 className={`font-semibold text-sm ${difficultyLevel === 'medium' ? 'text-yellow-700' : 'text-gray-900'}`}>
                  Medium
                </h4>
                <p className="text-xs text-gray-600">Intermediate level</p>
              </div>
            </div>
          </div>

          {/* Hard */}
          <div
            onClick={() => onDifficultyLevelChange('hard')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              difficultyLevel === 'hard'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className={`w-5 h-5 ${difficultyLevel === 'hard' ? 'text-red-600' : 'text-gray-400'}`} />
              <div>
                <h4 className={`font-semibold text-sm ${difficultyLevel === 'hard' ? 'text-red-700' : 'text-gray-900'}`}>
                  Hard
                </h4>
                <p className="text-xs text-gray-600">Advanced users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save as Draft Toggle */}
      <div
        onClick={() => onSaveAsDraftChange(!saveAsDraft)}
        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-200 rounded-lg">
            📝
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">Save as Draft</h4>
            <p className="text-xs text-gray-600">Publish later, would not be visible to users yet</p>
          </div>
        </div>
        <div className={`w-12 h-6 rounded-full transition ${
          saveAsDraft ? 'bg-[#253A7B]' : 'bg-gray-300'
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
            saveAsDraft ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </div>
      </div>
    </div>
  );
}
