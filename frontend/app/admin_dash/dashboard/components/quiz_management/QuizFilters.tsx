'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

type QuizStatus = 'all' | 'published' | 'draft' | 'scheduled';
type QuizPricing = 'all' | 'free' | 'paid';

interface QuizFiltersProps {
  onSearch?: (query: string) => void;
  onStatusChange?: (status: QuizStatus) => void;
  onPricingChange?: (pricing: QuizPricing) => void;
}

export default function QuizFilters({ onSearch, onStatusChange, onPricingChange }: QuizFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<QuizStatus>('all');
  const [selectedPricing, setSelectedPricing] = useState<QuizPricing>('all');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleStatusChange = (value: QuizStatus) => {
    setSelectedStatus(value);
    onStatusChange?.(value);
  };

  const handlePricingChange = (value: QuizPricing) => {
    setSelectedPricing(value);
    onPricingChange?.(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      {/* Search */}
      <div className="flex-1 relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search quizzes by title..."
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/10 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="relative w-full sm:w-44">
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value as QuizStatus)}
          className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/10 transition-all cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Pricing filter */}
      <div className="relative w-full sm:w-36">
        <select
          value={selectedPricing}
          onChange={(e) => handlePricingChange(e.target.value as QuizPricing)}
          className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:border-[#253A7B] focus:ring-2 focus:ring-[#253A7B]/10 transition-all cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
