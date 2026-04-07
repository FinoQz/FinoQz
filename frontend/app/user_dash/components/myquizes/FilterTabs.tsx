'use client';

import React from 'react';

interface FilterTabsProps {
  activeTab: 'all' | 'paid' | 'free' | 'attempted';
  onTabChange: (tab: 'all' | 'paid' | 'free' | 'attempted') => void;
  counts: {
    all: number;
    paid: number;
    free: number;
    attempted: number;
  };
}

export default function FilterTabs({ activeTab, onTabChange, counts }: FilterTabsProps) {
  const tabs = [
    { id: 'all' as const, label: 'All Quizzes', count: counts.all },
    { id: 'paid' as const, label: 'Premium', count: counts.paid },
    { id: 'free' as const, label: 'Standard', count: counts.free },
    { id: 'attempted' as const, label: 'My Progress', count: counts.attempted },
  ];

  return (
    <div className="w-full md:w-fit overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center p-1 bg-gray-50 border border-gray-200 rounded-xl w-max md:w-fit min-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-shrink-0 px-4 sm:px-5 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#253A7B] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

