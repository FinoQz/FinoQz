import React from 'react';
import { Plus } from 'lucide-react';

interface CreateQuizButtonProps {
  onClick?: () => void;
}

export default function CreateQuizButton({ onClick }: CreateQuizButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-[#253A7B] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2a5e] active:scale-95 transition-all shadow-sm"
    >
      <Plus className="w-4 h-4" />
      Create Quiz
    </button>
  );
}
