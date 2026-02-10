'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import FilterTabs from '../components/myquizes/FilterTabs';
import QuizCard, { QuizData } from '../components/myquizes/QuizCard';
import EmptyState from '../components/myquizes/EmptyState';
import ResultModal from '../components/myquizes/ResultModal';
import RetakeConfirmationModal from '../components/myquizes/RetakeConfirmationModal';
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
  const [savedQuizProgress, setSavedQuizProgress] = useState<Record<number, {
    currentQuestionIndex: number;
    answers: Record<string, number>;
    timeRemaining: number;
    flaggedQuestions: string[];
  }>>({});

  // Real API data
  const [allQuizzes, setAllQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user's quizzes from API
  useEffect(() => {
    const fetchMyQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await apiUser.get('/api/quizzes/my-quizzes');
        const quizzesData = response.data.data || [];
        
        // Transform backend data to match frontend QuizData interface
        const transformedQuizzes: QuizData[] = quizzesData.map((quiz: {
          _id: string;
          quizTitle: string;
          category: string;
          price?: number;
          duration: number;
          totalMarks?: number;
          pricingType?: string;
          attemptStatus: string;
          latestAttempt?: { score: number; submittedAt: string };
          bestScore?: number;
          totalAttempts?: number;
        }) => ({
          id: quiz._id,
          title: quiz.quizTitle,
          category: quiz.category,
          price: quiz.price || 0,
          duration: quiz.duration,
          questions: quiz.totalMarks || 0, // Using totalMarks as proxy for question count
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
          totalAttempts: quiz.totalAttempts || 0
        }));
        
        setAllQuizzes(transformedQuizzes);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        console.error('Error fetching my quizzes:', err);
        setError(error.response?.data?.message || 'Failed to load your quizzes');
        setAllQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyQuizzes();
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

  const handleQuizAction = (quizId: number, action: 'start' | 'continue' | 'view' | 'retake') => {
    const quiz = allQuizzes.find((q) => q.id === quizId);
    
    if (action === 'view' && quiz) {
      setSelectedQuizForResult(quiz);
      setShowResultModal(true);
    } else if (action === 'retake' && quiz) {
      setSelectedQuizForRetake(quiz);
      setShowRetakeModal(true);
    } else if ((action === 'start' || action === 'continue') && quiz) {
      setSelectedQuizToStart(quiz);
      setShowStartModal(true);
    }
  };

  const handleRetakeFromModal = () => {
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
        [attemptingQuiz.id]: progress
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

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">My Quizes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">View and manage your quizzes</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#253A7B] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your quizzes...</p>
          </div>
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
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">My Quizes</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              View and manage your quizzes
            </p>
          </div>

          {/* Search and Filter Row */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your quizzes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest')}
              className="appearance-none pl-4 pr-10 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition text-sm bg-white cursor-pointer font-medium"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="highest">Sort: Highest Score</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onAction={handleQuizAction} />
          ))}
        </div>
      ) : (
        <EmptyState onExplore={handleExploreClick} />
      )}

      {/* Result Modal */}
      {showResultModal && selectedQuizForResult && selectedQuizForResult.score !== undefined && (
        <ResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          quizName={selectedQuizForResult.title}
          category={selectedQuizForResult.category}
          completionDate={selectedQuizForResult.lastAttempted || 'N/A'}
          score={selectedQuizForResult.score}
          totalQuestions={selectedQuizForResult.totalQuestions || selectedQuizForResult.questions}
          correctAnswers={selectedQuizForResult.score}
          wrongAnswers={(selectedQuizForResult.totalQuestions || selectedQuizForResult.questions) - selectedQuizForResult.score}
          skippedQuestions={0}
          timeTaken="32 min"
          percentage={Math.round((selectedQuizForResult.score / (selectedQuizForResult.totalQuestions || selectedQuizForResult.questions)) * 100)}
          passed={(selectedQuizForResult.score / (selectedQuizForResult.totalQuestions || selectedQuizForResult.questions)) >= 0.4}
          rank="Top 20%"
          attemptsUsed={1}
          totalAttempts={3}
          canRetake={true}
          onRetake={handleRetakeFromModal}
          onDownloadCertificate={handleDownloadCertificate}
          onViewCertificatePreview={handleViewCertificatePreview}
          questionResults={generateQuestionResults(selectedQuizForResult)}
        />
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
          attemptsUsed={1}
          totalAttempts={3}
        />
      )}

      {/* Quiz Attempt Screen */}
      {attemptingQuiz && (
        <div className="fixed inset-0 z-50 bg-white">
          <UserQuizAttempt
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
            savedProgress={savedQuizProgress[attemptingQuiz.id]}
          />
        </div>
      )}
    </div>
  );
}
