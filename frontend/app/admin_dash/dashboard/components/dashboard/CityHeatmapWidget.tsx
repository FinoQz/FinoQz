'use client';

import React, { useEffect, useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { MapPin, Users, Activity, RefreshCw } from 'lucide-react';

interface CityData {
  city: string;
  profileCount: number;
  activityCount: number;
  total: number;
}

// Intensity color scale from faint → strong (indigo/blue palette matching dashboard)
function getHeatColor(ratio: number): string {
  if (ratio >= 0.85) return 'bg-[#253A7B] text-white border-[#253A7B]';
  if (ratio >= 0.65) return 'bg-blue-600 text-white border-blue-600';
  if (ratio >= 0.45) return 'bg-blue-400 text-white border-blue-400';
  if (ratio >= 0.25) return 'bg-blue-200 text-blue-800 border-blue-200';
  return 'bg-blue-50 text-blue-600 border-blue-100';
}

function getBarColor(ratio: number): string {
  if (ratio >= 0.85) return '#253A7B';
  if (ratio >= 0.65) return '#2563eb';
  if (ratio >= 0.45) return '#60a5fa';
  if (ratio >= 0.25) return '#bfdbfe';
  return '#eff6ff';
}

export default function CityHeatmapWidget() {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'heatmap' | 'bars'>('heatmap');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get('/api/analytics/user-locations');
      setCities(res.data?.cities || []);
    } catch {
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const maxVal = Math.max(...cities.map(c => c.total), 1);
  const totalUsers = cities.reduce((s, c) => s + c.total, 0);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">User Location Heatmap</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {loading ? 'Loading...' : `${totalUsers} users across ${cities.length} cities`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['heatmap', 'bars'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize transition-all ${
                  view === v ? 'bg-white text-[#253A7B] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'heatmap' ? '⬛ Grid' : '📊 Bars'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchLocations}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <MapPin className="w-8 h-8 opacity-20 mb-2" />
            <p className="text-sm font-medium">No location data yet</p>
            <p className="text-xs mt-1 text-gray-300 text-center max-w-xs">
              Data auto-populates as users log in. Ask users to fill their city in profile for richer data.
            </p>
          </div>
        ) : view === 'heatmap' ? (
          /* ── Grid Heatmap View ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {cities.map((city, idx) => {
              const ratio = city.total / maxVal;
              const colorClass = getHeatColor(ratio);
              const pct = ((city.total / totalUsers) * 100).toFixed(1);
              return (
                <div
                  key={city.city}
                  className={`relative group border rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-default ${colorClass}`}
                  title={`${city.city}: ${city.total} users (${pct}%)`}
                >
                  {/* Rank badge */}
                  <span className="absolute top-1.5 right-2 text-[9px] font-bold opacity-60">
                    #{idx + 1}
                  </span>
                  <p className="text-[11px] font-bold leading-snug pr-4 truncate">{city.city}</p>
                  <p className="text-lg font-black leading-none tabular-nums">{city.total}</p>
                  <p className="text-[9px] opacity-70 font-medium">{pct}% of total</p>
                  {/* Mini source breakdown */}
                  {(city.profileCount > 0 || city.activityCount > 0) && (
                    <div className="flex items-center gap-1 mt-0.5 opacity-80">
                      {city.profileCount > 0 && (
                        <span className="text-[8px] font-semibold flex items-center gap-0.5">
                          <Users className="w-2 h-2" />{city.profileCount}P
                        </span>
                      )}
                      {city.activityCount > 0 && (
                        <span className="text-[8px] font-semibold flex items-center gap-0.5">
                          <Activity className="w-2 h-2" />{city.activityCount}IP
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Horizontal Bar View ── */
          <div className="space-y-2.5">
            {cities.map((city, idx) => {
              const ratio = city.total / maxVal;
              const pct = ((city.total / totalUsers) * 100).toFixed(1);
              return (
                <div key={city.city} className="flex items-center gap-3 group">
                  <span className="text-[9px] font-bold text-gray-400 w-4 flex-shrink-0">#{idx + 1}</span>
                  <span className="text-[11px] font-semibold text-gray-700 w-24 flex-shrink-0 truncate" title={city.city}>
                    {city.city}
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700 ease-out"
                      style={{
                        width: `${ratio * 100}%`,
                        backgroundColor: getBarColor(ratio)
                      }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-gray-600">
                      {city.total} users
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 w-10 text-right flex-shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {!loading && cities.length > 0 && view === 'heatmap' && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <span className="text-[9px] text-gray-400 font-medium mr-1">Density:</span>
            {[
              { label: 'Low', cls: 'bg-blue-50 border-blue-100 text-blue-400' },
              { label: '', cls: 'bg-blue-200 border-blue-200 text-blue-600' },
              { label: '', cls: 'bg-blue-400 border-blue-400 text-white' },
              { label: '', cls: 'bg-blue-600 border-blue-600 text-white' },
              { label: 'High', cls: 'bg-[#253A7B] border-[#253A7B] text-white' },
            ].map((item, i) => (
              <div key={i} className={`w-7 h-4 rounded border text-[8px] font-bold flex items-center justify-center ${item.cls}`}>
                {item.label}
              </div>
            ))}
            <span className="text-[9px] text-gray-400 ml-2">
              · <b>P</b> = Profile &nbsp;·&nbsp; <b>IP</b> = Geoip-detected
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
