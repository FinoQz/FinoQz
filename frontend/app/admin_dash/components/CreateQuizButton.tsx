'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface CreateQuizButtonProps {
  onClick?: () => void;
}

export default function CreateQuizButton({ onClick }: CreateQuizButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#253A7B] text-white rounded-xl hover:bg-[#1a2a5e] shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-sm"
    >
      <Plus className="w-5 h-5" />
      Create Quiz
    </button>
  );
}
