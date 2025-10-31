'use client';

import { useState } from 'react';

const quizData = {
  'Balance Sheet': [
    {
      question: 'A company’s assets increase, but liabilities stay constant. What happens to equity?',
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
    <section id="TryQuiz" className="w-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white overflow-hidden py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-blue-700 mb-12">Practice Finance Quiz</h2>

        {/* Topic Tabs */}
        <div className="flex justify-center gap-6 mb-10 flex-wrap">
          {topics.map((topic) => (
            <button
              key={topic}
              className={`px-6 py-3 rounded-full border text-lg font-medium transition ${
                selectedTopic === topic
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
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
              <h3 className="text-3xl font-semibold mb-4 text-blue-700">Want to see your results?</h3>
              <p className="mb-6 text-gray-600 text-lg">Login to continue and unlock full quiz access.</p>
              <a href="/login">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
                  Login / Signup
                </button>
              </a>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[60vh]">
              <p className="text-xl font-medium text-blue-700 mb-6">
                Q{currentQ + 1} (of {questions.length}): {questions[currentQ].question}
              </p>
              <ul className="space-y-5">
                {questions[currentQ].options.map((opt, i) => (
                  <li key={i}>
                    <button
                      className="w-full text-left px-6 py-4 border border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-medium transition"
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
                  className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
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
