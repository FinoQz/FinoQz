'use client';

import React, { useState, useEffect } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  FileUp, 
  Sparkles, 
  Edit3,
  Layout, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import QuizQuestionForm from './quiz/QuizQuestionForm';
import QuizAIForm from './quiz/QuizAIForm';

interface Category {
  _id: string;
  name: string;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export default function DemoQuizEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<'manual' | 'ai' | 'file'>('manual');
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchQuestions(selectedCategoryId);
    } else {
      setQuestions([]);
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const res = await apiAdmin.get('api/admin/demo-quiz/categories');
      setCategories(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedCategoryId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchQuestions = async (catId: string) => {
    try {
      setFetchingQuestions(true);
      const res = await apiAdmin.get(`api/admin/demo-quiz/questions?categoryId=${catId}`);
      setQuestions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const refreshCurrentQuestions = async () => {
    if (!selectedCategoryId) return;
    await fetchQuestions(selectedCategoryId);
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await apiAdmin.delete(`api/admin/demo-quiz/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      console.error('Delete question error:', err);
    }
  };

  const handleStartEditQuestion = (question: Question) => {
    setEditingQuestion({
      ...question,
      options: Array.isArray(question.options) && question.options.length === 4
        ? question.options
        : ['', '', '', ''],
      explanation: question.explanation || '',
    });
  };

  const handleEditOptionChange = (index: number, value: string) => {
    if (!editingQuestion) return;
    const updatedOptions = [...editingQuestion.options];
    updatedOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: updatedOptions });
  };

  const handleSaveQuestionEdit = async () => {
    if (!editingQuestion) return;
    const payload = {
      question: editingQuestion.question.trim(),
      options: editingQuestion.options.map((opt) => opt.trim()),
      correctIndex: editingQuestion.correctIndex,
      explanation: (editingQuestion.explanation || '').trim(),
    };

    if (!payload.question || payload.options.some((opt) => !opt) || !payload.explanation) {
      alert('Please fill question, all 4 options, and explanation.');
      return;
    }

    try {
      setSavingEdit(true);
      const res = await apiAdmin.put(`api/admin/demo-quiz/questions/${editingQuestion._id}`, payload);
      setQuestions((prev) => prev.map((q) => (q._id === editingQuestion._id ? res.data : q)));
      setEditingQuestion(null);
    } catch (err) {
      console.error('Update question error:', err);
      alert('Failed to update question.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCategoryId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', selectedCategoryId);

    try {
      setLoading(true);
      const res = await apiAdmin.post('api/admin/demo-quiz/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Imported ${res.data.data.length} questions!`);
      fetchQuestions(selectedCategoryId);
    } catch (err: unknown) {
      console.error('File upload error:', err);
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to process file. Only Excel and CSV files are supported.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Selector Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Select Category to Manage Quiz</label>
        <div className="relative group max-w-md">
          <select 
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full appearance-none px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer font-bold text-gray-800"
          >
            {categories.length === 0 && <option value="">No categories found</option>}
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
        </div>
      </div>

      {selectedCategoryId ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Side: Addition Panel (5/12 cols) */}
          <div className="xl:col-span-12 lg:col-span-12 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              {/* Internal Mode Switcher */}
              <div className="flex p-1.5 bg-gray-50 rounded-2xl w-fit mb-8 border border-gray-100">
                <button
                  onClick={() => setMode('manual')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    mode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Plus className="w-4 h-4" /> Manual
                </button>
                <button
                  onClick={() => setMode('file')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    mode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FileUp className="w-4 h-4" /> File Import
                </button>
                <button
                  onClick={() => setMode('ai')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    mode === 'ai' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> AI Magic
                </button>
              </div>

              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {mode === 'manual' && (
                    <motion.div key="manual" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <QuizQuestionForm categoryId={selectedCategoryId} onQuestionsUpdated={refreshCurrentQuestions} />
                    </motion.div>
                  )}
                  
                  {mode === 'file' && (
                    <motion.div key="file" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <div className="space-y-6">
                        <div className="text-center p-12 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 hover:bg-gray-50 transition-all group">
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <FileUp className="w-8 h-8" />
                          </div>
                          <h4 className="text-lg font-bold text-gray-800">Upload Excel or CSV</h4>
                          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">We will automatically extract questions and add them to this category.</p>
                          <input 
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            className="hidden" 
                            id="file-upload" 
                            onChange={handleFileUpload} 
                            disabled={loading}
                          />
                          <button 
                            onClick={() => document.getElementById('file-upload')?.click()}
                            disabled={loading}
                            className="mt-6 px-10 py-3.5 rounded-2xl bg-white border border-gray-200 text-[#253A7B] font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                          >
                            {loading ? 'Processing...' : 'Select File'}
                          </button>
                        </div>
                        
                        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex gap-4">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <p className="text-xs text-blue-800 leading-relaxed font-bold italic">
                            Tip: Only Excel/CSV files are supported. Use columns: question, optionA/option1, optionB/option2, optionC/option3, optionD/option4, correct (1-4 or A-D), explanation.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {mode === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <QuizAIForm categoryId={selectedCategoryId} onQuestionsUpdated={refreshCurrentQuestions} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom Side: Current Questions (Full Width) */}
          <div className="xl:col-span-12 lg:col-span-12">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                    <Layout className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Current Questions ({questions.length})</h3>
                </div>
              </div>

              {fetchingQuestions ? (
                <div className="py-20 text-center animate-pulse text-gray-400 font-bold">Scanning database...</div>
              ) : questions.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-gray-100 rounded-3xl">
                  <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">No questions added yet for this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {questions.map((q, idx) => (
                    <div key={q._id} className="group p-5 rounded-2xl bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Q{idx + 1}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleStartEditQuestion(q)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-4 line-clamp-2 leading-relaxed">{q.question}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 border transition-all ${
                              q.correctIndex === oIdx 
                                ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' 
                                : 'bg-white border-gray-100 text-gray-500'
                            }`}
                          >
                            {q.correctIndex === oIdx && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                            <span className="line-clamp-1">{opt}</span>
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="mt-3 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 leading-relaxed">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-red-900">No Category Selected</h4>
          <p className="text-red-800/60 max-w-sm mx-auto mt-2">Please select or create a category in the Categories tab first to manage its quiz questions.</p>
        </div>
      )}

      <AnimatePresence>
        {editingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              <h4 className="text-xl font-bold text-gray-900 mb-6">Edit Question</h4>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Question</label>
                  <textarea
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Options and Correct Answer</label>
                  {editingQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="edit-correct-option"
                        checked={editingQuestion.correctIndex === i}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: i })}
                        className="accent-[#253A7B]"
                      />
                      <input
                        type="text"
                        value={opt}
                        placeholder={`Option ${i + 1}`}
                        onChange={(e) => handleEditOptionChange(i, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Explanation</label>
                  <textarea
                    value={editingQuestion.explanation || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditingQuestion(null)}
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestionEdit}
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#253A7B] text-white font-semibold hover:bg-[#1a2a5e] transition-all disabled:opacity-60"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
