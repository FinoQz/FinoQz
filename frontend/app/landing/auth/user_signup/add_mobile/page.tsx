// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import MobileInput from "./components/MobileInput";
// import PasswordInput from "./components/PasswordInput";
// import ProgressBar from "./components/ProgressBar";
// import api from "@/lib/api";
// import axios from "axios";

// export default function AddMobilePage() {
//   const [mobile, setMobile] = useState("");
//   const [password, setPassword] = useState("");
//   const [formError, setFormError] = useState("");
//   const router = useRouter();

//   const handleSendOTP = async () => {
//     setFormError("");

//     if (!mobile || !password) {
//       setFormError("Please enter both mobile and password.");
//       return;
//     }

//     // ✅ optional frontend validation
//     if (!/^[6-9]\d{9}$/.test(mobile)) {
//       setFormError("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     try {
//       const email = localStorage.getItem("userEmail");

//       const res = await api.post("api/user/signup/mobile-password", {
//         email,
//         mobile,
//         password,
//       });

//       // ✅ temporary OTP from backend (for demo/testing only)
//       const otp = res.data?.otp;
//       if (otp) {
//         localStorage.setItem("tempOtp", otp);
//       }

//       localStorage.setItem("userMobile", mobile);
//       // ❌ Don't store password in localStorage (security risk)

//       // ✅ Use backend nextStep for resumable flow
//       const nextStep = res.data?.nextStep || "verify_mobile_otp";
//       switch (nextStep) {
//         case "verify_mobile_otp":
//           router.push("/landing/auth/user_signup/verify_mobile_otp");
//           break;
//         case "awaiting_approval":
//           router.push("/landing/auth/user_signup/approval");
//           break;
//         case "login":
//           router.push("/landing/auth/user_login/login");
//           break;
//         case "support":
//           router.push("/support");
//           break;
//         default:
//           router.push("/landing");
//       }
//     } catch (err: unknown) {
//       let message = "Failed to send OTP";
//       if (axios.isAxiosError(err)) {
//         message = err.response?.data?.message || message;
//       } else if (err instanceof Error) {
//         message = err.message;
//       }
//       // ✅ show only friendly message, no console.error spam
//       setFormError(message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
//       <div className="text-center mb-6 flex flex-col items-center justify-center gap-2">
//         <div className="flex items-center gap-2">
//           <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz Logo" width={40} height={40} />
//           <h1 className="text-2xl font-bold">FinoQz</h1>
//         </div>
//         <p className="text-sm text-gray-500">Welcome! Let’s get you started.</p>
//       </div>

//       <ProgressBar step={3} total={4} />

//       <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mt-2">Mobile & Password</h2>
//         <p className="text-sm text-gray-500">Step 3: Enter mobile number and create password</p>
//         <br />
//         <div className="space-y-4">
//           <MobileInput value={mobile} onChange={setMobile} />
//           <PasswordInput value={password} onChange={setPassword} />

//           {formError && (
//             <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
//               {formError}
//             </div>
//           )}

//           <div className="flex justify-between gap-4">
//             <div id="recaptcha-container"></div>

//             <button
//               onClick={() => router.back()}
//               className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition"
//             >
//               Back
//             </button>
//             <button
//               onClick={handleSendOTP}
//               className="w-1/2 bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
//             >
//               Send Mobile OTP
//             </button>
//           </div>
//         </div>

//         <p className="text-sm text-gray-500 mt-4 text-center">
//           Already have an account?{" "}
//           <a href="/landing/auth/user_login/login" className="text-blue-600 font-semibold">
//             Login here
//           </a>
//         </p>
//       </div>

//       <p className="text-sm text-gray-500 mt-4 text-center">
//         <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">
//           ← Back to Home
//         </a>
//       </p>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MobileInput from './components/MobileInput';
import PasswordInput from './components/PasswordInput';
import ProgressBar from './components/ProgressBar';
import apiUser from '@/lib/apiUser';
import axios from 'axios';

export default function AddMobilePage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  // ✅ Read email from cookie
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )userEmail=([^;]+)/);
    if (match) {
      setEmail(decodeURIComponent(match[1]));
    } else {
      setFormError('Email not found. Please restart signup.');
      router.push('/landing/auth/user_signup');
    }
  }, [router]);

  const handleSendOTP = async () => {
    setFormError('');

    if (!mobile || !password) {
      setFormError('Please enter both mobile and password.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      const res = await apiUser.post('api/user/signup/mobile-password', {
        email,
        mobile,
        password,
      });

      // ✅ Store mobile in cookie (valid for 5 minutes)
      document.cookie = `userMobile=${encodeURIComponent(mobile)}; path=/; max-age=300`;

      // ✅ Use backend nextStep for resumable flow
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
            alt="FinoQz Logo"
            width={40}
            height={40}
          />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500">Welcome! Let’s get you started.</p>
      </div>

      <ProgressBar step={3} total={4} />

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mt-2">Mobile & Password</h2>
        <p className="text-sm text-gray-500">Step 3: Enter mobile number and create password</p>
        <br />
        <div className="space-y-4">
          <MobileInput value={mobile} onChange={setMobile} />
          <PasswordInput value={password} onChange={setPassword} />

          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
              {formError}
            </div>
          )}

          <div className="flex justify-between gap-4">
            <div id="recaptcha-container"></div>

            <button
              onClick={() => router.back()}
              className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition"
            >
              Back
            </button>
            <button
              onClick={handleSendOTP}
              className="w-1/2 bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
            >
              Send Mobile OTP
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <a href="/landing/auth/user_login/login" className="text-blue-600 font-semibold">
            Login here
          </a>
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">
          ← Back to Home
        </a>
      </p>
    </div>
  );
}
