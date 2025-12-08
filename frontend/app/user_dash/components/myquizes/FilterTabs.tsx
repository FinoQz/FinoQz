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
    { id: 'all' as const, label: 'All', count: counts.all },
    { id: 'paid' as const, label: 'Paid', count: counts.paid },
    { id: 'free' as const, label: 'Free', count: counts.free },
    { id: 'attempted' as const, label: 'Attempted', count: counts.attempted },
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-[#253A7B] text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          {tab.label}
          <span className={`ml-2 ${activeTab === tab.id ? 'text-white/80' : 'text-gray-400'}`}>
            ({tab.count})
          </span>
        </button>
      ))}
    </div>
  );
}
