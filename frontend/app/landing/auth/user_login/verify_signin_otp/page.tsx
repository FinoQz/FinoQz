'use client';

import VerifyOtpForm from './components/verify_otp_form';
import Image from 'next/image';

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        {/* 👇 Signin wording */}
        <p className="text-sm text-gray-500">Enter the OTP sent to your email to complete login.</p>
      </div>

      {/* 👇 This form calls /user/login/verify */}
      <VerifyOtpForm />

      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">← Back to Home</a>
      </p>
    </div>
  );
}
