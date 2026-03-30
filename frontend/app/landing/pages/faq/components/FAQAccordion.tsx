"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is FinoQz?",
    answer:
      "FinoQz is a finance learning platform offering quizzes, certificates, and expert-curated content.",
  },
  {
    question: "Do I need to sign up to attempt quizzes?",
    answer:
      "No, you can explore and attempt demo quizzes without signing up. For certificates, login is required.",
  },
  {
    question: "How do I earn a certificate?",
    answer:
      "Complete a quiz and score above the required threshold to unlock your personalized certificate.",
  },
  {
    question: "Is FinoQz free to use?",
    answer:
      "Yes, most quizzes and learning resources are free. Premium content may be introduced later.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="divide-y divide-gray-100">
      {faqs.map((faq, i) => (
        <div key={i} className="py-6">
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between text-left focus:outline-none group"
          >
            <span className="text-gray-900 font-medium text-lg group-hover:text-[#253A7B] transition-colors">
              {faq.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 shrink-0 ml-4 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""
                }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-40 mt-3" : "max-h-0"
              }`}
          >
            <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
