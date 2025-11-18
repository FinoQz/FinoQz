'use client';

import React from 'react';
import { Wallet, Calculator, TrendingUp, FileText, Building2, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const categories: Category[] = [
  {
    id: 'personal-finance',
    name: 'Personal Finance',
    description: 'Budgeting, savings, investments, and personal money management',
    icon: Wallet
  },
  {
    id: 'accounting-basics',
    name: 'Accounting Basics',
    description: 'Fundamental accounting principles, bookkeeping, and financial statements',
    icon: Calculator
  },
  {
    id: 'stock-market',
    name: 'Stock Market',
    description: 'Trading, equity analysis, market fundamentals, and investing strategies',
    icon: TrendingUp
  },
  {
    id: 'taxation',
    name: 'Taxation',
    description: 'Tax planning, filing, deductions, and compliance requirements',
    icon: FileText
  },
  {
    id: 'corporate-finance',
    name: 'Corporate Finance',
    description: 'Business finance, capital structure, valuation, and financial strategy',
    icon: Building2
  }
];

interface CategorySelectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategorySelection({ selectedCategory, onSelectCategory }: CategorySelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Quiz Category</h2>
        <p className="text-sm text-gray-600">Select the primary category for this quiz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <div
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-[#253A7B] bg-white shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#253A7B] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? 'bg-[#253A7B]' : 'bg-gray-100'
              }`}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              </div>

              {/* Content */}
              <h3 className={`font-semibold text-lg mb-1 ${
                isSelected ? 'text-[#253A7B]' : 'text-gray-900'
              }`}>
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
            </div>
          );
        })}
      </div>

      {!selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <p className="text-sm text-blue-800">Please select a category to continue</p>
        </div>
      )}
    </div>
  );
}
