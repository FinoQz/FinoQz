"use client";

import VerifyResetOtpForm from "../components/VerifyResetOtpForm";
import BrandLogo from "@/components/BrandLogo";

export default function VerifyResetOtpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <BrandLogo width={40} height={40} />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500">Verify your OTP to reset password.</p>
      </div>

      <VerifyResetOtpForm />

      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing/auth/user_login/login" className="text-gray-500 hover:text-indigo-600 text-sm">
          ← Back to Signin
        </a>
      </p>
    </div>
  );
}
