import React from 'react';
import { Clock } from 'lucide-react';

interface PendingApprovalsCardProps {
  pendingApprovals: number;
  onClick: () => void;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ pendingApprovals, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="text-xs sm:text-sm font-medium text-gray-800">
        Pending Approval
      </div>
      <div className="p-2 sm:p-3 bg-orange-50 rounded-lg shadow-sm">
        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
      {pendingApprovals}
    </div>
    <div className="text-xs mt-2 text-orange-700">Requires action</div>
  </div>
);

export default PendingApprovalsCard;
