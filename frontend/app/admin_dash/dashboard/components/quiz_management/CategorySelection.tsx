'use client';

import React, { useState, useEffect } from 'react';
import { Check, PlusCircle, Trash2 } from 'lucide-react';

interface Category {
  _id?: string;
  id?: string;
  name: string;
  description: string;
}

interface CategorySelectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategorySelection({
  selectedCategory,
  onSelectCategory,
}: CategorySelectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
        const data = await res.json();
        const rawCategories = Array.isArray(data.data) ? data.data : data;
        const normalized = rawCategories.map((cat: Category) => ({
          _id: cat._id, // sirf backend ki _id use karo
          name: cat.name,
          description: cat.description,
        }));
        setCategories(normalized);
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSaveCategory = async () => {
    if (!customName.trim() || !customDesc.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName.trim(),
          description: customDesc.trim(),
        }),
      });
      const data = await res.json();

      // Fetch categories again after successful creation
      const resList = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
      const dataList = await resList.json();
      const rawCategories = Array.isArray(dataList.data) ? dataList.data : dataList;
      const normalized = rawCategories.map((cat: Category) => ({
        _id: cat._id, // sirf backend ki _id use karo
        name: cat.name,
        description: cat.description,
      }));
      setCategories(normalized);

      // Select the newly created category
      const newCatId = data._id || data.category?._id;
      if (newCatId) onSelectCategory(newCatId);
    } catch (err) {
      console.error('❌ Error saving category:', err);
      setError('Failed to create category. Please try again.');
    } finally {
      setShowForm(false);
      setCustomName('');
      setCustomDesc('');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!/^[a-f\d]{24}$/i.test(id)) return; // sirf valid MongoDB id delete karo
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
        if (selectedCategory === id) onSelectCategory('');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete category.');
      }
    } catch {
      alert('Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Quiz Category</h2>
        <p className="text-sm text-gray-600">Select or create a category for this quiz</p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading categories...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, idx) => {
            const id = category._id || category.id || `fallback-${idx}`;
            const isSelected = selectedCategory === id;
            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectCategory(id)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectCategory(id)}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                  isSelected
                    ? 'border-[#253A7B] bg-white shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Check icon if selected */}
                {isSelected && (
                  <div className="absolute top-3 right-10 w-6 h-6 bg-[#253A7B] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                {/* Delete button on hover */}
                <button
                  type="button"
                  className={`absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition ${
                    deletingId === id ? 'pointer-events-none opacity-60' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(id);
                  }}
                  disabled={deletingId === id}
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h3
                  className={`font-semibold text-lg mb-1 ${
                    isSelected ? 'text-[#253A7B]' : 'text-gray-900'
                  }`}
                >
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
              </div>
            );
          })}

          {/* Add New Category Card */}
          <div
            className={`p-5 rounded-xl border-2 border-dashed transition-all duration-300 ${
              showForm ? 'border-[#253A7B]' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {showForm ? (
              <div className="space-y-3">
                <input
                  id="category-name"
                  type="text"
                  placeholder="Category Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Category Description"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSaveCategory}
                  disabled={!customName.trim() || !customDesc.trim()}
                  className={`w-full py-2 rounded text-sm transition ${
                    customName.trim() && customDesc.trim()
                      ? 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Category
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full h-full flex flex-col items-center justify-center text-gray-600 hover:text-[#253A7B] transition"
              >
                <PlusCircle className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Add New Category</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <p className="text-sm text-blue-800">Please select a category to continue</p>
        </div>
      )}
    </div>
  );
}
