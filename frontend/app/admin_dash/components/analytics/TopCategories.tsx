'use client';

import React from 'react';
import { Layers } from 'lucide-react';

interface TopCategoriesProps {
  categories: {
    name: string;
    count: number;
  }[];
}

export default function TopCategories({ categories }: TopCategoriesProps) {
  const maxCount = Math.max(...categories.map(c => c.count));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-sm font-semibold text-gray-700">Top Categories</h3>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => {
          const percentage = (category.count / maxCount) * 100;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <span className="text-sm font-semibold text-gray-900">{category.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#253A7B] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
