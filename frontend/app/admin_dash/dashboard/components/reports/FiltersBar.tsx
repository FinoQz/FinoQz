'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface FiltersBarProps {
  selectedQuiz: string;
  onQuizChange: (quiz: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  type: string;
  onTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function FiltersBar({
  selectedQuiz,
  onQuizChange,
  dateRange,
  onDateRangeChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  searchQuery,
  onSearchChange,
  onApply,
  onClear
}: FiltersBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Quiz Dropdown */}
        <select
          value={selectedQuiz}
          onChange={(e) => onQuizChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
        >
          <option value="all">All Quizzes</option>
          <option value="quiz1">Financial Management Basics</option>
          <option value="quiz2">Stock Market Analysis</option>
          <option value="quiz3">Advanced Accounting</option>
        </select>

        {/* Date Range */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="custom">Custom range</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>

        {/* Type */}
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
        >
          <option value="all">All Types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search user, email, txn ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onApply}
          className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition text-sm font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
