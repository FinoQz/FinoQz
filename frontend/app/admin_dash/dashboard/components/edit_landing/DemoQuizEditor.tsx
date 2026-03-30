'use client';

import { useState } from 'react';
import QuizCategoryForm from './quiz/QuizCategoryForm';
import QuizQuestionForm from './quiz/QuizQuestionForm';
import QuizAIForm from './quiz/QuizAIForm';

export default function DemoQuizEditor() {
  const [selectedCategory, setSelectedCategory] = useState<{
    _id: string;
    name: string;
  } | null>(null);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');

  const reset = () => {
    setSelectedCategory(null);
    setMode('manual');
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#253A7B]">Demo Quiz Editor</h2>
        {selectedCategory && (
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-red-600 underline"
          >
            Reset
          </button>
        )}
      </header>

      {/* Step 1: Category Manager */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold text-gray-800">Step 1: Create or Select Category</h3>
        <QuizCategoryForm
          onSelectCategory={(cat) => {
            if (typeof cat === 'string') {
              setSelectedCategory({ _id: cat, name: cat });
            } else {
              setSelectedCategory(cat as { _id: string; name: string });
            }
            setMode('manual');
          }}
        />
      </div>

      {/* Step 2: Category Overview */}
      {selectedCategory && (
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-md font-semibold text-gray-800">Selected Category</h3>
          <div className="flex items-center justify-between">
            <span className="text-[#253A7B] font-medium">{selectedCategory.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('manual')}
                className={`px-4 py-1 rounded text-sm ${
                  mode === 'manual'
                    ? 'bg-[#253A7B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Mode
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`px-4 py-1 rounded text-sm ${
                  mode === 'ai'
                    ? 'bg-[#253A7B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                AI Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Mode Panel */}
      {selectedCategory && (
        <div className="space-y-4 border-t pt-4">
          {mode === 'manual' ? (
            <>
              <h3 className="text-md font-semibold text-gray-800">Add & Manage Questions</h3>
              <QuizQuestionForm categoryId={selectedCategory._id} />
            </>
          ) : (
            <>
              <h3 className="text-md font-semibold text-gray-800">Generate Questions with AI</h3>
              <QuizAIForm categoryId={selectedCategory._id} />
            </>
          )}
        </div>
      )}
    </section>
  );
}
