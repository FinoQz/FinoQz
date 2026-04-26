'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Clock, FileQuestion, X, CreditCard, Smartphone, Wallet, CheckCircle, Info, Play, Unlock, ChevronRight, LayoutGrid, List } from 'lucide-react';
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

/* ── Section Label (consistent with dashboard) ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{label}</p>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
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

      const categoryList: Category[] = categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data || []) : [];
      const categoryMap = new Map<string, string>(categoryList.map((cat) => [cat._id, cat.name]));
      setCategories(categoryList.map((cat) => ({ id: cat._id, name: cat.name })));

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

      if (quizzesRes.status === 'fulfilled') {
        const quizzesData = quizzesRes.value.data.data || [];
        const enrichedQuizzes = quizzesData.map((quiz: Quiz) => ({
          ...quiz,
          category: categoryMap.get(quiz.category) || quiz.category,
          isPurchased: purchasedIds.has(String(quiz._id)),
          attemptLimit: purchasedMetaById.get(String(quiz._id))?.attemptLimit || quiz.attemptLimit,
          attemptStatus: purchasedMetaById.get(String(quiz._id))?.attemptStatus || quiz.attemptStatus,
          totalAttempts: purchasedMetaById.get(String(quiz._id))?.totalAttempts || quiz.totalAttempts,
        }));
        setQuizzes(enrichedQuizzes);
      } else {
        throw new Error('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    let filtered = quizzes;
    if (searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((quiz) => quiz.category === selectedCategory);
    }
    if (priceFilter === 'free') {
      filtered = filtered.filter((quiz) => quiz.pricingType === 'free' || quiz.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((quiz) => quiz.pricingType === 'paid' && quiz.price > 0);
    }
    if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return filtered;
  }, [searchQuery, selectedCategory, priceFilter, sortBy, quizzes]);

  const enrollQuiz = async (quiz: Quiz) => {
    await apiUser.post(`/api/quizzes/${quiz._id}/enroll`);
    setPurchasedQuizIds((prev) => new Set(prev).add(String(quiz._id)));
    setQuizzes((prev) => prev.map((item) => (
      String(item._id) === String(quiz._id) ? { ...item, isPurchased: true } : item
    )));
  };

  const handleStartQuiz = (quiz: Quiz) => {
    if (!quiz.isPurchased) return alert('Please enroll before starting.');
    if (isQuizOver(quiz)) return;
    setSelectedQuizToStart(quiz);
    setShowStartQuizPopup(true);
  };

  const handleEnrollOnly = async (quiz: Quiz) => {
    if (quiz.isPurchased) return alert('Already enrolled.');
    if (quiz.pricingType === 'free' || quiz.price === 0) {
      try {
        await enrollQuiz(quiz);
        alert('Enrolled successfully!');
      } catch (err) { alert('Failed to enroll.'); }
      return;
    }
    setSelectedQuizToBuy(quiz);
    setShowPaymentModal(true);
  };

  const handlePreviewQuiz = (quiz: Quiz) => {
    setSelectedQuizForPreview(quiz);
    setShowPreviewPopup(true);
  };

  const fetchPreviewData = async (quizId: string) => {
    const response = await apiUser.get(`/api/quizzes/quizzes/${quizId}/preview`);
    return response.data?.data;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-40 bg-gray-50" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/2" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 bg-gray-100 rounded flex-1" />
                  <div className="h-8 bg-gray-100 rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        onExit={() => setAttemptingQuiz(null)}
        onSubmit={() => setAttemptingQuiz(null)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Browse Quizzes</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium italic">Discover professional resources to master finance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#253A7B] transition-all min-w-[200px] sm:min-w-[280px]"
            />
          </div>
          <button onClick={() => setIsMobileFilterOpen(true)} className="p-2 lg:hidden bg-white border border-gray-100 rounded-xl">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* ── Desktop Filters ── */}
      <div className="hidden lg:flex items-center gap-4">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none hover:bg-gray-50 transition-colors"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['all', 'free', 'paid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setPriceFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                priceFilter === f ? 'bg-white text-[#253A7B] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
          className="ml-auto px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 focus:outline-none"
        >
          <option value="newest">Sort: Newest</option>
          <option value="popular">Sort: Popular</option>
        </select>
      </div>

      {/* ── Quiz Grid ── */}
      <section>
        <SectionLabel label={`Available Courses (${filteredQuizzes.length})`} />
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQuizzes.map((quiz) => {
              const isPurchased = purchasedQuizIds.has(quiz._id) || quiz.isPurchased;
              const isDone = isQuizOver(quiz);
              
              return (
                <div 
                  key={quiz._id} 
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-gray-50 border-b border-gray-50 overflow-hidden">
                    {quiz.coverImage ? (
                      <img src={quiz.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={quiz.quizTitle} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileQuestion className="w-10 h-10 text-gray-100" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                       <span className="px-2 py-1 bg-white/95 backdrop-blur shadow-sm rounded-lg text-[9px] font-bold text-[#253A7B] uppercase tracking-wider border border-gray-100">
                         {quiz.category}
                       </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[40px] leading-tight mb-3 group-hover:text-[#253A7B] transition-colors">
                      {quiz.quizTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {quiz.duration}m
                      </div>
                      <div className="flex items-center gap-1.5 border-l border-gray-100 pl-4">
                        <FileQuestion className="w-3 h-3" />
                        {quiz.totalMarks} MQ
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Fee</p>
                        <p className="text-sm font-black text-gray-900">
                          {quiz.pricingType === 'free' || quiz.price === 0 ? 'FREE' : `₹${quiz.price}`}
                        </p>
                      </div>

                      {!isPurchased ? (
                        <button 
                          onClick={() => handleEnrollOnly(quiz)}
                          className="px-4 py-2 bg-[#253A7B] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#1a2a5e] transition-all shadow-sm active:scale-95"
                        >
                          Enroll
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => handlePreviewQuiz(quiz)}
                            className="p-2 border border-blue-100 text-blue-400 rounded-xl hover:bg-blue-50 transition-colors"
                            title="Preview Content"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStartQuiz(quiz)}
                            disabled={isDone}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${
                              isDone ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isDone ? 'Done' : 'Start'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
            <Search className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No results found</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setPriceFilter('all'); }} className="text-xs font-bold text-[#253A7B] mt-2 underline">Reset filters</button>
          </div>
        )}
      </section>

      {/* ── Popups (Preview, Start, Payment) ── */}
      {showPreviewPopup && selectedQuizForPreview && (
        <QuizPreview
          quizId={selectedQuizForPreview._id}
          onClose={() => setShowPreviewPopup(false)}
          onPurchase={() => { setShowPreviewPopup(false); handleEnrollOnly(selectedQuizForPreview); }}
          canPreview={Boolean(selectedQuizForPreview.isPurchased)}
          fetchPreviewData={fetchPreviewData}
        />
      )}

      {showStartQuizPopup && selectedQuizToStart && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <button onClick={() => setShowStartQuizPopup(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Ready to start?</p>
            <h3 className="text-xl font-bold text-gray-900 leading-snug mb-6">{selectedQuizToStart.quizTitle}</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                </div>
                <p className="text-sm font-bold text-gray-800">{selectedQuizToStart.duration} Minutes</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marks</span>
                </div>
                <p className="text-sm font-bold text-gray-800">{selectedQuizToStart.totalMarks} Total</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowStartQuizPopup(false)} className="flex-1 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
              <button 
                onClick={() => { setAttemptingQuiz(selectedQuizToStart); setShowStartQuizPopup(false); }}
                className="flex-1 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-black transition-all"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {showPaymentModal && selectedQuizToBuy && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#253A7B] opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#253A7B] flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-8 relative z-10">
              <p className="text-[10px] font-bold text-[#253A7B] uppercase tracking-[0.2em] mb-1">Checkout</p>
              <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">{selectedQuizToBuy.quizTitle}</h3>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-black text-gray-900">₹{selectedQuizToBuy.price}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inclusive tax</span>
              </div>
            </div>

            <div className="space-y-2 mb-8 relative z-10">
               <SectionLabel label="Select Method" />
               {(['upi', 'card', 'wallet'] as const).map(method => (
                 <button
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-4 ${
                      selectedPaymentMethod === method ? 'border-[#253A7B] bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                 >
                    <div className={`p-2.5 rounded-xl ${selectedPaymentMethod === method ? 'bg-[#253A7B] text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                      {method === 'upi' && <Smartphone className="w-4 h-4" />}
                      {method === 'card' && <CreditCard className="w-4 h-4" />}
                      {method === 'wallet' && <Wallet className="w-4 h-4" />}
                    </div>
                    <div className="text-left">
                       <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest leading-none mb-1">{method === 'upi' ? 'PhonePe UPI' : method === 'card' ? 'PhonePe Card' : 'FinoQz Wallet'}</p>
                       <p className="text-[10px] font-medium text-gray-400">{method === 'wallet' ? 'Use available balance' : 'Secure via PhonePe'}</p>
                    </div>
                    {selectedPaymentMethod === method && <CheckCircle className="ml-auto w-4 h-4 text-[#253A7B]" />}
                 </button>
               ))}
            </div>

            <button 
              onClick={async () => {
                if (!selectedPaymentMethod) return;
                try {
                  const mappedMethod = selectedPaymentMethod === 'wallet' ? 'wallet' : 'phonepe';
                  const response = await apiUser.post('/api/transactions/initiate', {
                    quizId: selectedQuizToBuy._id,
                    amount: selectedQuizToBuy.price,
                    paymentMethod: mappedMethod
                  });
                  if (mappedMethod === 'wallet') {
                    await apiUser.post('/api/transactions/verify', { transactionId: response.data?.transaction });
                    await enrollQuiz(selectedQuizToBuy);
                    setShowPaymentModal(false);
                    alert('Success!');
                  } else {
                    window.location.href = response.data?.orderData?.checkoutPageUrl;
                  }
                } catch (e) { alert('Payment Failed'); }
              }}
              disabled={!selectedPaymentMethod}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Purchase
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile Filter Drawer ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
           <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500">
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-widest text-[14px]">Refine Selection</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-50 rounded-lg text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-6">
                 <div>
                   <SectionLabel label="Category" />
                   <select 
                     value={selectedCategory} 
                     onChange={(e) => setSelectedCategory(e.target.value)}
                     className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800"
                   >
                     <option value="all">All Specialties</option>
                     {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                 </div>

                 <div>
                   <SectionLabel label="Pricing" />
                   <div className="grid grid-cols-3 gap-2">
                      {(['all', 'free', 'paid'] as const).map(f => (
                        <button key={f} onClick={() => setPriceFilter(f)} className={`py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${priceFilter === f ? 'bg-[#253A7B] text-white border-[#253A7B] shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}>
                          {f}
                        </button>
                      ))}
                   </div>
                 </div>

                 <button onClick={() => setIsMobileFilterOpen(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl mt-4">Apply Filters</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

function Trophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
  );
}
