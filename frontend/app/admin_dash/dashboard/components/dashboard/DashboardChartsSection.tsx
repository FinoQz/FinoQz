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
    {/* User Growth Chart */}
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">User Growth</h3>
      <div className="h-64 overflow-x-auto">
        <UserGrowthChart userData={userData} days={days} loading={loading} />
      </div>
    </div>
    {/* Daily Revenue Chart */}
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">
        Daily Revenue (Last 14 Days)
      </h3>
      <div className="h-64">
        <DailyRevenueChart />
      </div>
    </div>
    {/* Quiz Completion Rate */}
    <QuizCompletionRate />
    {/* Category Participation */}
    <CategoryParticipation />
  </div>
);

export default DashboardChartsSection;
