'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Brain,
  Plus,
  Edit3,
  Loader2,
  FileUp,
  FileSpreadsheet,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Database,
  Sparkles,
  HelpCircle,
  X,
  Zap,
  ArrowRight,
  type LucideIcon
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import { QuizData } from './CreateQuizForm';

type Question = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

const IMPORT_MODES = [
  { id: 'excel', label: 'Excel / CSV', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'ai', label: 'AI Genesis', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'manual', label: 'Manual', icon: Plus, color: 'text-gray-500', bg: 'bg-gray-50' },
];

interface UploadImportProps {
  quizData: QuizData;
  updateQuizData: (newData: Partial<QuizData>) => void;
  onNext?: () => void;
}

export default function UploadImport({ quizData, updateQuizData }: UploadImportProps) {
  const [activeTab, setActiveTab] = useState('excel');
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  // AI Mode States
  const [aiResource, setAiResource] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState<number | string>(5);
  const [isCustomQty, setIsCustomQty] = useState(false);

  const handleFileUpload = async (file: File, endpoint: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(endpoint.includes('pdf') ? 'pdf' : 'file', file);
      const res = await apiAdmin.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const list = res.data?.data || res.data?.questions || [];
      updateQuizData({ questions: [...quizData.questions, ...list] });
    } catch (err) {
      console.error('Import failed', err);
    } finally {
      setLoading(false);
    }
  };



  const runAiGenesis = async () => {
    if (!aiResource && !aiPrompt) return;
    setLoading(true);
    try {
      let context = '';
      if (aiResource) {
        const formData = new FormData();
        formData.append('file', aiResource);
        const extractRes = await apiAdmin.post('/api/upload/extract-text', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        context = extractRes.data?.data?.text || '';
      }

      const res = await apiAdmin.post('/api/quizzes/admin/generate-questions', {
        prompt: aiPrompt || 'Generate relevant questions',
        numQuestions: Number(numQuestions) || 5,
        topic: quizData.quizTitle,
        context
      });

      const list = res.data?.data || [];
      updateQuizData({ questions: [...quizData.questions, ...list] });
      setAiResource(null);
      setAiPrompt('');
    } catch (err) {
      console.error('AI Generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = (idx: number) => {
    const next = quizData.questions.filter((_, i) => i !== idx);
    updateQuizData({ questions: next });
    if (editingIdx === idx) setEditingIdx(null);
  };

  const updateQuestion = (idx: number, q: Question) => {
    const next = [...quizData.questions];
    next[idx] = q;
    updateQuizData({ questions: next });
    setEditingIdx(null);
  };

  const addManualQuestion = () => {
    const newQ: Question = { text: '', options: ['', '', '', ''], correct: 0, explanation: '' };
    updateQuizData({ questions: [...quizData.questions, newQ] });
    setActiveTab('manual');
    setEditingIdx(quizData.questions.length);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Dynamic Tab System */}
      <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2">
        {IMPORT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveTab(mode.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider ${activeTab === mode.id
              ? 'bg-[#253A7B] text-white shadow-lg shadow-blue-900/20 scale-[1.02]'
              : 'text-gray-400 hover:bg-gray-50'
              }`}
          >
            <mode.icon className={`w-4 h-4 ${activeTab === mode.id ? 'text-white' : mode.color}`} />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Conditional Interface Rendering */}
      <div className="min-h-[300px]">
        {activeTab === 'excel' && (
          <UploadArea
            title="Excel / CSV Spreadsheet"
            desc="Automated extraction for .xlsx and .csv records"
            icon={FileSpreadsheet}
            color="text-green-500"
            accept=".xlsx,.xls,.csv"
            loading={loading}
            onUpload={(file) => handleFileUpload(file, '/api/upload/excel')}
          />
        )}



        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            <div className="space-y-6">
              <div className="p-8 border-2 border-dashed border-blue-100 rounded-3xl bg-blue-50/20 hover:bg-white hover:border-blue-300 transition-all group relative overflow-hidden">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setAiResource(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-all">
                    {aiResource ? <CheckCircle2 className="w-7 h-7 text-green-500" /> : <FileUp className="w-7 h-7 text-blue-500" />}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    {aiResource ? aiResource.name : 'Upload Source Material'}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">PDF, Excel, or TXT for AI context</p>
                </div>
                {aiResource && (
                  <button onClick={(e) => { e.stopPropagation(); setAiResource(null); }} className="absolute top-4 right-4 p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="w-full">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Quantity</label>
                  {isCustomQty ? (
                    <div className="flex bg-white border border-gray-100 rounded-xl shadow-sm transition-all overflow-hidden focus-within:border-[#253A7B]">
                      <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        className="flex-1 w-full px-4 py-2.5 text-xs font-bold text-gray-700 outline-none bg-transparent"
                        placeholder="Enter amount..."
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                           setIsCustomQty(false);
                           if (!numQuestions || Number(numQuestions) <= 0) setNumQuestions(5);
                           if (![5, 10, 15, 20, 25, 50].includes(Number(numQuestions))) setNumQuestions(5);
                        }}
                        className="px-3 bg-gray-50 border-l border-gray-100 text-gray-400 hover:text-[#253A7B] hover:bg-blue-50 transition-all flex items-center justify-center text-[10px] font-bold"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={numQuestions}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomQty(true);
                          setNumQuestions('');
                        } else {
                          setNumQuestions(Number(e.target.value));
                        }
                      }}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none shadow-sm transition-all focus:border-[#253A7B]"
                    >
                      {[5, 10, 15, 20, 25, 50].map(n => <option key={n} value={n}>{n} Questions</option>)}
                      {(![5, 10, 15, 20, 25, 50].includes(Number(numQuestions)) && numQuestions !== '') && (
                        <option value={numQuestions}>{numQuestions} Questions</option>
                      )}
                      <option value="custom">Custom...</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full bg-white border border-gray-100 rounded-3xl p-8 relative shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h4 className="text-sm font-bold text-gray-900">AI Synthesis Core</h4>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="What specific focus should the AI maintain? (e.g., 'Focus on Chapter 4 financial technicalities')"
                className="flex-1 w-full bg-gray-50/50 rounded-2xl p-5 text-xs font-bold text-gray-700 placeholder:text-gray-300 resize-none outline-none focus:bg-white transition-all mb-6"
              />
              <button
                onClick={runAiGenesis}
                disabled={loading || (!aiResource && !aiPrompt)}
                className="w-full py-4 bg-[#253A7B] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all group"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 group-hover:fill-current" />}
                Initialize Genesis
              </button>
            </div>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <button
              onClick={addManualQuestion}
              className="w-full py-20 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-5 bg-gray-50/30 hover:bg-white hover:border-[#253A7B]/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-300 group-hover:text-[#253A7B] group-hover:border-[#253A7B]/20 group-hover:scale-110 transition-all shadow-sm">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-gray-700">Add Question Manually</h4>
                <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Single Entry Architecture</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Shared Question Pool */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#253A7B] rounded-full" />
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tighter">Current Question Pool</h4>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Validated & Staged for Launch</p>
            </div>
            {quizData.questions.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#253A7B] text-[10px] font-bold border border-blue-100">
                {quizData.questions.length} Items
              </span>
            )}
          </div>
          {quizData.questions.length > 0 && (
            <button
              onClick={() => updateQuizData({ questions: [] })}
              className="px-3 py-1.5 text-[9px] sm:text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-lg uppercase tracking-widest flex items-center gap-1.5 transition-all w-fit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All
            </button>
          )}
        </div>

        {quizData.questions.length === 0 ? (
          <div className="py-24 text-center bg-gray-50/30 border border-gray-100 rounded-3xl border-dashed">
            <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-4 animate-pulse" />
            <h5 className="text-sm font-bold text-gray-400">Void Detected</h5>
            <p className="text-[11px] font-medium text-gray-400 mt-1">Select an import mode above to populate the reactor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {(quizData.questions as Question[]).map((q, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden group hover:border-[#253A7B]/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                {editingIdx === idx ? (
                  <div className="p-3 sm:p-5">
                    <QuestionEditor
                      question={q}
                      onSave={(next) => updateQuestion(idx, next)}
                      onCancel={() => setEditingIdx(null)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-10 bg-gray-50/70 flex flex-row sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-gray-100 px-4 py-2 sm:p-2">
                      <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest sm:mb-1">Ques</span>
                      <span className="text-sm sm:text-base font-black text-[#253A7B] sm:text-gray-300">{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <p className="text-[13px] sm:text-sm font-semibold text-gray-900 leading-snug">{q.text || 'Untitled Entity'}</p>
                        <div className="flex items-center gap-1 shrink-0 bg-white sm:bg-transparent shadow-sm sm:shadow-none p-1 sm:p-0 rounded-lg sm:opacity-0 group-hover:opacity-100 transition-all border sm:border-transparent sm:-mt-1 sm:-mr-1">
                          <button
                            onClick={() => setEditingIdx(idx)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#253A7B] hover:bg-blue-50 rounded text-[10px] transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeQuestion(idx)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded text-[10px] transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {q.options.map((opt: string, i: number) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[10px] sm:text-[11px] font-semibold transition-all ${q.correct === i
                              ? 'bg-green-50/80 border-green-200 text-green-700'
                              : 'bg-gray-50/30 border-gray-100 text-gray-500'
                              }`}
                          >
                            <div className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center text-[8px] font-black ${q.correct === i ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-400'
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="flex-1">{opt || '...'}</span>
                            {q.correct === i && <ArrowRight className="w-4 h-4 ml-auto text-green-500 animate-in slide-in-from-left-2" />}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="mt-3.5 flex gap-2 p-2.5 bg-blue-50/30 rounded-lg border border-blue-50">
                          <div className="w-5 h-5 rounded flex-shrink-0 bg-white border border-blue-100 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-blue-900 uppercase tracking-widest flex items-center mt-0.5">Explanation</p>
                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UploadArea({ title, desc, icon: Icon, color, accept, onUpload, loading }: { title: string, desc: string, icon: LucideIcon, color: string, accept: string, onUpload: (file: File) => void, loading: boolean }) {
  return (
    <div className="relative group animate-in slide-in-from-top-4">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-20 bg-gray-50/30 hover:bg-white hover:border-[#253A7B]/20 transition-all cursor-pointer shadow-inner">
        <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all">
          <Icon className={`w-10 h-10 ${color}`} />
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
        <p className="text-xs text-gray-400 font-medium mb-8 max-w-[200px] text-center leading-relaxed">{desc}</p>
        <div className="flex items-center gap-3 px-6 py-2.5 bg-[#253A7B] rounded-2xl shadow-xl shadow-blue-900/20 group-hover:scale-105 transition-all">
          <UploadCloud className="w-4 h-4 text-white" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Select Target File</span>
        </div>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </label>

      {loading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl z-20">
          <div className="relative w-16 h-16">
            <Loader2 className="w-16 h-16 text-[#253A7B] animate-spin" />
            <Brain className="absolute inset-0 m-auto w-6 h-6 text-[#253A7B] animate-pulse" />
          </div>
          <p className="text-[11px] font-black text-[#253A7B] mt-6 tracking-[0.2em] uppercase">Initializing Data Extraction Reactor</p>
        </div>
      )}
    </div>
  );
}

function QuestionEditor({ question, onSave, onCancel }: { question: Question; onSave: (q: Question) => void; onCancel: () => void }) {
  const [q, setQ] = useState<Question>(question);

  return (
    <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#253A7B]/10 shadow-[0_2px_8px_rgba(37,58,123,0.05)]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[70px]">
              Question:
            </label>
            <input
              type="text"
              value={q.text}
              onChange={(e) => setQ({ ...q, text: e.target.value })}
              className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-[12px] text-gray-900 focus:bg-white focus:border-[#253A7B] outline-none transition-all"
              placeholder="Enter the question..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
            {q.options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-1.5 p-1 rounded-lg border transition-all ${q.correct === i ? 'border-[#253A7B] bg-blue-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
                <button
                  type="button"
                  onClick={() => setQ({ ...q, correct: i })}
                  className={`w-6 h-6 flex-shrink-0 rounded flex items-center justify-center text-[9px] font-black transition-all ${q.correct === i ? 'bg-[#253A7B] text-white shadow-sm' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {String.fromCharCode(65 + i)}
                </button>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...q.options];
                    next[i] = e.target.value;
                    setQ({ ...q, options: next });
                  }}
                  className="flex-1 w-full bg-transparent border-none py-1 text-[11px] sm:text-xs text-gray-700 outline-none placeholder:text-gray-300 min-w-0"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest min-w-[70px] flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Explain:
            </label>
            <input
              type="text"
              value={q.explanation}
              onChange={(e) => setQ({ ...q, explanation: e.target.value })}
              className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-[11px] sm:text-xs text-gray-600 focus:bg-white focus:border-[#253A7B] outline-none transition-all"
              placeholder="Why is it right?"
            />
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 mt-4 pt-3 border-t border-gray-50">
          <button
            type="button"
            onClick={() => onSave(q)}
            className="flex-[2] py-2 bg-[#253A7B] text-white rounded-lg text-xs font-semibold hover:bg-[#1a2a5e] transition-all text-center"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-50 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-100 hover:text-gray-700 transition-all text-center border border-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}