'use client';

import React, { useState, useEffect } from 'react';
import { Check, PlusCircle } from 'lucide-react';

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

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`);
        const data = await res.json();
        const normalized = Array.isArray(data.data) ? data.data : data;
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

    const tempId = `temp-${Date.now()}`;
    const optimisticCat: Category = {
      id: tempId,
      name: customName.trim(),
      description: customDesc.trim(),
    };

    setCategories((prev) => [...prev, optimisticCat]);
    onSelectCategory(tempId);

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

      const newCat: Category = {
        _id: data._id || data.category?._id,
        name: data.name || data.category?.name,
        description: data.description || data.category?.description,
      };

      if (newCat._id) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === tempId ? newCat : cat))
        );
        onSelectCategory(newCat._id);
      }
    } catch (err) {
      console.error('❌ Error saving category:', err);
      setCategories((prev) => prev.filter((cat) => cat.id !== tempId));
    } finally {
      setShowForm(false);
      setCustomName('');
      setCustomDesc('');
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
          {categories.map((category) => {
            const id = category._id || category.id!;
            const isSelected = selectedCategory === id;
            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectCategory(id)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectCategory(id)}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-[#253A7B] bg-white shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-[#253A7B] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
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
