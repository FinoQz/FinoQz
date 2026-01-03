'use client';

import { useState } from 'react';
import InputField from './components/InputField';
import TabSwitcher from './components/TabSwitcher';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiUser from '@/lib/apiUser';
import apiAdmin from '@/lib/apiAdmin';

export default function SigninPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleContinue = async () => {
    type AxiosLikeError = {
      response?: {
        data?: { message?: unknown };
        status?: number;
      };
    };

    if (!emailOrUsername.trim() || !password.trim()) {
      setFormError('Please fill in both email/username and password');
      return;
    }

    setFormError('');

    try {
      if (activeTab === 'admin') {
        const res = await apiAdmin.post(
          'api/admin/login',
          {
            identifier: emailOrUsername,
            password,
          },
          { withCredentials: true }
        );

        if (res.data.message === 'OTP sent to email') {
          router.push('/landing/auth/user_login/verify_admin_otp');
        } else {
          setFormError('Unexpected response from server');
        }
      } else {
        const res = await apiUser.post(
          'api/user/login/initiate',
          {
            email: emailOrUsername,
            password,
          },
          { withCredentials: true }
        );

        if (res.data.message === 'OTP sent to email') {
          // ✅ Set cookie for OTP verification
          document.cookie = `userEmail=${emailOrUsername}; path=/; max-age=300`;
          router.push('/landing/auth/user_login/verify_signin_otp');
        } else {
          setFormError('Unexpected response from server');
        }
      }
    } catch (err: unknown) {
      let errMsg = 'Login failed';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const maybeMessage = (err as AxiosLikeError).response?.data?.message;
        if (typeof maybeMessage === 'string') {
          errMsg = maybeMessage;
        } else if ((err as AxiosLikeError).response?.status === 401) {
          errMsg =
            activeTab === 'admin'
              ? 'Invalid username or password'
              : 'Invalid email or password';
        }
      }
      setFormError(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
            alt="FinoQz Logo"
            width={40}
            height={40}
            unoptimized
            priority
            style={{ height: 'auto' }}
          />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500">Welcome back! Please login to continue.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Login</h2>
        <p className="text-sm text-gray-500 mb-4">Enter your credentials.</p>

        <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="space-y-4">
          <InputField
            label={activeTab === 'user' ? 'Email Address' : 'Admin Username'}
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder={activeTab === 'user' ? 'your@email.com' : 'admin'}
          />
          <InputField
            label={activeTab === 'user' ? 'Password' : 'Admin Password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          {activeTab === 'user' && (
            <div className="text-right">
              <Link
                href="/landing/auth/user_login/forgot_password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm font-medium">
              {formError}
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full bg-black text-white py-2 rounded font-semibold"
          >
            Continue to OTP
          </button>
        </div>

        {activeTab === 'user' && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Don&apos;t have an account?{' '}
            <Link
              href="/landing/auth/user_signup/signup"
              className="text-blue-600 font-semibold"
            >
              Sign up here
            </Link>
          </p>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">
          ← Back to Home
        </a>
      </p>
    </div>
  );
}
