'use client';

import React, { ReactNode, useState } from 'react';
import UserDashboardSidebar from './UserDashboardSidebar';
import { Menu } from 'lucide-react';

interface UserDashboardLayoutProps {
  children: ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function UserDashboardLayout({ 
  children, 
  activePage, 
  onPageChange 
}: UserDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Sidebar */}
      <UserDashboardSidebar
        activePage={activePage}
        onPageChange={onPageChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto lg:ml-64">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">User Dashboard</h1>
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
