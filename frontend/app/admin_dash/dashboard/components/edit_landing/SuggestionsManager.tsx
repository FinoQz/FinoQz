'use client';

import React, { useState, useEffect } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Trash2, CheckCircle, Clock, Loader2, Mail, User, FileText, Download } from 'lucide-react';
import { exportSuggestionsToExcel, exportSuggestionsToPDF, SuggestionExportRow } from '@/utils/exportUtils';

interface Suggestion {
  _id: string;
  name: string;
  email: string;
  suggestion: string;
  category: string;
  priority: string;
  status: 'pending' | 'reviewed' | 'implemented';
  createdAt: string;
}

export default function SuggestionsManager() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [isManagingOptions, setIsManagingOptions] = useState(false);
  const [newOption, setNewOption] = useState({ type: 'category' as 'category' | 'priority', value: '' });

  useEffect(() => {
    fetchSuggestions();
    fetchOptions();
  }, []);

  const handleExport = (type: 'excel' | 'pdf') => {
    const exportData: SuggestionExportRow[] = suggestions.map(s => ({
      name: s.name,
      email: s.email,
      category: s.category,
      priority: s.priority,
      suggestion: s.suggestion,
      status: s.status,
      date: s.createdAt
    }));

    if (type === 'excel') {
      exportSuggestionsToExcel(exportData, `Quiz_Improvements_${new Date().toLocaleDateString()}`);
    } else {
      exportSuggestionsToPDF(exportData, `Quiz_Improvements_${new Date().toLocaleDateString()}`);
    }
  };

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

  const fetchOptions = async () => {
    try {
      const response = await apiAdmin.get('/api/admin/landing');
      setCategories(response.data.suggestionCategories || ['Quiz Improvement', 'UI/UX', 'Performance', 'New Feature']);
      setPriorities(response.data.suggestionPriorities || ['Nice to have', 'Important', 'Critical']);
    } catch (error) {
      console.error('Error fetching options:', error);
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

  const handleSaveOptions = async (updatedCats: string[], updatedPris: string[]) => {
    try {
      await apiAdmin.patch('/api/admin/landing', {
        suggestionCategories: updatedCats,
        suggestionPriorities: updatedPris
      });
      setCategories(updatedCats);
      setPriorities(updatedPris);
    } catch (error) {
      console.error('Error saving options:', error);
      alert('Failed to save options');
    }
  };

  const addOption = () => {
    if (!newOption.value.trim()) return;
    if (newOption.type === 'category') {
      const updated = [...categories, newOption.value.trim()];
      handleSaveOptions(updated, priorities);
    } else {
      const updated = [...priorities, newOption.value.trim()];
      handleSaveOptions(categories, updated);
    }
    setNewOption({ ...newOption, value: '' });
  };

  const removeOption = (type: 'category' | 'priority', index: number) => {
    if (type === 'category') {
      const updated = categories.filter((_, i) => i !== index);
      handleSaveOptions(updated, priorities);
    } else {
      const updated = priorities.filter((_, i) => i !== index);
      handleSaveOptions(categories, updated);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#253A7B]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quiz Improvements & Suggestions</h2>
          <p className="text-sm text-gray-500">Review feedback and ideas submitted by users.</p>
        </div>
        <div className="flex items-center gap-2">
          {!isManagingOptions && (
            <>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all border border-rose-100"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </>
          )}
          <button
            onClick={() => setIsManagingOptions(!isManagingOptions)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isManagingOptions 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isManagingOptions ? 'Back to Suggestions' : 'Manage Options'}
          </button>
        </div>
      </div>

      {isManagingOptions ? (
        <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Categories Management */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Suggestion Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 group">
                    {cat}
                    <button onClick={() => removeOption('category', i)} className="text-blue-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Priorities Management */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Priority Levels
              </h3>
              <div className="flex flex-wrap gap-2">
                {priorities.map((pri, i) => (
                  <span key={i} className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-yellow-100 group">
                    {pri}
                    <button onClick={() => removeOption('priority', i)} className="text-yellow-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-600 mb-4">Add New Option</h4>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1 min-w-[150px]">
                <label className="text-xs font-bold text-gray-400">Type</label>
                <select
                  value={newOption.type}
                  onChange={e => setNewOption({ ...newOption, type: e.target.value as 'category' | 'priority' })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="category">Category</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              <div className="space-y-1 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-gray-400">Value</label>
                <input
                  type="text"
                  value={newOption.value}
                  onChange={e => setNewOption({ ...newOption, value: e.target.value })}
                  placeholder="e.g. Documentation"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={addOption}
                className="bg-[#253A7B] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#1a2a5e] transition-all h-[42px]"
              >
                Add Option
              </button>
            </div>
          </div>
        </div>
      ) : (
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
                <div className="flex flex-col items-end gap-2">
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
                  <div className="flex gap-2">
                      {s.category && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold border border-indigo-100">
                          {s.category}
                        </span>
                      )}
                      {s.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                          s.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                          s.priority === 'Important' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {s.priority}
                        </span>
                      )}
                  </div>
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
      )}
    </div>
  );
}
