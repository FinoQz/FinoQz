'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, FileQuestion, Star, X, CreditCard, Smartphone, Wallet, CheckCircle, Eye, Info, Play } from 'lucide-react';
import UserQuizAttempt from '../components/UserQuizAttempt';

interface Quiz {
  id: number;
  title: string;
  category: string;
  price: number;
  duration: number;
  questions: number;
  coverImage: string;
  isPurchased: boolean;
  createdBy: string;
  rating: number;
  createdDate: string;
}

export default function Quizes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [attemptingQuiz, setAttemptingQuiz] = useState<Quiz | null>(null);
  const [previewingQuiz, setPreviewingQuiz] = useState<Quiz | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedQuizToBuy, setSelectedQuizToBuy] = useState<Quiz | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'upi' | 'card' | 'wallet' | null>(null);
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [selectedQuizForPreview, setSelectedQuizForPreview] = useState<Quiz | null>(null);
  const [showStartQuizPopup, setShowStartQuizPopup] = useState(false);
  const [selectedQuizToStart, setSelectedQuizToStart] = useState<Quiz | null>(null);

  // Sample quiz data
  const quizzes: Quiz[] = [
    {
      id: 1,
      title: 'Personal Finance Mastery',
      category: 'Personal Finance',
      price: 0,
      duration: 45,
      questions: 30,
      coverImage: '/quiz-covers/personal-finance.jpg',
      isPurchased: false,
      createdBy: 'FinoQz Academy',
      rating: 4.8,
      createdDate: '2025-01-15',
    },
    {
      id: 2,
      title: 'Accounting Fundamentals',
      category: 'Accounting Basics',
      price: 149,
      duration: 60,
      questions: 40,
      coverImage: '/quiz-covers/accounting.jpg',
      isPurchased: true,
      createdBy: 'FinoQz Pro',
      rating: 4.9,
      createdDate: '2025-01-18',
    },
    {
      id: 3,
      title: 'Stock Market Analysis',
      category: 'Stock Market',
      price: 199,
      duration: 90,
      questions: 50,
      coverImage: '/quiz-covers/stock-market.jpg',
      isPurchased: false,
      createdBy: 'FinoQz Pro',
      rating: 4.7,
      createdDate: '2025-01-20',
    },
    {
      id: 4,
      title: 'Tax Planning Basics',
      category: 'Taxation',
      price: 0,
      duration: 30,
      questions: 25,
      coverImage: '/quiz-covers/taxation.jpg',
      isPurchased: false,
      createdBy: 'FinoQz Academy',
      rating: 4.6,
      createdDate: '2025-01-10',
    },
    {
      id: 5,
      title: 'Corporate Finance Essentials',
      category: 'Corporate Finance',
      price: 249,
      duration: 75,
      questions: 45,
      coverImage: '/quiz-covers/corporate-finance.jpg',
      isPurchased: false,
      createdBy: 'FinoQz Expert',
      rating: 4.9,
      createdDate: '2025-01-22',
    },
    {
      id: 6,
      title: 'Investment Strategies',
      category: 'Stock Market',
      price: 0,
      duration: 40,
      questions: 35,
      coverImage: '/quiz-covers/investment.jpg',
      isPurchased: false,
      createdBy: 'FinoQz Academy',
      rating: 4.5,
      createdDate: '2025-01-12',
    },
  ];

  // Filter and sort logic
  const filteredQuizzes = useMemo(() => {
    let filtered = quizzes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((quiz) => quiz.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter((quiz) => quiz.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((quiz) => quiz.price > 0);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
    } else if (sortBy === 'popular') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [searchQuery, selectedCategory, priceFilter, sortBy, quizzes]);

  const categories = ['Personal Finance', 'Accounting Basics', 'Stock Market', 'Taxation', 'Corporate Finance'];

  const handleStartQuiz = (quiz: Quiz) => {
    if (quiz.price === 0 || quiz.isPurchased) {
      setSelectedQuizToStart(quiz);
      setShowStartQuizPopup(true);
    } else {
      // Show payment modal for unpurchased paid quiz
      setSelectedQuizToBuy(quiz);
      setShowPaymentModal(true);
    }
  };

  const handlePreviewQuiz = (quiz: Quiz) => {
    setSelectedQuizForPreview(quiz);
    setShowPreviewPopup(true);
  };

  const handleExitQuiz = () => {
    setAttemptingQuiz(null);
  };

  const handleExitPreview = () => {
    setPreviewingQuiz(null);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedQuizToBuy(null);
    setSelectedPaymentMethod(null);
  };

  const handlePaymentMethodSelect = (method: 'upi' | 'card' | 'wallet') => {
    setSelectedPaymentMethod(method);
  };

  const handleConfirmPayment = () => {
    if (!selectedPaymentMethod || !selectedQuizToBuy) return;
    
    // Simulate payment processing
    console.log(`Processing payment via ${selectedPaymentMethod} for quiz:`, selectedQuizToBuy.title);
    
    // Close modal and show success (in real app, this would be after payment gateway response)
    handleClosePaymentModal();
    alert(`Payment successful! You can now access ${selectedQuizToBuy.title}`);
  };

  const handleClosePreviewPopup = () => {
    setShowPreviewPopup(false);
    setSelectedQuizForPreview(null);
  };

  const handleStartPreview = () => {
    if (selectedQuizForPreview) {
      setPreviewingQuiz(selectedQuizForPreview);
      handleClosePreviewPopup();
    }
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

  // Show Quiz Preview Screen (for paid quizzes)
  if (previewingQuiz) {
    return (
      <UserQuizAttempt
        quizData={{
          quizTitle: `${previewingQuiz.title} (Preview)`,
          duration: '5',
          totalMarks: '3',
          negativeMarking: false,
          negativePerWrong: '0'
        }}
        onExit={handleExitPreview}
        onSubmit={(score, answers) => {
          console.log('Preview completed:', { score, answers });
          handleExitPreview();
        }}
      />
    );
  }

  // Show Quiz Attempt Screen
  if (attemptingQuiz) {
    return (
      <UserQuizAttempt
        quizData={{
          quizTitle: attemptingQuiz.title,
          duration: attemptingQuiz.duration.toString(),
          totalMarks: attemptingQuiz.questions.toString(),
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
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
                <h3 className="font-semibold text-gray-900 mb-1">{selectedQuizToBuy.title}</h3>
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
                    <p className="font-semibold text-gray-900">UPI</p>
                    <p className="text-xs text-gray-600">Google Pay, PhonePe, Paytm</p>
                  </div>
                  {selectedPaymentMethod === 'upi' && (
                    <CheckCircle className="w-5 h-5 text-[#253A7B]" />
                  )}
                </button>

                {/* Razorpay (Card) */}
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
                    <p className="font-semibold text-gray-900">Card Payment</p>
                    <p className="text-xs text-gray-600">Credit/Debit Card via Razorpay</p>
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
                  </div>
                  {selectedPaymentMethod === 'wallet' && (
                    <CheckCircle className="w-5 h-5 text-[#253A7B]" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClosePaymentModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={!selectedPaymentMethod}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition ${
                    selectedPaymentMethod
                      ? 'bg-[#253A7B] text-white hover:bg-[#1a2a5e]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Pay ₹{selectedQuizToBuy.price}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Preview Popup */}
      {showPreviewPopup && selectedQuizForPreview && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={handleClosePreviewPopup}
          >
            {/* Modal */}
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Quiz Preview</h2>
                    <p className="text-xs text-gray-600">Try before you buy</p>
                  </div>
                </div>
                <button
                  onClick={handleClosePreviewPopup}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Quiz Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedQuizForPreview.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedQuizForPreview.category}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Full Quiz</p>
                    <p className="font-semibold text-gray-900">{selectedQuizForPreview.duration} min • {selectedQuizForPreview.questions} Qs</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600 mb-1">Preview</p>
                    <p className="font-semibold text-blue-900">5 min • 3 Qs</p>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900 mb-1">Preview Limitations</p>
                      <ul className="text-xs text-orange-800 space-y-1">
                        <li>• Only 3 sample questions available</li>
                        <li>• 5 minutes time limit</li>
                        <li>• Preview results won&apos;t be saved</li>
                        <li>• Purchase to access full quiz</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Full Quiz Price</p>
                    <p className="text-2xl font-bold text-[#253A7B]">₹{selectedQuizForPreview.price}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClosePreviewPopup}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartPreview}
                  className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium"
                >
                  Start Preview
                </button>
              </div>
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
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedQuizToStart.title}</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 text-center">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-blue-700 mb-1">Duration</p>
                    <p className="font-bold text-blue-900">{selectedQuizToStart.duration} min</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 text-center">
                    <FileQuestion className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-green-700 mb-1">Questions</p>
                    <p className="font-bold text-green-900">{selectedQuizToStart.questions}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 text-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto mb-1" />
                    <p className="text-xs text-purple-700 mb-1">Rating</p>
                    <p className="font-bold text-purple-900">{selectedQuizToStart.rating}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Instructions</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• You have {selectedQuizToStart.duration} minutes to complete this quiz</li>
                        <li>• All {selectedQuizToStart.questions} questions must be answered</li>
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
                  className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2"
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
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition text-sm"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition text-sm bg-white cursor-pointer"
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
                  ? 'bg-white text-[#253A7B] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriceFilter('free')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                priceFilter === 'free'
                  ? 'bg-white text-[#253A7B] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setPriceFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                priceFilter === 'paid'
                  ? 'bg-white text-[#253A7B] shadow-sm'
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
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition text-sm bg-white cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium text-sm"
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
              key={quiz.id}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] overflow-hidden">
                {/* Placeholder pattern since we don't have actual images */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileQuestion className="w-16 h-16 text-white/30" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-medium">{quiz.rating}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4">
                {/* Title & Category */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#253A7B] transition">
                    {quiz.title}
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
                    <span>{quiz.questions} Qs</span>
                  </div>
                </div>

                {/* Price Badge & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {quiz.price === 0 ? (
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
                    {quiz.price > 0 && (
                      <button 
                        onClick={() => handlePreviewQuiz(quiz)}
                        className="px-3 py-1.5 border-2 border-[#253A7B] text-[#253A7B] rounded-lg hover:bg-[#253A7B] hover:text-white transition text-sm font-medium"
                      >
                        Preview
                      </button>
                    )}
                    <button 
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-4 py-1.5 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition text-sm font-medium"
                    >
                      {quiz.price === 0
                        ? 'Start'
                        : quiz.isPurchased
                        ? 'Start'
                        : `Buy`}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Created by {quiz.createdBy} • {new Date(quiz.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
          <button className="px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/20 transition bg-white"
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
