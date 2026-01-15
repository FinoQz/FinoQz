'use client';

import React from 'react';
import { Eye, Download, RefreshCw, CheckSquare, Square, ChevronLeft, ChevronRight } from 'lucide-react';

interface AttemptRecord {
  id: string;
  userName: string;
  email: string;
  quizTitle: string;
  attemptDate: string;
  score: number;
  totalScore: number;
  percentage: number;
  timeTaken: string;
  status: 'Passed' | 'Failed';
  type: 'Free' | 'Paid';
}

interface ReportsTableProps {
  attempts: AttemptRecord[];
  selectedAttempts: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewAttempt: (id: string) => void;
  onDownloadScorecard: (id: string) => void;
  onRegrade: (id: string) => void;
  onBulkExport: () => void;
  onBulkRegrade: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ReportsTable({
  attempts,
  selectedAttempts,
  onToggleSelect,
  onToggleSelectAll,
  onViewAttempt,
  onDownloadScorecard,
  onRegrade,
  onBulkExport,
  onBulkRegrade,
  currentPage,
  totalPages,
  onPageChange
}: ReportsTableProps) {
  const allSelected = selectedAttempts.length === attempts.length && attempts.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Bulk Actions Bar */}
      {selectedAttempts.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedAttempts.length} attempt{selectedAttempts.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onBulkExport}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export Selected
            </button>
            <button
              onClick={onBulkRegrade}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Regrade Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={onToggleSelectAll}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#253A7B]" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Quiz</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">%</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attempts.map((attempt) => (
              <tr key={attempt.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggleSelect(attempt.id)}
                    className="p-1 hover:bg-gray-100 rounded transition"
                  >
                    {selectedAttempts.includes(attempt.id) ? (
                      <CheckSquare className="w-4 h-4 text-[#253A7B]" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{attempt.userName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{attempt.email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{attempt.quizTitle}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{attempt.attemptDate}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {attempt.score}/{attempt.totalScore}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{attempt.percentage}%</td>
                <td className="px-4 py-3 text-sm text-gray-600">{attempt.timeTaken}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      attempt.status === 'Passed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {attempt.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewAttempt(attempt.id)}
                      className="p-1.5 text-gray-600 hover:text-[#253A7B] hover:bg-gray-100 rounded transition"
                      title="View Attempt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownloadScorecard(attempt.id)}
                      className="p-1.5 text-gray-600 hover:text-[#253A7B] hover:bg-gray-100 rounded transition"
                      title="Download Scorecard"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRegrade(attempt.id)}
                      className="p-1.5 text-gray-600 hover:text-[#253A7B] hover:bg-gray-100 rounded transition"
                      title="Regrade"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
