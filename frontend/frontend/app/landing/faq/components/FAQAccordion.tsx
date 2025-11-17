"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is FinoQz?",
    answer: "FinoQz is a finance learning platform offering quizzes, certificates, and expert-curated content.",
  },
  {
    question: "Do I need to sign up to attempt quizzes?",
    answer: "No, you can explore and attempt demo quizzes without signing up. For certificates, login is required.",
  },
  {
    question: "How do I earn a certificate?",
    answer: "Complete a quiz and score above the required threshold to unlock your personalized certificate.",
  },
  {
    question: "Is FinoQz free to use?",
    answer: "Yes, most quizzes and learning resources are free. Premium content may be introduced later.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-4">
          <button
            onClick={() => toggle(i)}
            className="w-full text-left text-[#253A7B] font-semibold text-lg focus:outline-none"
          >
            {faq.question}
          </button>
          {openIndex === i && (
            <p className="mt-2 text-gray-700 text-sm">{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
