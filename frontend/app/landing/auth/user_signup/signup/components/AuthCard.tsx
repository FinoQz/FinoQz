// components/AuthCard.tsx
import React from "react";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl shadow-indigo-100 backdrop-blur">
      {children}
    </div>
  );
}
