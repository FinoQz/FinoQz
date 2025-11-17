// components/AuthCard.tsx
import React from "react";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      {children}
    </div>
  );
}
