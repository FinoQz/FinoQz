'use client';

import React, { useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';

interface UserGrowthChartProps {
  userData: number[];
  days: string[];
  loading?: boolean;
}

const W = 600;
const H = 140;
const PAD_LEFT = 40;
const PAD_BOTTOM = 28;
const PAD_TOP = 12;
const PAD_RIGHT = 12;

function buildPath(data: number[], max: number, min: number): string {
  if (data.length < 2) return '';
  const range = max - min || 1;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  return data
    .map((v, i) => {
      const x = PAD_LEFT + (i / (data.length - 1)) * chartW;
      const y = PAD_TOP + chartH - ((v - min) / range) * chartH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildArea(data: number[], max: number, min: number): string {
  const line = buildPath(data, max, min);
  if (!line) return '';
  const range = max - min || 1;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const firstX = PAD_LEFT;
  const lastX = PAD_LEFT + chartW;
  const baseY = PAD_TOP + chartH;
  return `${line} L ${lastX.toFixed(2)},${baseY.toFixed(2)} L ${firstX.toFixed(2)},${baseY.toFixed(2)} Z`;
}

export default function UserGrowthChart({ userData, days, loading }: UserGrowthChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const max = userData.length ? Math.max(...userData, 1) : 1;
  const min = 0;
  const range = max - min;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const yTicks = [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];

  const total = userData.length ? userData.reduce((s, v) => s + v, 0) : 0;
  const latest = userData.length ? userData[userData.length - 1] : 0;
  const prev = userData.length > 1 ? userData[userData.length - 2] : 0;
  const delta = prev > 0 ? (((latest - prev) / prev) * 100).toFixed(1) : '0.0';
  const isUp = parseFloat(delta) >= 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">User Growth</h3>
            <p className="text-[10px] text-gray-400">New registrations over time</p>
          </div>
        </div>
        {!loading && userData.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900 tabular-nums">{total.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">total period</p>
            </div>
            <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2.5 py-1 rounded-full border
              ${isUp ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
              <TrendingUp className={`w-3 h-3 ${!isUp ? 'rotate-180' : ''}`} />
              {isUp ? '+' : ''}{delta}%
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-5 pt-4 pb-5">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={`growth-skeleton-bar-${i}`}
                  className="flex-1 bg-gray-100 rounded-t"
                  style={{ height: `${30 + (i % 5) * 14}%` }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={`growth-skeleton-lbl-${i}`} className="flex-1 h-2.5 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : !userData.length ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Users className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-xs text-gray-400">No growth data available yet</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ minWidth: '280px', height: '160px' }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis grid lines + labels */}
              {yTicks.map((tick, tIdx) => {
                const y = PAD_TOP + chartH - ((tick - min) / range) * chartH;
                return (
                  <g key={`growth-ytick-${tIdx}`}>
                    <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={y} y2={y}
                      stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={PAD_LEFT - 6} y={y + 4} textAnchor="end"
                      fontSize="9" fill="#9ca3af">
                      {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={buildArea(userData, max, min)} fill="url(#growthGrad)" />

              {/* Line */}
              <path
                d={buildPath(userData, max, min)}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive data points + tooltip */}
              {userData.map((v, i) => {
                const x = PAD_LEFT + (i / (userData.length - 1)) * chartW;
                const y = PAD_TOP + chartH - ((v - min) / range) * chartH;
                const isHov = hoveredIdx === i;
                // Show x-axis label only every 2nd point to avoid crowding
                const showLabel = days[i] && (i % 2 === 0 || userData.length <= 10);
                return (
                  <g key={`growth-pt-${i}`}>
                    {/* Invisible wide hit area */}
                    <rect
                      x={x - (chartW / userData.length) / 2}
                      y={PAD_TOP}
                      width={chartW / userData.length}
                      height={chartH + PAD_BOTTOM}
                      fill="transparent"
                      onMouseEnter={() => setHoveredIdx(i)}
                    />
                    {/* Vertical hover line */}
                    {isHov && (
                      <line x1={x} x2={x} y1={PAD_TOP} y2={PAD_TOP + chartH}
                        stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
                    )}
                    {/* Dot */}
                    <circle cx={x} cy={y} r={isHov ? 5 : 3.5}
                      fill={isHov ? '#10b981' : '#fff'}
                      stroke="#10b981"
                      strokeWidth={isHov ? 2.5 : 2}
                      style={{ transition: 'r 0.1s' }}
                    />
                    {/* Tooltip */}
                    {isHov && (
                      <g>
                        <rect
                          x={Math.min(x - 28, W - PAD_RIGHT - 60)}
                          y={y - 32}
                          width="58" height="22"
                          rx="5" fill="#111827"
                        />
                        <text
                          x={Math.min(x + 1, W - PAD_RIGHT - 28)}
                          y={y - 17}
                          textAnchor="middle"
                          fontSize="10" fill="white" fontWeight="600">
                          {v.toLocaleString()} users
                        </text>
                      </g>
                    )}
                    {/* X-axis label */}
                    {showLabel && days[i] && (
                      <text
                        x={x} y={H - 4}
                        textAnchor="middle"
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
}
