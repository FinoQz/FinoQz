'use client';

import * as React from 'react';
import { IndianRupee } from 'lucide-react';

interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  visibility: 'all' | 'new_users' | 'existing_users';
}

interface PricingAccessProps {
  pricingType: 'free' | 'paid';
  price: string;
  coupon: Coupon;
  onPricingTypeChange: (type: 'free' | 'paid') => void;
  onPriceChange: (price: string) => void;
  onCouponChange: (coupon: Coupon) => void;
}

export default function PricingAccess({
  pricingType,
  price,
  coupon,
  onPricingTypeChange,
  onPriceChange,
  onCouponChange
}: PricingAccessProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Access</h2>
        <p className="text-sm text-gray-600">Set the pricing and payment options for this quiz</p>
      </div>

      {/* Pricing Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Pricing Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['free', 'paid'].map((type) => (
            <div
              key={type}
              role="button"
              tabIndex={0}
              onClick={() => onPricingTypeChange(type as 'free' | 'paid')}
              onKeyDown={(e) => e.key === 'Enter' && onPricingTypeChange(type as 'free' | 'paid')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                pricingType === type
                  ? 'border-[#253A7B] bg-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    pricingType === type ? 'border-[#253A7B]' : 'border-gray-300'
                  }`}
                >
                  {pricingType === type && (
                    <div className="w-3 h-3 rounded-full bg-[#253A7B]" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 capitalize">{type}</h4>
                  <p className="text-xs text-gray-600">
                    {type === 'free' ? 'Open to all users' : 'Requires payment to access'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Options */}
      {pricingType === 'paid' && (
        <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 1) onPriceChange(val);
                }}
                placeholder="Enter price"
                min="1"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum ₹1</p>
          </div>

          {/* Coupon Code */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Coupon Settings</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={coupon.code}
                onChange={(e) =>
                  onCouponChange({ ...coupon, code: e.target.value.toUpperCase().trim() })
                }
                placeholder="Coupon Code"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition uppercase"
              />
              <select
                value={coupon.discountType}
                onChange={(e) =>
                  onCouponChange({ ...coupon, discountType: e.target.value as 'percentage' | 'flat' })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
              <input
                type="number"
                value={coupon.discountValue}
                onChange={(e) =>
                  onCouponChange({ ...coupon, discountValue: Number(e.target.value) })
                }
                placeholder="Discount Value"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
              />
              <select
                value={coupon.visibility}
                onChange={(e) =>
                  onCouponChange({ ...coupon, visibility: e.target.value as 'all' | 'new_users' | 'existing_users' })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl"
              >
                <option value="all">All Users</option>
                <option value="new_users">New Users Only</option>
                <option value="existing_users">Existing Users Only</option>
              </select>
            </div>
            <p className="text-xs text-gray-500">Define coupon code, discount type, and visibility</p>
          </div>

        </div>
      )}
    </div>
  );
}
