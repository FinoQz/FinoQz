'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Users, TrendingUp, ArrowRight } from 'lucide-react';

type Cat = {
  name: string;
  color: string;
  quizCount: number;
  participants: number;
  totalEnroll: number;
  noQuiz: boolean;
};

function SkeletonCatCard() {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 animate-pulse border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-12 mb-2" />
      <div className="h-2 bg-gray-200 rounded w-full mb-1" />
      <div className="h-2 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

export default function CategoryParticipation() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/category-participation');
        setCategories(res.data.categories || []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxParticipants = Math.max(...categories.map(c => c.participants), 1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Category Participation</h3>
            <p className="text-[10px] text-gray-400">Enrollments by quiz category</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
          {categories.length} categories
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCatCard key={`cat-skeleton-${i}`} />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No categories found</p>
            <p className="text-xs text-gray-400 mt-0.5">Create quiz categories to see participation data</p>
          </div>
        ) : (
          <>
            {/* Scrollable grid on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const enrollPct = Math.min((cat.participants / maxParticipants) * 100, 100);
                return (
                  <div
                    key={`cat-item-${cat.name}`}
                    className="relative bg-gray-50 rounded-2xl p-3.5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden"
                  >
                    {/* Color accent left border */}
                    <div
                      className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                      style={{ background: cat.color }}
                    />
                    <div className="pl-1">
                      {/* Category dot + name */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: cat.color }}
                        />
                        <span className="text-xs font-semibold text-gray-800 truncate">{cat.name}</span>
                      </div>

                      {cat.noQuiz ? (
                        <p className="text-[10px] text-gray-400 italic">No quizzes yet</p>
                      ) : (
                        <>
                          {/* Participants */}
                          <p className="text-lg font-bold text-gray-900 leading-none tabular-nums">
                            {cat.participants.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400 mb-2">participants</p>

                          {/* Enrollment bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div
                              className="h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${enrollPct}%`, background: cat.color }}
                            />
                          </div>

                          {/* Sub-stats row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Users className="w-2.5 h-2.5" />
                              {cat.totalEnroll} enrolled
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <TrendingUp className="w-2.5 h-2.5" />
                              {cat.quizCount} quizzes
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile swipe hint */}
            {categories.length > 4 && (
              <div className="flex items-center justify-center gap-1 mt-3 sm:hidden">
                <p className="text-[10px] text-gray-400">Scroll to see all categories</p>
                <ArrowRight className="w-3 h-3 text-gray-300" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
