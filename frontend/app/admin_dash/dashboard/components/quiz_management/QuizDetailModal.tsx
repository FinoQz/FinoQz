'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Clock, 
  Target, 
  IndianRupee, 
  Eye, 
  Shield, 
  Globe, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Brain,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiAdmin from '@/lib/apiAdmin';

interface PreviewQuestion {
  _id: string;
  id?: string;
  text: string;
  options: string[];
  type: string;
  marks: number;
  explanation?: string;
}

interface PreviewData {
  _id: string;
  quizTitle: string;
  description: string;
  duration: number;
  totalMarks: number;
  pricingType: 'free' | 'paid';
  price: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  category?: { name: string } | string;
  questions: PreviewQuestion[];
  visibility: 'public' | 'unlisted' | 'private' | 'individual';
  attemptLimit: string;
  shuffleQuestions: boolean;
  startAt?: string;
  endAt?: string;
  participantCount: number;
}

interface QuizDetailModalProps {
  quizId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (quizId: string) => void;
}

export default function QuizDetailModal({ quizId, isOpen, onClose, onEdit }: QuizDetailModalProps) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !quizId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        // We use the admin detail endpoint which returns more info than public preview
        const response = await apiAdmin.get(`/api/quizzes/admin/quizzes/${quizId}`);
        setData(response.data?.data || response.data || null);
      } catch (err) {
        console.error('Failed to load quiz details:', err);
        setError('Failed to synchronize with central repository.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [quizId, isOpen]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'hard': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'private': return <Shield className="w-4 h-4" />;
      case 'individual': return <Users className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#253A7B] flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assessment Blueprint</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Technical Specifications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(quizId)}
                  className="px-5 py-2 bg-slate-50 hover:bg-[#253A7B] hover:text-white text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all border border-slate-100"
                >
                  Edit Blueprint
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Zap className="w-10 h-10 text-[#253A7B] animate-pulse mb-4" />
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest animate-pulse">Synchronizing Core Data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                <p className="text-slate-900 font-bold">{error}</p>
                <button onClick={onClose} className="mt-4 text-[#253A7B] text-sm font-bold underline">Close Terminal</button>
              </div>
            ) : !data ? (
              <div className="text-center py-20 text-slate-400 italic">No data records found.</div>
            ) : (
              <div className="space-y-10">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-lg border border-blue-100 bg-blue-50 text-[#253A7B] text-[10px] font-black uppercase tracking-widest">
                        {typeof data.category === 'object' ? data.category.name : (data.category || 'Standard Assessment')}
                      </span>
                      <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getDifficultyColor(data.difficultyLevel)}`}>
                        {data.difficultyLevel || 'Balanced'} Intensity
                      </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tighter">
                      {data.quizTitle}
                    </h1>
                    <p className="text-slate-500 text-[15px] leading-relaxed max-w-2xl font-medium">
                      {data.description || 'Detailed behavioral and technical diagnostics for this evaluation module.'}
                    </p>
                  </div>

                  <div className="lg:col-span-4 bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Access Status</span>
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Record</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#253A7B]">
                          {getVisibilityIcon(data.visibility)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</p>
                          <p className="text-sm font-bold text-slate-900 capitalize">{data.visibility}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              U{i}
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Participants</p>
                          <p className="text-xl font-bold text-[#253A7B]">{data.participantCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Timeframe', value: `${data.duration} MIN`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Assessment Value', value: `${data.totalMarks} MARKS`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Complexity', value: data.difficultyLevel?.toUpperCase() || 'MEDIUM', icon: Brain, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Investment', value: data.pricingType === 'free' ? 'FREE' : `₹${data.price}`, icon: IndianRupee, color: 'text-indigo-500', bg: 'bg-indigo-50' }
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-4 shadow-inner`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Configuration Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Chronometry Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Availability Start</span>
                        <span className="text-xs font-bold text-slate-900">{data.startAt ? new Date(data.startAt).toLocaleString() : 'Live Now'}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Availability End</span>
                        <span className="text-xs font-bold text-slate-900">{data.endAt ? new Date(data.endAt).toLocaleString() : 'Permanent'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Info className="w-5 h-5 text-slate-400" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Usage Protocols</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Attempt Limit</span>
                        <span className="text-xs font-bold text-[#253A7B] capitalize">{data.attemptLimit || 'Unlimited'}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Shuffle Engine</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${data.shuffleQuestions ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                          {data.shuffleQuestions ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Inventory */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#253A7B] rounded-full" />
                      <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tighter">Diagnostic Matrix</h3>
                    </div>
                    <span className="px-4 py-1.5 bg-blue-50 text-[#253A7B] text-[10px] font-black border border-blue-100 rounded-full uppercase tracking-widest">
                      {data.questions.length} Items Configured
                    </span>
                  </div>

                  <div className="space-y-6">
                    {data.questions.map((q, idx) => (
                      <div key={q._id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:border-blue-100 transition-all group">
                        <div className="flex items-start justify-between gap-6 mb-6">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs shrink-0 border border-slate-100">
                              {idx + 1}
                            </div>
                            <div className="space-y-1">
                              <p className="text-lg font-bold text-slate-900 leading-tight">{q.text}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.type || 'MCQ'}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.marks} Mark</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-14">
                          {q.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 text-xs font-bold text-slate-600">
                              <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                {String.fromCharCode(65 + i)}
                              </div>
                              {opt}
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div className="mt-8 ml-14 p-5 bg-emerald-50/30 border border-emerald-100/50 rounded-3xl flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center shrink-0">
                              <Brain className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Logic / Rationale</p>
                              <p className="text-[11px] font-medium text-emerald-800 leading-relaxed italic">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Close Technical View
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(quizId)}
                className="px-8 py-3 bg-[#253A7B] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-all"
              >
                Modify Blueprint
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </AnimatePresence>
  );
}
