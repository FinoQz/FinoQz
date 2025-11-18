'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, AlertCircle, CheckCircle, X, Flag } from 'lucide-react';

interface Question {
  id: string;
  type: 'mcq' | 'true-false';
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface QuizAttemptProps {
  quizData: {
    quizTitle: string;
    duration: string;
    totalMarks: string;
    negativeMarking: boolean;
    negativePerWrong: string;
  };
  onExit: () => void;
  onSubmit?: (score: number, answers: Record<string, number>) => void;
}

export default function QuizAttempt({ quizData, onExit, onSubmit }: QuizAttemptProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(parseInt(quizData.duration) * 60); // in seconds
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Dummy questions
  const questions: Question[] = [
    {
      id: '1',
      type: 'mcq',
      text: 'What is the primary purpose of diversification in investment?',
      options: ['To maximize returns', 'To reduce risk', 'To increase liquidity', 'To avoid taxes'],
      correctAnswer: 1,
      marks: 1
    },
    {
      id: '2',
      type: 'mcq',
      text: 'Which financial ratio measures a company\'s ability to pay short-term obligations?',
      options: ['Debt-to-equity ratio', 'Current ratio', 'Return on Equity', 'Price-to-Earnings ratio'],
      correctAnswer: 1,
      marks: 1
    },
    {
      id: '3',
      type: 'true-false',
      text: 'Compound interest is calculated only on the principal amount.',
      options: ['True', 'False'],
      correctAnswer: 1,
      marks: 1
    },
    {
      id: '4',
      type: 'mcq',
      text: 'What does ROI stand for in finance?',
      options: ['Return on Investment', 'Rate of Interest', 'Risk of Investment', 'Revenue of Industry'],
      correctAnswer: 0,
      marks: 1
    },
    {
      id: '5',
      type: 'mcq',
      text: 'Which of the following is NOT a type of mutual fund?',
      options: ['Equity Fund', 'Debt Fund', 'Fixed Deposit', 'Hybrid Fund'],
      correctAnswer: 2,
      marks: 1
    },
    {
      id: '6',
      type: 'true-false',
      text: 'A credit score above 750 is generally considered good in India.',
      options: ['True', 'False'],
      correctAnswer: 0,
      marks: 1
    },
    {
      id: '7',
      type: 'mcq',
      text: 'What is the lock-in period for ELSS (Equity Linked Savings Scheme)?',
      options: ['1 year', '2 years', '3 years', '5 years'],
      correctAnswer: 2,
      marks: 1
    },
    {
      id: '8',
      type: 'mcq',
      text: 'Which of the following is a progressive tax?',
      options: ['GST', 'Income Tax', 'Sales Tax', 'Excise Duty'],
      correctAnswer: 1,
      marks: 1
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Timer
  useEffect(() => {
    if (showResult) return;

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
  }, [showResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const handleFlagToggle = () => {
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
        if (userAnswer === question.correctAnswer) {
          totalScore += question.marks;
        } else if (quizData.negativeMarking) {
          totalScore -= parseFloat(quizData.negativePerWrong || '0');
        }
      }
    });
    return Math.max(0, totalScore);
  };

  const handleAutoSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResult(true);
    onSubmit?.(finalScore, answers);
  };

  const handleSubmitConfirm = () => {
    setShowSubmitConfirm(false);
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResult(true);
    onSubmit?.(finalScore, answers);
  };

  const getQuestionStatus = (questionId: string) => {
    if (answers[questionId] !== undefined) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'not-visited';
  };

  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = totalQuestions - answeredCount;

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
                {Object.keys(answers).filter(id => answers[id] === questions.find(q => q.id === id)?.correctAnswer).length}/{totalQuestions}
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
                  {Object.keys(answers).filter(id => answers[id] === questions.find(q => q.id === id)?.correctAnswer).length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Wrong Answers</p>
                <p className="font-semibold text-red-600">
                  {Object.keys(answers).filter(id => answers[id] !== questions.find(q => q.id === id)?.correctAnswer).length}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onExit}
              className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium"
            >
              Back to Quizzes
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
              className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{quizData.quizTitle}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              {/* Exit Button */}
              <button
                onClick={onExit}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Exit Quiz"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#253A7B] bg-opacity-10 text-[#253A7B] rounded-lg text-sm font-medium">
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
                        ? 'border-[#253A7B] bg-white'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === index
                          ? 'border-[#253A7B] bg-[#253A7B]'
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
                  className="px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24">
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
                          ? 'bg-[#253A7B] text-white ring-2 ring-[#253A7B] ring-offset-2'
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
  );
}
