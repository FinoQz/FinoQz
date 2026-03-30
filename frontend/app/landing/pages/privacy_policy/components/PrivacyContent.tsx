"use client";

import { Shield, Database, Lock, UserCheck, RefreshCw } from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "1. Information We Collect",
    content: null,
    list: [
      "Personal details like name, email, and phone number",
      "Quiz activity and certificate history",
      "Device and browser information",
    ],
  },
  {
    icon: Shield,
    title: "2. How We Use Your Data",
    content: null,
    list: [
      "To provide and improve our learning services",
      "To issue certificates and track progress",
      "To respond to inquiries and offer support",
    ],
  },
  {
    icon: Lock,
    title: "3. Data Protection",
    content:
      "We use industry-standard security measures to protect your data. However, no method is 100% secure.",
    list: null,
  },
  {
    icon: UserCheck,
    title: "4. Your Rights",
    content:
      "You have the right to access, update, or delete your data. Contact us at support@finoqz.com.",
    list: null,
  },
  {
    icon: RefreshCw,
    title: "5. Changes to This Policy",
    content:
      "We may update this policy from time to time. Changes will be posted on this page.",
    list: null,
  },
];

export default function PrivacyContent() {
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
