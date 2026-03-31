'use client';

import React, { useEffect, useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Layout, 
  ListPlus,
  AlertCircle
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  bullets: string[];
}

export default function CategoryEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bullets: ['']
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiAdmin.get('api/admin/demo-quiz/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddBulletField = () => {
    setFormData(prev => ({ ...prev, bullets: [...prev.bullets, ''] }));
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...formData.bullets];
    newBullets[index] = value;
    setFormData(prev => ({ ...prev, bullets: newBullets }));
  };

  const handleRemoveBulletField = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      bullets: prev.bullets.filter((_, i) => i !== index) 
    }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', bullets: [''] });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      const payload = {
        ...formData,
        bullets: formData.bullets.filter(b => b.trim() !== '')
      };

      if (editingId) {
        await apiAdmin.put(`api/admin/demo-quiz/categories/${editingId}`, payload);
      } else {
        await apiAdmin.post('api/admin/demo-quiz/categories', payload);
      }
      
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all questions in this category.')) return;
    try {
      await apiAdmin.delete(`api/admin/demo-quiz/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      bullets: cat.bullets && cat.bullets.length > 0 ? cat.bullets : ['']
    });
    // Scroll to form or show modal
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-gray-400">Loading categories...</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Category Creation / Edit Form */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Basic Info */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
              <input 
                type="text"
                placeholder="e.g. Financial Markets"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
              <textarea 
                placeholder="A brief tagline for the category card..."
                rows={3}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Right Column: Bullets / Topics */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-gray-700">Key Topics / Bullets</label>
              <button 
                onClick={handleAddBulletField}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Topic
              </button>
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {formData.bullets.map((bullet, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text"
                    placeholder={`Topic ${idx + 1}`}
                    value={bullet}
                    onChange={e => handleBulletChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2 text-sm rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
                  <button 
                    onClick={() => handleRemoveBulletField(idx)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 border-t border-gray-50 pt-6">
          <button 
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-[#253A7B] text-white font-bold hover:bg-[#1a2a5e] shadow-lg shadow-blue-900/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {editingId ? 'Update Category' : 'Save Category'}
          </button>
          <button 
            onClick={resetForm}
            className="px-8 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Available Categories ({categories.length})</h3>
        </div>

        {categories.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-16 text-center">
            <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No categories created yet. Add your first one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#253A7B] flex items-center justify-center text-white">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => startEdit(cat)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#253A7B] transition-colors line-clamp-1">
                    {cat.name}
                  </h4>
                  <p className="text-sm text-gray-500 italic mb-4 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>

                  <div className="space-y-2 border-t border-gray-50 pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key Topics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.bullets && cat.bullets.length > 0 ? (
                        cat.bullets.slice(0, 4).map((b, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-gray-50 text-[10px] font-bold font-mono text-gray-600 border border-gray-100">
                            {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No topics listed</span>
                      )}
                      {cat.bullets && cat.bullets.length > 4 && (
                        <span className="text-[10px] text-gray-400 font-bold">+{cat.bullets.length - 4} more</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h5 className="text-sm font-bold text-blue-900">Pro Tip</h5>
          <p className="text-sm text-blue-800/80 mt-1">
            If you delete all categories, the Quiz Categories section on the landing page will automatically hide itself to maintain a clean look.
          </p>
        </div>
      </div>
    </div>
  );
}
