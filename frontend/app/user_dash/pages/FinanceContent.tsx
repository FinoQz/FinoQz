'use client';

import React from 'react';
import { FileText, Clock, BookOpen, TrendingUp } from 'lucide-react';

export default function FinanceContent() {
  const articles = [
    { id: 1, title: 'Understanding Personal Finance Basics', category: 'Personal Finance', readTime: '5 min', date: '2025-01-18' },
    { id: 2, title: 'Stock Market Investment Strategies', category: 'Investing', readTime: '8 min', date: '2025-01-17' },
    { id: 3, title: 'Tax Planning for Salaried Professionals', category: 'Tax', readTime: '6 min', date: '2025-01-15' },
    { id: 4, title: 'Cryptocurrency: A Beginner\'s Guide', category: 'Crypto', readTime: '10 min', date: '2025-01-12' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Finance Content</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Explore curated financial education content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Articles</div>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">48</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Articles Read</div>
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">12</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Reading Streak</div>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">7 days</div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-3">{article.title}</h3>
            <p className="text-sm text-gray-600 mb-4">Published on {article.date}</p>

            <button className="w-full px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium text-sm">
              Read Article
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
