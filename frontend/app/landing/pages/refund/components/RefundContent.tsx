"use client";

import { Gift, CreditCard, XCircle, HelpCircle, RefreshCw } from "lucide-react";

const sections = [
  {
    icon: Gift,
    title: "1. Free Content",
    content:
      "Most of our quizzes and learning materials are free to access. No refunds apply to free content.",
    list: null,
  },
  {
    icon: CreditCard,
    title: "2. Paid Services",
    content:
      "If you purchase premium content, certificates, or subscriptions, you may request a refund within 7 days of purchase, provided the content has not been fully accessed or downloaded.",
    list: null,
  },
  {
    icon: XCircle,
    title: "3. Non-Refundable Items",
    content: null,
    list: [
      "Certificates already issued",
      "Quizzes already completed",
      "Downloaded resources",
    ],
  },
  {
    icon: HelpCircle,
    title: "4. How to Request a Refund",
    content:
      "To request a refund, contact us at support@finoqz.com with your order details and reason for the request. We aim to respond within 3 business days.",
    list: null,
  },
  {
    icon: RefreshCw,
    title: "5. Changes to This Policy",
    content:
      "FinoQz reserves the right to update this refund policy at any time. Changes will be posted on this page.",
    list: null,
  },
];

export default function RefundContent() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {sections.map((section, i) => (
        <div key={i} className="flex gap-5">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <section.icon className="w-5 h-5 text-[#253A7B]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {section.title}
            </h2>
            {section.content && (
              <p className="text-gray-500 leading-relaxed">{section.content}</p>
            )}
            {section.list && (
              <ul className="space-y-1.5 text-gray-500">
                {section.list.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="text-[#253A7B] mt-1.5 text-xs">●</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
