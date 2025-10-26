// app/landing/signin/page.tsx
"use client";

import { useState } from "react";
import InputField from "./components/InputField";
import TabSwitcher from "./components/TabSwitcher";
import Link from "next/link";
import Image from "next/image";

export default function SigninPage() {
    const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleContinue = () => {
        console.log("Continue to OTP:", emailOrUsername);
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

                    <button
                        onClick={handleContinue}
                        className="w-full bg-black text-white py-2 rounded font-semibold"
                    >
                        Continue to OTP
                    </button>
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/landing/signup" className="text-blue-600 font-semibold">
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
