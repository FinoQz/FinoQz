'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiUser from '@/lib/apiUser';
import axios from 'axios';

export default function VerifySigninOtpForm() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);
  const router = useRouter();

  // 🔍 Helper to read cookie value
  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  useEffect(() => {
    const storedEmail = getCookie('userEmail');
    if (!storedEmail) {
      router.push('/landing/auth/user_login/login');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerify = async () => {
    if (!otp.trim() || !email.trim()) {
      setFormError('Missing OTP or email');
      return;
    }

    setFormError('');
    setResendMessage('');

    try {
      await apiUser.post(
        'api/user/login/verify',
        { email, otp },
        { withCredentials: true }
      );

      // ✅ Clear the cookie after successful login
      document.cookie = 'userEmail=; path=/; max-age=0';

      // ✅ Redirect to user dashboard
      router.push('/user_dash');
    } catch (err) {
      let errMsg = 'OTP verification failed';
      if (axios.isAxiosError(err)) {
        const maybeMessage = err.response?.data?.message;
        if (typeof maybeMessage === 'string') {
          errMsg = maybeMessage;
        } else if (err.response?.status === 403) {
          errMsg = 'Wrong OTP, kindly enter correct OTP';
        }
      }
      setFormError(errMsg);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setResending(true);
    setResendMessage('');
    try {
      await apiUser.post(
        'api/user/login/resend-otp',
        { email },
        { withCredentials: true }
      );
      setResendMessage('✅ OTP resent to your email');
    } catch (err) {
      setResendMessage('❌ Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Signin</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter the OTP sent to your email to complete login.
      </p>

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

      {formError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm font-medium">
          {formError}
        </div>
      )}

      {resendMessage && (
        <div className="text-sm mb-3 font-medium text-gray-600">{resendMessage}</div>
      )}

      <div className="flex justify-between gap-4 mb-3">
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
      <p className="text-xs text-gray-500 text-center mt-2">
        Didn’t get the OTP?{' '}
        <button
          onClick={handleResendOtp}
          disabled={resending}
          className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
        >
          {resending ? 'Resending...' : 'Resend'}
        </button>
      </p>

      {resendMessage && (
        <div
          className={`mt-3 text-sm px-4 py-2 rounded font-medium text-center ${resendMessage.startsWith('✅')
              ? 'bg-green-50 border border-green-300 text-green-700'
              : 'bg-red-50 border border-red-300 text-red-700'
            }`}
        >
          {resendMessage}
        </div>
      )}


    </div>
  );
}
