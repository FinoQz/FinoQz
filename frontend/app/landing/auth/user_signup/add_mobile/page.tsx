'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MobileInput from './components/MobileInput';
import PasswordInput from './components/PasswordInput';
import ProgressBar from './components/ProgressBar';
import apiUser from '@/lib/apiUser';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AddMobilePage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  // Read email from cookie
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )userEmail=([^;]+)/);
    if (match) {
      setEmail(decodeURIComponent(match[1]));
    } else {
      setFormError('Email not found. Please restart signup.');
      router.push('/landing/auth/user_signup/signup');
    }
  }, [router]);

  const handleSendOTP = async () => {
    setFormError('');

    if (!mobile || !password) {
      setFormError('Please enter both mobile number and password.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setIsSending(true);
      setIsFlipped(true);

      const res = await apiUser.post('api/user/signup/mobile-password', {
        email,
        mobile,
        password,
      });

      document.cookie = `userMobile=${encodeURIComponent(
        mobile
      )}; path=/; max-age=300; SameSite=Lax`;

      const nextStep = res.data?.nextStep || 'verify_mobile_otp';

      switch (nextStep) {
        case 'verify_mobile_otp':
          router.push('/landing/auth/user_signup/verify_mobile_otp');
          break;
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
    } catch (err: unknown) {
      setIsSending(false);
      setIsFlipped(false);

      let message = 'Failed to send OTP';

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">

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
          Welcome! Let’s get you started.
        </p>
      </div>

      <ProgressBar step={3} total={4} />

      {/* FLIP CARD */}
      <div className="relative z-10 w-full max-w-md mt-4 card-scene">
        <div className={`card ${isFlipped ? 'is-flipped' : ''}`}>
          {/* FRONT */}
          <div className="card-face card-front">
            <div className="min-h-[420px] flex flex-col justify-start pt-6">
              <h2 className="text-xl font-semibold mb-1">Mobile & Password</h2>
              <p className="text-sm text-gray-500 mb-6">
                Step 3: Secure your account
              </p>

              <div className="space-y-4">
                <MobileInput value={mobile} onChange={setMobile} />
                <PasswordInput value={password} onChange={setPassword} />

                {formError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
                    {formError}
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={isSending}
                  className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition disabled:opacity-60"
                >
                  {isSending ? 'Sending OTP...' : 'Send Mobile OTP'}
                </button>
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
