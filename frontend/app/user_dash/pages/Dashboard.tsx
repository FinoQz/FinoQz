'use client';

import React from 'react';
import { TrendingUp, BookOpen, Wallet, Award } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-700">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Welcome back! Heres your quiz activity overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Total Quizzes</div>
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shadow-sm">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">24</div>
          <div className="text-xs mt-2 text-gray-600">Attempted quizzes</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Active Quizzes</div>
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">8</div>
          <div className="text-xs mt-2 text-green-700">In progress</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Wallet Balance</div>
            <div className="p-2 sm:p-3 bg-purple-50 rounded-lg shadow-sm">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">₹2,450</div>
          <div className="text-xs mt-2 text-purple-600">Available balance</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-xs sm:text-sm font-medium text-gray-800">Certificates</div>
            <div className="p-2 sm:p-3 bg-orange-50 rounded-lg shadow-sm">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">12</div>
          <div className="text-xs mt-2 text-orange-700">Earned certificates</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center border-b border-l border-gray-200">
            <div className="text-gray-400 text-sm">Chart placeholder - Activity data</div>
          </div>
        </div>

        {/* Quiz Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">Quiz Progress</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center border-b border-l border-gray-200">
            <div className="text-gray-400 text-sm">Chart placeholder - Progress data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
