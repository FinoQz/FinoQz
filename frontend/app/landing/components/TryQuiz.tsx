'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiAdmin from '@/lib/apiAdmin';

type Question = {
  _id?: string;
  question: string;
  options: string[];
  correctIndex?: number;
};

type Category = {
  _id: string;
  name: string;
};

const LOGIN_AFTER = 5;

export default function TryQuiz() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    apiAdmin.get('api/admin/demo-quiz/public/categories')
      .then(res => {
        setCategories(res.data || []);
        setSelectedCategoryId(res.data?.[0]?._id || '');
      })
      .catch(err => console.error('Failed to load categories', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    setQuestions([]);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowLoginPrompt(false);

    apiAdmin.get(`api/admin/demo-quiz/public/quiz?categoryId=${selectedCategoryId}`)
      .then(res => setQuestions(res.data?.questions || []))
      .catch(err => console.error('Failed to load quiz', err));
  }, [selectedCategoryId]);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const correct = questions[currentQ]?.correctIndex;
    if (index === correct) setScore(s => s + 1);

    if (currentQ + 1 === LOGIN_AFTER) {
      timeoutRef.current = window.setTimeout(() => setShowLoginPrompt(true), 800);
    } else if (currentQ + 1 < questions.length) {
      timeoutRef.current = window.setTimeout(() => {
        setSelectedAnswer(null);
        setCurrentQ(q => q + 1);
      }, 900);
    } else {
      timeoutRef.current = window.setTimeout(() => setShowResults(true), 900);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setCurrentQ(q => q + 1);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowLoginPrompt(false);
  };

  const gotoLogin = () => router.push('/landing/auth/user_login/login');

  if (loading) return <div className="text-center py-20">Loading quiz...</div>;

  return (
    <section id="try-quiz" className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 space-y-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#253A7B]"> Try a Finance Quiz</h2>
          <p className="text-gray-600 mt-2">Select a category and test your knowledge - no login required</p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`px-4 py-2 rounded border text-sm ${
                selectedCategoryId === cat._id
                  ? 'bg-[#253A7B] text-white border-[#253A7B]'
                  : 'border-gray-300 text-gray-700 hover:border-[#253A7B]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Quiz Box */}
        {questions.length > 0 && !showResults && !showLoginPrompt && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#253A7B]">
                Question {currentQ + 1} of {questions.length}
              </h3>
              <span className="text-sm text-gray-500">{score} correct</span>
            </div>

            <p className="text-gray-800 font-medium">{questions[currentQ].question}</p>

            <div className="space-y-2">
              {questions[currentQ].options.map((opt, i) => {
                const isCorrect = i === questions[currentQ].correctIndex;
                const isSelected = i === selectedAnswer;
                const show = selectedAnswer !== null;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={show}
                    className={`w-full text-left px-4 py-2 rounded border transition ${
                      show
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isSelected
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300'
                        : 'border-gray-300 hover:border-[#253A7B]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && currentQ + 1 < questions.length && (
              <button
                onClick={handleNext}
                className="mt-4 bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] text-sm"
              >
                Next
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="bg-white rounded-xl shadow p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold text-[#253A7B]">Quiz Complete!</h3>
            <p className="text-gray-700">Your score: {score} / {questions.length}</p>
            <button
              onClick={handleRestart}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 text-sm"
            >
              Restart
            </button>
          </div>
        )}

        {/* Login Prompt */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
              <h4 className="text-lg font-semibold text-[#253A7B]">Continue to full quiz</h4>
              <p className="text-gray-700">
                You’ve reached {LOGIN_AFTER} questions. Login to continue and save your progress.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={gotoLogin}
                  className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 text-sm"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
