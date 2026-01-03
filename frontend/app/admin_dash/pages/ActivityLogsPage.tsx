'use client';

import { useEffect, useState } from 'react';
import apiAdmin from '@/lib/apiAdmin';

interface ActivityLog {
  _id: string;
  actorType: string;
  action: string;
  ip: string;
  device: { browser?: string; os?: string; platform?: string } | string;
  createdAt: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiAdmin.get('api/admin/activity-logs');
      const data = res.data;
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch activity logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await apiAdmin.delete('api/admin/activity-logs/clear');
      fetchLogs();
    } catch (err) {
      console.error('❌ Failed to clear logs:', err);
    }
  };

  const exportToExcel = () => {
    const header = ['Actor', 'Action', 'IP', 'Device', 'Date'];
    const rows = logs.map((log) => [
      log.actorType,
      log.action,
      log.ip,
      typeof log.device === 'string'
        ? log.device
        : `${log.device?.browser || 'Unknown'} on ${log.device?.os || 'Unknown'} (${log.device?.platform || 'Unknown'})`,
      new Date(log.createdAt).toLocaleString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows].map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'activity_logs.csv');
    document.body.appendChild(link);
    link.click();
  };

  const printLogs = () => {
    const printContent = `
      <html>
        <head>
          <title>Activity Logs</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Activity Logs</h2>
          <table>
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>IP</th>
                <th>Device</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${logs
                .map(
                  (log) => `
                <tr>
                  <td>${log.actorType}</td>
                  <td>${log.action}</td>
                  <td>${log.ip}</td>
                  <td>${
                    typeof log.device === 'string'
                      ? log.device
                      : `${log.device?.browser || 'Unknown'} on ${log.device?.os || 'Unknown'} (${log.device?.platform || 'Unknown'})`
                  }</td>
                  <td>${new Date(log.createdAt).toLocaleString()}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.warn('Unable to open print window.');
      return;
    }
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Export Excel
          </button>

          <button
            onClick={printLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Print
          </button>

          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
          >
            Clear All Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-semibold text-gray-700">Actor</th>
                  <th className="p-3 font-semibold text-gray-700">Action</th>
                  <th className="p-3 font-semibold text-gray-700">IP</th>
                  <th className="p-3 font-semibold text-gray-700">Device</th>
                  <th className="p-3 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          log.actorType === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {log.actorType.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          log.action.includes('login')
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.action.includes('logout')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{log.ip}</td>
                    <td className="p-3 text-gray-700 max-w-[200px] truncate">
                      {typeof log.device === 'string'
                        ? log.device
                        : `${log.device?.browser || 'Unknown'} on ${log.device?.os || 'Unknown'} (${log.device?.platform || 'Unknown'})`}
                    </td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
