'use client';

import React, { ReactNode, useState } from 'react';
import UserDashboardSidebar from './UserDashboardSidebar';
import { Menu, Bell, Settings, Search } from 'lucide-react';

interface UserDashboardLayoutProps {
  children: ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
}

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  quizes: 'Browse Quizzes',
  myquizes: 'My Quizzes',
  wallet: 'Wallet',
  community: 'Community',
  content: 'Finance Content',
  profile: 'Profile',
};

export default function UserDashboardLayout({
  children,
  activePage,
  onPageChange,
}: UserDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pageLabel = PAGE_LABELS[activePage] || 'Dashboard';
  const mainMargin = isCollapsed ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <UserDashboardSidebar
        activePage={activePage}
        onPageChange={onPageChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${mainMargin}`}>
        {/* ── Sticky Top Header ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 min-w-0">
              <span className="hidden sm:block">User</span>
              <span className="hidden sm:block text-gray-300">/</span>
              <span className="font-semibold text-gray-800 truncate">{pageLabel}</span>
            </div>
          </div>

          {/* Right: Search + Bell + Settings */}
          <div className="flex items-center gap-2">
            {/* Desktop search */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors min-w-[160px]">
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="ml-auto text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Mobile search */}
            <button className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-4 h-4 text-gray-500" />
            </button>

            {/* Bell */}
            <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>

            {/* Settings */}
            <button
              onClick={() => onPageChange('profile')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/60">
          {children}
        </main>
      </div>
    </div>
  );
}
