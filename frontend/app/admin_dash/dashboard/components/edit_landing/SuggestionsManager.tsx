'use client';

import React, { useState, useEffect } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Trash2, CheckCircle, Clock, Loader2, Mail, User } from 'lucide-react';

interface Suggestion {
  _id: string;
  name: string;
  email: string;
  suggestion: string;
  status: 'pending' | 'reviewed' | 'implemented';
  createdAt: string;
}

export default function SuggestionsManager() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await apiAdmin.get('/api/suggestions');
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'pending' | 'reviewed' | 'implemented') => {
    try {
      await apiAdmin.patch(`/api/suggestions/${id}`, { status });
      setSuggestions(suggestions.map(s => s._id === id ? { ...s, status } : s));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return;
    try {
      await apiAdmin.delete(`/api/suggestions/${id}`);
      setSuggestions(suggestions.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#253A7B]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Feature Suggestions</h2>
        <p className="text-sm text-gray-500">Review feedback and ideas submitted by users.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {suggestions.map((s) => (
          <div key={s._id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{s.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Mail className="w-3 h-3" />
                    {s.email || 'No email provided'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                  s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  s.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {s.status}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100">
              {s.suggestion}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(s._id, 'reviewed')}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Clock className="w-3 h-3" />
                  Mark Reviewed
                </button>
                <button
                  onClick={() => handleUpdateStatus(s._id, 'implemented')}
                  className="flex items-center gap-1 text-xs font-bold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark Implemented
                </button>
              </div>
              <button
                onClick={() => handleDelete(s._id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                title="Delete Suggestion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {suggestions.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No suggestions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
