'use client';

import React, { useState, useEffect } from 'react';
import { Check, PlusCircle } from 'lucide-react';

interface Category {
  _id?: string;   // backend se aayega
  id?: string;    // local fallback
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

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories'); // adjust URL if deployed
        const data = await res.json();

        // ⚡️ Normalize if backend returns {data: [...]}
        const normalized = Array.isArray(data.data) ? data.data : data;
        setCategories(normalized);
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Save new category to backend
  const handleSaveCategory = async () => {
    if (customName.trim() && customDesc.trim()) {
      try {
        const res = await fetch('http://localhost:5000/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: customName.trim(), description: customDesc.trim() })
        });
        const data = await res.json();

        // ⚡️ Normalize response (handle {category: {...}} or direct object)
        const newCat: Category = {
          _id: data._id || data.category?._id,
          name: data.name || data.category?.name,
          description: data.description || data.category?.description
        };

        if (newCat._id && newCat.name) {
          setCategories(prev => [...prev, newCat]);   // ✅ new card banega
          onSelectCategory(newCat._id);
        }

        setShowForm(false);
        setCustomName('');
        setCustomDesc('');
      } catch (err) {
        console.error('❌ Error saving category:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Quiz Category</h2>
        <p className="text-sm text-gray-600">Select or create a category for this quiz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const id = category._id || category.id!;
          const isSelected = selectedCategory === id;
          return (
            <div
              key={id}
              onClick={() => onSelectCategory(id)}
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
              <h3 className={`font-semibold text-lg mb-1 ${isSelected ? 'text-[#253A7B]' : 'text-gray-900'}`}>
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
                className="w-full py-2 bg-[#253A7B] text-white rounded text-sm hover:bg-[#1a2a5e] transition"
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

      {!selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <p className="text-sm text-blue-800">Please select a category to continue</p>
        </div>
      )}
    </div>
  );
}
