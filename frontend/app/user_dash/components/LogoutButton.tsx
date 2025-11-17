"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        localStorage.removeItem("userToken");
        router.push("/landing/auth/user_login/login");
      }}
      className="mt-6 w-full bg-[#253A7B] text-white py-2 rounded font-semibold hover:bg-[#1b2a5a] transition"
    >
      Logout
    </button>
  );
}
