'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, Clock, FileQuestion, X, CreditCard, Smartphone, Wallet, CheckCircle, Info, Play } from 'lucide-react';
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
  const [categories, setCategories] = useState<string[]>([]);
  const [purchasedQuizIds, setPurchasedQuizIds] = useState<Set<string>>(new Set());

  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch all published quizzes
        const response = await apiUser.get('/api/quizzes/quizzes');
        const quizzesData = response.data.data || [];
        
        // Fetch user's purchased quizzes to mark isPurchased
        try {
          const purchasedResponse = await apiUser.get('/api/quizzes/my-quizzes');
          const purchased = purchasedResponse.data.data || [];
          const purchasedIds = new Set<string>(purchased.map((q: Quiz) => String(q._id)));
          setPurchasedQuizIds(purchasedIds);
          
          // Mark purchased quizzes
          const enrichedQuizzes = quizzesData.map((quiz: Quiz) => ({
            ...quiz,
            isPurchased: purchasedIds.has(String(quiz._id))
          }));
          
          setQuizzes(enrichedQuizzes);
        } catch (err) {
          // If fetching purchased quizzes fails, just show all quizzes
          const enrichedQuizzes = quizzesData.map((quiz: Quiz) => ({
            ...quiz,
            isPurchased: false
          }));
          setQuizzes(enrichedQuizzes);
        }
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(quizzesData.map((q: Quiz) => q.category).filter(Boolean))) as string[];
        setCategories(uniqueCategories);
        
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load quizzes';
        setError(errorMessage);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

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

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Quizes / Explore</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Discover and explore quiz topics to expand your financial knowledge</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-secondary)] transition"
            >
              Retry
            </button>
          </div>
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
            setSelectedQuizToBuy(selectedQuizForPreview);
            setShowPaymentModal(true);
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
                  <span className="text-2xl font-bold text-[var(--theme-primary)]">₹{selectedQuizToBuy.price}</span>
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
                      ? 'border-[var(--theme-primary)] bg-blue-50'
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
                    <CheckCircle className="w-5 h-5 text-[var(--theme-primary)]" />
                  )}
                </button>

                {/* Card */}
                <button
                  onClick={() => handlePaymentMethodSelect('card')}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    selectedPaymentMethod === 'card'
                      ? 'border-[var(--theme-primary)] bg-blue-50'
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
                    <CheckCircle className="w-5 h-5 text-[var(--theme-primary)]" />
                  )}
                </button>

                {/* Wallet */}
                <button
                  onClick={() => handlePaymentMethodSelect('wallet')}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                    selectedPaymentMethod === 'wallet'
                      ? 'border-[var(--theme-primary)] bg-blue-50'
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
                    <CheckCircle className="w-5 h-5 text-[var(--theme-primary)]" />
                  )}
                </button>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={!selectedPaymentMethod}
                className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                  <span className="px-3 py-1 bg-[#ffffff] bg-opacity-10 text-[var(--theme-primary)] rounded-full text-sm font-semibold">
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
                  className="flex-1 px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Quizes / Explore</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Discover and explore quiz topics to expand your financial knowledge</p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition text-sm"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition text-sm bg-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Price Filter Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setPriceFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                priceFilter === 'all'
                  ? 'bg-white text-[var(--theme-primary)] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                priceFilter === 'free'
                  ? 'bg-white text-[var(--theme-primary)] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setPriceFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                priceFilter === 'paid'
                  ? 'bg-white text-[var(--theme-primary)] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Paid
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition text-sm bg-white cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium text-sm"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] overflow-hidden">
                {quiz.coverImage ? (
                  <img src={quiz.coverImage} alt={quiz.quizTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileQuestion className="w-16 h-16 text-white/30" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    {quiz.difficultyLevel && (
                      <span className="text-white text-xs font-medium uppercase bg-white/20 px-2 py-1 rounded">
                        {quiz.difficultyLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4">
                {/* Title & Category */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[var(--theme-primary)] transition">
                    {quiz.quizTitle}
                  </h3>
                  <p className="text-sm text-gray-500">{quiz.category}</p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4" />
                    <span>{quiz.totalMarks} marks</span>
                  </div>
                </div>

                {/* Price Badge & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {quiz.pricingType === 'free' || quiz.price === 0 ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                        Free
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                        ₹{quiz.price}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePreviewQuiz(quiz)}
                      className="px-3 py-1.5 border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] rounded-lg hover:bg-[var(--theme-primary)] hover:text-white transition text-sm font-medium"
                    >
                      Preview
                    </button>
                    {!quiz.isPurchased && (
                      <button 
                        onClick={() => handleEnrollOnly(quiz)}
                        className="px-3 py-1.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition text-sm font-medium"
                      >
                        {quiz.pricingType === 'free' || quiz.price === 0 ? 'Enroll' : 'Buy'}
                      </button>
                    )}
                    <button 
                      onClick={() => handleStartQuiz(quiz)}
                      disabled={!quiz.isPurchased}
                      className={`px-4 py-1.5 rounded-lg transition text-sm font-medium ${
                        quiz.isPurchased
                          ? 'bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-secondary)]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Start
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search terms to find what you&apos;re looking for.
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setPriceFilter('all');
            }}
            className="px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium"
          >
            Clear Filters
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                      ? 'bg-[var(--theme-primary)] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPriceFilter('free')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    priceFilter === 'free'
                      ? 'bg-[var(--theme-primary)] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPriceFilter('paid')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    priceFilter === 'paid'
                      ? 'bg-[var(--theme-primary)] text-white'
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition bg-white"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
