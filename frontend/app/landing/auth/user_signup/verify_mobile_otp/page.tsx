'use client';

import apiUser from "@/lib/apiUser";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import InputField from "./components/InputField";
import ProgressBar from "./components/ProgressBar";
import AuthCard from "./components/AuthCard";
import axios from "axios";

export default function VerifyMobileOtpPage() {
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState("");
  const [mobile, setMobile] = useState("");
  const [tempOtp, setTempOtp] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const storedMobile = getCookie("userMobile");
    if (storedMobile) setMobile(storedMobile);

    const storedOtp = getCookie("tempOtp");
    if (storedOtp) {
      setTempOtp(storedOtp);
      setTimeout(() => {
        setTempOtp(null);
        document.cookie = "tempOtp=; Max-Age=0; path=/; SameSite=Lax";
      }, 10000);
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setFormError("Please enter OTP.");
      return;
    }

    try {
      const match = document.cookie.match(/(?:^|; )userEmail=([^;]+)/);
      const email = match ? decodeURIComponent(match[1]) : null;

      if (!email) {
        setFormError("Email not found. Please restart signup.");
        return;
      }

      const res = await apiUser.post("api/user/signup/verify-mobile", { email, otp });

      const nextStep = res.data?.nextStep || "awaiting_approval";
      switch (nextStep) {
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
    } catch (err) {
      let message = "OTP verification failed";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setFormError(message);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setResendMessage("");
    try {
      const match = document.cookie.match(/(?:^|; )userEmail=([^;]+)/);
      const email = match ? decodeURIComponent(match[1]) : null;

      if (!email) {
        setFormError("Email not found. Please restart signup.");
        return;
      }

      const res = await apiUser.post("api/user/signup/resend-mobile-otp", { email });

      setResendMessage("New OTP has been sent to your mobile.");
      setCooldown(30);

      const newOtp = res.data?.otp;
      if (newOtp) {
        document.cookie = `tempOtp=${encodeURIComponent(newOtp)}; path=/; max-age=10; SameSite=Lax`;
        setTempOtp(newOtp);
        setTimeout(() => {
          setTempOtp(null);
          document.cookie = "tempOtp=; Max-Age=0; path=/; SameSite=Lax";
        }, 10000);
      }
    } catch (err) {
      let message = "Failed to resend OTP";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setResendMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4 relative">
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

      <ProgressBar step={4} total={4} />

      {tempOtp && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-lg shadow-lg text-center max-w-sm w-full mx-4 relative">
            <button
              onClick={() => {
                setTempOtp(null);
                document.cookie = "tempOtp=; Max-Age=0; path=/; SameSite=Lax";
              }}
              className="absolute top-1 right-2 text-sm text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <p className="font-semibold">Temporary OTP (testing)</p>
            <p className="text-2xl font-bold tracking-widest">{tempOtp}</p>
            <p className="text-xs text-gray-500 mt-2">This will disappear in 10 seconds</p>
          </div>
        </div>
      )}

      <AuthCard>
        <h2 className="text-xl font-semibold mb-2">Verify Mobile</h2>
        <p className="text-sm text-gray-500 mb-4">
          Step 4: Enter the OTP sent to <span className="font-medium text-black">{mobile}</span>
        </p>

        <div className="space-y-4">
          <InputField
            label="Mobile OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            type="number"
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
              Complete Signup
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            Didn’t get the OTP?{" "}
            <button
              onClick={handleResendOtp}
              disabled={loading || cooldown > 0}
              className="text-indigo-600 font-medium hover:underline disabled:text-gray-400"
            >
              {loading
                ? "Resending..."
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend"}
            </button>
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <a href="/landing/login" className="text-blue-600 font-semibold">
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
