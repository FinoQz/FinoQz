'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  _id: string;
  name: string;
}

interface QuizCategoryFormProps {
  onSelectCategory: (categoryId: string) => void;
}

export default function QuizCategoryForm({ onSelectCategory }: QuizCategoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/demo-quiz/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name || categories.some((c) => c.name === name)) return;

    setLoading(true);
    try {
      const res = await api.post('/admin/demo-quiz/categories', { name });
      const created: Category = res.data;
      setCategories((prev) => [...prev, created]);
      setSelected(created._id);
      onSelectCategory(created._id);
      setNewCategory('');
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (catId: string) => {
    setSelected(catId);
    onSelectCategory(catId);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Select or Create Quiz Category
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleSelect(cat._id)}
            className={`px-4 py-2 rounded border text-sm ${
              selected === cat._id
                ? 'bg-[#253A7B] text-white border-[#253A7B]'
                : 'border-gray-300 text-gray-700 hover:border-[#253A7B]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={handleAddCategory}
          disabled={loading}
          className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] transition text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
}
