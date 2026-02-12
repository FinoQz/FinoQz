import React, { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

export default function UpcomingQuizzes() {
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<{ title: string; date: string; time?: string; participants?: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/upcoming-quizzes');
        setUpcomingQuizzes(res.data.upcomingQuizzes || []);
      } catch (err) {
        setUpcomingQuizzes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Scheduled Quizzes</h3>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
              <div className="w-12 h-12 bg-[#253A7B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#253A7B]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm mb-1">...</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    ...
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ...
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          upcomingQuizzes.map((quiz, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200">
              <div className="w-12 h-12 bg-[#253A7B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#253A7B]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm mb-1">{quiz.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(quiz.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {quiz.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <button className="w-full mt-4 px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition text-sm font-medium">
        View All Scheduled
      </button>
    </div>
  );
}

