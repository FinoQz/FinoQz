'use client';

import React, { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';

interface ExportControlsProps {
  onExportCSV: () => void;
  onExportXLSX: () => void;
}

export default function ExportControls({ onExportCSV, onExportXLSX }: ExportControlsProps) {
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    includeAnswers: true,
    includePII: false,
    dateRange: '30',
    format: 'detailed'
  });

  const handleGeneratePDF = () => {
    console.log('Generating PDF with options:', pdfOptions);
    setShowPDFModal(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onExportCSV}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button
          onClick={() => setShowPDFModal(true)}
          className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium flex items-center gap-2 shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Generate PDF Report
        </button>
      </div>

      {/* PDF Options Modal */}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">PDF Report Options</h3>
              <button
                onClick={() => setShowPDFModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Include Answers */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeAnswers}
                  onChange={(e) =>
                    setPdfOptions({ ...pdfOptions, includeAnswers: e.target.checked })
                  }
                  className="w-4 h-4 text-[#253A7B] border-gray-300 rounded focus:ring-[#253A7B]"
                />
                <span className="text-sm text-gray-700">Include answers in report</span>
              </label>

              {/* Include PII */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includePII}
                  onChange={(e) =>
                    setPdfOptions({ ...pdfOptions, includePII: e.target.checked })
                  }
                  className="w-4 h-4 text-[#253A7B] border-gray-300 rounded focus:ring-[#253A7B]"
                />
                <span className="text-sm text-gray-700">Include user PII (email, phone)</span>
              </label>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Date Range
                </label>
                <select
                  value={pdfOptions.dateRange}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Report Format
                </label>
                <select
                  value={pdfOptions.format}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A7B] text-sm"
                >
                  <option value="summary">Summary Report</option>
                  <option value="detailed">Detailed Report</option>
                  <option value="scorecard">Individual Scorecards</option>
                </select>
              </div>

              {/* Permission Note */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Only Finance/Manager roles can export reports with PII data.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPDFModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePDF}
                className="px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
