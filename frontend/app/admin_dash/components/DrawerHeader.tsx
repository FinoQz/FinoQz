'use client';

import React from 'react';
import { Eye, Download, Award, Mail } from 'lucide-react';

interface DrawerHeaderProps {
  quizData: {
    _id: string;
    title: string;
  };
  onExport: () => void;
}

export default function DrawerHeader({ quizData, onExport }: DrawerHeaderProps) {
  const handlePreviewQuiz = () => {
    alert(`Preview quiz: ${quizData.title}`);
  };

  const handleGenerateCertificates = () => {
    alert('Generating certificates... This may take a few minutes.');
  };

  const handleMessageAll = () => {
    alert('Opening message composer for all participants...');
  };

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePreviewQuiz}
          className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[#253A7B] hover:text-[#253A7B] transition font-medium text-sm flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview Quiz
        </button>

        <button
          onClick={onExport}
          className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[#253A7B] hover:text-[#253A7B] transition font-medium text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        <button
          onClick={handleGenerateCertificates}
          className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[#253A7B] hover:text-[#253A7B] transition font-medium text-sm flex items-center gap-2"
        >
          <Award className="w-4 h-4" />
          Generate Certificates
        </button>

        <button
          onClick={handleMessageAll}
          className="px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium text-sm flex items-center gap-2 shadow-md"
        >
          <Mail className="w-4 h-4" />
          Message All
        </button>
      </div>
    </div>
  );
}
