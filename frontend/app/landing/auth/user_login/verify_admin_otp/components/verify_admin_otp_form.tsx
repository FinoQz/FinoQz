// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import api from '@/lib/api';
// import axios from 'axios';

// export default function VerifyOtpForm() {
//   const [otp, setOtp] = useState('');
//   const [email, setEmail] = useState('');
//   const router = useRouter();
//   const [formError, setFormError] = useState('');
//   const [resendLoading, setResendLoading] = useState(false);



//   useEffect(() => {
//     const storedEmail = localStorage.getItem('adminEmail');
//     if (!storedEmail) {
//       router.push('/landing/admin_dash');
//     } else {
//       setEmail(storedEmail);
//     }
//   }, [router]);
//   const handleVerify = async () => {
//     if (!otp || !email) {
//       setFormError("Missing OTP or email/username");
//       return;
//     }

//     setFormError(""); // clear previous error

//     try {
//       // 👉 अगर storedEmail valid email है तो email भेजो, वरना identifier भेजो
//       const payload = email.includes("@")
//         ? { email, otp }
//         : { identifier: email, otp };

//       const res = await api.post('api/admin/verify-otp', payload);

//       localStorage.setItem('adminToken', res.data.token);
//       router.push('/admin_dash');
//     } catch (err: unknown) {
//       let errMsg = 'OTP verification failed';

//       if (axios.isAxiosError(err)) {
//         const maybeMessage = err.response?.data?.message;
//         if (typeof maybeMessage === 'string') {
//           errMsg = maybeMessage;
//         } else if (err.response?.status === 403) {
//           errMsg = "Wrong OTP, kindly enter correct OTP";
//         }
//       }

//       setFormError(errMsg);
//     }
//   };
//   const handleResendOtp = async () => {
//     if (!email) {
//       setFormError("Email/username missing");
//       return;
//     }

//     setResendLoading(true);
//     try {
//       const payload = email.includes("@")
//         ? { email }
//         : { identifier: email };

//       await api.post('api/admin/resend-otp', payload);
//       alert("✅ OTP resent successfully!");
//     } catch (err) {
//       console.error("Resend OTP error:", err);
//       alert("❌ Failed to resend OTP");
//     } finally {
//       setResendLoading(false);
//     }
//   };


//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
//       <h2 className="text-xl font-semibold mb-2">Login</h2>
//       <p className="text-sm text-gray-500 mb-4">Enter the OTP sent to your email.</p>

//       <label htmlFor="otp" className="block text-sm text-gray-700 mb-1">
//         Enter OTP
//       </label>
//       <input
//         id="otp"
//         type="text"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//         placeholder="123456"
//         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
//       />
//       {formError && (
//         <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm font-medium">
//           {formError}
//         </div>
//       )}


//       <div className="flex justify-between gap-4">
//         <button
//           onClick={() => router.back()}
//           className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition"
//         >
//           Back
//         </button>
//         <button
//           onClick={handleVerify}
//           className="w-1/2 bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
//         >
//           Verify & Login
//         </button>
//       </div>
//       <p className="text-xs text-gray-500 text-center mt-2">
//         Didn’t get the OTP?{" "}
//         <button
//           onClick={handleResendOtp}
//           disabled={resendLoading}
//           className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
//         >
//           {resendLoading ? "Resending..." : "Resend"}
//         </button>
//       </p>

//     </div>
//   );
// }
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import apiAdmin from '@/lib/apiAdmin';

// export default function VerifyOtpForm() {
//   const [otp, setOtp] = useState('');
//   const [email, setEmail] = useState('');
//   const router = useRouter();
//   const [formError, setFormError] = useState('');
//   const [resendLoading, setResendLoading] = useState(false);

//   useEffect(() => {
//     const fetchEmail = async () => {
//       try {
//         const res = await apiAdmin.get('api/admin/pending-email', { withCredentials: true });
//         setEmail(res.data.email);
//       } catch {
//         console.error('❌ Failed to fetch pending email from cookie');
//         router.push('/landing/auth/user_login/login');
//       }
//     };
//     fetchEmail();
//   }, [router]);

//   const handleVerify = async () => {
//     if (!otp || !email) {
//       setFormError("Missing OTP or email/username");
//       return;
//     }

//     setFormError("");

//     try {
//       const payload = email.includes("@")
//         ? { email, otp }
//         : { identifier: email, otp };

//       await apiAdmin.post('api/admin/verify-otp', payload);

//       // ✅ No need to store token manually — it's in HTTP-only cookie
//       router.push('/admin_dash');
//     } catch (err: unknown) {
//       let errMsg = 'OTP verification failed';

//       if (axios.isAxiosError(err)) {
//         const maybeMessage = err.response?.data?.message;
//         if (typeof maybeMessage === 'string') {
//           errMsg = maybeMessage;
//         } else if (err.response?.status === 403) {
//           errMsg = "Wrong OTP, kindly enter correct OTP";
//         }
//       }

//       setFormError(errMsg);
//     }
//   };

//   const handleResendOtp = async () => {
//     if (!email) {
//       setFormError("Email/username missing");
//       return;
//     }

//     setResendLoading(true);
//     try {
//       const payload = email.includes("@")
//         ? { email }
//         : { identifier: email };

//       await apiAdmin.post('api/admin/resend-otp', payload);
//       alert("✅ OTP resent successfully!");
//     } catch (err) {
//       console.error("Resend OTP error:", err);
//       alert("❌ Failed to resend OTP");
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
//       <h2 className="text-xl font-semibold mb-2">Login</h2>
//       <p className="text-sm text-gray-500 mb-4">Enter the OTP sent to your email.</p>

//       <label htmlFor="otp" className="block text-sm text-gray-700 mb-1">
//         Enter OTP
//       </label>
//       <input
//         id="otp"
//         type="text"
//         value={otp}
//         onChange={(e) => setOtp(e.target.value)}
//         placeholder="123456"
//         className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
//       />
//       {formError && (
//         <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm font-medium">
//           {formError}
//         </div>
//       )}

//       <div className="flex justify-between gap-4">
//         <button
//           onClick={() => router.back()}
//           className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition"
//         >
//           Back
//         </button>
//         <button
//           onClick={handleVerify}
//           className="w-1/2 bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
//         >
//           Verify & Login
//         </button>
//       </div>

//       <p className="text-xs text-gray-500 text-center mt-2">
//         Didn’t get the OTP?{" "}
//         <button
//           onClick={handleResendOtp}
//           disabled={resendLoading}
//           className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
//         >
//           {resendLoading ? "Resending..." : "Resend"}
//         </button>
//       </p>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import apiAdmin from '@/lib/apiAdmin';

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await apiAdmin.get('api/admin/pending-email', { withCredentials: true });
        setEmail(res.data.email);
      } catch {
        console.error('❌ Failed to fetch pending email from cookie');
        router.push('/landing/auth/user_login/login');
      }
    };
    fetchEmail();
  }, [router]);

  const handleVerify = async () => {
  if (!otp || !email) {
    setFormError("Missing OTP or email/username");
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    setFormError("OTP must be a 6-digit number");
    return;
  }

  setFormError("");
  setResendMessage("");

  try {
    const payload = { identifier: email, otp };

    await apiAdmin.post('api/admin/verify-otp', payload, {
      withCredentials: true,
    });

    router.push('/admin_dash');
  } catch (err: unknown) {
    let errMsg = 'OTP verification failed';

    if (axios.isAxiosError(err)) {
      console.log("Full error:", err.response?.data); // 👈 helpful for debugging
      const maybeMessage = err.response?.data?.message;
      if (typeof maybeMessage === 'string') {
        errMsg = maybeMessage;
      } else if (err.response?.status === 403) {
        errMsg = "Wrong OTP, kindly enter correct OTP";
      }
    }

    setFormError(errMsg);
  }
};


  const handleResendOtp = async () => {
    if (!email) {
      setFormError('Email/username missing');
      return;
    }

    setFormError('');
    setResendMessage('');
    setResendLoading(true);

    try {
      const payload = email.includes('@') ? { email } : { identifier: email };
      await apiAdmin.post('api/admin/resend-otp', payload);
      setResendMessage('✅ OTP resent successfully!');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setResendMessage('❌ Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };
  
  useEffect(() => {
  if (resendMessage) {
    const timer = setTimeout(() => {
      setResendMessage('');
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }
}, [resendMessage]);


  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Admin Login</h2>
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

      <p className="text-xs text-gray-500 text-center mt-2">
        Didn’t get the OTP?{' '}
        <button
          onClick={handleResendOtp}
          disabled={resendLoading}
          className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
        >
          {resendLoading ? 'Resending...' : 'Resend'}
        </button>
      </p>

      {resendMessage && (
        <div
          className={`mt-3 text-sm px-4 py-2 rounded font-medium text-center ${
            resendMessage.startsWith('✅')
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
