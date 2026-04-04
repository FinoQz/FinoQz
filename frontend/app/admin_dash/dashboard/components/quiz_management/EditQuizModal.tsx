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
      [name]: ['duration', 'totalMarks', 'price'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiAdmin.put(`/api/quizzes/admin/quizzes/${quiz._id}`, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Quiz</h2>
            <p className="text-gray-500 text-xs mt-0.5">Modify properties for assessment ID: {quiz._id.slice(-6).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* General Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-[#253A7B] rounded-full" />
                <h3 className="text-sm font-semibold text-gray-900">General Information</h3>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Quiz Title</label>
                <input
                  type="text"
                  name="quizTitle"
                  value={formData.quizTitle}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 transition-all outline-none"
                  placeholder="Enter quiz title"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded-md px-4 py-2 text-sm font-normal focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 transition-all outline-none resize-none"
                  placeholder="Provide a brief overview..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Difficulty</label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-sm font-normal focus:border-[#253A7B] outline-none appearance-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] outline-none"
                    placeholder="Category"
                  />
                </div>
              </div>
            </div>

            {/* Performance & Access */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-1 h-4 bg-green-500 rounded-full" />
                 <h3 className="text-sm font-semibold text-gray-900">Performance & Access</h3>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-medium text-gray-500">Duration (Mins)</label>
                   <input
                     type="number"
                     name="duration"
                     value={formData.duration}
                     onChange={handleInputChange}
                     className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] outline-none transition-all"
                   />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Attempt Limit</label>
                    <div className="flex p-1 bg-gray-50 rounded-md border border-gray-100 gap-1">
                      {['unlimited', '1', '2', '3'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, attemptLimit: opt }))}
                          className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${formData.attemptLimit === opt ? 'bg-white text-[#253A7B] shadow-sm border border-gray-100' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          {opt === 'unlimited' ? 'Unlmtd' : `${opt}X`}
                        </button>
                      ))}
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">Pricing</label>
                    <select
                      name="pricingType"
                      value={formData.pricingType}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-sm font-normal focus:border-[#253A7B] outline-none"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  {formData.pricingType === 'paid' && (
                     <div className="space-y-1.5 animate-in slide-in-from-left-2 transition-all">
                       <label className="text-xs font-medium text-gray-500">Price (INR)</label>
                       <input
                         type="number"
                         name="price"
                         value={formData.price}
                         onChange={handleInputChange}
                         className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] outline-none"
                       />
                     </div>
                  )}
               </div>

               <div className="space-y-1.5">
                 <label className="text-xs font-medium text-gray-500">Visibility</label>
                 <div className="grid grid-cols-3 gap-2">
                    {['public', 'unlisted', 'private'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, visibility: v }))}
                        className={`py-2 rounded border text-xs font-medium transition-all ${formData.visibility === v ? 'border-[#253A7B] bg-blue-50 text-[#253A7B]' : 'border-gray-200 bg-white text-gray-400'}`}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-500">Current Status:</span>
              <div className="flex p-0.5 bg-white border border-gray-200 rounded-md">
                 <button
                   type="button"
                   onClick={() => setFormData(p => ({ ...p, status: 'published' }))}
                   className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${formData.status === 'published' ? 'bg-[#253A7B] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   Published
                 </button>
                 <button
                   type="button"
                   onClick={() => setFormData(p => ({ ...p, status: 'draft' }))}
                   className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${formData.status === 'draft' ? 'bg-[#253A7B] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   Draft
                 </button>
              </div>
           </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-md text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-[#253A7B] text-white rounded-md font-medium text-sm shadow-sm hover:bg-[#1a2a5e] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-red-600 text-white rounded-md text-xs font-medium shadow-lg animate-in slide-in-from-top-4 z-[110]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
