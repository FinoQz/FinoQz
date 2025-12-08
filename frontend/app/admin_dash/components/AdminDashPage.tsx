'use client';
import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import DashboardOverview from '../pages/DashboardOverview';
import UserManagement from '../pages/UserManagement';
import QuizManagement from '../pages/QuizManagement';
import ActivityLogsPage from '../pages/ActivityLogsPage';
import PendingApprovalsPage from '../pages/PendingApprovalsPage';
import LandingPageManager from './adminComponents/LandingPageManager';

export default function AdminDashPage() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'quiz':
        return <QuizManagement />;
      case 'activity':
        return <ActivityLogsPage />;
      case 'approvals':
        return <PendingApprovalsPage />;
      case 'landing':
        return <LandingPageManager />;
      case 'content':
        return <PlaceholderPage title="Finance Content" />;
      case 'revenue':
        return <PlaceholderPage title="Payments & Revenue" />;
      case 'community':
        return <PlaceholderPage title="Community Posts" />;
      case 'reports':
        return <PlaceholderPage title="Quiz Reports" />;
      case 'analytics':
        return <PlaceholderPage title="Analytics" />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </DashboardLayout>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500">This page is under development</p>
        </div>
      </div>
    </div>
  );
}
