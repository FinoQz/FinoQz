'use client';

import React from 'react';
import { Users, UserCheck, CreditCard, IndianRupee } from 'lucide-react';

export default function KPICards() {
  const kpiData = [
    {
      label: 'Registered',
      value: '1,248',
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Attempted',
      value: '892',
      icon: UserCheck,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Paid users',
      value: '456',
      icon: CreditCard,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Total revenue',
      value: '₹1,24,580',
      icon: IndianRupee,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
              <div className={`w-10 h-10 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        );
      })}
    </div>
  );
}
