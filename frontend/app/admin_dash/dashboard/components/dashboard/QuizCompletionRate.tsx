'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function QuizCompletionRate() {
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [totalQuizzes, setTotalQuizzes] = useState<number | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/quiz-completion-rate');
        setCompletionRate(res.data.completionRate);
        setTotalQuizzes(res.data.totalQuizzes);
        setCompletedQuizzes(res.data.completedQuizzes);
      } catch (err) {
        setCompletionRate(0);
        setTotalQuizzes(0);
        setCompletedQuizzes(0);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
      
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-white/20 rounded-lg animate-pulse">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Quiz Completion Rate</h3>
      </div>
      
      {/* Completion Rate */}
      <div className="text-4xl font-bold text-white mb-2">
        {loading ? <span className="animate-pulse">...</span> : `${completionRate}%`}
      </div>
      <p className="text-sm text-white/90 mb-4">
        {loading ? <span className="animate-pulse">...</span> : `${completedQuizzes} of ${totalQuizzes} quizzes completed`}
      </p>
      <div className="w-full bg-white/20 rounded-full h-3">
        <div
          className="bg-white/80 h-3 rounded-full transition-all duration-300"
          style={{ width: `${completionRate || 0}%` }}
        />
      </div>
    </div>
  );
}
