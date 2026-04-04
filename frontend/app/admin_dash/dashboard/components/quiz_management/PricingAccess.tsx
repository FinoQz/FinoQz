'use client';

import * as React from 'react';
import { IndianRupee, Globe, Lock, Check, Sparkles } from 'lucide-react';
import { QuizData } from './CreateQuizForm';

interface PricingAccessProps {
  quizData: QuizData;
  updateQuizData: (newData: Partial<QuizData>) => void;
  onNext?: () => void;
}

export default function PricingAccess({
  quizData,
  updateQuizData,
  onNext
}: PricingAccessProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <label className="block text-sm font-semibold text-gray-900 mb-6">Choose Pricing Strategy</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Option */}
          <button
            onClick={() => updateQuizData({ pricingType: 'free', price: 0 })}
            className={`group relative text-left p-6 rounded-lg border transition-all duration-300 ${
              quizData.pricingType === 'free'
                ? 'border-[#253A7B] bg-blue-50/30 ring-1 ring-[#253A7B]/10'
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 transition-all ${
              quizData.pricingType === 'free' ? 'bg-[#253A7B] text-white' : 'bg-white border border-gray-100 text-gray-400'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1.5">Free Access</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed font-normal">Available to all users. Ideal for lead generation and brand awareness.</p>
            {quizData.pricingType === 'free' && <Check className="absolute top-6 right-6 w-5 h-5 text-[#253A7B]" />}
          </button>

          {/* Paid Option */}
          <button
            onClick={() => updateQuizData({ pricingType: 'paid' })}
            className={`group relative text-left p-6 rounded-lg border transition-all duration-300 ${
              quizData.pricingType === 'paid'
                ? 'border-[#253A7B] bg-blue-50/30 ring-1 ring-[#253A7B]/10'
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-4 transition-all ${
              quizData.pricingType === 'paid' ? 'bg-[#253A7B] text-white' : 'bg-white border border-gray-100 text-gray-400'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1.5">Premium Content</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed font-normal">Restricted to paid users. Best for high-value assessments and certifications.</p>
            {quizData.pricingType === 'paid' && <Check className="absolute top-6 right-6 w-5 h-5 text-[#253A7B]" />}
          </button>
        </div>
      </div>

      {quizData.pricingType === 'paid' && (
        <div className="space-y-6 animate-in slide-in-from-top-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-[#253A7B]">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Set Pricing</h3>
            </div>

            <div className="max-w-md space-y-2">
              <label className="text-xs font-medium text-gray-500 ml-0.5">Listing Price (INR)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="number"
                  value={quizData.price}
                  onChange={(e) => updateQuizData({ price: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-normal focus:border-[#253A7B] outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium ml-1">Note: Professional transaction fees may apply.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-md bg-orange-50 flex items-center justify-center text-orange-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Promotions</h3>
            </div>

            <div className="max-w-md space-y-2">
              <label className="text-xs font-medium text-gray-500 ml-0.5">Offer Code (Optional)</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300">
                  <span className="text-xs font-bold font-mono">%</span>
                </div>
                <input
                  type="text"
                  value={quizData.offerCode || ''}
                  onChange={(e) => updateQuizData({ offerCode: e.target.value.toUpperCase() })}
                  placeholder="E.G. NEWYEAR50"
                  className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-bold tracking-widest focus:border-[#253A7B] outline-none transition-all placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium ml-1">Users can use this code to get a discount or free access.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
