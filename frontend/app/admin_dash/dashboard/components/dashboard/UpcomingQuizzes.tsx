'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, X, Tag, DollarSign, Zap, Lock, Users, Loader2 } from 'lucide-react';

interface QuizDetail {
  quizTitle: string;
  startAt: string;
  description: string;
  duration: number;
  totalMarks: number;
  pricingType: string;
  price: number;
  status: string;
  coverImage?: string;
  attemptLimit?: string;
  difficultyLevel?: string;
  visibility?: string;
  category?: { name?: string } | string;
}

interface ScheduledQuiz {
  id: string;
  title: string;
  date: string;
  time?: string;
  participants?: number;
  pricingType?: string;
  visibility?: string;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return { label: 'Today', color: 'text-red-600 bg-red-50 border-red-100' };
  if (days === 1) return { label: 'Tomorrow', color: 'text-amber-600 bg-amber-50 border-amber-100' };
  if (days <= 7) return { label: `In ${days} days`, color: 'text-blue-600 bg-blue-50 border-blue-100' };
  return { label: `In ${days}d`, color: 'text-gray-500 bg-gray-50 border-gray-100' };
}

export default function UpcomingQuizzes() {
  const [quizzes, setQuizzes] = useState<ScheduledQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/upcoming-quizzes');
        setQuizzes(res.data.upcomingQuizzes || []);
      } catch {
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedQuizId) return;
    setDetailLoading(true);
    setQuizDetail(null);
    import('@/lib/apiAdmin').then(api => {
      api.default.get(`/api/quizzes/admin/quizzes/${selectedQuizId}`)
        .then(res => setQuizDetail(res.data?.data || null))
        .catch(() => setQuizDetail(null))
        .finally(() => setDetailLoading(false));
    });
  }, [selectedQuizId]);

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-600 bg-emerald-50',
    medium: 'text-amber-600 bg-amber-50',
    hard: 'text-red-600 bg-red-50',
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Scheduled Quizzes</h3>
              <p className="text-[10px] text-gray-400">Upcoming quiz calendar</p>
            </div>
          </div>
          {!loading && quizzes.length > 0 && (
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
              {quizzes.length} scheduled
            </span>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 max-h-72">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`quiz-skeleton-${i}`} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 animate-pulse">
                <div className="w-9 h-9 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-40" />
                  <div className="h-2.5 bg-gray-100 rounded w-24" />
                </div>
                <div className="h-5 w-14 bg-gray-100 rounded-full" />
              </div>
            ))
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-blue-300" />
              </div>
              <p className="text-sm font-medium text-gray-600">No scheduled quizzes</p>
              <p className="text-xs text-gray-400 mt-0.5">Schedule a quiz to see it appear here</p>
            </div>
          ) : (
            quizzes.map((quiz, idx) => {
              const countdown = daysUntil(quiz.date);
              return (
                <div
                  key={quiz.id || `quiz-item-${idx}`}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  {/* Icon with date */}
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-blue-400 leading-none">
                      {new Date(quiz.date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-blue-700 leading-none">
                      {new Date(quiz.date).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                      {quiz.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {quiz.time && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Clock className="w-2.5 h-2.5" /> {quiz.time}
                        </span>
                      )}
                      {quiz.pricingType && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${quiz.pricingType === 'paid' ? 'text-violet-700 bg-violet-50' : 'text-emerald-700 bg-emerald-50'}`}>
                          {quiz.pricingType === 'paid' ? '₹ Paid' : 'Free'}
                        </span>
                      )}
                      {quiz.visibility === 'private' && (
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Countdown badge */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${countdown.color}`}>
                    {countdown.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-50 px-5 py-3">
          <button className="w-full py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
            View all scheduled quizzes →
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Quiz Details</h2>
              <button
                onClick={() => { setSelectedQuizId(null); setQuizDetail(null); }}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : quizDetail ? (
                <div className="space-y-4">
                  {quizDetail.coverImage && (
                    <img
                      src={quizDetail.coverImage}
                      alt="Quiz cover"
                      className="w-full h-36 object-cover rounded-xl border border-gray-100"
                    />
                  )}

                  {/* Title + badges */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{quizDetail.quizTitle}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${quizDetail.pricingType === 'paid' ? 'text-violet-700 bg-violet-50 border border-violet-100' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'}`}>
                        {quizDetail.pricingType === 'paid' ? `₹${quizDetail.price} Paid` : 'Free'}
                      </span>
                      {quizDetail.difficultyLevel && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${difficultyColor[quizDetail.difficultyLevel] || 'text-gray-600 bg-gray-50'}`}>
                          {quizDetail.difficultyLevel}
                        </span>
                      )}
                      {quizDetail.visibility && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-gray-600 bg-gray-50 border border-gray-100 capitalize">
                          {quizDetail.visibility}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${quizDetail.status === 'published' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 bg-gray-50'}`}>
                        {quizDetail.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {quizDetail.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{quizDetail.description}</p>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 rounded-xl px-3 py-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      {quizDetail.startAt && new Date(quizDetail.startAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Duration', value: `${quizDetail.duration}m`, icon: <Clock className="w-3 h-3" /> },
                      { label: 'Marks', value: quizDetail.totalMarks, icon: <Tag className="w-3 h-3" /> },
                      { label: 'Attempts', value: quizDetail.attemptLimit || '∞', icon: <Users className="w-3 h-3" /> },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 flex flex-col items-center gap-0.5">
                        <span className="text-gray-400">{s.icon}</span>
                        <span className="text-sm font-bold text-gray-900">{s.value}</span>
                        <span className="text-[10px] text-gray-500">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {quizDetail.category && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium">
                        {typeof quizDetail.category === 'object' ? quizDetail.category.name : quizDetail.category}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">Quiz details not found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
