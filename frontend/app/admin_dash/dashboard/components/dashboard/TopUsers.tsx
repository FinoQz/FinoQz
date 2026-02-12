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
    <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-white/20 rounded-lg animate-pulse">
          <User className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Top Users</h3>
      </div>

      {/* User List */}
      <ul>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 mb-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/20" />
              <div className="flex-1">
                <span className="text-white/60 font-medium text-sm">...</span>
                <span className="ml-2 text-xs text-white/40">Score: ...</span>
              </div>
              <span className="text-xs text-white/40">#{i + 1}</span>
            </li>
          ))
        ) : (
          topUsers.map((user, i) => (
            <li key={user.name} className="flex items-center gap-3 mb-3">
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-white/40" />
              <div className="flex-1">
                <span className="text-white/90 font-medium text-sm">{user.name}</span>
                <span className="ml-2 text-xs text-white/60">Score: {user.score}</span>
              </div>
              <span className="text-xs text-white/70">#{i + 1}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
