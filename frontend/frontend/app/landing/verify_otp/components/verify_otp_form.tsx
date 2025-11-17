'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleVerify = () => {
    if (otp === '123456') {
      router.push('/admin_dash');
    } else {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Login</h2>
      <p className="text-sm text-gray-500 mb-4">Enter the OTP sent to your email.</p>

      <label htmlFor="otp" className="block text-sm text-gray-700 mb-1">
        Enter OTP
      </label>
      <input
        id="otp"
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="123456"
        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
      />
      <p className="text-xs text-gray-500 mb-6">Demo: Use OTP 123456</p>

      <div className="flex justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition"
        >
          Back
        </button>
        <button
          onClick={handleVerify}
          className="w-1/2 bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
        >
          Verify & Login
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Don’t have an account?{' '}
        <span
          className="text-blue-600 font-semibold cursor-pointer"
          onClick={() => router.push('/landing/signup')}
        >
          Sign up here
        </span>
      </p>
    </div>
  );
}
