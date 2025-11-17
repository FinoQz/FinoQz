"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim()) {
      setFormError("Please enter your email address");
      return;
    }

    setFormError("");
    setSuccessMessage("");

    try {
      const res = await api.post("/user/forgot-password/initiate", { email });

      if (res.data.message === "OTP sent") {
        localStorage.setItem("resetEmail", email);
        setSuccessMessage("OTP has been sent to your email");
        router.push("/landing/auth/user_login/forgot_password/verify_reset_otp");
      } else {
        setFormError("Unexpected response from server");
      }
    } catch (err: unknown) {
      let errMsg = "Failed to initiate password reset";

      if (axios.isAxiosError(err)) {
        const maybeMessage = err.response?.data?.message;
        if (typeof maybeMessage === "string") {
          errMsg = maybeMessage;
        }
      }

      setFormError(errMsg);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter your registered email to receive an OTP.
      </p>

      <label className="block text-sm text-gray-700 mb-1">Email Address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
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
        onClick={handleSubmit}
        className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
      >
        Send OTP
      </button>
    </div>
  );
}
