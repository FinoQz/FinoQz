import React from 'react';
import TotalUsersCard from './TotalUsersCard';
import ActiveUsersCard from './ActiveUsersCard';
import PendingApprovalsCard from './PendingApprovalsCard';

interface StatsGridProps {
  totalUsers: number;
  growthPercent: string;
  activeUsers: number;
  pendingApprovals: number;
  onPendingClick: () => void;
}

const StatsGrid: React.FC<StatsGridProps> = ({ totalUsers, growthPercent, activeUsers, pendingApprovals, onPendingClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
    <TotalUsersCard totalUsers={totalUsers} growthPercent={growthPercent} />
    <ActiveUsersCard activeUsers={activeUsers} />
    <PendingApprovalsCard pendingApprovals={pendingApprovals} onClick={onPendingClick} />
  </div>
);

export default StatsGrid;
