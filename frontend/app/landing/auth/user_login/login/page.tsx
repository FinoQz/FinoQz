// app/landing/signin/page.tsx
"use client";

import { useState } from "react";
import InputField from "./components/InputField";
import TabSwitcher from "./components/TabSwitcher";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SigninPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");


  const handleContinue = async () => {
    type AxiosLikeError = { response?: { data?: { message?: unknown }; status?: number } };

    if (activeTab === "admin") {
      // ✅ Admin login
      if (!emailOrUsername.trim() || !password.trim()) {
        setFormError("Please fill in both username/email and password");
        return;
      }

      setFormError("");
      try {
        const res = await api.post("/admin/login", {
          identifier: emailOrUsername,
          password,
        });

        if (res.data.message === "OTP sent to email") {
          localStorage.setItem("adminEmail", emailOrUsername);
          router.push("/landing/auth/user_login/verify_admin_otp");
        } else {
          setFormError("Unexpected response from server");
        }
      } catch (err: unknown) {
        let errMsg = "Login failed";
        if (typeof err === "object" && err !== null && "response" in err) {
          const maybeMessage = (err as AxiosLikeError).response?.data?.message;
          if (typeof maybeMessage === "string") {
            errMsg = maybeMessage;
          } else if ((err as AxiosLikeError).response?.status === 401) {
            errMsg = "Invalid username or password";
          }
        }
        setFormError(errMsg);
      }
    } else {
      // ✅ User login
      if (!emailOrUsername.trim() || !password.trim()) {
        setFormError("Please fill in both email and password");
        return;
      }

      setFormError("");
      try {
        const res = await api.post("/user/login/initiate", {
          email: emailOrUsername,
          password,
        });

        if (res.data.message === "OTP sent to email") {
          localStorage.setItem("userEmail", emailOrUsername);
          router.push("/landing/auth/user_login/verify_signin_otp");
        } else {
          setFormError("Unexpected response from server");
        }

      } catch (err: unknown) {
        let errMsg = "Login failed";
        if (typeof err === "object" && err !== null && "response" in err) {
          const maybeMessage = (err as AxiosLikeError).response?.data?.message;
          if (typeof maybeMessage === "string") {
            errMsg = maybeMessage;
          } else if ((err as AxiosLikeError).response?.status === 401) {
            errMsg = "Invalid email or password";
          }
        }
        setFormError(errMsg);
      }
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <Image src="/finoqz.svg" alt="FinoQz Logo" width={40} height={40} />
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
            label={activeTab === "user" ? "Email Address" : "Admin Username"}
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder={activeTab === "user" ? "your@email.com" : "admin"}
          />
          <InputField
            label={activeTab === "user" ? "Password" : "Admin Password"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          {/* 👇 Forgot password link only for USER tab */}
          {activeTab === "user" && (
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



        <p className="text-sm text-gray-500 mt-4 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/landing/auth/user_signup/signup" className="text-blue-600 font-semibold">
            Sign up here
          </Link>
        </p>
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">← Back to Home</a>
      </p>
    </div>
  );
}
// app/landing/signin/page.tsx
// "use client";

// import { useState } from "react";
// import InputField from "./components/InputField";
// import TabSwitcher from "./components/TabSwitcher";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import api from "@/lib/api";

// export default function SigninPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
//   const [emailOrUsername, setEmailOrUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [formError, setFormError] = useState("");
//   const [loading, setLoading] = useState(false); // ✅ loading state

//   const handleContinue = async () => {
//   if (!emailOrUsername.trim() || !password.trim()) {
//     setFormError("Please fill in both fields");
//     return;
//   }

//   setFormError("");
//   setLoading(true);

//   try {
//     const endpoint = activeTab === "admin" ? "/admin/login" : "/user/login/initiate";
//     const payload = activeTab === "admin"
//       ? { identifier: emailOrUsername, password }
//       : { email: emailOrUsername, password };

//     const res = await api.post(endpoint, payload);
//     console.log("API response:", res.data);

//     if (res.data.message?.toLowerCase().includes("otp")) {
//       localStorage.setItem(activeTab === "admin" ? "adminEmail" : "userEmail", emailOrUsername);
//       router.push(
//         activeTab === "admin"
//           ? "/landing/auth/user_login/verify_admin_otp"
//           : "/landing/auth/user_login/verify_signin_otp"
//       );
//     } else {
//       setFormError(res.data.message || "Unexpected response from server");
//     }
//   } catch (err: unknown) {
//     type AxiosLikeError = { response?: { status?: number; data?: { message?: string } } };
//     const hasResponse = typeof err === "object" && err !== null && "response" in err;
//     const status = hasResponse ? (err as AxiosLikeError).response?.status : undefined;
//     const message = hasResponse ? (err as AxiosLikeError).response?.data?.message : undefined;
//     setFormError(
//       message ||
//       (status === 401 ? "Invalid credentials" :
//        status === 500 ? "Server error, please try again later" :
//        "Login failed")
//     );
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
//       <div className="text-center mb-6 flex flex-col items-center justify-center gap-1">
//         <div className="flex items-center gap-2">
//           <Image src="/finoqz.svg" alt="FinoQz Logo" width={40} height={40} />
//           <h1 className="text-2xl font-bold">FinoQz</h1>
//         </div>
//         <p className="text-sm text-gray-500">Welcome back! Please login to continue.</p>
//       </div>

//       <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-2">Login</h2>
//         <p className="text-sm text-gray-500 mb-4">Enter your credentials.</p>

//         <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

//         <div className="space-y-4">
//           <InputField
//             label={activeTab === "user" ? "Email Address" : "Admin Username"}
//             value={emailOrUsername}
//             onChange={(e) => setEmailOrUsername(e.target.value)}
//             placeholder={activeTab === "user" ? "your@email.com" : "admin"}
//           />
//           <InputField
//             label={activeTab === "user" ? "Password" : "Admin Password"}
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter your password"
//           />

//           {activeTab === "user" && (
//             <div className="text-right">
//               <Link
//                 href="/landing/auth/user_login/forgot_password"
//                 className="text-sm text-blue-600 hover:underline"
//               >
//                 Forgot password?
//               </Link>
//             </div>
//           )}

//           {formError && (
//             <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm font-medium">
//               {formError}
//             </div>
//           )}

//           <button
//             onClick={handleContinue}
//             disabled={loading} // ✅ disable while loading
//             className={`w-full py-2 rounded font-semibold ${
//               loading ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-900"
//             }`}
//           >
//             {loading ? "Sending OTP..." : "Continue to OTP"} {/* ✅ UX polish */}
//           </button>
//         </div>

//         <p className="text-sm text-gray-500 mt-4 text-center">
//           Don&apos;t have an account?{" "}
//           <Link href="/landing/auth/user_signup/signup" className="text-blue-600 font-semibold">
//             Sign up here
//           </Link>
//         </p>
//       </div>

//       <p className="text-sm text-gray-500 mt-4 text-center">
//         <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">← Back to Home</a>
//       </p>
//     </div>
//   );
// }
