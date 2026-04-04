'use client';

import React from 'react';
import { Eye, Download } from 'lucide-react';

interface DrawerHeaderProps {
  quizData: {
    _id: string;
    title: string;
  };
  onPreview: () => void;
  onExport: () => void;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ quizData, onPreview, onExport }) => {
  return (
    <>
      <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2 bg-white">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPreview}
            title={`Preview ${quizData.title}`}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            Preview
          </button>

          <button
            onClick={onExport}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Export Data
          </button>
        </div>
      </div>
    </>
  );
};

export default DrawerHeader;
