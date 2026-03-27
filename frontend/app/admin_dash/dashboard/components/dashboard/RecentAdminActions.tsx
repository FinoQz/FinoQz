import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export default function RecentAdminActions() {
  const [actions, setActions] = useState<{ admin: string; action: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/recent-admin-actions');
        setActions(res.data.actions || []);
      } catch (err) {
        setActions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[var(--theme-primary)]" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Admin Actions</h3>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-pulse border border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-400 text-sm">...</p>
                <p className="text-xs text-gray-300 truncate">...</p>
              </div>
              <span className="text-xs text-gray-300 whitespace-nowrap">...</span>
            </div>
          ))
        ) : (
          actions.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{item.admin}</p>
                <p className="text-xs text-gray-500 truncate">{item.action}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
