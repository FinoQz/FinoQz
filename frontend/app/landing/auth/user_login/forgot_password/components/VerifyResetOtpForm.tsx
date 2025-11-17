"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

export default function VerifyResetOtpForm() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.push("/landing/auth/user_login/signin");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerify = async () => {
    if (!otp || !email) {
      setFormError("Missing OTP or email");
      return;
    }

    setFormError("");

    try {
      const res = await api.post("/user/forgot-password/verify", { email, otp });

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

      <button
        onClick={handleVerify}
        className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
      >
        Verify & Continue
      </button>
    </div>
  );
}
