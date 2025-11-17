"use client";

import { useRouter } from "next/navigation";

export default function ApprovalCard() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center space-y-4">
      <div className="flex justify-center">
        <div className="bg-green-100 rounded-full p-3">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="text-xl font-semibold">Account Created Successfully!</h2>
      <p className="text-sm text-gray-600">
        Your registration is pending admin approval.
      </p>
      <p className="text-sm text-gray-500">
        You will receive an email notification once your account is approved. You can then login to access the platform.
      </p>

      <button
        onClick={() => router.push("/landing/auth/user_login/login")}
        className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-900 transition"
      >
        Go to Login
      </button>
    </div>
  );
}
