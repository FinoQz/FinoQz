
import React, { useEffect, useState } from "react";
import { Calendar, Clock, X } from "lucide-react";

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

export default function UpcomingQuizzes() {
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<{ id: string; title: string; date: string; time?: string; participants?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  // Fetch quiz detail when selectedQuizId changes
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

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative">
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
          upcomingQuizzes.length === 0 ? (
            <div className="flex flex-1 min-h-[220px] h-full items-center justify-center">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Calendar className="w-12 h-12 mb-2 text-[#253A7B]/30" />
                <p className="text-base font-medium text-gray-500 mb-1">No upcoming scheduled quizzes</p>
                <p className="text-xs text-gray-400">All caught up! Scheduled quizzes will appear here.</p>
              </div>
            </div>
          ) : (
            upcomingQuizzes.map((quiz, index) => (
              <div
                key={quiz.id || index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200 cursor-pointer"
                onClick={() => setSelectedQuizId(quiz.id)}
                title="View full quiz details"
              >
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
          )
        )}
      </div>
      <button className="w-full mt-4 px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition text-sm font-medium">
        View All Scheduled
      </button>

      {/* Modal for quiz details */}
      {selectedQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md relative animate-fadeIn border border-gray-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-[#253A7B] bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition shadow"
              onClick={() => { setSelectedQuizId(null); setQuizDetail(null); }}
              aria-label="Close"
              style={{ zIndex: 10 }}
            >
              <X className="w-6 h-6" />
            </button>
            {detailLoading ? (
              <div className="py-16 text-center text-gray-500">Loading...</div>
            ) : quizDetail ? (
              <div className="p-4">
                <div className="flex flex-col items-center mb-4">
                  {quizDetail.coverImage && (
                    <img src={quizDetail.coverImage} alt="Quiz Cover" className="rounded-xl mb-2 max-h-28 object-cover w-full border border-gray-100 shadow-sm" />
                  )}
                  <h2 className="text-2xl font-bold mb-1 text-[#253A7B] text-center">{quizDetail.quizTitle}</h2>
                  <div className="mb-2 flex items-center gap-2">
                    {quizDetail.pricingType === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        Paid
                        {quizDetail.price > 0 && (
                          <span className="inline-flex items-center gap-1 ml-1 font-bold">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="#e11d48" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-2.83.48-5.48-1.51-5.96-4.34-.07-.39.24-.75.64-.75.31 0 .58.22.64.52.38 2.09 2.36 3.5 4.45 3.12 1.7-.31 2.97-1.86 2.97-3.62 0-1.93-1.57-3.5-3.5-3.5-.55 0-1-.45-1-1s.45-1 1-1c2.21 0 4 1.79 4 4 0 2.21-1.79 4-4 4-.55 0-1 .45-1 1s.45 1 1 1c2.76 0 5-2.24 5-5 0-2.21-1.79-4-4-4-.55 0-1-.45-1-1s.45-1 1-1c2.76 0 5 2.24 5 5 0 2.76-2.24 5-5 5z"/></svg>
                            ₹{quizDetail.price}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Free</span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="inline w-4 h-4" />
                      {quizDetail.startAt && new Date(quizDetail.startAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="mb-3 text-gray-700 text-sm leading-relaxed whitespace-pre-line text-center">{quizDetail.description}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 mb-1">
                  <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center">
                    <span className="font-semibold">Duration</span>
                    <span>{quizDetail.duration} min</span>
                  </div>
                  <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center">
                    <span className="font-semibold">Total Marks</span>
                    <span>{quizDetail.totalMarks}</span>
                  </div>
                  {quizDetail.attemptLimit && (
                    <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center">
                      <span className="font-semibold">Attempts</span>
                      <span>{quizDetail.attemptLimit}</span>
                    </div>
                  )}
                  {quizDetail.difficultyLevel && (
                    <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center">
                      <span className="font-semibold">Difficulty</span>
                      <span className="capitalize">{quizDetail.difficultyLevel}</span>
                    </div>
                  )}
                  {quizDetail.visibility && (
                    <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center">
                      <span className="font-semibold">Visibility</span>
                      <span className="capitalize">{quizDetail.visibility}</span>
                    </div>
                  )}
                  {quizDetail.category && (
                    <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center">
                      <span className="font-semibold">Category</span>
                      <span>{typeof quizDetail.category === 'object' ? quizDetail.category.name : quizDetail.category}</span>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center">
                    <span className="font-semibold">Status</span>
                    <span className="capitalize">{quizDetail.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">Quiz details not found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

