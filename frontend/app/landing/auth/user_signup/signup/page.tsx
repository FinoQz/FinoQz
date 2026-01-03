// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import InputField from "./components/InputField";
// import ProgressBar from "./components/ProgressBar";
// import AuthCard from "./components/AuthCard";
// import api from "@/lib/api";
// import { isAxiosError } from "axios";

// // 🔑 Helper function for redirect
// const redirectByNextStep = (nextStep: string, router: ReturnType<typeof useRouter>) => {
//   switch (nextStep) {
//     case "email_otp":
//       router.push("/landing/auth/user_signup/verify_email_otp");
//       break;
//     case "mobile_password":
//       router.push("/landing/auth/user_signup/add_mobile");
//       break;
//     case "verify_mobile_otp":
//       router.push("/landing/auth/user_signup/verify_mobile_otp");
//       break;
//     case "awaiting_approval":
//       router.push("/landing/auth/user_signup/approval");
//       break;
//     case "login":
//       router.push("/landing/auth/user_login/login");
//       break;
//     case "support":
//       router.push("/support");
//       break;
//     default:
//       // 👇 Default should be email OTP, not landing
//       router.push("/landing/auth/user_signup/verify_email_otp");
//   }
// };

// export default function SignupPage() {
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [formError, setFormError] = useState("");
//   const router = useRouter();

//   const isValidEmail = (email: string) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   const handleSendOTP = async () => {
//     const trimmedName = fullName.trim();
//     const trimmedEmail = email.trim();

//     // ✅ Validation
//     if (!trimmedName && !trimmedEmail) {
//       setFormError("Please enter your full name and email address.");
//       return;
//     }
//     if (!trimmedName) {
//       setFormError("Please enter your full name.");
//       return;
//     }
//     if (!trimmedEmail) {
//       setFormError("Please enter your email address.");
//       return;
//     }
//     if (!isValidEmail(trimmedEmail)) {
//       setFormError("Please enter a valid email address.");
//       return;
//     }

//     setFormError("");

//     try {
//       const res = await api.post("api/user/signup/initiate", {
//         fullName: trimmedName,
//         email: trimmedEmail,
//       });

//       localStorage.setItem("userEmail", trimmedEmail);

//       // ✅ Use backend nextStep for redirect
//       const nextStep = res.data?.nextStep || "email_otp";
//       redirectByNextStep(nextStep, router);
//     } catch (err: unknown) {
//       let msg = "Something went wrong. Please try again.";

//       if (isAxiosError(err)) {
//         const data = (err as { response?: { data?: { message?: string; nextStep?: string } } }).response?.data;
//         msg = data?.message ?? (err as { message?: string }).message ?? msg;

//         // ✅ Special case: already registered & verified → show error + redirect to login after delay
//         if (data?.nextStep === "login") {
//           setFormError("This email is already registered and verified. Please sign in instead.");
//           setTimeout(() => {
//             router.push("/landing/auth/user_login/login");
//           }, 3000); // ⏱️ 3 second delay
//           return;
//         }

//         // ✅ Handle resumable flow on other errors
//         if (data?.nextStep) {
//           localStorage.setItem("userEmail", trimmedEmail);
//           redirectByNextStep(data.nextStep, router);
//           return;
//         }
//       } else if (err instanceof Error) {
//         msg = err.message || msg;
//       }

//       setFormError(msg);
//     }
//   };


//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
//       {/* Header */}
//       <div className="text-center mb-6 flex flex-col items-center justify-center gap-2">
//         <div className="flex items-center gap-2">
//           <Image src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg" alt="FinoQz Logo" width={40} height={40} />
//           <h1 className="text-2xl font-bold">FinoQz</h1>
//         </div>
//         <p className="text-sm text-gray-500">Welcome! Let’s get you started.</p>
//       </div>

//       {/* Progress */}
//       <ProgressBar step={1} total={4} />

//       {/* Card */}
//       <AuthCard>
//         <h2 className="text-xl font-semibold mb-2">Create Your Account</h2>
//         <p className="text-sm text-gray-500 mb-4">Step 1: Enter your details</p>

//         <div className="space-y-4">
//           <InputField
//             label="Full Name"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             placeholder="John Doe"
//           />
//           <InputField
//             label="Email Address"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="john@example.com"
//           />

//           {formError && (
//             <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
//               {formError}
//             </div>
//           )}

//           <button
//             onClick={handleSendOTP}
//             className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
//           >
//             Send Email OTP
//           </button>
//         </div>

//         <p className="text-sm text-gray-500 mt-4 text-center">
//           Already have an account?{" "}
//           <a href="/landing/auth/user_login/login" className="text-blue-600 font-semibold">
//             Login here
//           </a>
//         </p>
//       </AuthCard>

//       {/* Back to Home */}
//       <p className="text-sm text-gray-500 mt-4 text-center">
//         <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">
//           ← Back to Home
//         </a>
//       </p>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import InputField from './components/InputField';
import ProgressBar from './components/ProgressBar';
import AuthCard from './components/AuthCard';
import apiUser from '@/lib/apiUser';
import { isAxiosError } from 'axios';

const redirectByNextStep = (nextStep: string, router: ReturnType<typeof useRouter>) => {
  switch (nextStep) {
    case 'email_otp':
      router.push('/landing/auth/user_signup/verify_email_otp');
      break;
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
      router.push('/landing/auth/user_signup/verify_email_otp');
  }
};

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOTP = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName && !trimmedEmail) {
      setFormError('Please enter your full name and email address.');
      return;
    }
    if (!trimmedName) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setFormError('');

    try {
      const res = await apiUser.post('api/user/signup/initiate', {
        fullName: trimmedName,
        email: trimmedEmail,
      });

      // ✅ Store email in cookie (valid for 5 minutes)
      document.cookie = `userEmail=${encodeURIComponent(trimmedEmail)}; path=/; max-age=300`;

      const nextStep = res.data?.nextStep || 'email_otp';
      redirectByNextStep(nextStep, router);
    } catch (err: unknown) {
      let msg = 'Something went wrong. Please try again.';

      if (isAxiosError(err)) {
        const data = (err as { response?: { data?: { message?: string; nextStep?: string } } }).response?.data;
        msg = data?.message ?? (err as { message?: string }).message ?? msg;

        if (data?.nextStep === 'login') {
          setFormError('This email is already registered and verified. Please sign in instead.');
          setTimeout(() => {
            router.push('/landing/auth/user_login/login');
          }, 3000);
          return;
        }

        if (data?.nextStep) {
          document.cookie = `userEmail=${encodeURIComponent(trimmedEmail)}; path=/; max-age=300`;
          redirectByNextStep(data.nextStep, router);
          return;
        }
      } else if (err instanceof Error) {
        msg = err.message || msg;
      }

      setFormError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
      {/* Header */}
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

      {/* Progress */}
      <ProgressBar step={1} total={4} />

      {/* Card */}
      <AuthCard>
        <h2 className="text-xl font-semibold mb-2">Create Your Account</h2>
        <p className="text-sm text-gray-500 mb-4">Step 1: Enter your details</p>

        <div className="space-y-4">
          <InputField
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />

          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
              {formError}
            </div>
          )}

          <button
            onClick={handleSendOTP}
            className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
          >
            Send Email OTP
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <a href="/landing/auth/user_login/login" className="text-blue-600 font-semibold">
            Login here
          </a>
        </p>
      </AuthCard>

      {/* Back to Home */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">
          ← Back to Home
        </a>
      </p>
    </div>
  );
}
