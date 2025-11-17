"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.push("/landing/auth/user_login/forgot_password");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setFormError("Please fill in both fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setFormError("");
    setSuccessMessage("");

    try {
      const res = await api.post("/user/forgot-password/reset", {
        email,
        newPassword,
      });

      if (res.data.message === "Password reset successful") {
        setSuccessMessage("Password has been reset successfully!");
        localStorage.removeItem("resetEmail");
        router.push("/landing/auth/user_login/login");
      } else {
        setFormError("Unexpected response from server");
      }
    } catch (err) {
      let errMsg = "Password reset failed";

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
      <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
      <p className="text-sm text-gray-500 mb-4">
        Enter your new password below.
      </p>

      {/* New Password Field */}
      <div className="flex items-center border border-gray-300 rounded focus-within:ring-2 focus-within:ring-indigo-500 mb-3">
        <input
          type={showNew ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="flex-1 px-4 py-2 outline-none text-sm"
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="px-3 py-2 text-gray-600 hover:text-black"
        >
          {showNew ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Confirm Password Field */}
      <div className="flex items-center border border-gray-300 rounded focus-within:ring-2 focus-within:ring-indigo-500 mb-3">
        <input
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="flex-1 px-4 py-2 outline-none text-sm"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="px-3 py-2 text-gray-600 hover:text-black"
        >
          {showConfirm ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>

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
        onClick={handleReset}
        className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
      >
        Reset Password
      </button>
    </div>
  );
}
