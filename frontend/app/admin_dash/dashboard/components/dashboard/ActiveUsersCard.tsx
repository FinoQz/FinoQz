import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ActiveUsersCardProps {
  activeUsers: number;
}

const ActiveUsersCard: React.FC<ActiveUsersCardProps> = ({ activeUsers }) => (
  <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="text-xs sm:text-sm font-medium text-gray-800">
        Active Users
      </div>
      <div className="p-2 sm:p-3 bg-green-50 rounded-lg shadow-sm">
        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
      {activeUsers.toLocaleString()}
    </div>
    <div className="text-xs mt-2 text-green-700">Approved accounts</div>
  </div>
);

export default ActiveUsersCard;
