'use client';

import React from 'react';
import { Shield, Calendar, Clock } from 'lucide-react';

interface AccountDetailsSectionProps {
  accountData: {
    accountCreated: string;
    lastLogin: string;
  };
}

export default function AccountDetailsSection({ accountData }: AccountDetailsSectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Shield className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Account Details</h3>
      </div>

      <div className="space-y-5">
        {/* Account Created */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Created On
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={accountData.accountCreated}
              readOnly
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Last Login */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Login
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={accountData.lastLogin}
              readOnly
              className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
