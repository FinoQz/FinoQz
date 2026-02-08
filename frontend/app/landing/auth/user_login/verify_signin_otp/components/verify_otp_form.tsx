'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiUser from '@/lib/apiUser';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function VerifySigninOtpForm() {
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [showBack, setShowBack] = useState(false);

  const inputsRef = useRef<HTMLInputElement[]>([]);

  // 🔍 read cookie
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

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join('');

    if (finalOtp.length !== 6) {
      setFormError('Enter 6-digit OTP');
      return;
    }

    setFormError('');
    setVerifying(true);
    setShowBack(true);

    try {
      await apiUser.post(
        'api/user/login/verify',
        { email, otp: finalOtp },
        { withCredentials: true }
      );

      document.cookie = 'userEmail=; path=/; max-age=0';

      setTimeout(() => {
        router.push('/user_dash');
      }, 1500);

    } catch (err) {
      setVerifying(false);
      setShowBack(false);

      let errMsg = 'OTP verification failed';
      if (axios.isAxiosError(err)) {
        const maybeMessage = err.response?.data?.message;
        if (typeof maybeMessage === 'string') errMsg = maybeMessage;
        else if (err.response?.status === 403)
          errMsg = 'Wrong OTP, kindly enter correct OTP';
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
    } catch {
      setResendMessage('❌ Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card-scene">
      <div className={`card ${showBack ? 'is-flipped' : ''}`}>

        {/* FRONT */}
        <div className="card-face card-front flex flex-col items-center justify-center">

          <div className="w-full max-w-xs text-center">

            <h2 className="text-xl font-semibold mb-3">
              User OTP Verification
            </h2>

            <p className="text-sm text-gray-500 mb-8">
              Enter the 6-digit code sent to your email
            </p>

            {/* OTP BOXES */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-6 shadow-md border border-gray-200 mb-6">
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) inputsRef.current[index] = el;
                    }}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    maxLength={1}
                    className="
                      w-full h-12 sm:h-16
                      text-center text-base sm:text-lg font-semibold
                      rounded-xl
                      bg-gray-50
                      border border-gray-300
                      shadow-inner
                      focus:outline-none
                      focus:ring-2 focus:ring-indigo-500
                      focus:bg-white
                      transition
                    "
                  />
                ))}
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded text-sm mb-5">
                {formError}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition disabled:opacity-70"
            >
              Verify & Login
            </button>

            <p className="text-xs text-gray-500 mt-5">
              Didn’t get OTP?{' '}
              <button
                onClick={handleResendOtp}
                disabled={resending}
                className="text-indigo-600 font-medium"
              >
                {resending ? 'Resending…' : 'Resend'}
              </button>
            </p>

            {resendMessage && (
              <p className="mt-2 text-sm font-medium">
                {resendMessage}
              </p>
            )}
          </div>
        </div>

        {/* BACK */}
        <div className="card-face card-back flex flex-col items-center justify-center">
          <DotLottieReact
            src="/adminash.json"
            autoplay
            loop
            style={{ width: 180, height: 180 }}
          />
          <p className="mt-4 text-lg font-semibold text-indigo-700">
            Verifying OTP…
          </p>
        </div>

      </div>
    </div>
  );
}
