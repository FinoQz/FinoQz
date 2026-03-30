'use client';

import VerifyOtpForm from './components/verify_admin_otp_form';
import Image from 'next/image';
import Link from 'next/link';

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">

      {/* LOGO + TITLE */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
            alt="FinoQz"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Welcome ADMIN! Please login to continue.
        </p>
      </div>

      {/* OTP CARD */}
      <VerifyOtpForm />

      {/* BACK TO HOME (PAGE LEVEL) */}
      <Link
        href="/landing"
        className="mt-6 text-sm text-gray-600 hover:text-indigo-600 transition flex items-center gap-1"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
