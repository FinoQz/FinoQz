'use client';

import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  onExplore?: () => void;
}

export default function EmptyState({ message = 'No quizzes here yet.', onExplore }: EmptyStateProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <FileQuestion className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">{message}</h3>
      <p className="text-gray-600 mb-6">
        Discover amazing quizzes to expand your knowledge
      </p>
      {onExplore && (
        <button
          onClick={onExplore}
          className="px-6 py-3 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] transition font-medium"
        >
          Explore Quizes
        </button>
      )}
    </div>
  );
}
