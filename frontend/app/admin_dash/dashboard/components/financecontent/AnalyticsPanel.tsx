'use client';

import React from 'react';
import { FileText, Eye, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsPanelProps {
  stats: {
    totalContent: number;
    totalViews: number;
    monthlyEngagement: number;
    topContent: {
      title: string;
      views: number;
      category: string;
    }[];
  };
}

export default function AnalyticsPanel({ stats }: AnalyticsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Content */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalContent}
          </h3>
          <p className="text-sm text-gray-600">Content Items</p>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">All Time</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.totalViews.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Total Views</p>
        </div>

        {/* Monthly Engagement */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">This Month</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {stats.monthlyEngagement.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">Engagements</p>
        </div>

        {/* Growth Indicator */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(stats.totalViews / stats.totalContent)}
          </h3>
          <p className="text-sm text-gray-600">Avg. Views/Content</p>
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Most Viewed Content</h3>
          <TrendingUp className="w-5 h-5 text-[#253A7B]" />
        </div>
        
        <div className="space-y-3">
          {stats.topContent.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-[#253A7B] text-white rounded-lg font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm">
                  {item.title}
                </p>
                <p className="text-xs text-gray-600">{item.category}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{item.views.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
