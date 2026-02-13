import React from 'react';
import UserGrowthChart from './UserGrowthChart';
import DailyRevenueChart from './DailyRevenueChart';
import QuizCompletionRate from './QuizCompletionRate';
import CategoryParticipation from './CategoryParticipation';


interface DashboardChartsSectionProps {
  userData: number[];
  days: string[];
  loading: boolean;
}

const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({ userData, days, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
    <UserGrowthChart userData={userData} days={days} loading={loading} />
    <DailyRevenueChart />
    <QuizCompletionRate />
    <CategoryParticipation />
  </div>
);

export default DashboardChartsSection;
