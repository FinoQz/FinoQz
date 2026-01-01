"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ApprovalCard from "./components/ApprovalCard";
import api from "@/lib/api";

export default function ApprovalPage() {
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get("api/user/signup/status", { params: { email } });
        if (res.data?.status === "approved") {
          router.push("/landing/auth/user_login/login");
        }
      } catch (err) {
        console.error("Status check failed:", err);
      }
    }, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
      {/* Header */}
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500">Welcome! Let’s get you started.</p>
      </div>

      {/* Card */}
      <ApprovalCard />

      {/* Back to Home */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">
          ← Back to Home
        </a>
      </p>
    </div>
  );
}
