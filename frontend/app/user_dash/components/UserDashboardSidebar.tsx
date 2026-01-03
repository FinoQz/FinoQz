'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiUser from '@/lib/apiUser';
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  Award,
  MessageSquare,
  FileText,
  User,
  LogOut,
  X,
  Library,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quizes', label: 'Quizes', icon: BookOpen },
  { id: 'myquizes', label: 'My Quizes', icon: Library },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'community', label: 'Community', icon: MessageSquare },
  { id: 'content', label: 'Finance Content', icon: FileText },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function UserDashboardSidebar({
  activePage,
  onPageChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiUser.get('api/user/profile/me', { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        router.push('/landing/auth/user_login/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiUser.post('api/user/login/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      router.push('/landing');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 transition"
        >
          <X className="w-6 h-6 text-[#253A7B]" />
        </button>

        <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image
              src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
              alt="FinoQz Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-[1.25rem] font-semibold text-black tracking-wide">
                FinoQz
              </h1>
              <p className="text-xs text-gray-600">User Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive
                      ? 'bg-[#253A7B] text-white shadow-md'
                      : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg shadow-sm">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] flex items-center justify-center text-white text-lg font-semibold">
              {user?.fullName?.split(' ')[0]?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* Name + Email */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {user?.fullName?.split(' ')[0] || 'Loading...'}
              </p>
              <p className="text-xs text-gray-600">
                {user?.email || 'Fetching email...'}
              </p>
            </div>
          </div>
        </div>


        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-200 transition-all shadow-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </aside >
    </>
  );
}
