import React from 'react';
import TopUsers from './TopUsers';
import UpcomingQuizzes from './UpcomingQuizzes';
import RecentAdminActions from './RecentAdminActions';

const DashboardWidgetsRow: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
    <TopUsers />
    <UpcomingQuizzes />
    <RecentAdminActions />
  </div>
);

export default DashboardWidgetsRow;
