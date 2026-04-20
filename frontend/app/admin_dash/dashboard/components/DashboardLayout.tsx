'use client';

import React, { ReactNode, useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import { Menu, Search, Bell, Settings } from 'lucide-react';
import SessionMonitor from './SessionMonitor';

interface DashboardLayoutProps {
  children: ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
}

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  quiz: 'Quiz Management',
  landing: 'Landing Page',
  financeContent: 'Finance Content',
  revenue: 'Payments & Revenue',
  community: 'Community Posts',
  reports: 'Quiz Reports',
  analytics: 'Analytics',
  activity: 'Activity Logs',
  reviews: 'Review Management',
  liveChat: 'Live Chat',
  banners: 'Banners',
  contact: 'Contact Queries',
  newsletter: 'Newsletter',
};

export default function DashboardLayout({
  children,
  activePage,
  onPageChange,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pageLabel = PAGE_LABELS[activePage] || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-white">
      {/* Session Manager */}
      <SessionMonitor />

      {/* Sidebar */}
      <DashboardSidebar
        activePage={activePage}
        onPageChange={onPageChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Persistent Top Header ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-sm">
          {/* Left: Mobile hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 min-w-0">
              <span className="hidden sm:block">Admin</span>
              <span className="hidden sm:block text-gray-300">/</span>
              <span className="font-semibold text-gray-800 truncate">{pageLabel}</span>
            </div>
          </div>

          {/* Right: Search + Notifications + Settings */}
          <div className="flex items-center gap-2">
            {/* Global Search (placeholder) */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors min-w-[160px]">
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="ml-auto text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Mobile search icon */}
            <button className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Search className="w-4 h-4 text-gray-500" />
            </button>

            {/* Notifications */}
            <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>

            {/* Settings */}
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
