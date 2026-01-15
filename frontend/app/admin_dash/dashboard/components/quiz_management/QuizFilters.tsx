'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface QuizFiltersProps {
  onSearch?: (query: string) => void;
  onStatusChange?: (status: string) => void;
  onApply?: () => void;
}

export default function QuizFilters({ onSearch, onStatusChange, onApply }: QuizFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onStatusChange?.(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by title…"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition text-sm"
        />
      </div>

      {/* Status Dropdown */}
      <select
        value={selectedStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition text-sm min-w-[140px]"
      >
        <option value="all">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>

      {/* Apply Button */}
      <button
        onClick={onApply}
        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-medium text-sm"
      >
        Apply
      </button>
    </div>
  );
}
