"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import DashboardHeader from "./components/DashboardHeader";
import ProfileCard from "./components/ProfileCard";
import ActivityCard from "./components/ActivityCard";
import LogoutButton from "./components/LogoutButton";

export default function UserDashboardPage() {
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.push("/landing/auth/user_login/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await api.get("/user/login/user_dash", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        setError("Failed to load dashboard. Please login again.");
        localStorage.removeItem("userToken");
        router.push("/landing/auth/user_login/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 px-6 py-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <DashboardHeader fullName={user?.fullName || ""} email={user?.email || ""} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileCard />
          <ActivityCard />
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
