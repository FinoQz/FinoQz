'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Clock, FileQuestion, Calendar, Trophy, RotateCcw, Lock, CheckCircle2, ChevronRight, BarChart3, Play } from 'lucide-react';
import FilterTabs from '../components/myquizes/FilterTabs';
import QuizCard, { QuizData } from '../components/myquizes/QuizCard';
import EmptyState from '../components/myquizes/EmptyState';
import ResultModal from '../components/myquizes/ResultModal';
import RetakeConfirmationModal from '../components/RetakeConfirmationModal';
import StartQuizConfirmationModal from '../components/myquizes/StartQuizConfirmationModal';
import UserQuizAttempt from '../components/UserQuizAttempt';
import apiUser from '@/lib/apiUser';

export default function MyQuizes() {
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'free' | 'attempted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedQuizForResult, setSelectedQuizForResult] = useState<QuizData | null>(null);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [selectedQuizForRetake, setSelectedQuizForRetake] = useState<QuizData | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedQuizToStart, setSelectedQuizToStart] = useState<QuizData | null>(null);
  const [attemptingQuiz, setAttemptingQuiz] = useState<QuizData | null>(null);
  const [savedQuizProgress, setSavedQuizProgress] = useState<Record<string, {
    currentQuestionIndex: number;
    answers: Record<string, number>;
    timeRemaining: number;
    flaggedQuestions: string[];
  }>>({});

  // Real API data
  const [allQuizzes, setAllQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFetchingResult, setIsFetchingResult] = useState(false);
  const [detailedResult, setDetailedResult] = useState<any>(null);

  // Fetch user's quizzes and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [myQuizzesRes, categoriesRes] = await Promise.allSettled([
          apiUser.get('/api/quizzes/my-quizzes'),
          apiUser.get('/api/categories')
        ]);

        // Handle Categories
        const categoryList = categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data || []) : [];
        const categoryMap = new Map(categoryList.map((cat: any) => [cat._id, cat.name]));

        // Handle My Quizzes
        if (myQuizzesRes.status === 'fulfilled') {
          const quizzesData = myQuizzesRes.value.data.data || [];
          const transformedQuizzes: QuizData[] = quizzesData.map((quiz: any) => {
            // Robust category mapping: handle ID string or object
            const catId = typeof quiz.category === 'object' ? quiz.category?._id : quiz.category;
            const catNameFromMap = categoryMap.get(String(catId));
            const catName = catNameFromMap || (typeof quiz.category === 'object' ? quiz.category?.name : quiz.category);

            return {
              id: quiz._id,
              title: quiz.quizTitle,
              category: catName || 'Uncategorized',
              price: quiz.price || 0,
              duration: quiz.duration,
              questions: quiz.totalMarks || 0,
              isPaid: quiz.pricingType === 'paid' && (quiz.price ?? 0) > 0,
              isAttempted: quiz.attemptStatus !== 'not-started',
              score: quiz.latestAttempt?.score,
              totalQuestions: quiz.totalMarks || 0,
              lastAttempted: quiz.latestAttempt?.submittedAt 
                ? new Date(quiz.latestAttempt.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : undefined,
              progress: quiz.attemptStatus === 'completed' ? 100 : 
                       quiz.attemptStatus === 'in-progress' ? 50 : 0,
              bestScore: quiz.bestScore,
              totalAttempts: quiz.totalAttempts || 0,
              attemptLimit: quiz.attemptLimit === 'unlimited' ? 'unlimited' : '1',
              coverImage: quiz.coverImage,
              attemptId: quiz.latestAttempt?._id
            };
          });
          setAllQuizzes(transformedQuizzes);
        } else {
          throw new Error('Failed to load your learning portfolio');
        }
      } catch (err) {
        console.error('Initialisation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialise. Please refresh.');
        setAllQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter quizzes based on active tab and search
  const filteredQuizzes = useMemo(() => {
    let filtered = allQuizzes;

    // Apply tab filter
    if (activeTab === 'paid') {
      filtered = filtered.filter((q) => q.isPaid);
    } else if (activeTab === 'free') {
      filtered = filtered.filter((q) => !q.isPaid);
    } else if (activeTab === 'attempted') {
      filtered = filtered.filter((q) => q.isAttempted);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === 'newest') {
      filtered = [...filtered].reverse();
    } else if (sortBy === 'highest') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.score || !b.score) return 0;
        return b.score - a.score;
      });
    }

    return filtered;
  }, [activeTab, searchQuery, sortBy, allQuizzes]);

  // Calculate counts for tabs
  const counts = {
    all: allQuizzes.length,
    paid: allQuizzes.filter((q) => q.isPaid).length,
    free: allQuizzes.filter((q) => !q.isPaid).length,
    attempted: allQuizzes.filter((q) => q.isAttempted).length,
  };

  const handleQuizAction = (quizId: any, action: 'start' | 'continue' | 'view' | 'retake') => {
    const quiz = allQuizzes.find((q) => q.id === quizId);
    if (!quiz) return;

    if (action === 'view' && quiz) {
      handleViewPerformance(quiz);
    } else if (action === 'retake' && quiz) {
      if (quiz.attemptLimit !== 'unlimited') {
        return;
      }
      setSelectedQuizForRetake(quiz);
      setShowRetakeModal(true);
    } else if ((action === 'start' || action === 'continue') && quiz) {
      const isExpiredOneTime = Boolean(
        quiz.attemptLimit !== 'unlimited' && quiz.isAttempted && quiz.progress === 100
      );
  
      if (isExpiredOneTime) {
        return;
      }

      setSelectedQuizToStart(quiz);
      setShowStartModal(true);
    }
  };

  const handleViewPerformance = async (quiz: QuizData) => {
    if (!quiz.attemptId) {
      // If no attempt ID, fall back to basic info or show error
      setSelectedQuizForResult(quiz);
      setShowResultModal(true);
      return;
    }

    try {
      setIsFetchingResult(true);
      const response = await apiUser.get(`/api/quiz-attempts/${quiz.attemptId}/result`);
      if (response.data?.data) {
        setDetailedResult(response.data.data);
        setSelectedQuizForResult(quiz);
        setShowResultModal(true);
      } else {
        throw new Error('Result data not found');
      }
    } catch (err) {
      console.error('Error fetching result detail:', err);
      // Fallback
      setSelectedQuizForResult(quiz);
      setShowResultModal(true);
    } finally {
      setIsFetchingResult(false);
    }
  };

  const handleRetakeFromModal = () => {
    if (!selectedQuizForResult || selectedQuizForResult.attemptLimit !== 'unlimited') {
      return;
    }
    setShowResultModal(false);
    if (selectedQuizForResult) {
      setSelectedQuizForRetake(selectedQuizForResult);
      setShowRetakeModal(true);
    }
  };

  const handleConfirmRetake = () => {
    setShowRetakeModal(false);
    if (selectedQuizForRetake) {
      setAttemptingQuiz(selectedQuizForRetake);
      setSelectedQuizForRetake(null);
    }
  };

  const handleConfirmStart = () => {
    setShowStartModal(false);
    if (selectedQuizToStart) {
      setAttemptingQuiz(selectedQuizToStart);
      setSelectedQuizToStart(null);
    }
  };

  const handleExitQuiz = (progress?: {
    currentQuestionIndex: number;
    answers: Record<string, number>;
    timeRemaining: number;
    flaggedQuestions: string[];
  }) => {
    // Save progress if provided (quiz not completed)
    if (progress && attemptingQuiz) {
      setSavedQuizProgress(prev => ({
        ...prev,
        [String(attemptingQuiz.id)]: progress
      }));
    }
    setAttemptingQuiz(null);
  };

  const handleDownloadCertificate = () => {
    console.log('Downloading certificate...');
    // Handle certificate download
  };

  const handleViewCertificatePreview = () => {
    console.log('Viewing certificate preview...');
    // Handle certificate preview
  };

  // Generate sample question results based on quiz score
  const generateQuestionResults = (quiz: QuizData) => {
    if (!quiz.score || !quiz.totalQuestions) return [];
    
    const results = [];
    const correctCount = quiz.score;
    
    for (let i = 1; i <= quiz.totalQuestions; i++) {
      if (i <= correctCount) {
        results.push({
          questionNumber: i,
          status: 'correct' as const,
        });
      } else {
        results.push({
          questionNumber: i,
          status: 'wrong' as const,
          userAnswer: 'B',
          correctAnswer: 'A',
        });
      }
    }
    
    return results;
  };

  const handleExploreClick = () => {
    // Navigate to explore quizes page
    console.log('Navigate to explore');
  };

  // Minimalist Skeleton Loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="mb-10 animate-pulse">
          <div className="h-8 w-48 bg-gray-100 rounded-lg mb-2"></div>
          <div className="h-4 w-72 bg-gray-50 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-50"></div>
              <div className="p-4 space-y-4">
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                <div className="flex gap-4">
                  <div className="h-2.5 bg-gray-50 rounded w-1/4"></div>
                  <div className="h-2.5 bg-gray-50 rounded w-1/4"></div>
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="h-4 bg-gray-100 rounded w-12"></div>
                  <div className="h-8 bg-gray-100 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">My Quizes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">View and manage your quizzes</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          My Learning Portfolio
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Manage your enrolled courses and track your assessment performance.
        </p>
      </div>

      {/* Structured Search & Filter Bar */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-[#253A7B] transition-all text-xs sm:text-sm font-medium shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="w-full sm:flex-1 lg:w-auto overflow-hidden">
              <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
            </div>
            
            <div className="relative w-full sm:w-40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:border-[#253A7B] transition-all text-[11px] sm:text-xs font-bold text-gray-500 cursor-pointer shadow-sm"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Score</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onAction={handleQuizAction} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-2xl">
          <FileQuestion className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 mb-2">No quizzes available</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">You haven&apos;t enrolled in any quizzes yet matching your filters.</p>
          <button 
            onClick={() => window.location.href = '/user_dash/pages/Quizes'}
            className="text-xs font-bold text-[#253A7B] hover:underline"
          >
            Explore all quizzes
          </button>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && selectedQuizForResult && (
        <ResultModal
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            setDetailedResult(null);
          }}
          quizName={detailedResult?.quizTitle || selectedQuizForResult.title}
          category={selectedQuizForResult.category}
          completionDate={detailedResult?.submittedAt 
            ? new Date(detailedResult.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : (selectedQuizForResult.lastAttempted || 'N/A')}
          score={detailedResult?.totalScore ?? selectedQuizForResult.score ?? 0}
          totalQuestions={detailedResult?.totalQuestions ?? (selectedQuizForResult.totalQuestions || selectedQuizForResult.questions)}
          correctAnswers={detailedResult?.correctAnswers ?? (selectedQuizForResult.score || 0)}
          wrongAnswers={detailedResult?.incorrectAnswers ?? ((selectedQuizForResult.totalQuestions || selectedQuizForResult.questions) - (selectedQuizForResult.score || 0))}
          skippedQuestions={detailedResult?.unanswered ?? 0}
          timeTaken={detailedResult?.timeTaken ? `${Math.floor(detailedResult.timeTaken / 60)} min ${detailedResult.timeTaken % 60}s` : "32 min"}
          percentage={detailedResult?.percentage ?? Math.round(((selectedQuizForResult.score || 0) / (selectedQuizForResult.totalQuestions || selectedQuizForResult.questions)) * 100)}
          passed={detailedResult?.passed ?? ((selectedQuizForResult.score || 0) / (selectedQuizForResult.totalQuestions || selectedQuizForResult.questions)) >= 0.4}
          rank={detailedResult?.rank || "Top 20%"}
          attemptsUsed={detailedResult?.attemptNumber || selectedQuizForResult.totalAttempts || 1}
          totalAttempts={selectedQuizForResult.attemptLimit === 'unlimited' ? undefined : 1}
          canRetake={detailedResult?.allowRetake ?? (selectedQuizForResult.attemptLimit === 'unlimited')}
          onRetake={handleRetakeFromModal}
          onDownloadCertificate={handleDownloadCertificate}
          onViewCertificatePreview={handleViewCertificatePreview}
          questionResults={detailedResult?.answers?.map((ans: any, idx: number) => {
            const getAnswerValue = (val: any, options: string[]) => {
              if (!val && val !== 0) return '';
              
              if (Array.isArray(options) && options.length > 0) {
                // If val is exactly one of the options, return it as is
                if (options.includes(String(val))) return String(val);
                
                // Otherwise try treating val as a numeric index
                const numericIdx = Number(val);
                if (!isNaN(numericIdx) && numericIdx >= 0 && numericIdx < options.length) {
                  return options[numericIdx];
                }
              }
              return String(val);
            };

            return {
              questionNumber: idx + 1,
              status: ans.isCorrect ? 'correct' : 'wrong',
              userAnswer: getAnswerValue(ans.selectedAnswer, ans.options),
              correctAnswer: getAnswerValue(ans.correctAnswer, ans.options),
              questionText: ans.questionText || ans.text,
              options: ans.options || [],
              explanation: ans.explanation
            };
          }) || generateQuestionResults(selectedQuizForResult)}
        />
      )}

      {/* Loading Overlay for Fetching Result */}
      {isFetchingResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-[#253A7B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[11px] font-semibold text-[#253A7B] tracking-wide">Generating Analysis...</p>
          </div>
        </div>
      )}

      {/* Start Quiz Confirmation Modal */}
      {showStartModal && selectedQuizToStart && (
        <StartQuizConfirmationModal
          isOpen={showStartModal}
          onClose={() => {
            setShowStartModal(false);
            setSelectedQuizToStart(null);
          }}
          onConfirm={handleConfirmStart}
          quizTitle={selectedQuizToStart.title}
          category={selectedQuizToStart.category}
          duration={selectedQuizToStart.duration}
          totalQuestions={selectedQuizToStart.totalQuestions || selectedQuizToStart.questions}
          rating={4.5}
          isFree={selectedQuizToStart.price === 0}
          price={selectedQuizToStart.price}
          attemptLimit={selectedQuizToStart.attemptLimit === 'unlimited' ? 'unlimited' : '1'}
          isExpired={Boolean(selectedQuizToStart.progress === 100 && selectedQuizToStart.attemptLimit !== 'unlimited')}
        />
      )}

      {/* Retake Confirmation Modal */}
      {showRetakeModal && selectedQuizForRetake && (
        <RetakeConfirmationModal
          isOpen={showRetakeModal}
          onClose={() => {
            setShowRetakeModal(false);
            setSelectedQuizForRetake(null);
          }}
          onConfirm={handleConfirmRetake}
          quizTitle={selectedQuizForRetake.title}
          previousScore={selectedQuizForRetake.score}
          totalQuestions={selectedQuizForRetake.totalQuestions || selectedQuizForRetake.questions}
          attemptsUsed={selectedQuizForRetake.totalAttempts || 1}
          totalAttempts={selectedQuizForRetake.attemptLimit === 'unlimited' ? undefined : 1}
        />
      )}

      {/* Quiz Attempt Screen */}
      {attemptingQuiz && (
        <div className="fixed inset-0 z-50 bg-white">
          <UserQuizAttempt
            quizId={String(attemptingQuiz.id)}
            quizData={{
              quizTitle: attemptingQuiz.title,
              duration: attemptingQuiz.duration.toString(),
              totalMarks: (attemptingQuiz.totalQuestions || attemptingQuiz.questions).toString(),
              negativeMarking: false,
              negativePerWrong: '0'
            }}
            onExit={handleExitQuiz}
            onSubmit={(score, answers) => {
              console.log('Quiz submitted:', { score, answers });
              // Don't exit immediately - let user see the result screen first
              // User will click "Exit" button on result screen to go back
              
              // Clear saved progress for this quiz after submission
              setSavedQuizProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[attemptingQuiz.id];
                return newProgress;
              });
            }}
            savedProgress={savedQuizProgress[String(attemptingQuiz.id)]}
          />
        </div>
      )}
    </div>
  );
}
