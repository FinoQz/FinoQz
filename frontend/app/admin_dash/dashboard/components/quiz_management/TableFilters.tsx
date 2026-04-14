'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { ParticipantFilters } from './ParticipantsTable';

interface TableFiltersProps {
  onFilterChange: (filters: ParticipantFilters) => void;
  pricingType?: 'free' | 'paid';
}

const DEFAULT_FILTERS: ParticipantFilters = {
  search: '',
  paymentStatus: 'all',
  attemptStatus: 'all',
  dateFrom: '',
  dateTo: '',
  scoreMin: '',
  scoreMax: '',
};

export default function TableFilters({ onFilterChange, pricingType = 'free' }: TableFiltersProps) {
  const [filters, setFilters] = useState<ParticipantFilters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState(false);

  const set = (key: keyof ParticipantFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange({ ...filters });
    setApplied(true);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
    setApplied(false);
  };

  // Live search
  const handleSearchChange = (value: string) => {
    const next = { ...filters, search: value };
    setFilters(next);
    onFilterChange(next);
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'search') return v !== '';
    if (k === 'paymentStatus' || k === 'attemptStatus') return v !== 'all';
    return v !== '';
  }).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#253A7B]" />
          <h3 className="text-sm font-bold text-gray-900">Filter Participants</h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-[#253A7B] text-white text-[10px] font-bold rounded-full">
              {activeCount} active
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={handleReset} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors font-medium">
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={filters.search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm bg-white"
            />
          </div>

          {/* Attempt Status */}
          <select
            value={filters.attemptStatus}
            onChange={e => set('attemptStatus', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm bg-white"
          >
            <option value="all">All Attempt Status</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="not-attempted">Not Attempted</option>
          </select>

          {/* Payment Status (only for paid quizzes) */}
          {pricingType === 'paid' ? (
            <select
              value={filters.paymentStatus}
              onChange={e => set('paymentStatus', e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm bg-white"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
            </select>
          ) : (
            <div /> /* placeholder for grid alignment */
          )}

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => set('dateFrom', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm bg-white"
              placeholder="From date"
              title="Filter from date"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => set('dateTo', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm bg-white"
              title="Filter to date"
            />
          </div>

          {/* Score Min */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Min Score: {filters.scoreMin || 0}%</label>
            </div>
            <input
              type="range" min="0" max="100" value={filters.scoreMin || 0}
              onChange={e => set('scoreMin', e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#253A7B]"
            />
          </div>

          {/* Score Max */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Max Score: {filters.scoreMax || 100}%</label>
            </div>
            <input
              type="range" min="0" max="100" value={filters.scoreMax || 100}
              onChange={e => set('scoreMax', e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#253A7B]"
            />
          </div>

          {/* Apply / Reset */}
          <div className="flex gap-2 items-end">
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-semibold text-sm"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
