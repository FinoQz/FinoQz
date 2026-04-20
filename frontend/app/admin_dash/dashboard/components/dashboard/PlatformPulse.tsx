'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity, UserCheck, UserX, CreditCard, BookOpen,
  FileText, MessageSquare, Zap,
} from 'lucide-react';

interface ActivityItem {
  _id: string;
  type: 'approval' | 'rejection' | 'payment' | 'enrollment' | 'system';
  user: string;
  detail: string;
  timestamp: string;
}

const iconMap: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  approval: { icon: <UserCheck className="w-3.5 h-3.5" />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  rejection: { icon: <UserX className="w-3.5 h-3.5" />, bg: 'bg-red-50', text: 'text-red-500' },
  payment: { icon: <CreditCard className="w-3.5 h-3.5" />, bg: 'bg-violet-50', text: 'text-violet-600' },
  enrollment: { icon: <BookOpen className="w-3.5 h-3.5" />, bg: 'bg-blue-50', text: 'text-blue-600' },
  system: { icon: <Zap className="w-3.5 h-3.5" />, bg: 'bg-gray-50', text: 'text-gray-500' },
  default: { icon: <Activity className="w-3.5 h-3.5" />, bg: 'bg-indigo-50', text: 'text-indigo-600' },
};

function formatTime(timeStr: string) {
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return timeStr;
  }
}

export default function PlatformPulse() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/platform-pulse');
        setActivities(res.data.activities || []);
      } catch {
        // Endpoint not yet wired — empty state is fine
        setActivities([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Platform Pulse</h3>
            <p className="text-[10px] text-gray-400">Live activity feed</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
          Live
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1 max-h-64">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`pulse-skeleton-${i}`} className="flex items-center gap-3 py-2.5 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-gray-100 rounded w-48" />
                <div className="h-2 bg-gray-50 rounded w-20" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Activity className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-xs text-gray-400">No recent activity to display</p>
          </div>
        ) : (
          activities.slice(0, 10).map((item, idx) => {
            const style = iconMap[item.type] ?? iconMap.default;
            return (
              <div key={item._id || `pulse-item-${idx}`} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <div className={`w-7 h-7 rounded-lg ${style.bg} ${style.text} flex items-center justify-center shrink-0 mt-0.5`}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed font-medium capitalize prose-sm">
                    {item.detail}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.user}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap mt-0.5">
                  {formatTime(item.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-50 px-5 py-3">
        <button className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg py-1.5 transition-colors">
          View full activity log →
        </button>
      </div>
    </div>
  );
}
