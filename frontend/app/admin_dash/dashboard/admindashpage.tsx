'use client';
import { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import UserManagement from './pages/UserManagement';
import QuizManagement from './pages/QuizManagement';
import EditLandingPage from './pages/EditLandingPage';
import FinanceContent from './pages/FinanceContent';   
import PaymentsRevenue from './pages/PaymentsRevenue';
import CommunityPosts from './pages/CommunityPosts';
import QuizReports from './pages/QuizReports';
import Analytics from './pages/Analytics';
import ActivityLogsPage from './pages/ActivityLogsPage';

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
      case 'landing':
        return <EditLandingPage />;
      case 'content':
        return <FinanceContent />;
      case 'revenue':
        return <PaymentsRevenue />;
      case 'community':
        return <CommunityPosts/>;
      case 'reports':
        return <QuizReports/>;
      case 'analytics':
        return <Analytics/>;
      case 'activity':
        return <ActivityLogsPage />;
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
