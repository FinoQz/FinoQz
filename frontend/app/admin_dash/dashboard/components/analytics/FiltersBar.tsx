'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface FiltersBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedQuiz: string;
  onQuizChange: (quiz: string) => void;
  selectedUserType: string;
  onUserTypeChange: (type: string) => void;
  onReset: () => void;
}

export default function FiltersBar({
  selectedCategory,
  onCategoryChange,
  selectedQuiz,
  onQuizChange,
  selectedUserType,
  onUserTypeChange,
  onReset
}: FiltersBarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
        >
          <option value="all">All Categories</option>
          <option value="personal-finance">Personal Finance</option>
          <option value="accounting">Accounting</option>
          <option value="stock-market">Stock Market</option>
          <option value="taxation">Taxation</option>
        </select>

        <select
          value={selectedQuiz}
          onChange={(e) => onQuizChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
        >
          <option value="all">All Quizzes</option>
          <option value="financial-basics">Financial Management Basics</option>
          <option value="stock-analysis">Stock Market Analysis</option>
          <option value="advanced-accounting">Advanced Accounting</option>
        </select>

        <select
          value={selectedUserType}
          onChange={(e) => onUserTypeChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
        >
          <option value="all">All Users</option>
          <option value="free">Free Users</option>
          <option value="paid">Paid Users</option>
        </select>

        <button
          onClick={onReset}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </button>
      </div>
    </div>
  );
}
