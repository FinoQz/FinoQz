'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import InputField from './components/InputField';
import TabSwitcher from './components/TabSwitcher';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiUser from '@/lib/apiUser';
import apiAdmin from '@/lib/apiAdmin';

export default function SigninPage() {
  const router = useRouter();
  
  // Prefetch next steps for instantaneous transitions
  useEffect(() => {
    router.prefetch('/landing/auth/user_login/verify_admin_otp');
    router.prefetch('/landing/auth/user_login/verify_signin_otp');
  }, [router]);

  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!emailOrUsername || !password) {
      setFormError('Please fill all fields');
      return;
    }

    setFormError('');
    setLoading(true);

    if (activeTab === 'user') {
      document.cookie = `userEmail=${emailOrUsername}; path=/; max-age=1200`;
    }

    try {
      if (activeTab === 'admin') {
        await apiAdmin.post(
          'api/admin/login',
          { identifier: emailOrUsername, password },
          { withCredentials: true }
        );

        setTimeout(() => {
          router.push('/landing/auth/user_login/verify_admin_otp');
        }, 1600);
      } else {
        await apiUser.post(
          'api/user/login/initiate',
          { email: emailOrUsername, password },
          { withCredentials: true }
        );

        setTimeout(() => {
          router.push('/landing/auth/user_login/verify_signin_otp');
        }, 1600);
      }
    } catch (err: unknown) {
      const responseData =
        err && typeof err === 'object'
          ? (err as {
              response?: {
                status?: number;
                data?: { message?: string; nextStep?: string; status?: string };
              };
            }).response
          : undefined;

      const nextStep = responseData?.data?.nextStep;
      const userStatus = responseData?.data?.status;

      if (activeTab === 'user' && (nextStep === 'verify_email_otp' || nextStep === 'verify_mobile_otp' || nextStep === 'resume_signup_verification')) {
        if (nextStep === 'verify_email_otp') {
          router.push('/landing/auth/user_signup/verify_email_otp');
          return;
        }

        if (nextStep === 'verify_mobile_otp') {
          router.push('/landing/auth/user_signup/verify_mobile_otp');
          return;
        }

        // Resume flow fallback based on status
        if (userStatus === 'pending_mobile_verification') {
          router.push('/landing/auth/user_signup/verify_mobile_otp');
          return;
        }

        router.push('/landing/auth/user_signup/verify_email_otp');
        return;
      }

      setLoading(false);
      const errorMessage = responseData?.data?.message;
      setFormError(errorMessage || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">

      {/* Logo */}
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
          Welcome back! Please login to continue.
        </p>
      </div>

      {/* 🔥 FLIP CARD */}
      <div className="card-scene">
        <div className={`card ${loading ? 'is-flipped' : ''}`}>

          {/* FRONT */}
          {/* FRONT */}
          <div className="card-face card-front flex flex-col justify-between h-full px-6 py-6">

            {/* TOP CONTENT */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Login</h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter your credentials
              </p>

              <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

              <div className="space-y-4 mt-4">
                <InputField
                  label={activeTab === 'user' ? 'Email Address' : 'Admin Username'}
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder={activeTab === 'user' ? 'your@email.com' : 'admin'}
                />

                <InputField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />

                {formError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm">
                    {formError}
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
                  disabled={loading}
                >
                  Continue to OTP
                </button>
              </div>
            </div>

            {/* BOTTOM FIXED */}
            {activeTab === 'user' && (
              <p className="text-sm text-gray-500 text-center pt-2">
                Don&apos;t have an account?{' '}
                <Link
                  href="/landing/auth/user_signup/signup"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </p>
            )}
          </div>


          {/* BACK */}
          <div className="card-face card-back">
            <DotLottieReact
              src="/OTP%20Verification.json"
              loop
              autoplay
              style={{ width: 160, height: 160 }}
            />
            <p className="mt-4 text-lg font-semibold text-indigo-700">
              Verifying credentials...
            </p>
          </div>

        </div>
      </div>

      <p className="text-sm text-gray-500 mt-6 text-center">
        <Link href="/landing" className="hover:text-indigo-600">← Back to Home</Link>
      </p>
    </div>
  );
}
