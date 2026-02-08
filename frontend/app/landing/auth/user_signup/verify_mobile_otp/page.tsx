'use client';

import apiUser from '@/lib/apiUser';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import InputField from './components/InputField';
import ProgressBar from './components/ProgressBar';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function VerifyMobileOtpPage() {
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [mobile, setMobile] = useState('');
  const [tempOtp, setTempOtp] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const router = useRouter();

  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  };

  useEffect(() => {
    const storedMobile = getCookie('userMobile');
    if (storedMobile) setMobile(storedMobile);

    const storedOtp = getCookie('tempOtp');
    if (storedOtp) {
      setTempOtp(storedOtp);
      setTimeout(() => {
        setTempOtp(null);
        deleteCookie('tempOtp');
      }, 10000);
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(
        () => setCooldown((c) => (c > 0 ? c - 1 : 0)),
        1000
      );
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setFormError('Please enter the OTP.');
      return;
    }

    try {
      const email = getCookie('userEmail');
      if (!email) {
        setFormError('Email not found. Please restart signup.');
        return;
      }

      const res = await apiUser.post('api/user/signup/verify-mobile', {
        email,
        otp,
      });

      const nextStep = res.data?.nextStep || 'awaiting_approval';
      setIsFlipped(true);
      setTimeout(() => goNext(nextStep), 900);
    } catch (err) {
      let message = 'OTP verification failed';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setFormError(message);
    }
  };

  const goNext = (nextStep: string) => {
    switch (nextStep) {
      case 'awaiting_approval':
        router.push('/landing/auth/user_signup/approval');
        break;
      case 'login':
        router.push('/landing/auth/user_login/login');
        break;
      case 'support':
        router.push('/support');
        break;
      default:
        router.push('/landing');
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setResendMessage('');
    setFormError('');

    try {
      const email = getCookie('userEmail');
      if (!email) {
        setFormError('Email not found. Please restart signup.');
        return;
      }

      await apiUser.post('api/user/signup/resend-mobile-otp', { email });

      setResendMessage('A new OTP has been sent to your mobile number.');
      setCooldown(30);

      const newOtp = getCookie('tempOtp');
      if (newOtp) {
        setTempOtp(newOtp);
        setTimeout(() => {
          setTempOtp(null);
          deleteCookie('tempOtp');
        }, 10000);
      }
    } catch (err) {
      let message = 'Failed to resend OTP';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setResendMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4 relative">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
            alt="FinoQz Logo"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Final step — verify your mobile number
        </p>
      </div>

      <ProgressBar step={4} total={4} />

      {/* TEMP OTP (DEV ONLY) */}
      {tempOtp && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-lg shadow-lg text-center max-w-sm w-full mx-4 relative">
            <button
              onClick={() => {
                setTempOtp(null);
                deleteCookie('tempOtp');
              }}
              className="absolute top-1 right-2 text-sm text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <p className="font-semibold">Temporary OTP (testing)</p>
            <p className="text-2xl font-bold tracking-widest mt-1">{tempOtp}</p>
            <p className="text-xs text-gray-500 mt-2">
              This will disappear in 10 seconds
            </p>
          </div>
        </div>
      )}

      {/* FLIP CARD */}
      <div className="relative z-10 w-full max-w-md mt-4 card-scene">
        <div className={`card ${isFlipped ? 'is-flipped' : ''}`}>
          {/* FRONT */}
          <div className="card-face card-front">
            <div className="min-h-[420px] flex flex-col justify-start pt-6">
              <h2 className="text-xl font-semibold mb-2">Verify Mobile</h2>

              <p className="text-sm text-gray-500 mb-6">
                Enter the OTP sent to{' '}
                <span className="font-medium text-black">{mobile}</span>
              </p>

              <div className="space-y-4">
                <InputField
                  label="Mobile OTP"
                  value={otp}
                  onChange={(value) => setOtp(value)}
                />

                {formError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
                    {formError}
                  </div>
                )}

                {resendMessage && (
                  <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded text-sm font-medium">
                    {resendMessage}
                  </div>
                )}

                <button
                  onClick={handleVerify}
                  className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
                >
                  Complete Signup
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Didn’t get the OTP?{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={loading || cooldown > 0}
                    className="text-indigo-600 font-medium hover:underline disabled:text-gray-400"
                  >
                    {loading
                      ? 'Resending...'
                      : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend'}
                  </button>
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-6 text-center">
                Already have an account?{' '}
                <a
                  href="/landing/auth/user_login/login"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Login here
                </a>
              </p>
            </div>
          </div>

          {/* BACK */}
          <div className="card-face card-back flex flex-col items-center justify-center">
            <DotLottieReact
              src="/OTP%20Verification.json"
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

      {/* Back to Home */}
      <a
        href="/landing"
        className="mt-6 text-sm text-gray-500 hover:text-indigo-600 relative z-20"
      >
        ← Back to Home
      </a>

    </div>
  );
}
