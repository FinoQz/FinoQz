"use client";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import InputField from "./components/InputField";
import ProgressBar from "./components/ProgressBar";
import AuthCard from "./components/AuthCard";

export default function VerifyEmailOtpPage() {
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState("");
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setFormError("Please enter the OTP.");
      return;
    }

    try {
      const res = await api.post("/user/signup/verify-email", { email, otp });
      setFormError("");

      // 👇 Use backend nextStep for resumable flow
      const nextStep = res.data?.nextStep || "mobile_password";
      switch (nextStep) {
        case "mobile_password":
          router.push("/landing/auth/user_signup/add_mobile");
          break;
        case "verify_mobile_otp":
          router.push("/landing/auth/user_signup/verify_mobile_otp");
          break;
        case "awaiting_approval":
          router.push("/landing/auth/user_signup/approval");
          break;
        case "login":
          router.push("/landing/auth/user_login/login");
          break;
        case "support":
          router.push("/support");
          break;
        default:
          router.push("/landing");
      }
    } catch (err: unknown) {
      let message = "Verification failed. Please try again.";
      if (typeof err === "object" && err !== null) {
        const maybe = err as { response?: { data?: { message?: unknown, nextStep?: string } } };
        const candidate = maybe.response?.data?.message;
        if (typeof candidate === "string" && candidate.length > 0) {
          message = candidate;
        }

        // 👇 If backend sends nextStep even on error, handle it
        const nextStep = maybe.response?.data?.nextStep;
        if (nextStep) {
          switch (nextStep) {
            case "mobile_password":
              router.push("/landing/auth/user_signup/add_mobile");
              return;
            case "verify_mobile_otp":
              router.push("/landing/auth/user_signup/verify_mobile_otp");
              return;
            case "awaiting_approval":
              router.push("/landing/auth/user_signup/approval");
              return;
            case "login":
              router.push("/landing/auth/user_login/login");
              return;
            case "support":
              router.push("/support");
              return;
          }
        }
      }
      setFormError(message);
    }
  };


  const handleResendOtp = async () => {
    setLoading(true);
    setResendMessage("");
    try {
      await api.post("/user/signup/resend-email-otp", { email });
      setResendMessage("OTP has been resent to your email.");
    } catch (err: unknown) {
      let message = "Failed to resend OTP. Please try again.";
      if (typeof err === "object" && err !== null) {
        const maybe = err as { response?: { data?: { message?: unknown } } };
        const candidate = maybe.response?.data?.message;
        if (typeof candidate === "string" && candidate.length > 0) {
          message = candidate;
        }
      }
      setResendMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4">
      <div className="text-center mb-6 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <Image src="/finoqz.svg" alt="FinoQz Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">FinoQz</h1>
        </div>
        <p className="text-sm text-gray-500">Welcome! Let’s get you started.</p>
      </div>

      <ProgressBar step={2} total={4} />

      <AuthCard>
        <h2 className="text-xl font-semibold mb-2">Verify Email</h2>
        <p className="text-sm text-gray-500 mb-4">
          Step 2: Enter the OTP sent to <span className="font-medium text-black">{email}</span>
        </p>

        <div className="space-y-4">
          <InputField
            label="Email OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />

          {formError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
              {formError}
            </div>
          )}

          <div className="flex justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition"
            >
              ← Back
            </button>
            <button
              onClick={handleVerify}
              className="w-1/2 bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
            >
              Verify Email
            </button>
          </div>

          {/* Chhota Resend OTP link */}
          <p className="text-xs text-gray-500 text-center mt-2">
            Didn’t get the OTP?{" "}
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-indigo-600 font-medium hover:underline"
            >
              {loading ? "Resending..." : "Resend"}
            </button>
          </p>

          {resendMessage && (
            <p className="text-xs text-green-600 text-center mt-1">{resendMessage}</p>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <a href="/landing/auth/user_login/login" className="text-blue-600 font-semibold">
            Login here
          </a>
        </p>
      </AuthCard>

      <p className="text-sm text-gray-500 mt-4 text-center">
        <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">
          ← Back to Home
        </a>
      </p>
    </div>
  );
}
