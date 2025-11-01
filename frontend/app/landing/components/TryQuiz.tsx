'use client';

import { useRouter } from 'next/dist/client/components/navigation';
import router from 'next/dist/shared/lib/router/router';
import { useState } from 'react';

const quizData = {
  'Balance Sheet': [
    {
      question: 'A companys assets increase, but liabilities stay constant. What happens to equity?',
      options: ['It increases', 'It decreases', 'It stays the same', 'It becomes negative'],
    },
    {
      question: 'Which item is NOT part of a balance sheet?',
      options: ['Revenue', 'Inventory', 'Accounts Payable', 'Shareholder Equity'],
    },
    {
      question: 'What does “current ratio” measure?',
      options: ['Liquidity', 'Profitability', 'Leverage', 'Efficiency'],
    },
  ],
  'P&L Statement': [
    {
      question: 'Which of these affects net profit directly?',
      options: ['Operating Expenses', 'Assets', 'Liabilities', 'Equity'],
    },
    {
      question: 'Gross profit is calculated as?',
      options: ['Revenue - COGS', 'Revenue - Expenses', 'Net Profit + Tax', 'Operating Income'],
    },
    {
      question: 'Which item is NOT in a P&L statement?',
      options: ['Depreciation', 'Net Income', 'Cash Balance', 'Tax Expense'],
    },
  ],
  'Cash Flow Statement': [
    {
      question: 'Which activity includes buying machinery?',
      options: ['Investing', 'Operating', 'Financing', 'None of the above'],
    },
    {
      question: 'Cash from financing includes?',
      options: ['Loan repayments', 'Interest income', 'Inventory purchases', 'Depreciation'],
    },
    {
      question: 'Which method adjusts net income for non-cash items?',
      options: ['Indirect method', 'Direct method', 'Hybrid method', 'Cash-only method'],
    },
  ],
};

export default function TryQuiz() {
  const router = useRouter();
  const topics = Object.keys(quizData) as Array<keyof typeof quizData>;
  const [selectedTopic, setSelectedTopic] = useState<keyof typeof quizData>(topics[0]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const questions = quizData[selectedTopic];

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setShowLoginPrompt(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  return (
    <section
      id="TryQuiz"
      className="py-20 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#253A7B] mb-4">Try a Finance Quiz</h2>
          <p className="text-xl text-gray-600">
            Attempt 3 questions from your favorite topic — no login required
          </p>
        </div>

        {/* Topic Tabs */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {topics.map((topic) => (
            <button
              key={topic}
              className={`px-6 py-3 rounded-full border text-lg font-medium transition ${
                selectedTopic === topic
                  ? 'bg-[#253A7B] text-white border-[#253A7B]'
                  : 'bg-blue-100 text-[#253A7B] border-blue-300 hover:bg-blue-200'
              }`}
              onClick={() => {
                setSelectedTopic(topic);
                setCurrentQ(0);
                setShowLoginPrompt(false);
              }}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Quiz Box */}
        <div className="w-full bg-white shadow-xl rounded-3xl border border-blue-100 p-10">
          {showLoginPrompt ? (
            <div className="text-center py-10">
              <h3 className="text-3xl font-semibold mb-4 text-[#253A7B]">Want to see your results?</h3>
              <p className="mb-6 text-gray-600 text-lg">Login to continue and unlock full quiz access.</p>
  
                <button className="bg-[#253A7B] text-white px-6 py-3 rounded-full hover:bg-blue-700 transition" onClick={() => router.push("/landing/login")}>
                  Login / Signup
                </button>
            
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <p className="text-xl font-medium text-[#253A7B] mb-6">
                Q{currentQ + 1} (of {questions.length}): {questions[currentQ].question}
              </p>
              <ul className="space-y-5">
                {questions[currentQ].options.map((opt, i) => (
                  <li key={i}>
                    <button
                      className="w-full text-left px-6 py-4 border border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#253A7B] font-medium transition"
                      onClick={handleNext}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex justify-between items-center">
                <button className="text-sm text-blue-500 hover:underline">Reveal</button>
                <button
                  className="bg-[#253A7B] text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
