'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle, Edit3, RefreshCw, UserPlus, FileEdit, XCircle } from 'lucide-react';
import apiAdmin from '@/lib/apiAdmin';

interface ActivityLogItem {
  _id: string;
  action: string;
  category: 'auth' | 'profile' | 'system' | 'other';
  status: 'success' | 'failure';
  actorType: 'admin' | 'user';
  createdAt: string;
  meta?: Record<string, unknown>;
}

export default function ActivityTimeline() {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiAdmin.get('/api/admin/activity-logs');
        setActivities(response.data || []);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
        setError('Failed to load activity logs');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const mappedActivities = useMemo(() => {
    return activities.slice(0, 5).map((activity) => {
      const categoryMap = {
        auth: { icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100' },
        profile: { icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-100' },
        system: { icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-100' },
        other: { icon: FileEdit, color: 'text-orange-600', bg: 'bg-orange-100' }
      };
      const statusMap = activity.status === 'failure'
        ? { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
        : categoryMap[activity.category || 'other'];

      return {
        id: activity._id,
        description: activity.action || 'Activity updated',
        user: activity.actorType === 'admin' ? 'Admin' : 'User',
        timestamp: new Date(activity.createdAt).toLocaleString('en-IN'),
        icon: statusMap.icon,
        color: statusMap.color,
        bg: statusMap.bg
      };
    });
  }, [activities]);

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-[var(--theme-primary)]" />
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading activity...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : mappedActivities.length === 0 ? (
        <div className="text-sm text-gray-500">No recent activity found.</div>
      ) : (
        <div className="space-y-4">
          {mappedActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  {index < mappedActivities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>by {activity.user}</span>
                    <span>•</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="w-full mt-4 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm">
        View Full Activity Log
      </button>
    </div>
  );
}
