'use client';

import React, { useEffect, useState } from 'react';
import { Lock, Users, CheckSquare, BarChart2 } from 'lucide-react';

interface PrivateGroup {
  name: string;
  members: number;
  completionRate: number;
}

interface GroupStats {
  totalGroups: number;
  totalMembers: number;
  avgCompletion: number;
}

export default function PrivateGroupHealth() {
  const [groups, setGroups] = useState<PrivateGroup[]>([]);
  const [stats, setStats] = useState<GroupStats>({ totalGroups: 0, totalMembers: 0, avgCompletion: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/private-groups');
        setGroups(res.data.groups || []);
        setStats({
          totalGroups: res.data.totalGroups || 0,
          totalMembers: res.data.totalMembers || 0,
          avgCompletion: res.data.avgCompletion || 0,
        });
      } catch {
        // Not yet wired
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const miniStats = [
    { label: 'Groups', value: stats.totalGroups, icon: <BarChart2 className="w-3.5 h-3.5 text-violet-500" />, bg: 'bg-violet-50' },
    { label: 'Members', value: stats.totalMembers, icon: <Users className="w-3.5 h-3.5 text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Avg Done', value: `${stats.avgCompletion}%`, icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />, bg: 'bg-emerald-50' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Private Groups</h3>
            <p className="text-[10px] text-gray-400">B2B & private access</p>
          </div>
        </div>
      </div>

      {/* Mini stat row */}
      <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-gray-50">
        {miniStats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-2.5 flex flex-col items-center`}>
            {s.icon}
            <p className="text-base font-bold text-gray-800 mt-1 tabular-nums">
              {loading ? '—' : s.value}
            </p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={`group-skeleton-${i}`} className="flex items-center gap-3">
                <div className="h-2.5 bg-gray-100 rounded flex-1" />
                <div className="h-2.5 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lock className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-xs text-gray-400">No private groups created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.slice(0, 5).map((g, i) => (
              <div key={`group-list-item-${i}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-700 truncate flex-1 mr-2">{g.name}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-gray-400">{g.members}m</span>
                    <span className="text-[10px] font-bold text-violet-600">{g.completionRate}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 bg-violet-400 rounded-full transition-all duration-700"
                    style={{ width: `${g.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
