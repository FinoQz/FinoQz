"use client";

import ForgotPasswordForm from "./components/ForgotPasswordForm";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz Logo" width={40} height={40} unoptimized priority style={{ height: 'auto' }} />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500">Reset your password securely.</p>
      </div>

      <ForgotPasswordForm />

      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing/auth/user_login/login" className="text-gray-500 hover:text-indigo-600 text-sm">
          ← Back to Signin
        </a>
      </p>
    </div>
  );
}
