'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

const DailyRevenueChart: React.FC = () => {
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/daily-revenue');
        setRevenueData(res.data.revenueData || []);
        setDays(res.data.days || []);
      } catch {
        setRevenueData([]);
        setDays([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxRevenue = revenueData.length ? Math.max(...revenueData, 1) : 1;
  const totalRevenue = revenueData.reduce((a, b) => a + b, 0);

  // Compute week-over-week change (last 7 vs prev 7)
  const last7 = revenueData.slice(-7).reduce((a, b) => a + b, 0);
  const prev7 = revenueData.slice(-14, -7).reduce((a, b) => a + b, 0);
  const wow = prev7 > 0 ? (((last7 - prev7) / prev7) * 100).toFixed(1) : null;
  const isUp = wow !== null && parseFloat(wow) >= 0;

  const W = 560;
  const H = 130;
  const PAD_L = 44;
  const PAD_B = 28;
  const PAD_T = 12;
  const PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  // SVG area + line path
  const points = revenueData.map((v, i) => ({
    x: PAD_L + (i / Math.max(revenueData.length - 1, 1)) * chartW,
    y: PAD_T + chartH - (v / maxRevenue) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x.toFixed(2)},${(PAD_T + chartH).toFixed(2)} L ${PAD_L},${(PAD_T + chartH).toFixed(2)} Z`
    : '';

  const yTicks = [0, Math.round(maxRevenue * 0.5), maxRevenue];

  const formatRevenue = (v: number) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#e8ecf9] flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-[#253A7B]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Daily Revenue</h3>
            <p className="text-[10px] text-gray-400">Last 14 days earnings</p>
          </div>
        </div>
        {!loading && revenueData.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 tabular-nums">{formatRevenue(totalRevenue)}</p>
              <p className="text-[10px] text-gray-400">14-day total</p>
            </div>
            {wow !== null && (
              <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2.5 py-1 rounded-full border
                ${isUp ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                <TrendingUp className={`w-3 h-3 ${!isUp ? 'rotate-180' : ''}`} />
                WoW {isUp ? '+' : ''}{wow}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart area */}
      <div className="px-5 pt-4 pb-5">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={`rev-skeleton-bar-${i}`}
                  className="flex-1 bg-gray-100 rounded-t"
                  style={{ height: `${25 + (i % 5) * 15}%` }}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={`rev-skeleton-lbl-${i}`} className="flex-1 h-2 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : !revenueData.length ? (
          <div className="flex flex-col items-center justify-center h-36 text-center">
            <DollarSign className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-xs text-gray-400">No revenue data available yet</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto" onMouseLeave={() => setHoveredIdx(null)}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ minWidth: '260px', height: '160px' }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#253A7B" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#253A7B" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis grid + labels */}
              {yTicks.map((tick, tIdx) => {
                const y = PAD_T + chartH - (tick / maxRevenue) * chartH;
                return (
                  <g key={`rev-ytick-${tIdx}`}>
                    <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
                      stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={PAD_L - 6} y={y + 4} textAnchor="end"
                      fontSize="9" fill="#9ca3af">
                      {formatRevenue(tick)}
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              <path d={areaPath} fill="url(#revenueGrad)" />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#253A7B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Bars behind line for interaction */}
              {revenueData.map((v, i) => {
                const barW = (chartW / revenueData.length) * 0.8;
                const x = (PAD_L + (i / Math.max(revenueData.length - 1, 1)) * chartW) - barW / 2;
                const isHov = hoveredIdx === i;
                const dotX = PAD_L + (i / Math.max(revenueData.length - 1, 1)) * chartW;
                const dotY = PAD_T + chartH - (v / maxRevenue) * chartH;
                const showLabel = i % 2 === 0 || revenueData.length <= 10;
                return (
                  <g key={`rev-pt-${i}`}>
                    {/* Hit area */}
                    <rect
                      x={x}
                      y={PAD_T}
                      width={barW}
                      height={chartH + PAD_B}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIdx(i)}
                      style={{ cursor: 'crosshair' }}
                    />
                    {/* Hover vertical rule */}
                    {isHov && (
                      <line x1={dotX} x2={dotX} y1={PAD_T} y2={PAD_T + chartH}
                        stroke="#253A7B" strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
                    )}
                    {/* Dot */}
                    <circle cx={dotX} cy={dotY}
                      r={isHov ? 5 : 3}
                      fill={isHov ? '#253A7B' : '#fff'}
                      stroke="#253A7B"
                      strokeWidth={isHov ? 2.5 : 2}
                      style={{ transition: 'r 0.1s' }}
                    />
                    {/* Tooltip */}
                    {isHov && (
                      <g>
                        <rect
                          x={Math.min(dotX - 30, W - PAD_R - 64)}
                          y={dotY - 34}
                          width="62" height="22"
                          rx="5" fill="#111827"
                        />
                        <text
                          x={Math.min(dotX + 1, W - PAD_R - 31)}
                          y={dotY - 19}
                          textAnchor="middle"
                          fontSize="10" fill="white" fontWeight="600">
                          {formatRevenue(v)}
                        </text>
                      </g>
                    )}
                    {/* X-axis label */}
                    {showLabel && days[i] && (
                      <text x={dotX} y={H - 4} textAnchor="middle"
                        fontSize="8.5" fill="#9ca3af"
                        style={{ pointerEvents: 'none' }}>
                        {days[i]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRevenueChart;
