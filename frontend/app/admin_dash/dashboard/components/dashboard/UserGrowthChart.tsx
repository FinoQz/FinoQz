import React from 'react';

interface UserGrowthChartProps {
  userData: number[];
  days: string[];
  loading?: boolean;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ userData, days, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Loading user growth data...
      </div>
    );
  }

  if (!userData.length || !days.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        No user growth data available.
      </div>
    );
  }

  // Always start y-axis at zero, never negative
  const minUsers = 0;
  const maxUsers = Math.max(...userData);
  const range = maxUsers - minUsers || 1;
  // Y-axis labels: show all integers from maxUsers to 0, up to a practical limit for density
  let yLabels: number[] = [];
  const maxDenseTicks = 100;
  if (maxUsers <= maxDenseTicks) {
    yLabels = Array.from({ length: maxUsers + 1 }, (_, i) => maxUsers - i);
  } else {
    // For very large maxUsers, fallback to 100 ticks for performance
    const step = Math.ceil(maxUsers / maxDenseTicks);
    for (let v = maxUsers; v >= 0; v -= step) {
      yLabels.push(v);
    }
    if (yLabels[yLabels.length - 1] !== 0) yLabels.push(0);
  }
  const labelWidth = 48; // gap kam kar diya
  const width = days.length * labelWidth;
  const height = 120;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-80 flex flex-col">
      <div className="flex items-center gap-3 mb-3 sm:mb-4">
        <div className="p-2 sm:p-2 bg-[#e6eafd] rounded-lg">
          {/* User/group icon instead of calendar */}
          <svg className="w-5 h-5 sm:w-5 sm:h-5 text-[#253A7B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="9" cy="7" r="4" />
            <path d="M17 11a4 4 0 1 1 0 8" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800">User Growth Overview</h3>
      </div>
      <div className="flex-1 w-full overflow-x-auto flex items-end">
        <div
          className="relative border-b-2 border-l-2 border-gray-300 pl-10 pb-0"
          style={{ minWidth: `${width + 60}px`, width: `${width + 60}px`, height: `${height + 40}px`, marginBottom: 0 }}
        >
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-400 py-2 pr-1">
            {yLabels.map((label, i) => (
              <div key={i} className="h-[1px] -translate-y-1/2">
                {label}
              </div>
            ))}
          </div>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pl-2 pb-2 pointer-events-none">
            {yLabels.map((_, i) => (
              <div key={i} className="border-t border-gray-100" />
            ))}
          </div>
          {/* Chart */}
          <svg className="h-full" width={width} height={height} preserveAspectRatio="none">
            <defs>
              <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#4ade80', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`M 0,${height - ((userData[0] - minUsers) / range) * height
                } ${userData
                  .map(
                    (users, index) =>
                      `L ${(index / (userData.length - 1)) * width},${height - ((users - minUsers) / range) * height}`
                  )
                  .join(' ')} L ${width},${height} L 0,${height} Z`}
              fill="url(#userGradient)"
            />
            {/* Line path */}
            <path
              d={`M 0,${height - ((userData[0] - minUsers) / range) * height
                } ${userData
                  .map(
                    (users, index) =>
                      `L ${(index / (userData.length - 1)) * width},${height - ((users - minUsers) / range) * height}`
                  )
                  .join(' ')}`}
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Dots */}
            {userData.map((users, index) => {
              const cx = (index / (userData.length - 1)) * width;
              const cy = height - ((users - minUsers) / range) * height;
              const color = users === 0 ? '#22c55e' : '#ef4444';
              return (
                <g key={index}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill={color}
                    className="hover:r-7 transition-all cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>
          {/* Tooltips */}
          <div className="absolute inset-0 flex items-end justify-between pl-2 pb-2 pointer-events-none">
            {userData.map((users, index) => {
              const bottom = users === 0
                ? 0
                : ((users - minUsers) / range) * height + 14;
              const label =
                users === 0
                  ? 'No users'
                  : users === 1
                    ? '1 user'
                    : `${users.toLocaleString()} users`;
              return (
                <div key={index} className="relative group" style={{ width: `${labelWidth}px` }}>
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-auto"
                    style={{ bottom: `${bottom}px` }}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div
            className="absolute left-0 right-0 flex mt-2 pl-2 gap-[4px]"
            style={{
              bottom: '-28px',
              minWidth: `${width + 60}px`,
            }}
          >
            {days.map((day, index) => (
              <div
                key={index}
                className="text-[11px] text-gray-600 text-center"
                style={{
                  width: `${labelWidth}px`,
                  transform: 'rotate(-25deg)',
                  whiteSpace: 'nowrap',
                  marginLeft: '-2px',
                  marginRight: '-2px',
                }}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;
