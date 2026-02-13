import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

type Cat = {
  name: string;
  color: string;
  quizCount: number;
  participants: number;
  totalEnroll: number;
  noQuiz: boolean;
};

export default function CategoryParticipation() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/category-participation');
        setCategories(res.data.categories || []);
      } catch (err) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Category Participation</h3>
      </div>
      <div
        className="
          flex gap-2 overflow-x-auto pb-1
          sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-4 sm:overflow-x-visible
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[140px] max-w-[180px] w-full rounded-xl bg-gray-100 h-20 animate-pulse" />
            ))
          : categories.length === 0 ? (
              <div className="col-span-full text-gray-400 text-center py-8">No categories found.</div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.name}
                  className="
                    min-w-[130px] max-w-[180px] w-full
                    rounded-xl border border-gray-200 shadow p-2 sm:p-3 flex flex-col gap-0.5 sm:gap-1
                    flex-shrink-0 min-h-[80px]
                  "
                  style={{ borderTop: `3px solid ${cat.color}` }}
                >
                  <div className="flex items-center gap-1 mb-0">
                    <span
                      className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                      style={{ background: cat.color }}
                    />
                    <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">{cat.name}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-0">
                    Total quizzes: <span className="font-semibold text-gray-700">{cat.quizCount}</span>
                  </div>
                  {cat.noQuiz ? (
                    <div className="text-[10px] sm:text-xs text-gray-400 font-medium mt-0.5">No quiz posted</div>
                  ) : (
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap">
                      <span className="text-base sm:text-lg font-bold text-purple-700">{cat.participants}</span>
                      <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium">participants</span>
                      <span className="text-gray-400 mx-0.5">/</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">{cat.totalEnroll}</span>
                      <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium">enrolled</span>
                    </div>
                  )}
                </div>
              ))
            )}
      </div>
      {/* Slider hint for mobile */}
      {!loading && categories.length > 2 && (
        <div className="block sm:hidden text-xs text-gray-400 mt-2 text-center select-none">
          Swipe to see more categories &rarr;
        </div>
      )}
    </div>
  );
}
