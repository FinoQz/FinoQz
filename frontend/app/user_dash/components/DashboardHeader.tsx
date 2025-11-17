"use client";
import Image from "next/image";

export default function DashboardHeader({ fullName, email }: { fullName: string; email: string }) {
  return (
    <div className="text-center mb-8 flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-2">
        <Image src="/finoqz.svg" alt="FinoQz Logo" width={48} height={48} />
        <h1 className="text-3xl font-bold text-[#253A7B]">FinoQz</h1>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">Welcome, {fullName} 👋</h2>
      <p className="text-sm text-gray-500">{email}</p>
    </div>
  );
}
