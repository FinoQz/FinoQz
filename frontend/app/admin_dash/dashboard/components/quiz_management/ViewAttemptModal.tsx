'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Check, XCircle, Clock, Target, User, BarChart2 } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface AttemptData {
  attemptId: string;
  name: string;
  email?: string;
  score: number;
  timeTaken: string | number;
  city?: string;
  country?: string;
  gender?: string;
  joinDate?: string | null;
}

interface QuestionRow {
  id: string;
  text: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  totalMarks: number;
  options?: string[];
  explanation?: string;
}

interface ViewAttemptModalProps {
  attemptData: AttemptData;
  onClose: () => void;
}

const fmtTime = (seconds: string | number) => {
  const secs = typeof seconds === 'string' ? parseInt(seconds, 10) : Number(seconds);
  if (isNaN(secs) || secs <= 0) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
};

export default function ViewAttemptModal({ attemptData, onClose }: ViewAttemptModalProps) {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<{ submittedAt?: string; percentage?: number; totalScore?: number; timeTaken?: number }>({});

  useEffect(() => {
    if (!attemptData.attemptId) return;

    const fetchAttemptDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiAdmin.get(`/api/quiz-attempts/${attemptData.attemptId}`);
        const att = response.data;
        setAttempt({
          submittedAt: att.submittedAt,
          percentage: att.percentage,
          totalScore: att.totalScore,
          timeTaken: att.timeTaken,
          // Enrich attemptData with details from backend if available
          userInfo: {
            city: att.userId?.city,
            country: att.userId?.country,
            gender: att.userId?.gender,
            joinDate: att.userId?.createdAt
          }
        });

        const formatted: QuestionRow[] = (att.answers || []).map((answer: {
          questionId?: { _id?: string; text?: string; marks?: number; options?: string[]; correct?: number | number[]; explanation?: string };
          selectedAnswer?: unknown;
          selectedAnswerDisplay?: string;
          correctAnswerDisplay?: string;
          isCorrect?: boolean;
          marksAwarded?: number;
        }) => {
          const q = answer.questionId;
          return {
            id: String(q?._id || ''),
            text: q?.text || 'Question text unavailable',
            userAnswer: answer.selectedAnswerDisplay ?? '—',
            correctAnswer: answer.correctAnswerDisplay ?? '—',
            isCorrect: Boolean(answer.isCorrect),
            marksAwarded: Number(answer.marksAwarded || 0),
            totalMarks: Number(q?.marks || 0),
            options: Array.isArray(q?.options) ? q.options : [],
            explanation: q?.explanation,
          };
        });
        setQuestions(formatted);
      } catch (err) {
        console.error('Failed to load attempt details:', err);
        setError('Failed to load attempt details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptData.attemptId]);

  const summary = useMemo(() => {
    const correct = questions.filter(q => q.isCorrect).length;
    const incorrect = questions.filter(q => !q.isCorrect).length;
    const totalMarks = questions.reduce((s, q) => s + q.totalMarks, 0);
    const earnedMarks = questions.reduce((s, q) => s + q.marksAwarded, 0);
    return { correct, incorrect, total: questions.length, totalMarks, earnedMarks };
  }, [questions]);

  const score = attempt.percentage ?? attemptData.score ?? 0;
  const timeTaken = attempt.timeTaken ?? attemptData.timeTaken;
  const scoreColor = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-orange-500' : 'text-red-600';
  const scoreBg = score >= 70 ? 'bg-green-50 border-green-200' : score >= 40 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#253A7B]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#253A7B]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{attemptData.name}&apos;s Attempt</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                {attemptData.email && <span className="text-xs text-gray-400 flex items-center gap-1">✉️ {attemptData.email}</span>}
                {(attemptData.city || attemptData.country) && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">📍 {attemptData.city || '—'}, {attemptData.country || '—'}</span>
                )}
                {attemptData.gender && <span className="text-xs text-gray-400 flex items-center gap-1">👤 {attemptData.gender}</span>}
                {attemptData.joinDate && <span className="text-xs text-gray-400 flex items-center gap-1">📅 Joined {new Date(attemptData.joinDate).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Stats Strip */}
          <div className="px-6 py-5 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border-2 ${scoreBg} text-center`}>
              <BarChart2 className={`w-5 h-5 mx-auto mb-1 ${scoreColor}`} />
              <p className={`text-2xl font-black ${scoreColor}`}>{typeof score === 'number' ? score.toFixed(1) : score}%</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Score</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-[#253A7B]" />
              <p className="text-2xl font-black text-gray-900">{summary.earnedMarks} <span className="text-base font-semibold text-gray-400">/ {summary.totalMarks}</span></p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Marks</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-green-100 bg-green-50 text-center">
              <Check className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-black text-green-600">{summary.correct} <span className="text-base font-semibold text-green-400">/ {summary.total}</span></p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Correct</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-gray-500" />
              <p className="text-xl font-black text-gray-900">{fmtTime(timeTaken)}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Time Taken</p>
            </div>
          </div>

          {/* Questions */}
          <div className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-[#253A7B] rounded-full inline-block" />
              Question-wise Breakdown
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 rounded-xl text-red-600 text-sm border border-red-200">{error}</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No answers recorded for this attempt.</div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className={`rounded-2xl border-2 overflow-hidden ${q.isCorrect ? 'border-green-100' : 'border-red-100'}`}
                >
                  {/* Question header */}
                  <div className={`px-5 py-3 flex items-center justify-between ${q.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Q{idx + 1}</span>
                      <span className="text-xs text-gray-400 font-medium">•</span>
                      <span className="text-xs font-semibold text-gray-600">{q.marksAwarded}/{q.totalMarks} marks</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${q.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                      {q.isCorrect ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {q.isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>

                  {/* Question body */}
                  <div className="px-5 py-4 bg-white space-y-3">
                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">{q.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl border-2 ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          User&apos;s Answer
                        </p>
                        <p className="text-sm text-gray-800 font-medium">{q.userAnswer}</p>
                      </div>
                      <div className="p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-emerald-600">Correct Answer</p>
                        <p className="text-sm text-gray-800 font-medium">{q.correctAnswer}</p>
                      </div>
                    </div>
                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex gap-2">
                        <span className="text-blue-500 text-sm">💡</span>
                        <p className="text-xs text-blue-800 leading-relaxed italic">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 px-6 py-4 bg-white flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-green-600 font-bold">✓ {summary.correct} correct</span>
            <span className="text-red-500 font-bold">✗ {summary.incorrect} incorrect</span>
            <span className="text-gray-500">{summary.total} total</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
