"use client";

import {
  Monitor,
  User,
  Award,
  Copyright,
  XCircle,
  RefreshCw,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: Monitor,
    title: "1. Use of Platform",
    text: "You may use FinoQz for personal, educational purposes. You agree not to misuse the platform or attempt unauthorized access.",
  },
  {
    icon: User,
    title: "2. Account Responsibility",
    text: "If you create an account, you are responsible for maintaining its confidentiality and for all activities under it.",
  },
  {
    icon: Award,
    title: "3. Certificates & Achievements",
    text: "Certificates are awarded based on quiz performance. FinoQz reserves the right to revoke certificates in case of misuse.",
  },
  {
    icon: Copyright,
    title: "4. Intellectual Property",
    text: "All content on FinoQz is protected by copyright. You may not reproduce or distribute content without permission.",
  },
  {
    icon: XCircle,
    title: "5. Termination",
    text: "We may suspend or terminate your access if you violate these terms or misuse the platform.",
  },
  {
    icon: RefreshCw,
    title: "6. Changes to Terms",
    text: "FinoQz may update these terms from time to time. Continued use of the platform means you accept the changes.",
  },
  {
    icon: Mail,
    title: "7. Contact",
    text: "For questions, contact us at support@finoqz.com.",
  },
];

export default function TermsContent() {
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
            <p className="text-gray-500 leading-relaxed">{section.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
