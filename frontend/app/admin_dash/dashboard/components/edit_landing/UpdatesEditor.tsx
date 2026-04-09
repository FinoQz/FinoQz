'use client';

import React, { useState, useEffect } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Plus, Trash2, Save, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

interface UpdateItem {
  id: string;
  date: string;
  title: string;
  description: string;
}

export default function UpdatesEditor() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    try {
      const response = await apiAdmin.get('/api/admin/landing');
      setUpdates(response.data.updates || []);
    } catch (error) {
      console.error('Error fetching landing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const newItem: UpdateItem = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: 'New Update',
      description: ''
    };
    setUpdates([newItem, ...updates]);
  };

  const handleDelete = (id: string) => {
    setUpdates(updates.filter(u => u.id !== id));
  };

  const handleChange = (id: string, field: keyof UpdateItem, value: string) => {
    setUpdates(updates.map(u => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await apiAdmin.patch('/api/admin/landing', { updates });
      setMessage({ type: 'success', text: 'Updates saved successfully!' });
    } catch (error: any) {
      if (error.response?.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save updates.' });
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
          <h2 className="text-xl font-bold text-gray-800">New Updates Manager</h2>
          <p className="text-sm text-gray-500">Add and manage feature updates shown on the landing page.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Update
        </button>
      </div>

      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4 relative group">
            <button
              onClick={() => handleDelete(update.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Update Title</label>
                <input
                  type="text"
                  value={update.title}
                  onChange={(e) => handleChange(update.id, 'title', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="e.g., AI Weakness Analysis"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Release Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={update.date.split('T')[0]}
                    onChange={(e) => handleChange(update.id, 'date', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Description</label>
              <textarea
                value={update.description}
                onChange={(e) => handleChange(update.id, 'description', e.target.value)}
                rows={2}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                placeholder="Briefly describe what's new..."
              />
            </div>
          </div>
        ))}

        {updates.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No updates yet. Click "Add Update" to begin.</p>
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
          Save All Updates
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
