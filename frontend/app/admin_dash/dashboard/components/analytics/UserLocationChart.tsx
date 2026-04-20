'use client';

import React, { useState } from 'react';
import { MapPin, Users, Activity } from 'lucide-react';

interface CityData {
  city: string;
  profileCount: number;
  activityCount: number;
  total: number;
}

interface UserLocationChartProps {
  cities: CityData[];
}

export default function UserLocationChart({ cities }: UserLocationChartProps) {
  const [viewMode, setViewMode] = useState<'total' | 'profile' | 'activity'>('total');

  if (!cities || cities.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-[#253A7B]" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">User Locations</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <MapPin className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">No location data yet.</p>
          <p className="text-xs mt-1 text-gray-300">Data populates as users log in or fill profiles.</p>
        </div>
      </div>
    );
  }

  const getValue = (c: CityData) => {
    if (viewMode === 'profile') return c.profileCount;
    if (viewMode === 'activity') return c.activityCount;
    return c.total;
  };

  const maxVal = Math.max(...cities.map(getValue), 1);

  // Color palette cycling through a curated set
  const COLORS = [
    '#253A7B', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#22D3EE',
    '#84CC16', '#EF4444', '#A855F7', '#0EA5E9', '#D97706'
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#253A7B]" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-tight">User Locations</h3>
          <span className="ml-1 text-[10px] font-bold bg-[#253A7B]/10 text-[#253A7B] px-2 py-0.5 rounded-full">
            Top {cities.length} Cities
          </span>
        </div>

        {/* Source Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'total', label: 'All' },
            { key: 'profile', label: 'Profile' },
            { key: 'activity', label: 'IP' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as any)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                viewMode === tab.key
                  ? 'bg-white text-[#253A7B] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-[#253A7B]" />
          <span>Profile (self-reported)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span>IP Geolocation (auto)</span>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3">
        {cities.map((city, idx) => {
          const value = getValue(city);
          const pct = (value / maxVal) * 100;
          const color = COLORS[idx % COLORS.length];

          return (
            <div key={city.city} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-medium text-gray-800 truncate" title={city.city}>
                    {city.city}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {viewMode === 'total' && (
                    <span className="text-[10px] text-gray-400">
                      {city.profileCount > 0 && (
                        <span className="text-[#253A7B] font-semibold">{city.profileCount}P</span>
                      )}
                      {city.profileCount > 0 && city.activityCount > 0 && ' + '}
                      {city.activityCount > 0 && (
                        <span className="text-emerald-600 font-semibold">{city.activityCount}IP</span>
                      )}
                    </span>
                  )}
                  <span className="text-xs font-bold text-gray-700 w-6 text-right">{value}</span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
        <b>P</b> = Profile-reported  · <b>IP</b> = Auto-detected via IP geolocation (geoip-lite)
      </p>
    </div>
  );
}
