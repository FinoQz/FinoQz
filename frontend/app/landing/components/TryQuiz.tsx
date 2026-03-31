'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import apiAdmin from '@/lib/apiAdmin';
import { Button } from '@/components/ui/button';

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

export default function TryQuiz() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [showResults, setShowResults] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [showReveal, setShowReveal] = useState(true);
  const [revealClicked, setRevealClicked] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Safety for Portals & Prefetching
  useEffect(() => {
    setMounted(true);
    // Prefetch auth routes for near-instant transitions later
    router.prefetch('/landing/auth/user_login/login');
    router.prefetch('/landing/auth/user_signup/signup');
  }, [router]);

  // Body Scroll Lock when Modals are Open (Aggressive)
  useEffect(() => {
    const isModalOpen = showLoginPrompt || showResults;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, [showLoginPrompt, showResults]);

  useEffect(() => {
    let active = true;
    apiAdmin.get('/api/admin/demo-quiz/public/categories')
      .then(res => {
        if (!active) return;
        setCategories(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedCategoryId(res.data[0]._id);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (selectedCategoryId) {
      setLoading(true);
      apiAdmin.get(`/api/admin/demo-quiz/public/quiz?categoryId=${selectedCategoryId}`)
        .then(res => {
          if (!active) return;
          setQuestions(res.data?.questions || []);
          setCurrentQ(0);
          setScore(0);
          setSelectedAnswer(null);
          setShowResults(false);
          setShowLoginPrompt(false);
          setShowReveal(true);
          setRevealClicked(false);
          setShowExplanation(false);
        })
        .catch(console.error)
        .finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => { active = false; };
  }, [selectedCategoryId]);

  const handleSelect = (idx: number) => {
    if (selectedAnswer !== null || revealClicked) return;
    setSelectedAnswer(idx);
    setShowReveal(false);

    if (questions[currentQ].correctIndex === idx) {
      setScore(s => s + 1);
    }
  };

  const revealAnswer = () => {
    if (selectedAnswer !== null) return;
    setRevealClicked(true);
    setShowReveal(false);
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

  const gotoLogin = () => {
    handleRestart();
    router.push('/landing/auth/user_login/login');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 60;
    const y = (e.clientY / window.innerHeight - 0.5) * 60;
    setMousePos({ x, y });
  };

  const currentQuestion = questions[currentQ];
  const isLastQuestion = currentQ + 1 === questions.length;
  const hideOuterLayout = showResults || showLoginPrompt;

  return (
    <section
      id="try-quiz"
      className={`pt-12 pb-4 bg-transparent relative overflow-hidden transition-all duration-500 ${hideOuterLayout ? 'z-[1000]' : 'z-10'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden flex justify-center items-center">
        <motion.div animate={{ x: mousePos.x * -1, y: mousePos.y * -1 }} transition={{ type: "spring", stiffness: 50, damping: 20 }} className="absolute inset-0 w-full h-full">
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }} className="absolute w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-[120px] left-[5%] top-[5%]" />
        </motion.div>
        <motion.div animate={{ x: mousePos.x, y: mousePos.y }} transition={{ type: "spring", stiffness: 40, damping: 25 }} className="absolute inset-0 w-full h-full">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }} className="absolute w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-[120px] right-[5%] bottom-[5%]" />
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-8 relative z-10">
        <AnimatePresence>
          {!hideOuterLayout && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center mt-28 md:mt-32 mb-4" animate={{ x: mousePos.x * 0.1, y: mousePos.y * 0.1 }} transition={{ type: "spring", stiffness: 100, damping: 30 }}>
              <div className="flex items-center gap-3 mb-2">
                <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz Logo" width={48} height={48} priority unoptimized />
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-800">FinoQz</h1>
              </div>
              <p className="text-sm md:text-base font-medium tracking-wide text-gray-500 mb-6">
                Test and improve your <span className="font-medium text-[#253A7B]">investment IQ</span>
              </p>

              <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4">
                <div className="w-full flex items-center flex-nowrap overflow-x-auto gap-2 pb-2 justify-start md:justify-center scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
                  <span className="text-sm text-gray-500 mr-2 shrink-0">Quiz Categories:</span>
                  {categories.map(cat => (
                    <button key={cat._id} onClick={() => setSelectedCategoryId(cat._id)} disabled={loading} className={`shrink-0 px-3 py-1.5 rounded-md border text-xs transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${selectedCategoryId === cat._id ? 'border-[#253A7B] text-[#253A7B] bg-white/80 shadow-md backdrop-blur-sm font-medium' : 'border-gray-200/50 bg-white/40 text-gray-600 hover:border-gray-300 hover:bg-white/60'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/50 shadow-sm text-blue-700 text-xs font-medium uppercase tracking-widest backdrop-blur-md">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></div>Try Free Quiz
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!hideOuterLayout && (
          loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl max-w-2xl mx-auto shadow-sm min-h-[300px]">
              <div className="w-8 h-8 border-4 border-[#253A7B]/20 border-t-[#253A7B] rounded-full animate-spin mb-4"></div>
              <p className="text-[#253A7B] font-medium text-sm animate-pulse">Gathering questions...</p>
            </div>
          ) : questions.length > 0 && !showResults && (
            <motion.div key={currentQ} initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm p-5 md:p-6 space-y-4 max-w-2xl mx-auto relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#253A7B]/20 to-transparent"></div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100/50">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100/50 text-[#253A7B] font-medium text-xs">{currentQ + 1}</span>
                  <span className="text-gray-400 font-medium text-xs">of {questions.length}</span>
                </div>
                <div className="px-2 py-1 bg-green-50/50 border border-green-100 text-green-700 rounded-full text-[10px] font-medium uppercase tracking-wider">Score: {score}</div>
              </div>
              <h3 className="text-gray-900 font-medium text-lg md:text-xl leading-snug">{currentQuestion.question}</h3>
              <div className="space-y-2">
                {currentQuestion.options.map((opt, i) => {
                  const isCorrect = i === currentQuestion.correctIndex;
                  const isSelected = i === selectedAnswer;
                  let style = 'border-white/60 hover:border-blue-300 hover:-translate-y-0.5 bg-white/70 text-gray-700';
                  if (revealClicked) { style = isCorrect ? 'border-green-400 bg-green-50 text-green-800' : isSelected ? 'border-red-300 bg-red-50 text-red-700 opacity-80' : 'border-gray-200 bg-gray-50/50 text-gray-400 opacity-60'; }
                  else if (selectedAnswer !== null) { style = (isSelected && isCorrect) ? 'border-green-400 bg-green-50 text-green-800' : (isSelected && !isCorrect) ? 'border-red-400 bg-red-50 text-red-800' : (!isSelected && isCorrect) ? 'border-green-400 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50/50 text-gray-400 opacity-60'; }
                  const labels = ['A', 'B', 'C', 'D'];
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={selectedAnswer !== null || revealClicked} className={`w-full flex items-center p-3 rounded-2xl border transition-all duration-300 ease-out ${style}`}>
                      <span className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg font-medium text-[10px] mr-3 transition-colors ${((revealClicked || selectedAnswer !== null) && isCorrect) ? 'bg-green-200 text-green-900' : (selectedAnswer !== null && isSelected && !isCorrect) ? 'bg-red-200 text-red-900' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50'}`}>{labels[i]}</span>
                      <span className="text-left text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 flex flex-col gap-3">
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-2xl">
                      <h4 className="font-medium text-[#253A7B] text-sm mb-1">💡 Why?</h4>
                      <p className="text-xs text-blue-900/80 leading-relaxed font-medium">{currentQuestion.explanation || 'This is the correct choice based on solid financial principles.'}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    {showReveal && !revealClicked && selectedAnswer === null && <button onClick={revealAnswer} className="text-yellow-700 bg-yellow-100/50 hover:bg-yellow-200/80 border border-yellow-200 px-4 py-2 rounded-xl font-medium text-xs transition-colors">Reveal Answer</button>}
                    {(revealClicked || selectedAnswer !== null) && !showExplanation && <button onClick={handleExplain} className="text-[#253A7B] bg-blue-100/50 hover:bg-blue-200/80 border border-blue-200 px-4 py-2 rounded-xl font-medium text-xs transition-colors">Show Explanation</button>}
                  </div>
                  {(selectedAnswer !== null || revealClicked) && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if (isLastQuestion) setShowResults(true); else handleNext(); }} className="bg-[#253A7B] text-white px-6 py-2.5 rounded-xl font-medium uppercase tracking-wider text-[10px] shadow-sm hover:shadow-md transition-all ml-auto">
                      {isLastQuestion ? 'Finish Quiz ✨' : 'Next Question ➔'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        )}

        {mounted && typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {showResults && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/10 backdrop-blur-[8px] flex items-center justify-center z-[99999] p-6">
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[2.25rem] shadow-[0_40px_80px_-30px_rgba(37,58,123,0.1)] p-6 w-full max-w-[240px] text-center space-y-4 relative overflow-hidden">
                  <button onClick={() => { setShowResults(false); handleRestart(); }} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-medium tracking-[0.4em] text-blue-500 uppercase">IQ Assessment</span>
                    <h2 className="text-base font-medium text-gray-800 tracking-tight">Your Score</h2>
                  </div>
                  <div className="relative inline-flex items-center justify-center p-5 bg-gray-50/50 rounded-full border border-gray-100">
                    <div className="text-4xl font-medium text-[#253A7B] tracking-tighter tabular-nums leading-none">
                      {score}<span className="text-gray-300 font-light text-2xl mx-1">/</span><span className="text-gray-400">{questions.length}</span>
                    </div>
                  </div>
                  <div className="space-y-4 pt-1">
                    <button onClick={() => { setShowResults(false); setShowLoginPrompt(true); }} className="w-full bg-[#253A7B] text-white py-2.5 rounded-xl hover:bg-[#1a2a5e] text-[8px] font-medium uppercase tracking-[0.2em] transition-all shadow-md active:scale-95">Continue</button>
                    <div className="flex flex-col gap-2">
                      <div className="w-full bg-gray-100/50 h-0.5 rounded-full overflow-hidden relative">
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 7, ease: "linear" }} className="absolute top-0 left-0 h-full bg-blue-500/40" />
                      </div>
                      <p className="text-[8px] font-medium text-gray-300 tracking-[0.1em]">Generating personal report...</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {mounted && typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {showLoginPrompt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/10 backdrop-blur-[8px] flex items-center justify-center z-[99999] p-6">
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[2.25rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.08)] p-8 w-full max-w-[300px] space-y-6 relative">
                  <button onClick={() => { setShowLoginPrompt(false); handleRestart(); }} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="text-center space-y-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm shadow-blue-100">
                      <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz" width={20} height={20} unoptimized />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-medium text-gray-900 tracking-tight text-center">Access Locked</h4>
                      <p className="text-gray-400 text-[10px] leading-relaxed font-normal text-center px-4">Sign in to access more quizzes</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button 
                      asChild
                      className="w-full bg-[#253A7B] text-white py-3.5 rounded-2xl hover:bg-[#1a2a5e] text-[10px] font-medium uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 h-auto"
                      onClick={() => handleRestart()}
                    >
                      <Link href="/landing/auth/user_login/login">
                        Sign In Now
                      </Link>
                    </Button>
                    <p className="text-center text-[9px] text-gray-400 font-normal tracking-wide">
                      New here?{' '}
                      <Link 
                        href="/landing/auth/user_signup/signup"
                        className="text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() => handleRestart()}
                      >
                        Create Free Account
                      </Link>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </section>
  );
}
