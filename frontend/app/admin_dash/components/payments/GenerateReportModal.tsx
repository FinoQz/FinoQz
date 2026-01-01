'use client';

import React, { useState } from 'react';
import { X, FileText, Calendar, Filter, Download, CheckCircle } from 'lucide-react';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ReportConfig) => void;
}

export interface ReportConfig {
  reportType: string;
  dateFrom: string;
  dateTo: string;
  format: string;
  includeRefunds: boolean;
  includeFailedTxns: boolean;
  groupBy: string;
}

export default function GenerateReportModal({ isOpen, onClose, onGenerate }: GenerateReportModalProps) {
  const [reportType, setReportType] = useState('summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [format, setFormat] = useState('pdf');
  const [includeRefunds, setIncludeRefunds] = useState(true);
  const [includeFailedTxns, setIncludeFailedTxns] = useState(false);
  const [groupBy, setGroupBy] = useState('date');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!dateFrom) newErrors.dateFrom = 'Start date is required';
    if (!dateTo) newErrors.dateTo = 'End date is required';
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      newErrors.dateTo = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (validateForm()) {
      onGenerate({
        reportType,
        dateFrom,
        dateTo,
        format,
        includeRefunds,
        includeFailedTxns,
        groupBy
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setReportType('summary');
    setDateFrom('');
    setDateTo('');
    setFormat('pdf');
    setIncludeRefunds(true);
    setIncludeFailedTxns(false);
    setGroupBy('date');
    setErrors({});
    onClose();
  };

  const reportTypes = [
    { value: 'summary', label: 'Revenue Summary', desc: 'Overview of revenue, transactions, and trends' },
    { value: 'detailed', label: 'Detailed Transactions', desc: 'All transaction records with complete details' },
    { value: 'refunds', label: 'Refunds Report', desc: 'All refunded transactions with reasons' },
    { value: 'gateway', label: 'Gateway Analysis', desc: 'Performance breakdown by payment gateway' },
    { value: 'user', label: 'User Payment History', desc: 'Payment patterns by user segments' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#253A7B] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate Report</h2>
              <p className="text-sm text-gray-600 mt-0.5">Create custom payment and revenue reports</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Report Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {reportTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                    reportType === type.value
                      ? 'border-[#253A7B] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={reportType === type.value}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mt-1 w-4 h-4 text-[#253A7B]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{type.desc}</p>
                  </div>
                  {reportType === type.value && (
                    <CheckCircle className="w-5 h-5 text-[#253A7B] flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                />
              </div>
              {errors.dateFrom && <p className="text-xs text-red-500 mt-1">{errors.dateFrom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
                />
              </div>
              {errors.dateTo && <p className="text-xs text-red-500 mt-1">{errors.dateTo}</p>}
            </div>
          </div>

          {/* Format & Group By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group By
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition bg-white"
              >
                <option value="date">Date</option>
                <option value="method">Payment Method</option>
                <option value="gateway">Gateway</option>
                <option value="user">User</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include in Report
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={includeRefunds}
                  onChange={(e) => setIncludeRefunds(e.target.checked)}
                  className="w-4 h-4 text-[#253A7B] rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Refunded Transactions</p>
                  <p className="text-xs text-gray-600">Include all refund records in the report</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={includeFailedTxns}
                  onChange={(e) => setIncludeFailedTxns(e.target.checked)}
                  className="w-4 h-4 text-[#253A7B] rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Failed Transactions</p>
                  <p className="text-xs text-gray-600">Include failed payment attempts</p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Report Generation:</span> The report will be generated based on your selections and will be available for download. Large reports may take a few moments to process.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t-2 border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 px-6 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
