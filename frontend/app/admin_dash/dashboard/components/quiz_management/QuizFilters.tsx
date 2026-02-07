import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Listbox } from '@headlessui/react';

type QuizStatus = 'all' | 'published' | 'draft';

interface QuizFiltersProps {
  onSearch?: (query: string) => void;
  onStatusChange?: (status: QuizStatus) => void;
  onApply?: () => void;
}

export default function QuizFilters({ onSearch, onStatusChange, onApply }: QuizFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleStatusChange = (value: QuizStatus) => {
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
      <div className="relative min-w-[140px]">
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value as QuizStatus)}
          className="appearance-none w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition text-sm bg-white pr-10 shadow-sm font-medium text-gray-700
            hover:border-[#253A7B] hover:bg-gray-50 focus:bg-white"
          style={{
            boxShadow: '0 4px 16px rgba(37, 58, 123, 0.08)',
            cursor: 'pointer',
          }}
        >
          <option value="all" className="bg-white text-gray-700 font-medium">All Status</option>
          <option value="published" className="bg-white text-green-700 font-medium">Published</option>
          <option value="draft" className="bg-white text-gray-500 font-medium">Draft</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>

      {/* Apply Button */}
      <button
        onClick={() => onApply?.()}
        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-medium text-sm"
      >
        Apply
      </button>
    </div>
  );
}


const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

interface CustomDropdownProps {
  selectedStatus: QuizStatus;
  setSelectedStatus: (status: QuizStatus) => void;
}

import {
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';

export function CustomDropdown({ selectedStatus, setSelectedStatus }: CustomDropdownProps) {
  return (
    <Listbox value={selectedStatus} onChange={setSelectedStatus}>
      <div className="relative min-w-[140px]">
        <ListboxButton className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium">
          {statusOptions.find(o => o.value === selectedStatus)?.label}
        </ListboxButton>
        <ListboxOptions className="absolute mt-1 w-full bg-white rounded-xl shadow-lg z-10">
          {statusOptions.map(option => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-xl"
            >
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
