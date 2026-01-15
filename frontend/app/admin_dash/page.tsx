"use client";
import AdminDashPage from './dashboard/admindashpage';
export default function Page() {
  return <AdminDashPage />;
}
        // {/* Total Revenue */}
        // <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
        //   <div className="flex items-center justify-between mb-3 sm:mb-4">
        //     <div className="text-xs sm:text-sm font-medium text-gray-800">
        //       Total Revenue
        //     </div>
        //     <div className="p-2 sm:p-3 bg-purple-50 rounded-lg shadow-sm">
        //       <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        //     </div>
        //   </div>
        //   <div className="text-2xl sm:text-3xl font-bold text-gray-900">
        //     ₹{stats.totalRevenue.toLocaleString()}
        //   </div>
        //   <div className="flex items-center gap-1 text-xs mt-2 text-purple-600">
        //     <TrendingUp className="w-4 h-4" />
        //     <span>+24% this month</span>
        //   </div>
        // </div>

        // {/* Total Paid Users */}
        // <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
        //   <div className="flex items-center justify-between mb-3 sm:mb-4">
        //     <div className="text-xs sm:text-sm font-medium text-gray-800">
        //       Total Paid Users
        //     </div>
        //     <div className="p-2 sm:p-3 bg-cyan-50 rounded-lg shadow-sm">
        //       <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
        //     </div>
        //   </div>
        //   <div className="text-2xl sm:text-3xl font-bold text-gray-900">
        //     {stats.totalPaidUsers}
        //   </div>
        //   <div className="text-xs mt-2 text-cyan-700">
        //     Purchased at least one quiz
        //   </div>
        // </div>

        // {/* Free Quiz Attempts */}
        // <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
        //   <div className="flex items-center justify-between mb-3 sm:mb-4">
        //     <div className="text-xs sm:text-sm font-medium text-gray-800">
        //       Free Quiz Attempts
        //     </div>
        //     <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg shadow-sm">
        //       <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        //     </div>
        //   </div>
        //   <div className="text-2xl sm:text-3xl font-bold text-gray-900">
        //     {stats.freeQuizAttempts.toLocaleString()}
        //   </div>
        //   <div className="text-xs mt-2 text-indigo-700">
        //     Total free attempts
        //   </div>
        // </div>