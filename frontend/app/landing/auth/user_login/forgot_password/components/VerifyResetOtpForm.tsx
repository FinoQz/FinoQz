"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiUser from "@/lib/apiUser";
import axios from "axios";

export default function VerifyResetOtpForm() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const storedEmail = getCookie("resetEmail");
    if (!storedEmail) {
      router.push("/landing/auth/user_login/login");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    if (!otp || !email) {
      setFormError("Missing OTP or email");
      return;
    }

    setFormError("");
    setSuccessMessage("");

    try {
      const res = await apiUser.post("api/user/forgot-password/verify", { email, otp });

      if (res.data.message === "OTP verified") {
        router.push("/landing/auth/user_login/forgot_password/reset_password");
      } else {
        setFormError("Unexpected response from server");
      }
    } catch (err) {
      let errMsg = "OTP verification failed";

      if (axios.isAxiosError(err)) {
        const maybeMessage = err.response?.data?.message;
        if (typeof maybeMessage === "string") {
          errMsg = maybeMessage;
        } else if (err.response?.status === 403) {
          errMsg = "Wrong OTP, kindly enter correct OTP";
        }
      }

      setFormError(errMsg);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setLoading(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const res = await apiUser.post("api/user/forgot-password/initiate", { email });

      if (res.data.message === "OTP sent") {
        setSuccessMessage("A new OTP has been sent to your email.");
        setCooldown(30);
      } else {
        setFormError("Failed to resend OTP");
      }
    } catch (err) {
      let errMsg = "Failed to resend OTP";

      if (axios.isAxiosError(err)) {
        const maybeMessage = err.response?.data?.message;
        if (typeof maybeMessage === "string") {
          errMsg = maybeMessage;
        }
      }

      setFormError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Verify OTP</h2>
      <p className="text-sm text-gray-500 mb-4">Enter the OTP sent to your email.</p>

      <input
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

      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded mb-4 text-sm font-medium">
          {successMessage}
        </div>
      )}

      <button
        onClick={handleVerify}
        className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition mb-3"
      >
        Verify & Continue
      </button>

      <p className="text-sm text-gray-600 text-center">
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
            : "Resend OTP"}
        </button>
      </p>
    </div>
  );
}
