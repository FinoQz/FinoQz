'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Folder, ChevronRight, Hash, LayoutGrid, AlertCircle, X, Check } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  order: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
  order: number;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState<any>(null); // { type: 'category' | 'subcategory', parentId?: string, edit?: any }
  const [formData, setFormData] = useState({ name: '', icon: 'BookOpen', order: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiAdmin.get('/api/finance-content/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showAddModal.edit) {
        if (showAddModal.type === 'category') {
          await apiAdmin.put(`/api/finance-content/categories/${showAddModal.edit._id}`, formData);
        } else {
          await apiAdmin.put(`/api/finance-content/subcategories/${showAddModal.edit._id}`, formData);
        }
      } else {
        if (showAddModal.type === 'category') {
          await apiAdmin.post('/api/finance-content/categories', formData);
        } else {
          await apiAdmin.post('/api/finance-content/subcategories', { ...formData, categoryId: showAddModal.parentId });
        }
      }
      setShowAddModal(null);
      setFormData({ name: '', icon: 'BookOpen', order: 0 });
      fetchCategories();
    } catch (err) {
      alert('Error saving category');
    }
  };

  const handleDelete = async (type: 'category' | 'subcategory', id: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      if (type === 'category') await apiAdmin.delete(`/api/finance-content/categories/${id}`);
      else await apiAdmin.delete(`/api/finance-content/subcategories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting item');
    }
  };

  if (loading) return <div className="text-[12px] text-gray-400 p-8">Initializing structure...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[15px] font-bold text-gray-800 tracking-tight">System Hierarchy</h2>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-1">Manage Categories & Folders</p>
        </div>
        <button
          onClick={() => setShowAddModal({ type: 'category' })}
          className="flex items-center gap-2 px-4 py-2 bg-[#253A7B] text-white rounded-lg text-[12px] font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Root Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#253A7B]">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-800 leading-tight">{cat.name}</h3>
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1 inline-block">ROOT</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                       setShowAddModal({ type: 'category', edit: cat });
                       setFormData({ name: cat.name, icon: cat.icon, order: cat.order });
                    }}
                    className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete('category', cat._id)}
                    className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {cat.subcategories.length === 0 ? (
                  <div className="text-center py-4 border-2 border-dashed border-gray-50 rounded-xl">
                    <p className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Empty Category</p>
                  </div>
                ) : (
                  cat.subcategories.map((sub) => (
                    <div key={sub._id} className="flex justify-between items-center px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl group/sub">
                      <div className="flex items-center gap-2.5">
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                        <span className="text-[12px] font-bold text-gray-700">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                             setShowAddModal({ type: 'subcategory', parentId: cat._id, edit: sub });
                             setFormData({ name: sub.name, icon: '', order: sub.order });
                          }}
                          className="p-1 hover:bg-white rounded p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDelete('subcategory', sub._id)}
                          className="p-1 hover:bg-white rounded p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => setShowAddModal({ type: 'subcategory', parentId: cat._id })}
                  className="w-full mt-2 py-2.5 border border-dashed border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-50 hover:text-[#253A7B] hover:border-[#253A7B]/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  ADD SUBCATEGORY
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modern High-Density Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#253A7B]/10 backdrop-blur-sm" onClick={() => setShowAddModal(null)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-[14px] font-bold text-gray-800">
                  {showAddModal.edit ? 'Edit' : 'Create New'} {showAddModal.type === 'category' ? 'Category' : 'Subcategory'}
                </h3>
                <button onClick={() => setShowAddModal(null)} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-4 h-4 text-gray-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Label Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Personal Finance"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-[#253A7B]/20 rounded-2xl text-[13px] font-medium outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[13px] font-bold outline-none"
                    />
                  </div>
                  {showAddModal.type === 'category' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Theme Icon</label>
                      <select 
                        value={formData.icon} 
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[13px] font-bold outline-none"
                      >
                         <option value="BookOpen">Book</option>
                         <option value="TrendingUp">Trend</option>
                         <option value="Wallet">Wallet</option>
                         <option value="Scale">Legal</option>
                         <option value="Cpu">IT</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(null)}
                    className="flex-1 py-3.5 bg-gray-50 text-gray-500 rounded-2xl text-[12px] font-bold hover:bg-gray-100 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#253A7B] text-white rounded-2xl text-[12px] font-bold hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Commit Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
