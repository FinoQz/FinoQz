'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BarChart3,
  Timer,
  Target,
  type LucideIcon
} from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

type PrimitiveAnswer = string | number;
type AnswerValue = PrimitiveAnswer | PrimitiveAnswer[] | null | undefined;

interface QuestionAnalysis {
  index: number;
  questionId: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: AnswerValue;
  selectedAnswer: AnswerValue;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  timeSpent: number;
  explanation: string;
}

interface AttemptAnalysis {
  attemptId: string;
  user: { name: string; email: string };
  quiz: { title: string; totalMarks: number };
  summary: {
    score: number;
    percentage: number;
    timeTaken: number;
    submittedAt: string;
    status: string;
  };
  questions: QuestionAnalysis[];
}

interface AttemptAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: string;
}

export default function AttemptAnalysisModal({ isOpen, onClose, attemptId }: AttemptAnalysisModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttemptAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiAdmin.get<AttemptAnalysis>(`/api/analytics/attempt-analysis/${attemptId}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch attempt analysis:', err);
      setError('Could not load detailed analysis');
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (isOpen && attemptId) {
      if (attemptId.startsWith('not-started-')) {
          setLoading(false);
          setError('This candidate has not started the attempt yet.');
          return;
      }
      fetchAnalysis();
    }
  }, [isOpen, attemptId, fetchAnalysis]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-[#253A7B] flex items-center justify-center text-white">
                <BarChart3 className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-900">Attempt Detail Intelligence</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{data?.user.name} • {data?.quiz.title}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
               <div className="w-8 h-8 border-2 border-[#253A7B] border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Running Deep Analysis...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
               <AlertCircle className="w-12 h-12 text-red-100 mx-auto mb-4" />
               <p className="text-sm font-medium text-gray-500">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <SummaryCard 
                    icon={Target} 
                    label="Final Score" 
                    value={`${data.summary.score}/${data.quiz.totalMarks}`} 
                    subvalue={`${data.summary.percentage}% Accuracy`}
                    color="text-blue-600"
                 />
                 <SummaryCard 
                    icon={Timer} 
                    label="Time Taken" 
                    value={`${Math.floor(data.summary.timeTaken / 60)}m ${data.summary.timeTaken % 60}s`} 
                    subvalue="Total Duration"
                    color="text-amber-600"
                 />
                 <SummaryCard 
                    icon={CheckCircle2} 
                    label="Status" 
                    value={data.summary.status.toUpperCase()} 
                    subvalue={new Date(data.summary.submittedAt).toLocaleDateString()}
                    color="text-emerald-600"
                 />
                 <SummaryCard 
                    icon={Clock} 
                    label="Speed" 
                    value={`${(data.summary.timeTaken / data.questions.length).toFixed(1)}s`} 
                    subvalue="Avg. per Question"
                    color="text-indigo-600"
                 />
              </div>

              {/* Question Breakdown */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 px-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sequence Breakdown</h4>
                 </div>

                 <div className="space-y-4">
                    {data.questions.map((q) => (
                      <div key={q.questionId} className="group border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all bg-gray-50/20">
                         <div className="p-5 flex flex-col md:flex-row gap-5">
                            {/* Q Index & Result */}
                            <div className="flex-shrink-0 flex items-start gap-4">
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                 q.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                               }`}>
                                 {q.index}
                               </div>
                               <div>
                                  {q.isCorrect ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                       <CheckCircle2 className="w-3.5 h-3.5" />
                                       <span className="text-[10px] font-bold uppercase">Correct</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-red-600">
                                       <XCircle className="w-3.5 h-3.5" />
                                       <span className="text-[10px] font-bold uppercase">Incorrect</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                                     <Timer className="w-3 h-3" />
                                     <span className="text-[10px] font-medium">{q.timeSpent}s spent</span>
                                  </div>
                               </div>
                            </div>

                            {/* Question Content */}
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-semibold text-gray-900 leading-relaxed mb-4">
                                 {q.text}
                               </p>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="p-3 bg-white border border-gray-100 rounded-lg">
                                     <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">User Selection</p>
                                     <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${q.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-bold ${q.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                          {getOptionLabel(q, q.selectedAnswer)}
                                        </span>
                                     </div>
                                  </div>

                                  <div className="p-3 bg-green-50 border border-green-100/50 rounded-lg">
                                     <p className="text-[9px] font-bold text-green-600 uppercase mb-1">Winning Path</p>
                                     <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold text-green-800">
                                          {getOptionLabel(q, q.correctAnswer)}
                                        </span>
                                     </div>
                                  </div>
                               </div>

                               {q.explanation && (
                                 <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100/50 rounded-lg flex gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-blue-800 leading-relaxed">
                                      <span className="font-bold">Logic:</span> {q.explanation}
                                    </p>
                                 </div>
                               )}
                            </div>

                            <div className="flex-shrink-0 text-right">
                               <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                                 {q.marksAwarded} / {q.maxMarks} PTS
                               </div>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm"
           >
             Close Audit
           </button>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subvalue: string;
  color: string;
}

function SummaryCard({ icon: Icon, label, value, subvalue, color }: SummaryCardProps) {
  return (
    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
       <div className="flex items-center gap-3 mb-2">
          <div className={`p-1.5 rounded-lg bg-gray-50 ${color}`}>
             <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
       </div>
       <p className="text-lg font-bold text-gray-900">{value}</p>
       <p className="text-[10px] text-gray-500 font-medium mt-0.5">{subvalue}</p>
    </div>
  );
}

function getOptionLabel(q: QuestionAnalysis, value: AnswerValue): string {
  if (value === null || value === undefined) return 'No answer submitted';
  if (Array.isArray(value)) {
    return value.map((entry) => getOptionLabel(q, entry)).join(', ');
  }
  if (q.type === 'mcq') {
    const idx = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
    if (Number.isNaN(idx)) return String(value);
    return q.options[idx] || `Option #${idx + 1}`;
  }
  return String(value);
}
