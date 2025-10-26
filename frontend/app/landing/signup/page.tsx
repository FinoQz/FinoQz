// app/landing/signup/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import InputField from "./components/InputField";
import ProgressBar from "./components/ProgressBar";
import AuthCard from "./components/AuthCard";


export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    const handleSendOTP = () => {
        console.log("Sending OTP to:", email);
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


            <ProgressBar step={1} total={4} />

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

                    <button
                        onClick={handleSendOTP}
                        className="w-full bg-black text-white py-2 rounded font-semibold"
                    >
                        Send Email OTP
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                    Already have an account?{" "}
                    <a href="/landing/login" className="text-blue-600 font-semibold">
                        Login here
                    </a>
                </p>
            </AuthCard>
            <p className="text-sm text-gray-500 mt-4 text-center">
                <a href="/landing" className="text-gray-500 hover:text-indigo-600 text-sm">← Back to Home</a>
            </p>

        </div>
    );
}
