// 'use client';

// import React from 'react';
// import { IndianRupee, Tag, CheckSquare, Square } from 'lucide-react';

// interface PricingAccessProps {
//   pricingType: 'free' | 'paid';
//   price: string;
//   couponCode: string;
//   allowOfflinePayment: boolean;
//   onPricingTypeChange: (type: 'free' | 'paid') => void;
//   onPriceChange: (price: string) => void;
//   onCouponCodeChange: (code: string) => void;
//   onOfflinePaymentChange: (allowed: boolean) => void;
// }

// export default function PricingAccess({
//   pricingType,
//   price,
//   couponCode,
//   allowOfflinePayment,
//   onPricingTypeChange,
//   onPriceChange,
//   onCouponCodeChange,
//   onOfflinePaymentChange
// }: PricingAccessProps) {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Access</h2>
//         <p className="text-sm text-gray-600">Set the pricing and payment options for this quiz</p>
//       </div>

//       {/* Pricing Type Selection */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-3">Pricing Type</label>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {/* Free Option */}
//           <div
//             onClick={() => onPricingTypeChange('free')}
//             className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
//               pricingType === 'free'
//                 ? 'border-[#253A7B] bg-white'
//                 : 'border-gray-200 hover:border-gray-300'
//             }`}
//           >
//             <div className="flex items-center gap-3">
//               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                 pricingType === 'free' ? 'border-[#253A7B]' : 'border-gray-300'
//               }`}>
//                 {pricingType === 'free' && (
//                   <div className="w-3 h-3 rounded-full bg-[#253A7B]" />
//                 )}
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-900">Free</h4>
//                 <p className="text-xs text-gray-600">Open to all users</p>
//               </div>
//             </div>
//           </div>

//           {/* Paid Option */}
//           <div
//             onClick={() => onPricingTypeChange('paid')}
//             className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
//               pricingType === 'paid'
//                 ? 'border-[#253A7B] bg-white'
//                 : 'border-gray-200 hover:border-gray-300'
//             }`}
//           >
//             <div className="flex items-center gap-3">
//               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                 pricingType === 'paid' ? 'border-[#253A7B]' : 'border-gray-300'
//               }`}>
//                 {pricingType === 'paid' && (
//                   <div className="w-3 h-3 rounded-full bg-[#253A7B]" />
//                 )}
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-900">Paid</h4>
//                 <p className="text-xs text-gray-600">Requires payment to access</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Paid Options */}
//       {pricingType === 'paid' && (
//         <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
//           {/* Price Input */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Price (₹) <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="number"
//                 value={price}
//                 onChange={(e) => onPriceChange(e.target.value)}
//                 placeholder="Enter price"
//                 min="1"
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
//               />
//             </div>
//             <p className="text-xs text-gray-500 mt-1">Minimum ₹1</p>
//           </div>

//           {/* Coupon Code */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Coupon Code (Optional)
//             </label>
//             <div className="relative">
//               <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 value={couponCode}
//                 onChange={(e) => onCouponCodeChange(e.target.value)}
//                 placeholder="e.g., LAUNCH50"
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition uppercase"
//               />
//             </div>
//             <p className="text-xs text-gray-500 mt-1">Users can apply this code for discounts</p>
//           </div>

//           {/* Offline Payment */}
//           <div
//             onClick={() => onOfflinePaymentChange(!allowOfflinePayment)}
//             className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition"
//           >
//             <div className="mt-0.5">
//               {allowOfflinePayment ? (
//                 <CheckSquare className="w-5 h-5 text-[#253A7B]" />
//               ) : (
//                 <Square className="w-5 h-5 text-gray-400" />
//               )}
//             </div>
//             <div className="flex-1">
//               <h4 className="font-medium text-gray-900 text-sm">Allow Offline Payment</h4>
//               <p className="text-xs text-gray-600 mt-1">
//                 Enable manual payment verification through bank transfer, UPI, or cash
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';

import React from 'react';
import { IndianRupee, Tag, CheckSquare, Square } from 'lucide-react';

interface PricingAccessProps {
  pricingType: 'free' | 'paid';
  price: string;
  couponCode: string;
  allowOfflinePayment: boolean;
  onPricingTypeChange: (type: 'free' | 'paid') => void;
  onPriceChange: (price: string) => void;
  onCouponCodeChange: (code: string) => void;
  onOfflinePaymentChange: (allowed: boolean) => void;
}

export default function PricingAccess({
  pricingType,
  price,
  couponCode,
  allowOfflinePayment,
  onPricingTypeChange,
  onPriceChange,
  onCouponCodeChange,
  onOfflinePaymentChange
}: PricingAccessProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Access</h2>
        <p className="text-sm text-gray-600">Set the pricing and payment options for this quiz</p>
      </div>

      {/* Pricing Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor="pricing-type">
          Pricing Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="pricing-type">
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
              aria-label={`Select ${type} pricing`}
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
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (Number(val) >= 0) onPriceChange(val);
                }}
                placeholder="Enter price"
                min="1"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum ₹1</p>
          </div>

          {/* Coupon Code */}
          <div>
            <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code (Optional)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase().trim())}
                placeholder="e.g., LAUNCH50"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#253A7B] focus:border-transparent transition uppercase"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Users can apply this code for discounts</p>
          </div>

          {/* Offline Payment */}
          <div
            role="checkbox"
            aria-checked={allowOfflinePayment}
            tabIndex={0}
            onClick={() => onOfflinePaymentChange(!allowOfflinePayment)}
            onKeyDown={(e) => e.key === 'Enter' && onOfflinePaymentChange(!allowOfflinePayment)}
            className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition"
          >
            <div className="mt-0.5">
              {allowOfflinePayment ? (
                <CheckSquare className="w-5 h-5 text-[#253A7B]" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">Allow Offline Payment</h4>
              <p className="text-xs text-gray-600 mt-1">
                Enable manual payment verification through bank transfer, UPI, or cash
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
