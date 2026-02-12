import React from 'react';
import LiveUsersWidget from './LiveUsersWidget';
import ActiveQuizzesWidget from './ActiveQuizzesWidget';
import TodayRevenueWidget from './TodayRevenueWidget';

const LiveMetricsGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    <LiveUsersWidget />
    <ActiveQuizzesWidget />
    <TodayRevenueWidget />
  </div>
);

export default LiveMetricsGrid;
