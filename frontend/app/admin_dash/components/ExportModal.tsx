'use client';

import React, { useState } from 'react';
import { X, Download, CheckCircle } from 'lucide-react';

interface ExportModalProps {
  quizId: string;
  onClose: () => void;
}

export default function ExportModal({ quizId, onClose }: ExportModalProps) {
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includePersonalData, setIncludePersonalData] = useState(true);
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Exporting ${format.toUpperCase()} with selected options...`);
      onClose();
    }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Export Options</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                {['csv', 'xlsx', 'pdf'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt as any)}
                    className={`p-3 rounded-xl border-2 text-center font-medium text-sm transition ${
                      format === fmt
                        ? 'border-[#253A7B] bg-[#253A7B] text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 block">Include Options</label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition border border-gray-200">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={(e) => setIncludeAnswers(e.target.checked)}
                  className="w-5 h-5 accent-[#253A7B] cursor-pointer"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Include Answers</p>
                  <p className="text-xs text-gray-500">Export user's answers and correct answers</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition border border-gray-200">
                <input
                  type="checkbox"
                  checked={includePersonalData}
                  onChange={(e) => setIncludePersonalData(e.target.checked)}
                  className="w-5 h-5 accent-[#253A7B] cursor-pointer"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Include Personal Data</p>
                  <p className="text-xs text-gray-500">Export email, phone, and other personal info</p>
                </div>
              </label>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Your export will be ready in a few seconds. Large datasets may take longer to process.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
