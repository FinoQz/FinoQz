'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, Clock, FileQuestion, X, CreditCard, Smartphone, Wallet, CheckCircle, Info, Play, Lock, Unlock, ChevronRight } from 'lucide-react';
import UserQuizAttempt from '../components/UserQuizAttempt';
import QuizPreview from '../components/QuizPreview';
import apiUser from '@/lib/apiUser';

interface Quiz {
  _id: string;
  quizTitle: string;
  category: string;
  price: number;
  duration: number;
  totalMarks: number;
  coverImage: string;
  pricingType: 'free' | 'paid';
  status: string;
  difficultyLevel?: string;
  tags?: string[];
  createdAt: string;
  isPurchased?: boolean;
  attemptLimit?: 'unlimited' | '1';
  attemptStatus?: 'not-started' | 'in-progress' | 'completed';
  totalAttempts?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface PurchasedQuiz {
  _id: string;
  attemptLimit?: 'unlimited' | '1';
  attemptStatus?: 'not-started' | 'in-progress' | 'completed';
  totalAttempts?: number;
}

export default function Quizes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [attemptingQuiz, setAttemptingQuiz] = useState<Quiz | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedQuizToBuy, setSelectedQuizToBuy] = useState<Quiz | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'wallet' | null>(null);
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [selectedQuizForPreview, setSelectedQuizForPreview] = useState<Quiz | null>(null);
  const [showStartQuizPopup, setShowStartQuizPopup] = useState(false);
  const [selectedQuizToStart, setSelectedQuizToStart] = useState<Quiz | null>(null);
  
  // Real API data fetching
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [purchasedQuizIds, setPurchasedQuizIds] = useState<Set<string>>(new Set());

  const isQuizOver = (quiz: Quiz) =>
    Boolean(
      quiz.attemptLimit !== 'unlimited' &&
      quiz.attemptStatus === 'completed'
    );

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [quizzesRes, categoriesRes, purchasedRes] = await Promise.allSettled([
        apiUser.get('/api/quizzes/quizzes'),
        apiUser.get('/api/categories'),
        apiUser.get('/api/quizzes/my-quizzes')
      ]);

      // Handle Category Response
      const categoryList: Category[] = categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data || []) : [];
      const categoryMap = new Map<string, string>(categoryList.map((cat) => [cat._id, cat.name]));
      setCategories(categoryList.map((cat) => ({ id: cat._id, name: cat.name })));

      // Handle Purchased Response
      const purchased: PurchasedQuiz[] = purchasedRes.status === 'fulfilled' && Array.isArray(purchasedRes.value.data?.data) 
        ? purchasedRes.value.data.data 
        : [];
      const purchasedIds = new Set<string>(purchased.map((q) => String(q._id)));
      const purchasedMetaById = new Map<string, {
        attemptLimit: 'unlimited' | '1';
        attemptStatus: 'not-started' | 'in-progress' | 'completed';
        totalAttempts: number;
      }>();
      purchased.forEach((q) => {
        const id = String(q._id || '');
        if (!id) return;
        purchasedMetaById.set(id, {
          attemptLimit: q.attemptLimit === 'unlimited' ? 'unlimited' : '1',
          attemptStatus: q.attemptStatus === 'completed' || q.attemptStatus === 'in-progress' ? q.attemptStatus : 'not-started',
          totalAttempts: Number(q.totalAttempts || 0),
        });
      });
      setPurchasedQuizIds(purchasedIds);

      // Handle Quizzes Response
      if (quizzesRes.status === 'fulfilled') {
        const quizzesData = quizzesRes.value.data.data || [];
        const enrichedQuizzes = quizzesData.map((quiz: Quiz) => ({
          ...quiz,
          category: categoryMap.get(quiz.category) || quiz.category, // Map ID to Name if possible
          isPurchased: purchasedIds.has(String(quiz._id)),
          attemptLimit: purchasedMetaById.get(String(quiz._id))?.attemptLimit || quiz.attemptLimit,
          attemptStatus: purchasedMetaById.get(String(quiz._id))?.attemptStatus || quiz.attemptStatus,
          totalAttempts: purchasedMetaById.get(String(quiz._id))?.totalAttempts || quiz.totalAttempts,
        }));
        setQuizzes(enrichedQuizzes);
      } else {
        throw new Error('Failed to load main components list');
      }
    } catch (err) {
      console.error('Initialisation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialise. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Filter and sort logic
  const filteredQuizzes = useMemo(() => {
    let filtered = quizzes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((quiz) => quiz.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter((quiz) => quiz.pricingType === 'free' || quiz.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((quiz) => quiz.pricingType === 'paid' && quiz.price > 0);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'popular') {
      // TODO: Add participantCount field from backend to properly sort by popularity
      // For now, just keep the original order (which is already sorted by latest from backend)
      filtered = [...filtered];
    }

    return filtered;
  }, [searchQuery, selectedCategory, priceFilter, sortBy, quizzes]);

  const enrollQuiz = async (quiz: Quiz) => {
    await apiUser.post(`/api/quizzes/${quiz._id}/enroll`);
    setPurchasedQuizIds((prev) => new Set(prev).add(String(quiz._id)));
    setQuizzes((prev) => prev.map((item) => (
      String(item._id) === String(quiz._id)
        ? { ...item, isPurchased: true }
        : item
    )));
  };

  const handleStartQuiz = (quiz: Quiz) => {
    if (!quiz.isPurchased) {
      alert('Please enroll before starting this quiz.');
      return;
    }

    if (isQuizOver(quiz)) {
      return;
    }

    setSelectedQuizToStart(quiz);
    setShowStartQuizPopup(true);
  };

  const handleEnrollOnly = async (quiz: Quiz) => {
    if (quiz.isPurchased) {
      alert('You are already enrolled.');
      return;
    }

    if (quiz.pricingType === 'free' || quiz.price === 0) {
      try {
        await enrollQuiz(quiz);
        alert('Enrolled successfully. You can start the quiz now.');
      } catch (err) {
        console.error('Enroll error:', err);
        alert('Failed to enroll in quiz. Please try again.');
      }
      return;
    }

    setSelectedQuizToBuy(quiz);
    setShowPaymentModal(true);
  };

  const handlePreviewQuiz = (quiz: Quiz) => {
    setSelectedQuizForPreview(quiz);
    setShowPreviewPopup(true);
  };

  const handleExitQuiz = () => {
    setAttemptingQuiz(null);
  };


  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedQuizToBuy(null);
    setSelectedPaymentMethod(null);
  };

  const handlePaymentMethodSelect = (method: 'upi' | 'card' | 'wallet') => {
    setSelectedPaymentMethod(method);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod || !selectedQuizToBuy) return;

    try {
      // Map both UPI and Card to 'phonepe'
      const mappedMethod = selectedPaymentMethod === 'wallet' ? 'wallet' : 'phonepe';
      const response = await apiUser.post('/api/transactions/initiate', {
        quizId: selectedQuizToBuy._id,
        amount: selectedQuizToBuy.price,
        paymentMethod: mappedMethod
      });
      const transactionId = response.data?.transaction;

      if (!transactionId) {
        throw new Error('Transaction could not be initiated');
      }

      if (mappedMethod === 'wallet') {
        await apiUser.post('/api/transactions/verify', { transactionId });
        await enrollQuiz(selectedQuizToBuy);
        handleClosePaymentModal();
        alert('Payment successful. Quiz added to My Quizzes.');
        return;
      }

      const orderData = response.data?.orderData;
      if (!orderData?.checkoutPageUrl) {
        throw new Error('PhonePe checkout URL missing');
      }

      handleClosePaymentModal();
      window.location.href = orderData.checkoutPageUrl;
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      alert(errorMessage);
    }
  };

  const handleClosePreviewPopup = () => {
    setShowPreviewPopup(false);
    setSelectedQuizForPreview(null);
  };

  const handleCloseStartQuizPopup = () => {
    setShowStartQuizPopup(false);
    setSelectedQuizToStart(null);
  };

  const handleConfirmStartQuiz = () => {
    if (selectedQuizToStart) {
      if (isQuizOver(selectedQuizToStart)) {
        alert('You cannot attempt this quiz again. Attempt limit is 1 and it is already used.');
        return;
      }
      setAttemptingQuiz(selectedQuizToStart);
      handleCloseStartQuizPopup();
    }
  };

  // Show Quiz Attempt Screen
  if (attemptingQuiz) {
    return (
      <UserQuizAttempt
        quizId={attemptingQuiz._id}
        quizData={{
          quizTitle: attemptingQuiz.quizTitle,
          duration: attemptingQuiz.duration.toString(),
          totalMarks: attemptingQuiz.totalMarks.toString(),
          negativeMarking: false,
          negativePerWrong: '0'
        }}
        onExit={handleExitQuiz}
        onSubmit={(score, answers) => {
          console.log('Quiz submitted:', { score, answers });
          handleExitQuiz();
        }}
      />
    );
  }

  // Minimalist Skeleton Loading
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="mb-10 animate-pulse">
          <div className="h-8 w-48 bg-gray-100 rounded-lg mb-2"></div>
          <div className="h-4 w-72 bg-gray-50 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-50"></div>
              <div className="p-5 space-y-4">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-50 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-50 rounded w-1/4"></div>
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

  const fetchPreviewData = async (quizId: string) => {
    const response = await apiUser.get(`/api/quizzes/quizzes/${quizId}/preview`);
    return response.data?.data;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {showPreviewPopup && selectedQuizForPreview && (
        <QuizPreview
          quizId={selectedQuizForPreview._id}
          onClose={handleClosePreviewPopup}
          onPurchase={() => {
            handleClosePreviewPopup();
            handleEnrollOnly(selectedQuizForPreview);
          }}
          canPreview={Boolean(selectedQuizForPreview.isPurchased)}
          fetchPreviewData={fetchPreviewData}
        />
      )}
      {/* Payment Modal */}
      {showPaymentModal && selectedQuizToBuy && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleClosePaymentModal}
          >
            {/* Modal */}
            <div 
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                <button
                  onClick={handleClosePaymentModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Quiz Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-1">{selectedQuizToBuy.quizTitle}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedQuizToBuy.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-[#253A7B]">₹{selectedQuizToBuy.price}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</p>
                
                {/* UPI */}
                <button
                  onClick={() => handlePaymentMethodSelect('upi')}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    selectedPaymentMethod === 'upi'
                      ? 'border-[#253A7B] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">PhonePe UPI</p>
                    <p className="text-xs text-gray-600">Google Pay, PhonePe, Paytm</p>
                  </div>
                  {selectedPaymentMethod === 'upi' && (
                    <CheckCircle className="w-5 h-5 text-[#253A7B]" />
                  )}
                </button>

                {/* Card */}
                <button
                  onClick={() => handlePaymentMethodSelect('card')}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    selectedPaymentMethod === 'card'
                      ? 'border-[#253A7B] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">PhonePe Card</p>
                    <p className="text-xs text-gray-600">Credit/Debit Card via PhonePe</p>
                  </div>
                  {selectedPaymentMethod === 'card' && (
                    <CheckCircle className="w-5 h-5 text-[#253A7B]" />
                  )}
                </button>

                {/* Wallet */}
                <button
                  onClick={() => handlePaymentMethodSelect('wallet')}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    selectedPaymentMethod === 'wallet'
                      ? 'border-[#253A7B] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Wallet</p>
                    <p className="text-xs text-gray-600">Use your account wallet balance</p>
                  </div>
                  {selectedPaymentMethod === 'wallet' && (
                    <CheckCircle className="w-5 h-5 text-[#253A7B]" />
                  )}
                </button>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={!selectedPaymentMethod}
                className="w-full px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </>
      )}

      {/* Start Quiz Popup */}
      {showStartQuizPopup && selectedQuizToStart && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleCloseStartQuizPopup}
          >
            {/* Modal */}
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Play className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Start Quiz</h2>
                    <p className="text-xs text-gray-600">Ready to test your knowledge?</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseStartQuizPopup}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Quiz Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#ffffff] bg-opacity-10 text-[#253A7B] rounded-full text-sm font-semibold">
                    {selectedQuizToStart.category}
                  </span>
                  {selectedQuizToStart.price === 0 ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Free
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      Purchased
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedQuizToStart.attemptLimit === 'unlimited'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedQuizToStart.attemptLimit === 'unlimited' ? 'Unlimited Attempts' : '1 Time Only'}
                  </span>
                  {selectedQuizToStart.attemptLimit !== 'unlimited' &&
                    (selectedQuizToStart.attemptStatus === 'completed' || (selectedQuizToStart.totalAttempts || 0) > 0) && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        Expired
                      </span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedQuizToStart.quizTitle}</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 text-center">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-blue-700 mb-1">Duration</p>
                    <p className="font-bold text-blue-900">{selectedQuizToStart.duration} min</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 text-center">
                    <FileQuestion className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-green-700 mb-1">Marks</p>
                    <p className="font-bold text-green-900">{selectedQuizToStart.totalMarks}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 text-center">
                    <FileQuestion className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-purple-700 mb-1">Level</p>
                    <p className="font-bold text-purple-900 capitalize">{selectedQuizToStart.difficultyLevel || 'Medium'}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Instructions</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• You have {selectedQuizToStart.duration} minutes to complete this quiz</li>
                        <li>• Total marks: {selectedQuizToStart.totalMarks}</li>
                        <li>• You can review and change answers before submitting</li>
                        <li>• Make sure you have a stable internet connection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseStartQuizPopup}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStartQuiz}
                  disabled={selectedQuizToStart.attemptLimit !== 'unlimited' && (selectedQuizToStart.attemptStatus === 'completed' || (selectedQuizToStart.totalAttempts || 0) > 0)}
                  className={`flex-1 px-6 py-3 rounded-xl transition font-medium flex items-center justify-center gap-2 ${
                    selectedQuizToStart.attemptLimit !== 'unlimited' && (selectedQuizToStart.attemptStatus === 'completed' || (selectedQuizToStart.totalAttempts || 0) > 0)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  {selectedQuizToStart.attemptLimit !== 'unlimited' && (selectedQuizToStart.attemptStatus === 'completed' || (selectedQuizToStart.totalAttempts || 0) > 0)
                    ? 'Attempt Expired'
                    : 'Start Quiz'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header Section */}
      <div className="mb-10 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Explore Quizzes
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
          Professional resources for mastering financial concepts and regulations.
        </p>
      </div>

      {/* Simplified Search & Filters */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-transparent">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition-colors text-sm font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 md:flex-none px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition-colors text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Fields</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
              className="flex-1 md:flex-none px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition-colors text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Pricing</option>
              <option value="free">Free</option>
              <option value="paid">Premium</option>
            </select>

            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Grid - Minimalist Cards */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-900 transition-all duration-300 flex flex-col group"
            >
              {/* Media Section */}
              <div className="relative aspect-video bg-gray-50 border-b border-gray-100 overflow-hidden">
                {quiz.coverImage ? (
                  <img src={quiz.coverImage} alt={quiz.quizTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileQuestion className="w-8 h-8 text-gray-200" />
                  </div>
                )}
                
                {/* Subtle Meta Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {quiz.category}
                  </span>
                  <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-md ${
                    quiz.attemptLimit === 'unlimited' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                      : 'bg-orange-50 border-orange-100 text-orange-700'
                  }`}>
                    {quiz.attemptLimit === 'unlimited' ? '∞ Attempts' : '1 Attempt'}
                  </span>
                </div>
              </div>

              {/* Data Section */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xs font-bold text-gray-900 leading-snug min-h-[2rem] line-clamp-2">
                  {quiz.quizTitle}
                </h3>

                <div className="flex items-center gap-3 mt-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {quiz.duration} min
                  </div>
                  <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                    <FileQuestion className="w-2.5 h-2.5" />
                    {quiz.totalMarks} MQ
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Fee</p>
                    <p className="text-sm font-black text-gray-900">
                      {quiz.pricingType === 'free' || quiz.price === 0 ? 'Free' : `₹${quiz.price}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!quiz.isPurchased ? (
                      <button 
                        onClick={() => handleEnrollOnly(quiz)}
                        className="px-4 py-2 bg-[#253A7B] text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#1a2a5e] transition shadow-sm"
                      >
                        Enroll Now
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handlePreviewQuiz(quiz)}
                          className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
                          title="Preview"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStartQuiz(quiz)}
                          disabled={isQuizOver(quiz)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition shadow-sm ${
                            isQuizOver(quiz)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isQuizOver(quiz) ? 'Finished' : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Start
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Minimalist Empty State
        <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-2xl">
          <FileQuestion className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 mb-2">No components found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">We couldn&apos;t find any quizzes matching your search criteria.</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setPriceFilter('all');
            }}
            className="text-xs font-bold text-[#253A7B] hover:underline"
          >
            Reset all parameters
          </button>
        </div>
      )}

      {/* Mobile Filter Panel */}
      {isMobileFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-6 space-y-4 animate-slide-up sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition bg-white"
              >
                <option value="all">All Fields</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    priceFilter === 'all'
                      ? 'bg-[#253A7B] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPriceFilter('free')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    priceFilter === 'free'
                      ? 'bg-[#253A7B] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPriceFilter('paid')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    priceFilter === 'paid'
                      ? 'bg-[#253A7B] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition bg-white"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
