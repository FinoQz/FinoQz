'use client';

import React from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, File } from 'lucide-react';

interface ExportReportsProps {
  onExport: () => void;
}

export default function ExportReports({ onExport }: ExportReportsProps) {
  const exportFormats = [
    {
      label: 'CSV (Participants)',
      description: 'Export participant data as CSV',
      icon: FileText,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'XLSX (Excel)',
      description: 'Export as Excel spreadsheet',
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'PDF Scorecards',
      description: 'Generate PDF scorecards',
      icon: File,
      color: 'text-red-600',
      bg: 'bg-red-100'
    },
    {
      label: 'JSON (Q&A)',
      description: 'Questions and answers data',
      icon: FileJson,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  const prebuiltReports = [
    { label: 'Attendance Report', description: 'Registration and attendance data' },
    { label: 'Revenue Report', description: 'Payment and revenue breakdown' },
    { label: 'Question Analysis', description: 'Question-wise performance' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-5 h-5 text-[#253A7B]" />
        <h3 className="text-lg font-bold text-gray-900">Export & Reports</h3>
      </div>

      {/* Export Formats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {exportFormats.map((format, index) => {
          const Icon = format.icon;
          return (
            <button
              key={index}
              onClick={onExport}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition border-2 border-gray-200 hover:border-[#253A7B] text-left group"
            >
              <div className={`w-10 h-10 rounded-lg ${format.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                <Icon className={`w-5 h-5 ${format.color}`} />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1">{format.label}</p>
              <p className="text-xs text-gray-500">{format.description}</p>
            </button>
          );
        })}
      </div>

      {/* Pre-built Reports */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Pre-built Reports</h4>
        <div className="space-y-2">
          {prebuiltReports.map((report, index) => (
            <button
              key={index}
              className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200 hover:border-[#253A7B] text-left flex items-center justify-between group"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">{report.label}</p>
                <p className="text-xs text-gray-500">{report.description}</p>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-[#253A7B] transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
