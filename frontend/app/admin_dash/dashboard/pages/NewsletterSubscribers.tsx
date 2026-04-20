'use client';

import React, { useEffect, useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';
import { Download, Users, UserCheck, UserX } from 'lucide-react';

interface Subscriber {
  _id: string;
  name?: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await apiAdmin.get('/api/newsletter/admin/all');
      setSubscribers(res.data);
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiAdmin.get('/api/newsletter/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'newsletter_subscribers.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export subscribers:', err);
    }
  };

  if (loading) return <div className="p-8">Loading subscribers...</div>;

  const activeCount = subscribers.filter(s => s.active).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Newsletter Subscribers</h1>
          <p className="text-gray-500 mt-1">Manage your mailing list and audience</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 bg-[#253A7B] text-white px-5 py-2.5 rounded-xl hover:bg-[#1e3068] transition-colors font-medium shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-[#253A7B]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Subscribers</div>
            <div className="text-2xl font-bold text-gray-900">{subscribers.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Active Recipients</div>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Subscribers</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No subscribers yet.</td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{subscriber.name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">{subscriber.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {subscriber.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <UserCheck className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <UserX className="w-3 h-3" /> Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
