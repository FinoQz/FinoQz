import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Timer, ChevronLeft, Target, BarChart3, AlertCircle } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';
import KpiCard from './KpiCard';
import QuizParticipantTable from './QuizParticipantTable';

interface QuizDetailAnalyticsProps {
  quizId: string;
  onBack: () => void;
}

interface QuizStats {
  quizTitle: string;
  totalAttempts: number;
  avgPercentage: number;
  avgTimeTaken: number;
  totalRevenue?: number;
  category: string;
}

export default function QuizDetailAnalytics({ quizId, onBack }: QuizDetailAnalyticsProps) {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizDetail = async () => {
      try {
        setLoading(true);
        // Fetch specific quiz aggregated stats
        const res = await apiAdmin.get(`/api/analytics/quiz-stats?quizId=${quizId}`);
        if (res.data && res.data.length > 0) {
          setStats(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch quiz stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetail();
  }, [quizId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center grayscale opacity-50">
        <div className="w-10 h-10 border-4 border-[#253A7B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Synthesizing Detailed Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 sm:pb-8">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 font-semibold text-xs uppercase tracking-widest hover:text-[#253A7B] transition-colors mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Global Analytics
          </button>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-[#253A7B]">
                <Target className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {stats?.quizTitle || 'Quiz Analytics'}
                </h1>
                <p className="text-gray-400 text-xs font-medium mt-1">Detailed performance report for this quiz</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
           <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Active Analysis</p>
        </div>
      </div>

      {/* KPI Row - Matching QuizManagement Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: stats?.totalAttempts || 0, icon: Users, color: 'text-blue-600' },
          { label: 'Avg. Accuracy', value: `${stats?.avgPercentage || 0}%`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Avg. Duration', value: `${Math.round((stats?.avgTimeTaken || 0) / 60)}m`, icon: Timer, color: 'text-amber-600' },
          { label: 'Revenue', value: stats?.totalRevenue ? `₹${stats.totalRevenue}` : 'FREE', icon: DollarSign, color: 'text-indigo-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 leading-none mt-1">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Detailed Table Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <BarChart3 className="w-4 h-4 text-[#253A7B]" />
           <h2 className="text-sm font-bold text-gray-900 uppercase">Participant Intelligence</h2>
        </div>
        <QuizParticipantTable quizId={quizId} onBack={onBack} />
      </div>
    </div>
  );
}
