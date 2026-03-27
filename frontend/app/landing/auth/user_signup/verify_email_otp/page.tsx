'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import apiUser from '@/lib/apiUser';
import InputField from './components/OtpInputField';
import ProgressBar from './components/ProgressBar';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function VerifyEmailOtpPage() {
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )userEmail=([^;]+)/);
    if (match) {
      setEmail(decodeURIComponent(match[1]));
    } else {
      setFormError('Email not found. Please restart signup.');
      router.push('/landing/auth/user_signup');
    }
  }, [router]);

  const goNext = (nextStep: string) => {
    switch (nextStep) {
      case 'mobile_password':
        router.push('/landing/auth/user_signup/add_mobile');
        break;
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
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      setFormError('Please enter the OTP.');
      return;
    }

    try {
      setIsVerifying(true);

      const res = await apiUser.post('api/user/signup/verify-email', {
        email,
        otp,
      });

      setFormError('');
      const nextStep = res.data?.nextStep || 'mobile_password';

      setIsFlipped(true);
      setTimeout(() => goNext(nextStep), 900);
    } catch (err: unknown) {
      setIsVerifying(false);

      let message = 'Verification failed. Please try again.';

      if (typeof err === 'object' && err !== null) {
        const maybe = err as {
          response?: { data?: { message?: unknown; nextStep?: string } };
        };

        const candidate = maybe.response?.data?.message;
        if (typeof candidate === 'string' && candidate.length > 0) {
          message = candidate;
        }

        const nextStep = maybe.response?.data?.nextStep;
        if (nextStep) {
          setIsFlipped(true);
          setTimeout(() => goNext(nextStep), 900);
          return;
        }
      }

      setFormError(message);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setResendMessage('');

    try {
      await apiUser.post('api/user/signup/resend-email-otp', { email });
      setResendMessage('OTP has been resent to your email.');
    } catch (err: unknown) {
      let message = 'Failed to resend OTP. Please try again.';

      if (typeof err === 'object' && err !== null) {
        const maybe = err as { response?: { data?: { message?: unknown } } };
        const candidate = maybe.response?.data?.message;
        if (typeof candidate === 'string' && candidate.length > 0) {
          message = candidate;
        }
      }

      setResendMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <BrandLogo width={40} height={40} priority />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Welcome! Let’s get you started.
        </p>
      </div>

      <ProgressBar step={2} total={4} />

      {/* FLIP CARD */}
      <div className="relative z-10 w-full max-w-md mt-4 card-scene">
        <div className={`card ${isFlipped ? 'is-flipped' : ''}`}>

          {/* FRONT */}
          <div className="card-face card-front">
            <div className="min-h-[425px] flex flex-col justify-start pt-4">
              <h2 className="text-xl font-semibold mb-2">Verify Email</h2>
              <p className="text-sm text-gray-500 mb-6">
                Step 2: Enter the OTP sent to{' '}
                <span className="font-medium text-black">{email}</span>
              </p>

              <div className="space-y-4">
                <InputField label="Email OTP" value={otp} onChange={setOtp} />

                {formError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
                    {formError}
                  </div>
                )}

                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition disabled:opacity-60"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Didn’t get the OTP?{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
                  >
                    {loading ? 'Resending...' : 'Resend'}
                  </button>
                </p>

                {resendMessage && (
                  <p className="text-xs text-green-600 text-center mt-1">
                    {resendMessage}
                  </p>
                )}
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
          <div className="card-face card-back flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold">Email Verified</h3>
              <p className="text-sm text-gray-500 mt-1">
                Taking you to the next step...
              </p>
            </div>
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
