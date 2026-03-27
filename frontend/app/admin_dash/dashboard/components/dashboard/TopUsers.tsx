import React, { useEffect, useState } from "react";
import { User } from "lucide-react";


export default function TopUsers() {
  const [topUsers, setTopUsers] = useState<{ name: string; score: number; avatar: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await (await import('@/lib/apiAdmin')).default.get('/api/admin/panel/analytics/top-users');
        setTopUsers(res.data.topUsers || []);
      } catch (err) {
        setTopUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[var(--theme-primary)]/10 rounded-lg">
          <User className="w-5 h-5 text-[var(--theme-primary)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--theme-primary)] tracking-tight">Top Users</h3>
      </div>

      {/* User List */}
      <ul className="divide-y divide-gray-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)]/10" />
              <div className="flex-1">
                <span className="text-gray-400 font-medium text-sm">...</span>
                <span className="ml-2 text-xs text-gray-300">Score: ...</span>
              </div>
              <span className="inline-block min-w-[32px] text-center text-xs text-gray-300 font-semibold bg-gray-100 rounded-full px-2 py-1">{i + 1}</span>
            </li>
          ))
        ) : (
          topUsers.map((user, i) => (
            <li key={user.name + '-' + i} className={`flex items-center gap-3 py-3 ${i === 0 ? 'bg-[var(--theme-primary)]/5 rounded-xl shadow-sm' : ''}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-[var(--theme-primary)]/20 shadow-md bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                  <User className="w-6 h-6" />
                </div>
                {i === 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">1</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[var(--theme-primary)] font-semibold text-sm truncate">{user.name}</span>
                <span className="block text-xs text-gray-500">Score: {user.score}</span>
              </div>
              <span className="inline-block min-w-[32px] text-center text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: i === 0 ? 'var(--theme-primary)' : '#f3f4f6', color: i === 0 ? '#fff' : 'var(--theme-primary)' }}>
                {i + 1}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
