'use client';

import VerifyOtpForm from './components/verify_admin_otp_form';
import Image from 'next/image';

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Image src="/finoqz.svg" alt="FinoQz Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500">Welcome ADMIN! Please login to continue.</p>
      </div>

      <VerifyOtpForm />

      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">← Back to Home</a>
      </p>
    </div>
  );
}
