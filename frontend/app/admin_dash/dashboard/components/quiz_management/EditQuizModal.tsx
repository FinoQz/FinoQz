'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Quiz {
  _id: string;
  quizTitle: string;
  description: string;
  duration: number;
  totalMarks: number;
  price: number;
  pricingType: 'free' | 'paid';
  attemptLimit: string;
  difficultyLevel: string;
  category: string;
  visibility: string;
  status: 'published' | 'draft';
}

interface EditQuizModalProps {
  quiz: Quiz;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditQuizModal({ quiz, onClose, onSuccess }: EditQuizModalProps) {
  const [formData, setFormData] = useState({
    quizTitle: quiz.quizTitle || '',
    description: quiz.description || '',
    duration: quiz.duration || 30,
    totalMarks: quiz.totalMarks || 100,
    price: quiz.price || 0,
    pricingType: quiz.pricingType || 'free',
    attemptLimit: quiz.attemptLimit || 'unlimited',
    difficultyLevel: quiz.difficultyLevel || 'medium',
    category: quiz.category || '',
    visibility: quiz.visibility || 'public',
    status: quiz.status || 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'totalMarks' || name === 'price' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiAdmin.put(`/api/quizzes/admin/quizzes/${quiz._id}`, formData);
      if (response.status >= 200 && response.status < 300) {
        onSuccess();
        onClose();
      } else {
        setError(response.data?.message || 'Failed to update quiz');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'An error occurred while updating the quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Quiz</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                id="quizTitle"
                name="quizTitle"
                value={formData.quizTitle}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                placeholder="Enter quiz description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                  placeholder="e.g., Finance, Mathematics"
                />
              </div>

              <div>
                <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficultyLevel"
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quiz Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks *
                </label>
                <input
                  type="number"
                  id="totalMarks"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="attemptLimit" className="block text-sm font-medium text-gray-700 mb-2">
                  Attempt Limit
                </label>
                <select
                  id="attemptLimit"
                  name="attemptLimit"
                  value={formData.attemptLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                >
                  <option value="unlimited">Unlimited</option>
                  <option value="1">1 Attempt</option>
                  <option value="2">2 Attempts</option>
                  <option value="3">3 Attempts</option>
                  <option value="5">5 Attempts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pricingType" className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Type
                </label>
                <select
                  id="pricingType"
                  name="pricingType"
                  value={formData.pricingType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {formData.pricingType === 'paid' && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Visibility & Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Visibility & Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#253A7B] focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
