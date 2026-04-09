'use client';

import React, { useState, useEffect } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Plus, Trash2, Save, Rocket, Loader2 } from 'lucide-react';

interface ComingSoonItem {
  id: string;
  name: string;
  timeline?: string;
}

export default function ComingSoonEditor() {
  const [items, setItems] = useState<ComingSoonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    try {
      const response = await apiAdmin.get('/api/admin/landing');
      setItems(response.data.comingSoon || []);
    } catch (error) {
      console.error('Error fetching landing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newItem: ComingSoonItem = {
      id: Date.now().toString(),
      name: 'Upcoming Feature',
      timeline: ''
    };
    setItems([...items, newItem]);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleChange = (id: string, field: keyof ComingSoonItem, value: string) => {
    setItems(items.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await apiAdmin.patch('/api/admin/landing', { comingSoon: items });
      setMessage({ type: 'success', text: 'Coming Soon list saved successfully!' });
    } catch (error: any) {
      if (error.response?.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save Coming Soon list.' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#253A7B]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Coming Soon Manager</h2>
          <p className="text-sm text-gray-500">List features that are currently in development.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Feature
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4 group">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                className="w-full bg-transparent border-b border-transparent focus:border-indigo-200 py-1 text-sm font-bold text-gray-800 focus:outline-none transition-all"
                placeholder="Feature Name"
              />
              <input
                type="text"
                value={item.timeline || ''}
                onChange={(e) => handleChange(item.id, 'timeline', e.target.value)}
                className="w-full bg-transparent border-b border-transparent focus:border-indigo-200 py-1 text-sm text-gray-500 focus:outline-none transition-all"
                placeholder="Timeline (e.g., May 2026)"
              />
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No upcoming features listed.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#253A7B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a2a5e] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Roadmap
        </button>
      </div>

      {message.text && (
        <div className={`text-center p-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
