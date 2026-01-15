'use client';

import React from 'react';
import Image from 'next/image';
import apiAdmin from '@/lib/apiAdmin';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  BarChart3, 
  TrendingUp,
  LogOut,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'quiz', label: 'Quiz Management', icon: BookOpen },
  { id: 'landing', label: 'Landing Page', icon: ImageIcon },
  { id: 'content', label: 'Finance Content', icon: FileText },
  { id: 'revenue', label: 'Payments & Revenue', icon: DollarSign },
  { id: 'community', label: 'Community Posts', icon: MessageSquare },
  { id: 'reports', label: 'Quiz Reports', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'activity', label: 'Activity Logs', icon: FileText },
];

export default function DashboardSidebar({ activePage, onPageChange, isOpen, onClose }: SidebarProps) {
const handleLogout = async () => {
  try {
    await apiAdmin.post('/api/admin/logout', {}, { withCredentials: true });
  } catch (err) {
    console.warn('Logout failed:', err);
  } finally {
    window.location.href = '/landing';
  }
};



  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 transition"
        >
          <X className="w-6 h-6 text-[#253A7B]" />
        </button>

        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image 
              src="/finoqz.ico" 
              alt="FinoQz Logo" 
              width={48} 
              height={48} 
              className="rounded-lg"
            />
            <div>
              <h1 className="text-[1.25rem] font-semibold text-black tracking-wide">FinoQz</h1>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive
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

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-200 transition-all shadow-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}