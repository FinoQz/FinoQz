'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiAdmin from '@/lib/apiAdmin';

type Question = {
  _id?: string;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
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
  const [showReveal, setShowReveal] = useState(false);
  const [revealClicked, setRevealClicked] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setShowReveal(true);
    setRevealClicked(false);
    setShowExplanation(false);

    apiAdmin.get(`api/admin/demo-quiz/public/quiz?categoryId=${selectedCategoryId}`)
      .then(res => setQuestions(res.data?.questions || []))
      .catch(err => console.error('Failed to load quiz', err));
  }, [selectedCategoryId]);

  useEffect(() => {
    if (showResults) {
      const timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showResults]);
  
  useEffect(() => {
  if (currentQ === LOGIN_AFTER) {
    setShowResults(true);
  }
}, [currentQ]);


  const handleSelect = (index: number) => {
    if (selectedAnswer !== null || revealClicked) return;
    setSelectedAnswer(index);
    const correct = questions[currentQ]?.correctIndex;
    if (index === correct) setScore(s => s + 1);
  };

  const revealAnswer = () => {
    setRevealClicked(true);
    setSelectedAnswer(null);
  };

  const handleExplain = () => {
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowReveal(true);
    setRevealClicked(false);
    setShowExplanation(false);
    setCurrentQ(q => q + 1);
  };


  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setShowLoginPrompt(false);
    setShowReveal(true);
    setRevealClicked(false);
    setShowExplanation(false);
  };

  const gotoLogin = () => router.push('/landing/auth/user_login/login');

  if (loading) return <div className="text-center py-20">Loading quiz...</div>;

  const currentQuestion = questions[currentQ];
  const isLastQuestion = currentQ + 1 === questions.length;

  return (
    <section id="try-quiz" className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 space-y-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#253A7B]">Try a Finance Quiz</h2>
          <p className="text-gray-600 mt-2">Select a category and test your knowledge - no login required</p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`px-4 py-2 rounded border text-sm transition ${selectedCategoryId === cat._id
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
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#253A7B]">
                Question {currentQ + 1} of {questions.length}
              </h3>
              <span className="text-sm text-gray-500">{score} correct</span>
            </div>

            <p className="text-gray-800 font-medium text-lg">{currentQuestion.question}</p>

            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => {
                const isCorrect = i === currentQuestion.correctIndex;
                const isSelected = i === selectedAnswer;

                let style = 'border-gray-300 hover:border-[#253A7B]';
                if (revealClicked) {
                  style = isCorrect
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-500';
                } else if (selectedAnswer !== null) {
                  if (isSelected && isCorrect) {
                    style = 'border-green-500 bg-green-50 text-green-700';
                  } else if (isSelected && !isCorrect) {
                    style = 'border-red-500 bg-red-50 text-red-700';
                  } else if (!isSelected && isCorrect) {
                    style = 'border-green-500 bg-green-50 text-green-700';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={selectedAnswer !== null || revealClicked}
                    className={`w-full text-left px-4 py-2 rounded border transition ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 items-center mt-4">
              {showReveal && !revealClicked && (
                <button
                  onClick={revealAnswer}
                  className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 text-sm"
                >
                  Reveal Answer
                </button>
              )}

              {revealClicked && !showExplanation && (
                <button
                  onClick={handleExplain}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200 text-sm"
                >
                  Explain
                </button>
              )}

              {(selectedAnswer !== null || revealClicked) && (
                <div className="ml-auto">
                  <button
                    onClick={() => {
                      if (isLastQuestion) {
                        setShowResults(true);
                      } else {
                        handleNext();
                      }
                    }}
                    className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] text-sm"
                  >
                    {isLastQuestion ? 'Finish Quiz' : 'Next'}
                  </button>
                </div>
              )}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                <h4 className="font-semibold text-blue-700 mb-1">Explanation</h4>
                <p className="text-sm text-blue-800">
                  {currentQuestion.explanation || 'This is a placeholder explanation for the answer.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Score after 5 questions */}
        {showResults && !showLoginPrompt && (
          <div className="bg-white rounded-xl shadow p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold text-[#253A7B]">Quiz Paused</h3>
            <p className="text-gray-700">
              You’ve completed {LOGIN_AFTER} questions. Your score so far is <strong>{score} / {LOGIN_AFTER}</strong>.
            </p>
            <p className="text-gray-600 text-sm">
              Please login to continue the full quiz and save your progress.
            </p>
          </div>
        )}

        {/* Login Prompt */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
              <h4 className="text-lg font-semibold text-[#253A7B]">Continue to full quiz</h4>
              <p className="text-gray-700">
                You’ve reached the free limit of {LOGIN_AFTER} questions. Please login to unlock the full quiz and track your progress.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={gotoLogin}
                  className="bg-[#253A7B] text-white px-4 py-2 rounded hover:bg-[#1a2a5e] text-sm"
                >
                  Login
                </button>
                <button
                  onClick={handleRestart}
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
