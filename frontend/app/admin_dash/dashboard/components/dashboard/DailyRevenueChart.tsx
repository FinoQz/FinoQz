import React, { useEffect, useState } from 'react';

const DailyRevenueChart: React.FC = () => {
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/daily-revenue');
        setRevenueData(res.data.revenueData || []);
        setDays(res.data.days || []);
      } catch (err) {
        setError('Failed to load revenue data.');
        setRevenueData([]);
        setDays([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-400 text-sm animate-pulse">Loading revenue data...</div>;
  }
  if (error) {
    return <div className="h-full flex items-center justify-center text-red-400 text-sm">{error}</div>;
  }
  if (!revenueData.length || !days.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        No revenue data available.
      </div>
    );
  }
  const maxRevenue = Math.max(...revenueData);
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-end justify-between gap-2 border-b-2 border-l-2 border-gray-300 pb-2 pl-2">
        {revenueData.map((revenue, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center group"
          >
            <div className="w-full relative">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ₹{revenue.toLocaleString()}
              </div>
              <div
                className="w-full bg-gradient-to-t from-[#253A7B] to-[#4a6bb5] rounded-t hover:from-[#1a2a5e] hover:to-[#253A7B] transition-all duration-300 cursor-pointer"
                style={{
                  height: `${(revenue / maxRevenue) * 200}px`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 pl-2">
        {days.map((day, index) =>
          index % 2 === 0 ? (
            <div
              key={index}
              className="text-xs text-gray-600 flex-1 text-center"
            >
              {day}
            </div>
          ) : (
            <div key={index} className="flex-1" />
          )
        )}
      </div>
    </div>
  );
};

export default DailyRevenueChart;
