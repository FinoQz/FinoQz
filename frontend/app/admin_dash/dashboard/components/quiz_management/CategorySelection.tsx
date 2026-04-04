'use client';

import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, Layout, AlertCircle } from 'lucide-react';
import { QuizData } from './CreateQuizForm';

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface CategorySelectionProps {
  quizData: QuizData;
  updateQuizData: (newData: Partial<QuizData>) => void;
  onNext?: () => void;
}

export default function CategorySelection({
  quizData,
  updateQuizData,
  onNext,
}: CategorySelectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      const data = await res.json();
      const rawCategories = Array.isArray(data.data) ? data.data : data;
      setCategories(rawCategories.map((cat: any) => ({
        _id: cat._id,
        name: cat.name,
        description: cat.description || '',
      })));
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!customName.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customName.trim(), description: customDesc.trim() }),
      });
      const data = await res.json();
      await fetchCategories();
      const newCatId = data._id || data.category?._id;
      if (newCatId) updateQuizData({ categoryId: newCatId });
      setShowForm(false);
      setCustomName('');
      setCustomDesc('');
    } catch (err) {
      setError('Failed to create category.');
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c._id !== id));
        if (quizData.categoryId === id) updateQuizData({ categoryId: '' });
      }
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <label className="block text-sm font-semibold text-gray-900 mb-6">Select Quiz Category</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const isSelected = quizData.categoryId === cat._id;
            return (
              <div
                key={cat._id}
                onClick={() => updateQuizData({ categoryId: cat._id })}
                className={`group relative text-left p-5 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'border-[#253A7B] bg-blue-50/30 ring-1 ring-[#253A7B]/10 shadow-sm' 
                    : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#253A7B] text-white' : 'bg-white border border-gray-200 text-gray-400'
                  }`}>
                    <Layout className="w-4 h-4" />
                  </div>
                  <button 
                    onClick={(e) => handleDeleteCategory(e, cat._id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="pr-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{cat.name}</h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-normal">{cat.description}</p>
                </div>
                {isSelected && <Check className="absolute top-5 right-5 w-4 h-4 text-[#253A7B]" />}
              </div>
            );
          })}
          
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white hover:border-[#253A7B]/30 transition-all gap-2 group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 group-hover:border-[#253A7B]/20 transition-all">
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#253A7B] transition-all" />
            </div>
            <span className="text-[11px] font-medium text-gray-400 group-hover:text-gray-600 transition-all">New Category</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-[#253A7B]">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Create New Category</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 ml-0.5">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Quantitative Finance"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 ml-0.5">Short Description</label>
              <input
                type="text"
                placeholder="Briefly describe this category"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md px-4 py-2.5 text-sm font-normal focus:border-[#253A7B] focus:ring-1 focus:ring-[#253A7B]/10 outline-none transition-all"
              />
            </div>
          </div>
          <div className="mt-8 flex gap-3 border-t border-gray-50 pt-6">
            <button
              onClick={handleSaveCategory}
              disabled={!customName.trim()}
              className="px-6 py-2.5 bg-[#253A7B] text-white rounded-md font-medium text-sm hover:bg-[#1a2a5e] transition-all disabled:opacity-50"
            >
              Save Category
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-md font-medium text-sm hover:bg-gray-200 transition-all border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <div className="text-center py-10 text-gray-400 font-medium text-sm animate-pulse">Loading Categories...</div>}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-md flex items-center gap-3 text-red-600 text-xs font-medium">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </div>
  );
}
