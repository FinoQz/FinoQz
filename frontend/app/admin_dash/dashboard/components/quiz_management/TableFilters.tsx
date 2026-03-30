'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

export default function TableFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [attemptStatus, setAttemptStatus] = useState('all');
  const [scoreRange, setScoreRange] = useState([0, 100]);

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-lg font-bold text-gray-900">Filter Participants</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm"
          />
        </div>

        {/* Payment Status */}
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm bg-white"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Pending</option>
        </select>

        {/* Attempt Status */}
        <select
          value={attemptStatus}
          onChange={(e) => setAttemptStatus(e.target.value)}
          className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm bg-white"
        >
          <option value="all">All Attempt Status</option>
          <option value="submitted">Submitted</option>
          <option value="in-progress">In Progress</option>
          <option value="not-attempted">Not Attempted</option>
        </select>

        {/* Date Range */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#253A7B] focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Score Range */}
      <div className="pt-2">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Score Range: {scoreRange[0]}% - {scoreRange[1]}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={scoreRange[1]}
          onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#253A7B]"
        />
      </div>

      {/* Apply/Reset */}
      <div className="flex gap-3 pt-2">
        <button className="flex-1 px-6 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium text-sm">
          Apply Filters
        </button>
        <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm">
          Reset
        </button>
      </div>
    </div>
  );
}
