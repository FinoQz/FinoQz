'use client';

import React from 'react';
import { Award, Download, Share2, Calendar } from 'lucide-react';

export default function Certificates() {
  const certificates = [
    { id: 1, title: 'Personal Finance Basics', score: 85, date: '2025-01-15', issueNo: 'CERT-001' },
    { id: 2, title: 'Tax Planning for Professionals', score: 92, date: '2025-01-10', issueNo: 'CERT-002' },
    { id: 3, title: 'Stock Market Analysis', score: 88, date: '2025-01-08', issueNo: 'CERT-003' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Certificates</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">View and download your earned certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Total Certificates</div>
            <Award className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">12</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Average Score</div>
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">88%</div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800">Last Earned</div>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">Jan 15, 2025</div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cert.title}</h3>
                  <p className="text-sm text-gray-600">Certificate No: {cert.issueNo}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600">Score</p>
                <p className="text-2xl font-bold text-green-600">{cert.score}%</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600">Issued On</p>
                <p className="text-sm font-semibold text-gray-900">{cert.date}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-[#253A7B] text-white rounded-lg hover:bg-[#1a2a5e] transition font-medium text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
