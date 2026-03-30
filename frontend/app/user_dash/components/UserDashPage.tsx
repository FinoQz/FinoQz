'use client';

import React, { useState } from 'react';
import UserDashboardLayout from './UserDashboardLayout';
import Dashboard from '../pages/Dashboard';
import Quizes from '../pages/Quizes';
import MyQuizes from '../pages/MyQuizes';
import Wallet from '../pages/Wallet';
import Certificates from '../pages/Certificates';
import Community from '../pages/Community';
import FinanceContent from '../pages/FinanceContent';
import Profile from '../pages/Profile';

export default function UserDashPage() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'quizes':
        return <Quizes />;
      case 'myquizes':
        return <MyQuizes />;
      case 'wallet':
        return <Wallet />;
      case 'certificates':
        return <Certificates />;
      case 'community':
        return <Community />;
      case 'content':
        return <FinanceContent />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <UserDashboardLayout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </UserDashboardLayout>
  );
}
