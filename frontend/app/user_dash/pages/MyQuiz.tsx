'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, XCircle, Trophy, Play, Filter, TrendingUp, IndianRupee } from 'lucide-react';
import apiUser from '@/lib/apiUser';

interface QuizAttempt {
  score: number;
  percentage: number;
  submittedAt: string;
  attemptNumber: number;
}

interface MyQuiz {
  _id: string;
  quizTitle: string;
  description: string;
  duration: number;
  totalMarks: number;
  pricingType: string;
  price: number;
  category: string;
  difficultyLevel: string;
  coverImage: string;
  isPurchased: boolean;
  attemptStatus: 'not-started' | 'in-progress' | 'completed';
  bestScore: number | null;
  totalAttempts: number;
  latestAttempt: QuizAttempt | null;
}

export default function MyQuiz() {
  const [quizzes, setQuizzes] = useState<MyQuiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<MyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  useEffect(() => {
    let filtered = quizzes;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.attemptStatus === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(q => q.category === categoryFilter);
    }
    
    setFilteredQuizzes(filtered);
  }, [statusFilter, categoryFilter, quizzes]);

  const fetchMyQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiUser.get('/api/quizzes/my-quizzes');
      if (response.data && Array.isArray(response.data.data)) {
        setQuizzes(response.data.data);
        setFilteredQuizzes(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch your quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const categories = new Set(quizzes.map(q => q.category));
    return Array.from(categories);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="flex items-center gap-1 text-sm text-orange-600 font-medium">
            <Clock className="w-4 h-4" />
            In Progress
          </span>
        );
      case 'not-started':
        return (
          <span className="flex items-center gap-1 text-sm text-gray-500 font-medium">
            <XCircle className="w-4 h-4" />
            Not Started
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = (quiz: MyQuiz) => {
    if (quiz.attemptStatus === 'completed') {
      return (
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          View Results
        </button>
      );
    } else if (quiz.attemptStatus === 'in-progress') {
      return (
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium text-sm flex items-center gap-2">
          <Play className="w-4 h-4" />
          Continue
        </button>
      );
    } else {
      return (
        <button className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-secondary)] transition font-medium text-sm flex items-center gap-2">
          <Play className="w-4 h-4" />
          Start Quiz
        </button>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const initiatePayment = async (quizId: string, amount: number) => {
    await apiUser.post('/api/transactions/initiate', {
      quizId,
      amount,
      paymentMethod: 'phonepe'
    });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-primary)]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">My Quizzes</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">View and manage your quiz attempts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{quizzes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {quizzes.filter(q => q.attemptStatus === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-[var(--theme-primary)] mt-1">
                {quizzes.filter(q => q.bestScore !== null).length > 0
                  ? Math.round(
                      quizzes
                        .filter(q => q.bestScore !== null)
                        .reduce((acc, q) => acc + (q.bestScore || 0), 0) /
                        quizzes.filter(q => q.bestScore !== null).length
                    )
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--theme-primary)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {getCategories().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600">
            {statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Start exploring quizzes to see them here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 w-full">
                  <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{quiz.quizTitle}</h3>
                      {quiz.isPurchased && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                          Purchased
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{quiz.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {getStatusBadge(quiz.attemptStatus)}
                      
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {quiz.duration} min
                      </span>
                      
                      {quiz.bestScore !== null && (
                        <span className="flex items-center gap-1 text-sm font-semibold text-[var(--theme-primary)]">
                          <Trophy className="w-4 h-4" />
                          Best: {quiz.bestScore}%
                        </span>
                      )}
                      
                      {quiz.totalAttempts > 0 && (
                        <span className="text-sm text-gray-500">
                          {quiz.totalAttempts} {quiz.totalAttempts === 1 ? 'attempt' : 'attempts'}
                        </span>
                      )}
                      
                      {quiz.latestAttempt && (
                        <span className="text-sm text-gray-500">
                          Last: {formatDate(quiz.latestAttempt.submittedAt)}
                        </span>
                      )}
                      
                      {!quiz.isPurchased && quiz.pricingType === 'paid' && (
                        <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                          <IndianRupee className="w-4 h-4" />
                          {quiz.price}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {quiz.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        quiz.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                        quiz.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {quiz.difficultyLevel}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-full sm:w-auto">
                  {getActionButton(quiz)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}