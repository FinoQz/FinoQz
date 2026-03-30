import React from 'react';
import { TrendingUp, Users } from 'lucide-react';

interface TotalUsersCardProps {
  totalUsers: number;
  growthPercent: string;
}

const TotalUsersCard: React.FC<TotalUsersCardProps> = ({ totalUsers, growthPercent }) => (
  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="text-xs sm:text-sm font-medium text-gray-800">
        Total Users
      </div>
      <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shadow-sm">
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
      {totalUsers.toLocaleString()}
    </div>
    <div className="flex items-center gap-1 text-xs mt-2 text-blue-600">
      <TrendingUp className="w-4 h-4" />
      <span>+{growthPercent}% this month</span>
    </div>
  </div>
);

export default TotalUsersCard;
