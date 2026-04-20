'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiUser from '@/lib/apiUser';
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  MessageSquare,
  FileText,
  User,
  LogOut,
  X,
  Library,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuGroups = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'myquizes', label: 'My Quizzes', icon: Library },
    ]
  },
  {
    title: 'Learning',
    items: [
      { id: 'quizes', label: 'Browse Quizzes', icon: BookOpen },
      { id: 'content', label: 'Finance Content', icon: FileText },
      { id: 'community', label: 'Community', icon: MessageSquare },
    ]
  },
  {
    title: 'Account',
    items: [
      { id: 'wallet', label: 'Wallet', icon: Wallet },
      { id: 'profile', label: 'Profile', icon: User },
    ]
  },
];

export default function UserDashboardSidebar({
  activePage,
  onPageChange,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
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
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      router.push('/landing');
    }
  };

  const sidebarW = isCollapsed ? 'lg:w-16' : 'lg:w-64';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarW} w-64 h-screen bg-white border-r border-gray-100 flex flex-col transform transition-all duration-300 lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <Image
            src="https://res.cloudinary.com/dwbbsvsrq/image/upload/v1767085055/finoqz_std7w8.svg"
            alt="FinoQz Logo"
            width={36}
            height={36}
            className="rounded-lg flex-shrink-0"
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-[1rem] font-bold text-gray-900 tracking-tight leading-none">
                FinoQz
              </h1>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-widest">User Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuGroups.map((group) => (
            <div key={group.title} className="mb-4">
              {!isCollapsed && (
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] px-2 mb-1.5">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => { onPageChange(item.id); onClose(); }}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isCollapsed ? 'lg:justify-center lg:px-2' : ''
                        } ${
                          isActive
                            ? 'bg-[#253A7B] text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                        {isActive && !isCollapsed && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-60" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className={`border-t border-gray-100 p-3 ${isCollapsed ? 'lg:px-2' : ''}`}>
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#253A7B] to-[#1a2a5e] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.fullName?.split(' ')[0]?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user?.fullName?.split(' ').slice(0,2).join(' ') || 'Loading...'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.email || '—'}
                </p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`mt-1.5 w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium ${
              isCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          {isCollapsed
            ? <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            : <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          }
        </button>
      </aside>
    </>
  );
}
