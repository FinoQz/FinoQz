import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, FileText, CheckCircle, Clock } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface Quiz {
  _id: string;
  quizTitle: string;
  category: string;
  pricingType: string;
  status: string;
}

interface QuizPickerProps {
  onSelect: (quizId: string) => void;
}

export default function QuizPicker({ onSelect }: QuizPickerProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await apiAdmin.get('/api/quizzes/admin/quizzes');
        const quizData = res.data?.data || res.data || [];
        setQuizzes(Array.isArray(quizData) ? quizData : []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(q => 
    q.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#253A7B] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#253A7B] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Loading...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            No Match
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredQuizzes.map((quiz) => (
              <button
                key={quiz._id}
                onClick={() => onSelect(quiz._id)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#253A7B] transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#253A7B] transition-colors">
                      {quiz.quizTitle}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium text-gray-400">{quiz.category}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        quiz.pricingType === 'paid' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'
                      }`}>
                        {quiz.pricingType}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#253A7B] transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
