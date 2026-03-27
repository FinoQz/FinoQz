'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Clock, AlertCircle, CheckCircle, X, Flag, Menu } from 'lucide-react';
import apiUser from '@/lib/apiUser';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  type: 'mcq' | 'true-false';
  text: string;
  options: string[];
  correctAnswer?: number | null;
  marks: number;
}

interface UserQuizAttemptProps {
  quizId?: string;
  quizData: {
    quizTitle: string;
    duration: string;
    totalMarks: string;
    negativeMarking: boolean;
    negativePerWrong: string;
  };
  mode?: 'preview' | 'full';
  questions?: Question[];
  onExit: (progress?: {
    currentQuestionIndex: number;
    answers: Record<string, number>;
    timeRemaining: number;
    flaggedQuestions: string[];
  }) => void;
  onSubmit?: (score: number, answers: Record<string, number>) => void;
  savedProgress?: {
    currentQuestionIndex: number;
    answers: Record<string, number>;
    timeRemaining: number;
    flaggedQuestions: string[];
  };
}

export default function UserQuizAttempt({
  quizId,
  quizData,
  mode = 'full',
  questions: initialQuestions,
  onExit,
  onSubmit,
  savedProgress
}: UserQuizAttemptProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedProgress?.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<Record<string, number>>(savedProgress?.answers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set(savedProgress?.flaggedQuestions || [])
  );
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [questionsLoading, setQuestionsLoading] = useState(!initialQuestions);
  const [questionsError, setQuestionsError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(
    savedProgress?.timeRemaining || parseInt(quizData.duration) * 60
  ); // in seconds
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const startAttemptOnce = useRef(false);
  const questionStartRef = useRef(Date.now());

  const normalizeQuestionType = (value: unknown): Question['type'] =>
    value === 'true-false' ? 'true-false' : 'mcq';

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setQuestionsLoading(false);
      setQuestionsError('');
    }
  }, [initialQuestions]);

  const fetchQuestions = async () => {
    if (!quizId) {
      setQuestionsError('Quiz ID is missing.');
      setQuestionsLoading(false);
      return;
    }
    try {
      setQuestionsLoading(true);
      setQuestionsError('');

      if (mode === 'preview') {
        const response = await apiUser.get(`/api/quizzes/quizzes/${quizId}/preview`);
        const preview = response.data?.data?.previewQuestions || [];
        const mapped = preview.map((q: { id?: string; _id?: string; text: string; options?: string[]; type?: string; marks?: number }, index: number) => ({
          id: String(q.id || q._id || index + 1),
          type: normalizeQuestionType(q.type),
          text: q.text,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: null,
          marks: typeof q.marks === 'number' ? q.marks : 1
        }));
        setQuestions(mapped);
      } else {
        const response = await apiUser.get(`/api/quizzes/quizzes/${quizId}/questions`);
        const fullQuestions = response.data?.data?.questions || [];
        const mapped = fullQuestions.map((q: { id?: string; _id?: string; type?: string; text: string; options?: string[]; correctAnswer?: number | null; marks?: number }, index: number) => ({
          id: String(q.id || q._id || index + 1),
          type: normalizeQuestionType(q.type),
          text: q.text,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : null,
          marks: typeof q.marks === 'number' ? q.marks : 1
        }));
        setQuestions(mapped);
      }
    } catch (err) {
      console.error('Failed to load quiz questions:', err);
      const message = err instanceof Error ? err.message : 'Failed to load quiz questions';
      setQuestionsError(message);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialQuestions) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, mode, initialQuestions]);

  useEffect(() => {
    if (mode === 'preview' || !quizId || startAttemptOnce.current) return;

    const startAttempt = async () => {
      try {
        startAttemptOnce.current = true;
        const response = await apiUser.post('/api/quiz-attempts/start', { quizId });
        setAttemptId(response.data?.attemptId || null);
      } catch (err) {
        console.error('Failed to start quiz attempt:', err);
        setSubmitError('Failed to start quiz attempt. Please try again.');
        startAttemptOnce.current = false;
      }
    };

    startAttempt();
  }, [mode, quizId]);

  useEffect(() => {
    if (currentQuestionIndex >= questions.length && questions.length > 0) {
      setCurrentQuestionIndex(questions.length - 1);
    }
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Timer
  useEffect(() => {
    if (questionsLoading || questions.length === 0 || showResult || showSubmitConfirm) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionsLoading, questions.length, showResult, showSubmitConfirm]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveAnswer = async (questionId: string, selectedAnswer: number, timeSpent: number) => {
    if (mode === 'preview' || !attemptId) return;

    try {
      await apiUser.post(`/api/quiz-attempts/${attemptId}/answer`, {
        questionId,
        selectedAnswer: String(selectedAnswer),
        timeSpent
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
    const timeSpent = Math.max(0, Math.round((Date.now() - questionStartRef.current) / 1000));
    void saveAnswer(currentQuestion.id, optionIndex, timeSpent);
  };

  const handleFlagToggle = () => {
    if (!currentQuestion) return;
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        if (typeof question.correctAnswer === 'number' && userAnswer === question.correctAnswer) {
          totalScore += question.marks;
        } else if (typeof question.correctAnswer === 'number' && quizData.negativeMarking) {
          totalScore -= parseFloat(quizData.negativePerWrong || '0');
        }
      }
    });
    return Math.max(0, totalScore);
  };

  const submitToServer = async () => {
    if (!attemptId || !quizId) {
      throw new Error('Attempt not initialized');
    }

    const answerEntries = Object.entries(answers);
    await Promise.all(
      answerEntries.map(([questionId, selectedAnswer]) =>
        apiUser.post(`/api/quiz-attempts/${attemptId}/answer`, {
          questionId,
          selectedAnswer: String(selectedAnswer),
          timeSpent: 0
        })
      )
    );

    const submitResponse = await apiUser.post(`/api/quiz-attempts/${attemptId}/submit`);
    return submitResponse.data?.attemptId || attemptId;
  };

  const handleAutoSubmit = async () => {
    if (mode === 'preview') {
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResult(true);
      onSubmit?.(finalScore, answers);
      return;
    }

    try {
      setSubmitError('');
      const submittedAttemptId = await submitToServer();
      router.push(`/user_dash/pages/QuizResult?attemptId=${submittedAttemptId}`);
    } catch (err) {
      console.error('Submit attempt failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit quiz';
      setSubmitError(message);
    }
  };

  const handleSubmitConfirm = async () => {
    setShowSubmitConfirm(false);

    if (mode === 'preview') {
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResult(true);
      onSubmit?.(finalScore, answers);
      return;
    }

    try {
      setSubmitError('');
      const submittedAttemptId = await submitToServer();
      router.push(`/user_dash/pages/QuizResult?attemptId=${submittedAttemptId}`);
    } catch (err) {
      console.error('Submit attempt failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit quiz';
      setSubmitError(message);
    }
  };

  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    // Save progress only if quiz is not completed (not showing result)
    if (!showResult) {
      const progress = {
        currentQuestionIndex,
        answers,
        timeRemaining,
        flaggedQuestions: Array.from(flaggedQuestions),
      };
      onExit(progress);
    } else {
      onExit();
    }
  };

  const getQuestionStatus = (questionId: string) => {
    if (answers[questionId] !== undefined) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'not-visited';
  };

  const correctCount = useMemo(() => (
    questions.reduce((count, question) => {
      if (typeof question.correctAnswer === 'number' && answers[question.id] === question.correctAnswer) {
        return count + 1;
      }
      return count;
    }, 0)
  ), [answers, questions]);

  const wrongCount = useMemo(() => (
    questions.reduce((count, question) => {
      if (typeof question.correctAnswer === 'number' && answers[question.id] !== undefined && answers[question.id] !== question.correctAnswer) {
        return count + 1;
      }
      return count;
    }, 0)
  ), [answers, questions]);

  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = totalQuestions - answeredCount;

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-primary)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{questionsError}</p>
          <button
            onClick={fetchQuestions}
            className="px-6 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-secondary)] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <p className="text-gray-600">No questions available for this quiz.</p>
      </div>
    );
  }

  // Result Screen
  if (showResult) {
    const percentage = ((score / parseInt(quizData.totalMarks)) * 100).toFixed(1);
    const isPassing = parseFloat(percentage) >= 40;

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isPassing ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isPassing ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <X className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isPassing ? 'Congratulations! 🎉' : 'Keep Learning! 📚'}
            </h2>
            <p className="text-gray-600">
              {isPassing ? 'You have successfully passed the quiz!' : 'Don\'t worry, practice makes perfect!'}
            </p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 text-center">
              <p className="text-sm text-blue-700 mb-1">Your Score</p>
              <p className="text-3xl font-bold text-blue-900">{score}/{quizData.totalMarks}</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 text-center">
              <p className="text-sm text-green-700 mb-1">Percentage</p>
              <p className="text-3xl font-bold text-green-900">{percentage}%</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 text-center">
              <p className="text-sm text-purple-700 mb-1">Correct</p>
              <p className="text-3xl font-bold text-purple-900">
                {correctCount}/{totalQuestions}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="p-5 bg-gray-50 rounded-xl mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quiz Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Questions</p>
                <p className="font-semibold text-gray-900">{totalQuestions}</p>
              </div>
              <div>
                <p className="text-gray-600">Attempted</p>
                <p className="font-semibold text-gray-900">{answeredCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Correct Answers</p>
                <p className="font-semibold text-green-600">
                  {correctCount}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Wrong Answers</p>
                <p className="font-semibold text-red-600">
                  {wrongCount}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExitConfirm}
              className="flex-1 px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exit Confirmation Modal
  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Exit Quiz?</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to exit? Your progress will be saved and you can continue later.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExitConfirm}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              Yes, Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submit Confirmation Modal
  if (showSubmitConfirm) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Quiz?</h3>
            <p className="text-sm text-gray-600">
              You have answered {answeredCount} out of {totalQuestions} questions.
              {notAnsweredCount > 0 && ` ${notAnsweredCount} questions are not answered.`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSubmitConfirm(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Review
            </button>
            <button
              onClick={handleSubmitConfirm}
              className="flex-1 px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{quizData.quizTitle}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Hamburger Menu for Mobile/Tablet */}
              <button
                onClick={() => setShowPalette(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                title="Question Palette"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              {/* Timer */}
              <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl ${
                timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="font-mono font-semibold text-sm sm:text-base">{formatTime(timeRemaining)}</span>
              </div>
              {/* Exit Button */}
              <button
                onClick={handleExitClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Exit Quiz"
              >
                <X className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 text-sm px-4 py-2">
          {submitError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#f9f9f9] bg-opacity-10 text-[var(--theme-primary)] rounded-lg text-sm font-medium">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-lg text-gray-900 leading-relaxed">{currentQuestion.text}</p>
                </div>
                <button
                  onClick={handleFlagToggle}
                  className={`ml-4 p-2 rounded-lg transition ${
                    flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title="Flag for review"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition ${
                      answers[currentQuestion.id] === index
                        ? 'border-[var(--theme-primary)] bg-white'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === index
                          ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === index && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="flex-1 text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
              {currentQuestionIndex === totalQuestions - 1 ? (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Question Navigator - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm lg:sticky lg:top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Question Palette</h3>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="p-2 bg-green-50 rounded-lg text-center">
                  <p className="text-green-700 font-semibold">{answeredCount}</p>
                  <p className="text-green-600">Answered</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-700 font-semibold">{notAnsweredCount}</p>
                  <p className="text-gray-600">Not Answered</p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const status = getQuestionStatus(question.id);
                  return (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionNavigate(index)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition ${
                        currentQuestionIndex === index
                          ? 'bg-[var(--theme-primary)] text-white ring-2 ring-[var(--theme-primary)] ring-offset-2'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : status === 'flagged'
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 rounded"></div>
                  <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile/Tablet Question Palette Drawer */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setShowPalette(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">Question Palette</h3>
                <button
                  onClick={() => setShowPalette(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="p-2 bg-green-50 rounded-lg text-center">
                  <p className="text-green-700 font-semibold">{answeredCount}</p>
                  <p className="text-green-600">Answered</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-700 font-semibold">{notAnsweredCount}</p>
                  <p className="text-gray-600">Not Answered</p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const status = getQuestionStatus(question.id);
                  return (
                    <button
                      key={question.id}
                      onClick={() => {
                        handleQuestionNavigate(index);
                        setShowPalette(false);
                      }}
                      className={`aspect-square rounded-lg font-semibold text-sm transition ${
                        currentQuestionIndex === index
                          ? 'bg-[var(--theme-primary)] text-white ring-2 ring-[var(--theme-primary)] ring-offset-2'
                          : status === 'answered'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : status === 'flagged'
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 rounded"></div>
                  <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
