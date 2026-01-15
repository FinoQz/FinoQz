'use client';

import React from 'react';
import { FileText, Video, FileDown, Calculator, TrendingUp } from 'lucide-react';

interface ContentFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'All Content', icon: TrendingUp },
  { id: 'article', label: 'Articles', icon: FileText },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'pdf', label: 'PDFs / Resources', icon: FileDown },
  { id: 'tool', label: 'Tools / Calculators', icon: Calculator },
];

export default function ContentFilters({ activeFilter, onFilterChange }: ContentFiltersProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-2 flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              isActive
                ? 'bg-[#253A7B] text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
