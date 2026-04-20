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
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Image as ImageIcon,
  Star,
  X
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
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'activity', label: 'Activity Logs', icon: FileText },
    ]
  },
  {
    title: 'Growth & Finance',
    items: [
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'quiz', label: 'Quiz Management', icon: BookOpen },
      { id: 'revenue', label: 'Payments & Revenue', icon: DollarSign },
      { id: 'financeContent', label: 'Finance Management', icon: FileText },
    ]
  },
  {
    title: 'Curation',
    items: [
      { id: 'landing', label: 'Landing Page', icon: ImageIcon },
      { id: 'banners', label: 'Banners', icon: ImageIcon },
      { id: 'community', label: 'Community Posts', icon: MessageSquare },
      { id: 'reviews', label: 'Review Management', icon: Star },
    ]
  },
  {
    title: 'Interaction',
    items: [
      { id: 'liveChat', label: 'Live Chat', icon: MessageCircle },
      { id: 'contact', label: 'Contact Queries', icon: MessageSquare },
      { id: 'newsletter', label: 'Subscribers', icon: Users },
      { id: 'reports', label: 'Quiz Reports', icon: BarChart3 },
    ]
  }
];

export default function DashboardSidebar({
  activePage,
  onPageChange,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
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
        className={`fixed lg:static inset-y-0 left-0 z-50 min-h-screen bg-[#F9FAFB] border-r border-gray-200/60 flex flex-col transition-all duration-300 ease-in-out transform lg:transform-none
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
         shadow-sm lg:shadow-none`}
      >
        {/* Brand/Toggle Header */}
        <div className={`relative flex items-center h-20 px-6 border-b border-gray-100/50 mb-2 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                <Image src="/finoqz.ico" alt="Logo" width={22} height={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">FinoQz</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Admin</p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm animate-in zoom-in duration-300">
              <Image src="/finoqz.ico" alt="Logo" width={24} height={24} />
            </div>
          )}

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex absolute -right-3 top-7 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-400 hover:text-[#253A7B] hover:border-[#253A7B] transition-all shadow-sm z-50`}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="space-y-7">
            {menuGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                {!isCollapsed && (
                  <h2 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 animate-in slide-in-from-left-2 duration-300">
                    {group.title}
                  </h2>
                )}
                <div className="space-y-1 px-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        title={isCollapsed ? item.label : ''}
                        onClick={() => {
                          onPageChange(item.id);
                          onClose();
                        }}
                        className={`w-full group flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-white text-[#253A7B] font-bold shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <div className={`flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-[#253A7B]' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        </div>
                        {!isCollapsed && (
                          <span className="text-sm truncate animate-in fade-in slide-in-from-left-1 duration-300">{item.label}</span>
                        )}
                        {isActive && !isCollapsed && (
                          <div className="ml-auto w-1 h-3 rounded-full bg-[#253A7B] animate-in zoom-in" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Simple Footer */}
        <div className={`p-4 border-t border-gray-50 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium text-sm group ${isCollapsed ? 'justify-center w-12 h-12 px-0' : 'w-full'}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className={`w-5 h-5 transition-colors ${isCollapsed ? 'text-gray-400' : 'text-gray-400 group-hover:text-red-500'}`} />
            {!isCollapsed && <span className="animate-in fade-in duration-300">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
