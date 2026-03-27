'use client';

import React, { useState } from 'react';
import { Eye, Download, Award, Mail } from 'lucide-react';
import GenerateCertificatePopup from './GenerateCertificatePopup';

interface DrawerHeaderProps {
  quizData: {
    _id: string;
    title: string;
  };
  onPreview: () => void;
  onExport: () => void;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ quizData, onPreview, onExport }) => {
  const [showCertPopup, setShowCertPopup] = useState(false);

  const handleGenerateCertificates = () => {
    setShowCertPopup(true);
  };

  const handleMessageAll = () => {
    alert('Opening message composer for all participants...');
  };

  return (
    <>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onPreview}
            title={`Preview ${quizData.title}`}
            className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition font-medium text-sm flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Quiz
          </button>

          <button
            onClick={onExport}
            className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition font-medium text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={handleGenerateCertificates}
            className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition font-medium text-sm flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            Generate Certificates
          </button>

          <button
            onClick={handleMessageAll}
            className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-xl hover:bg-[var(--theme-secondary)] transition font-medium text-sm flex items-center gap-2 shadow-md"
          >
            <Mail className="w-4 h-4" />
            Message All
          </button>
        </div>
      </div>
      {showCertPopup && (
        <GenerateCertificatePopup quizId={quizData._id} onClose={() => setShowCertPopup(false)} />
      )}
    </>
  );
};

export default DrawerHeader;
